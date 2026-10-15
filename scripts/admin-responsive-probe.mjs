/**
 * Admin responsive probe.
 *
 * The admin tree is gated behind AdminAuthProvider, so `/admin` redirects to the
 * login page when unauthenticated — which is why earlier public-route probes
 * never exercised it. This stubs the admin session at the CDP network layer
 * (API calls only; JS/CSS pass through) so the real admin pages mount, then
 * measures horizontal overflow at every device width.
 *
 * Usage: node scripts/admin-responsive-probe.mjs
 */

const PORT = Number(process.env.PROBE_PORT || 9222);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'phablet-640', width: 640, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-834', width: 834, height: 1112 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'desktop-1536', width: 1536, height: 864 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const ROUTES = ['/admin', '/admin/products', '/admin/orders', '/admin/customers', '/admin/inventory'];

const ADMIN = { _id: 'a1', firstName: 'Ada', lastName: 'Admin', email: 'admin@trtech.co.za', role: 'admin', isActive: true };

const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let id = 0;
const pending = new Map();
const exceptions = [];

ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') {
    exceptions.push((m.params?.exceptionDetails?.exception?.description || '').slice(0, 160));
  }
});

const send = (method, params = {}) => new Promise((res) => {
  const i = ++id;
  pending.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});

await send('Runtime.enable');
await send('Page.enable');
// API only. Intercepting everything would break Vite's module loading and the
// lazily-loaded admin chunks would never arrive.
await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });

ws.addEventListener('message', async (e) => {
  const m = JSON.parse(e.data);
  if (m.method !== 'Fetch.requestPaused') return;
  const url = m.params.request.url;
  const payload = url.includes('/auth/admin/me')
    ? { user: ADMIN }
    : { success: true, data: [], stats: { revenue: 0, orders: 0 } };
  await send('Fetch.fulfillRequest', {
    requestId: m.params.requestId,
    responseCode: 200,
    responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
    body: Buffer.from(JSON.stringify(payload)).toString('base64'),
  });
});

const MEASURE = `(() => {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('main.admin-content *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > vw + 0.5) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 64),
        right: Math.round(r.right),
        w: Math.round(r.width),
      });
    }
  }
  offenders.sort((a, b) => b.right - a.right);
  return {
    scrollWidth: de.scrollWidth,
    viewportWidth: vw,
    overflow: de.scrollWidth > vw + 1,
    mounted: !!document.querySelector('main.admin-content'),
    nodes: document.querySelectorAll('main.admin-content *').length,
    offenders: offenders.slice(0, 3),
  };
})()`;

const results = [];
for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.width < 768,
    });
    await send('Page.navigate', { url: `http://localhost:5199${route}` });
    await sleep(2600);
    const r = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
    results.push({ route, viewport: vp.name, width: vp.width, ...(r.result.value || { error: true }) });
  }
}

const failing = results.filter((r) => r.overflow);
console.log('probes:', results.length, '| overflowing:', failing.length);
for (const f of failing) {
  console.log(`  OVERFLOW ${f.route} @ ${f.viewport} (${f.width}px): scrollW=${f.scrollWidth}`);
  for (const o of f.offenders || []) console.log(`      <${o.tag}> right=${o.right} w=${o.w} ${o.cls}`);
}
console.log('exceptions:', exceptions.length ? exceptions.slice(0, 4) : 'none');
ws.close();
process.exit(0);
