/**
 * Client-side invoice generation.
 *
 * Produces a self-contained HTML invoice for an order and triggers a
 * browser download. The document is built from the same order snapshot
 * the customer sees on screen, so the invoice can never disagree with
 * the page. No server round-trip is required, which keeps it working
 * for legacy orders and while the backend is unreachable.
 */

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

const fmt = (value) =>
  `R${(Number(value) || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Builds the HTML body of an invoice for the given order.
 * @param {object} order - Order document (items, customer, totalAmount, …)
 * @param {string} orderNumber - Customer-facing order number
 * @returns {string} Complete HTML document
 */
export function buildInvoiceHtml(order, orderNumber) {
  const placed = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-ZA', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  const rows = (order.items || []).map((item, i) => `
      <tr>
        <td>${esc(item.name || `Item ${i + 1}`)}</td>
        <td>${esc(item.condition || '—')}</td>
        <td class="num">${Number(item.quantity) || 0}</td>
        <td class="num">${fmt(item.price)}</td>
        <td class="num">${fmt((Number(item.price) || 0) * (Number(item.quantity) || 0))}</td>
      </tr>`).join('');

  const subtotal = (order.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Invoice ${esc(orderNumber)} — TR-Tech Repairs &amp; Designs</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #0b0d1c; max-width: 720px; margin: 40px auto; padding: 0 24px; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  .muted { color: #6b7280; }
  .meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin: 24px 0; padding: 16px; background: #f5f5f5; border-radius: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
  .num { text-align: right; }
  .totals { margin-left: auto; width: 260px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .totals .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #0b0d1c; margin-top: 6px; padding-top: 10px; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
</style>
</head>
<body>
  <h1>TR-Tech Repairs &amp; Designs</h1>
  <p class="muted">Professional tech repairs, graphic design &amp; quality products</p>

  <div class="meta">
    <div>
      <strong>Invoice</strong><br>
      ${esc(orderNumber)}<br>
      <span class="muted">Placed ${esc(placed)}</span>
    </div>
    <div>
      <strong>Customer</strong><br>
      ${esc(order.customer?.name || '—')}<br>
      ${esc(order.customer?.email || '')}<br>
      ${esc(order.customer?.phone || '')}
    </div>
    <div>
      <strong>Payment</strong><br>
      ${esc(order.paymentMethod || '—')}<br>
      <span class="muted">${esc(order.paymentStatus || '—')}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Item</th><th>Condition</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Total</th></tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="5" class="muted">No items</td></tr>'}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="row"><span>Shipping</span><span>${(Number(order.shippingCost) || 0) === 0 ? 'Free' : fmt(order.shippingCost)}</span></div>
    ${(Number(order.discount) || 0) > 0 ? `<div class="row"><span>Discount</span><span>−${fmt(order.discount)}</span></div>` : ''}
    <div class="row grand"><span>Total</span><span>${fmt(order.totalAmount)}</span></div>
  </div>

  <footer>
    TR-Tech Repairs &amp; Designs · South Africa<br>
    Thank you for your order. Keep this invoice for your records.
  </footer>
</body>
</html>`;
}

/**
 * Downloads an HTML invoice for the given order.
 * @param {object} order - Order document
 * @param {string} orderNumber - Customer-facing order number
 */
export function downloadInvoice(order, orderNumber) {
  const html = buildInvoiceHtml(order, orderNumber);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TR-Tech-Invoice-${orderNumber}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
