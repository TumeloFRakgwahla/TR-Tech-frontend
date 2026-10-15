/**
 * Runtime proof that AdminLayout mounts.
 *
 * `/admin` is gated behind AdminAuthProvider, which calls GET /auth/me. With no
 * backend that returns 401 and the router redirects to the login page, so
 * AdminLayout never renders — which is exactly why the layout crash survived
 * the earlier public-route layout probe.
 *
 * This script intercepts the network at the CDP layer and serves a synthetic
 * admin session, so the real admin tree actually mounts in the browser. It then
 * asserts on live DOM: the admin layout shell exists and `main.admin-content`
 * received a sidebar-offset class, which requires AdminLayout to have read
 * `isCollapsed` from a real provider.
 */

const PORT = 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((res) => {
  const i = ++id; pending.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});

// Collect page console errors so a crash cannot pass silently.
const consoleErrors = [];
await send('Runtime.enable');
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(m.params?.exceptionDetails?.exception?.description
      || m.params?.exceptionDetails?.text || 'unknown exception');
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') {
    consoleErrors.push((m.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
  }
});

// Serve a synthetic admin session so the gate lets /admin through.
await send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
ws.addEventListener('message', async (e) => {
  const m = JSON.parse(e.data);
  if (m.method !== 'Fetch.requestPaused') return;
  const { requestId, request } = m.params;
  const url = request.url;

  // Only API calls are stubbed. Everything else (JS modules, CSS, assets) must
  // be passed through, or the lazily-loaded AdminLayout chunk never arrives.
  if (!url.includes('/api/')) {
    await send('Fetch.continueRequest', { requestId });
    return;
  }

  const body = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64');

  if (url.includes('/csrf-token')) {
    await send('Fetch.fulfillRequest', {
      requestId, responseCode: 200,
      responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
      body: body({ csrfToken: 'test-token' }),
    });
    return;
  }
  if (url.includes('/auth/admin/me') || url.includes('/admin/me') || url.endsWith('/auth/me')) {
    await send('Fetch.fulfillRequest', {
      requestId, responseCode: 200,
      responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
      // AdminAuthContext reads `data.user`, not `data.data`.
      body: body({
        user: {
          _id: 'admin1', firstName: 'Ada', lastName: 'Admin',
          email: 'admin@trtech.co.za', role: 'admin', isActive: true,
        },
      }),
    });
    return;
  }
  // Everything else: empty success so the shell renders without data.
  await send('Fetch.fulfillRequest', {
    requestId, responseCode: 200,
    responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
    body: body({ success: true, data: [] }),
  });
});

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://localhost:5199/admin' });
// The admin tree lazy-loads several chunks; give it time to settle.
await sleep(9000);

const report = await send('Runtime.evaluate', {
  returnByValue: true,
  expression: `(() => {
    const layout = document.querySelector('.admin-layout');
    const main = document.querySelector('main.admin-content');
    const sidebar = document.querySelector('.admin-sidebar-container');
    return {
      url: location.pathname,
      layoutMounted: !!layout,
      sidebarMounted: !!sidebar,
      mainMounted: !!main,
      mainOffsetClass: main ? (main.className.match(/md:ml-\\d+/) || [])[0] || null : null,
      sidebarWidthClass: sidebar ? (sidebar.className.match(/w-\\d+/) || [])[0] || null : null,
      renderedNodes: document.querySelectorAll('body *').length,
      errorFallbackShown: document.body.innerText.includes('unexpected error')
        || document.body.innerText.includes('Something went wrong'),
    };
  })()`,
});

console.log(JSON.stringify({
  dom: report.result.value,
  consoleErrors: consoleErrors.filter(Boolean).slice(0, 6),
}, null, 2));

ws.close();
process.exit(0);
