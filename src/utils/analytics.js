/**
 * TR-Tech Frontend — Analytics Utilities
 *
 * Client-side aggregation helpers used by admin dashboard charts.
 * These functions group raw order data into time-series buckets
 * suitable for Chart.js or similar visualization libraries.
 */

/**
 * Filters orders by a date range relative to now.
 *
 * @param {Array} orders - Array of order objects containing createdAt
 * @param {string} period - '7d' | '30d' | '90d' | '1y'
 * @returns {Array} Filtered orders
 */
export function filterOrdersByPeriod(orders, period = '30d') {
  const now = new Date();
  let days = 30;
  if (period === '7d' || period === 'This Week' || period === 'Today') {
    days = period === 'Today' ? 1 : 7;
  } else if (period === '30d' || period === 'This Month') {
    days = 30;
  } else if (period === '90d') {
    days = 90;
  } else if (period === '1y' || period === 'This Year') {
    days = 365;
  } else if (typeof period === 'string' && period.endsWith('d')) {
    days = Number(period.replace('d', ''));
  }
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return (orders || []).filter((o) => {
    if (!o.createdAt) return false;
    return new Date(o.createdAt) >= start;
  });
}

/**
 * Aggregates orders by calendar month.
 *
 * @param {Array} orders - Array of order objects containing createdAt and value fields
 * @param {string} valueKey - The numeric field to sum (default: 'totalAmount')
 * @param {string} quantityKey - The array field whose items are summed for sales count (default: 'items')
 * @returns {Array} Sorted array of month buckets with revenue, sales, and order counts
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
    monthMap[key].sales += (order[quantityKey] || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  });

  return Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Aggregates orders by day (YYYY-MM-DD).
 */
export function aggregateOrdersByDay(orders, valueKey = 'totalAmount', quantityKey = 'items') {
  const dayMap = {};

  (orders || []).forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const dayLabel = date.toLocaleString('default', { month: 'short', day: 'numeric' });

    if (!dayMap[key]) {
      dayMap[key] = { key, month: dayLabel, revenue: 0, sales: 0, orders: 0 };
    }

    dayMap[key].revenue += Number(order[valueKey] || 0);
    dayMap[key].orders += 1;
    dayMap[key].sales += (order[quantityKey] || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  });

  return Object.values(dayMap).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Aggregates orders by week (YYYY-Www).
 */
export function aggregateOrdersByWeek(orders, valueKey = 'totalAmount', quantityKey = 'items') {
  const weekMap = {};

  (orders || []).forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const year = d.getUTCFullYear();
    const weekNo = Math.ceil((((d - new Date(Date.UTC(year, 0, 1))) / 86400000) + 1) / 7);
    const key = `${year}-W${String(weekNo).padStart(2, '0')}`;
    const weekLabel = `Week ${weekNo}`;

    if (!weekMap[key]) {
      weekMap[key] = { key, month: weekLabel, revenue: 0, sales: 0, orders: 0 };
    }

    weekMap[key].revenue += Number(order[valueKey] || 0);
    weekMap[key].orders += 1;
    weekMap[key].sales += (order[quantityKey] || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  });

  return Object.values(weekMap).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Aggregates orders by year (YYYY).
 */
export function aggregateOrdersByYear(orders, valueKey = 'totalAmount', quantityKey = 'items') {
  const yearMap = {};

  (orders || []).forEach((order) => {
    if (!order.createdAt) return;
    const date = new Date(order.createdAt);
    const key = String(date.getFullYear());

    if (!yearMap[key]) {
      yearMap[key] = { key, month: key, revenue: 0, sales: 0, orders: 0 };
    }

    yearMap[key].revenue += Number(order[valueKey] || 0);
    yearMap[key].orders += 1;
    yearMap[key].sales += (order[quantityKey] || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  });

  return Object.values(yearMap).sort((a, b) => a.key.localeCompare(b.key));
}
