/**
 * Shared formatting utilities for the TR-Tech frontend.
 * Ensures consistent display formatting across all components.
 */

/**
 * Formats a price value for display.
 * @param {number} price - The price value to format
 * @param {object} options - Formatting options
 * @param {boolean} options.showDecimals - Whether to show decimal places (default: false)
 * @param {string} options.currency - Currency symbol (default: 'R')
 * @returns {string} Formatted price string
 */
export function formatPrice(price, options = {}) {
  const { showDecimals = false, currency = 'R' } = options;
  const numPrice = Number(price) || 0;

  if (showDecimals) {
    return `${currency}${numPrice.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${currency}${numPrice.toLocaleString('en-ZA')}`;
}

/**
 * Formats a price value for display with decimals.
 * @param {number} price - The price value to format
 * @returns {string} Formatted price string with decimals
 */
export function formatPriceWithDecimals(price) {
  return formatPrice(price, { showDecimals: true });
}

/**
 * Calculates the subtotal for a cart item.
 * @param {number} price - Unit price
 * @param {number} quantity - Item quantity
 * @returns {number} Calculated subtotal
 */
export function calculateSubtotal(price, quantity) {
  return (Number(price) || 0) * (Number(quantity) || 0);
}

/**
 * Calculates the total for all cart items.
 * @param {Array} items - Array of cart items with price and quantity
 * @returns {number} Calculated total
 */
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + calculateSubtotal(item.price, item.quantity), 0);
}
