/**
 * TR-Tech Frontend — Analytics Utilities
 *
 * Client-side aggregation helpers used by admin dashboard charts.
 * These functions group raw order data into time-series buckets
 * suitable for Chart.js or similar visualization libraries.
 */

/**
 * Aggregates orders by calendar month.
 *
 * @param {Array} orders - Array of order objects containing createdAt and value fields
 * @param {string} valueKey - The numeric field to sum (default: 'totalAmount')
 * @param {string} quantityKey - The array field whose items are summed for sales count (default: 'items')
 * @returns {Array} Sorted array of month buckets with revenue, sales, and order counts
 *
 * Each returned object has:
 *   key: "YYYY-MM" sort key
 *   month: Human-readable label like "Jan 2025"
 *   revenue: Sum of valueKey across all orders in the month
 *   sales: Sum of quantity values from quantityKey arrays
 *   orders: Count of orders in the month
 */
export function aggregateOrdersByMonth(orders, valueKey = 'totalAmount', quantityKey = 'items') {
  const monthMap = {};

  (orders || []).forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    if (!monthMap[key]) {
      monthMap[key] = { key, month: monthLabel, revenue: 0, sales: 0, orders: 0 };
    }

    monthMap[key].revenue += Number(order[valueKey] || 0);
    monthMap[key].orders += 1;
    // Sum quantity of each item in the order to get total units sold
    monthMap[key].sales += (order[quantityKey] || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  });

  // Return months in chronological order
  return Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
}
