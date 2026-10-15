/**
 * Runtime verification of the checkout form accessibility fix.
 *
 * Seeds a guest cart, opens the checkout modal, submits the delivery step empty
 * to trigger validation, then reports the live DOM state: whether error nodes
 * exist, carry role="alert", and whether the inputs are programmatically linked
 * via aria-invalid / aria-describedby.
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
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
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

// Seed a guest cart so the checkout page renders its actions.
await send('Page.navigate', { url: 'http://localhost:5199/' });
await sleep(1200);
await evaluate(`localStorage.setItem('trtech_sync_v1:guest', JSON.stringify({
  version: 1, rev: 0, queue: [],
  items: [{ product: '507f1f77bcf86cd799439011', variantKey: '', name: 'Test Phone',
            condition: 'New', category: 'Smartphones', price: 999, image: '',
            quantity: 2, stock: 5, available: true }]
})); true`);

await send('Page.navigate', { url: 'http://localhost:5199/checkout' });
await sleep(1800);

const pageState = await evaluate(`(() => {
  const btns = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean);
  return { hasProceed: btns.some(t => /proceed|checkout/i.test(t)), buttons: btns.slice(0, 12) };
})()`);

// Open the checkout modal.
const opened = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /proceed to checkout|continue to checkout/i.test(b.textContent));
  if (!btn) return false;
  btn.click();
  return true;
})()`);
await sleep(1200);

const modalOpen = await evaluate(`!!document.querySelector('[role="dialog"]')`);

// Trigger validation by submitting the delivery step empty.
await evaluate(`(() => {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return false;
  const form = dialog.querySelector('form') || dialog;
  const btn = [...form.querySelectorAll('button')].find(b => /continue to payment/i.test(b.textContent));
  if (btn) { btn.click(); return true; }
  return false;
})()`);
await sleep(1200);

const a11y = await evaluate(`(() => {
  const fields = ['name','email','phone','street','city'];
  const report = {};
  for (const f of fields) {
    const input = document.getElementById(f);
    const errId = f + '-error';
    const err = document.getElementById(errId);
    report[f] = {
      inputFound: !!input,
      ariaInvalid: input ? input.getAttribute('aria-invalid') : null,
      describedBy: input ? input.getAttribute('aria-describedby') : null,
      errorNodePresent: !!err,
      errorRole: err ? err.getAttribute('role') : null,
      errorText: err ? err.textContent.slice(0, 60) : null,
      linkResolves: !!(err && input && input.getAttribute('aria-describedby') === errId),
    };
  }
  const coupon = document.querySelector('input[aria-label="Coupon code"]');
  report.coupon = {
    accessibleName: coupon ? coupon.getAttribute('aria-label') : null,
    describedBy: coupon ? coupon.getAttribute('aria-describedby') : null,
  };
  return report;
})()`);

console.log(JSON.stringify({ pageState, opened, modalOpen, a11y }, null, 2));
ws.close();
process.exit(0);
