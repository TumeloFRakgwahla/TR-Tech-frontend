/**
 * Runtime layout probe (CDP over Node's built-in WebSocket — no npm install).
 *
 * Purpose: replace "static-analysis risk" with measured fact. For each route and
 * viewport this loads the real page in headless Chrome and reports:
 *   - horizontalOverflow: document.scrollWidth > innerWidth (a broken layout)
 *   - offenders: the widest elements, so an overflow can be attributed
 *   - viewportHeightFit: whether the page needs vertical scroll (informational)
 *
 * Usage: node scripts/layout-probe.mjs [--url http://localhost:5199]
 */

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.PROBE_PORT || 9222);
const BASE = (process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://localhost:5199');

const VIEWPORTS = [
  // Breakpoint boundaries are where responsive bugs concentrate, so each
  // boundary is sampled at -1 / exact / +1.
  { name: 'xs-320', width: 320, height: 640 },
  { name: 'phone-375', width: 375, height: 667 },
  { name: 'phone-414', width: 414, height: 896 },
  { name: 'sm-639', width: 639, height: 900 },
  { name: 'sm-640', width: 640, height: 900 },
  { name: 'md-767', width: 767, height: 1000 },
  { name: 'md-768-tablet-portrait', width: 768, height: 1024 },
  { name: 'md-769', width: 769, height: 1024 },
  { name: 'lg-1023', width: 1023, height: 800 },
  { name: 'lg-1024-tablet-landscape', width: 1024, height: 768 },
  { name: 'xl-1280-laptop', width: 1280, height: 800 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const ROUTES = [
  '/', '/shop', '/cart', '/wishlist', '/checkout', '/services',
  '/contact', '/repairs', '/about', '/track-order', '/support',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return res.json();
}

/** Minimal CDP client over the built-in WebSocket. */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 30000);
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }
}

const MEASURE = `(() => {
  const vw = window.innerWidth;
  const de = document.documentElement;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 70),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      });
    }
  }
  offenders.sort((a, b) => b.right - a.right);
  return {
    innerWidth: vw,
    scrollWidth: de.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalOverflow: de.scrollWidth > vw + 1,
    verticalScroll: de.scrollHeight > window.innerHeight,
    renderedNodes: document.querySelectorAll('body *').length,
    offenders: offenders.slice(0, 5),
  };
})()`;

async function run() {
  const targets = await getJson('/json/list');
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const cdp = new CDP(ws);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const results = [];

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768,
      });
      await cdp.send('Page.navigate', { url: `${BASE}${route}` });
      await sleep(1400);

      let m = null;
      try {
        m = await cdp.evaluate(MEASURE);
      } catch (e) {
        m = { error: String(e.message) };
      }
      results.push({ route, viewport: vp.name, width: vp.width, ...m });
    }
  }

  console.log(JSON.stringify(results, null, 2));
  ws.close();
}

run().catch((e) => {
  console.error('PROBE FAILED:', e.message);
  process.exit(1);
});

export { CHROME, PORT };
