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
