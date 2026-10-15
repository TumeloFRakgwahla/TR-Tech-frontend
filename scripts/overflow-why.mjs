/** Focused overflow attribution for a single route + width. */
const PORT = 9222;
const route = process.argv[2] || '/contact';
const width = Number(process.argv[3] || 768);
const height = Number(process.argv[4] || 1024);
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
  const i = ++id;
  pending.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
await send('Page.navigate', { url: `http://localhost:5199${route}` });
await sleep(1800);

const EXPR = `(() => {
  const vw = window.innerWidth;
  const out = { vw, scrollWidth: document.documentElement.scrollWidth, rightOverflow: [], leftOverflow: [], scrollables: [] };

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    if (r.right > vw + 0.5) {
      out.rightOverflow.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className||'').toString().slice(0,90),
        left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
        position: cs.position,
      });
    }
    // An element wider than its own scrollport is the usual cause.
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll') {
      out.scrollables.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className||'').toString().slice(0,90),
        scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, overflowX: cs.overflowX,
      });
    }
  }
  out.rightOverflow.sort((a,b) => b.right - a.right);
  out.scrollables.sort((a,b) => (b.scrollWidth-b.clientWidth) - (a.scrollWidth-a.clientWidth));
  return out;
})()`;

const res = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify(res.result.value, null, 2));
ws.close();
process.exit(0);
