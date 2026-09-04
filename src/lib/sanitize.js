/**
 * TR-Tech Frontend — Input Sanitization Utilities
 *
 * Provides safe-string extraction for user inputs that are forwarded
 * to external services (e.g. WhatsApp) or rendered in contexts where
 * HTML injection could be a risk.
 */

import { WHATSAPP_NUMBER } from '../constants';

/**
 * Strips HTML tags and normalizes whitespace for WhatsApp message text.
 *
 * @param {string} value - Raw user input
 * @returns {string} Sanitized string safe for URL embedding
 */
export function sanitizeWhatsAppInput(value) {
  if (typeof value !== 'string') return '';
  // Remove any HTML tags that may have slipped through input validation
  return value
    .replace(/<[^>]*>/g, '')
    // Collapse consecutive newlines/carriage returns into a single space
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

/**
 * Builds a clickable WhatsApp URL with a pre-filled message.
 *
 * @param {string} message - The message body to send
 * @param {string} phoneNumber - Recipient phone number (defaults to app config)
 * @returns {string} Fully encoded wa.me URL
 */
export function createWhatsAppUrl(message, phoneNumber = WHATSAPP_NUMBER) {
  const safeMessage = sanitizeWhatsAppInput(message);
  // Strip non-digit characters from phone number to ensure URL validity
  const safePhone = String(phoneNumber).replace(/[^0-9]/g, '');
  // encodeURIComponent handles spaces, newlines, and special chars
  const encoded = encodeURIComponent(safeMessage);
  return `https://wa.me/${safePhone}?text=${encoded}`;
}

/**
 * Strips HTML tags and control characters from strings for safe meta tag
 * injection. Prevents stored XSS through `<meta>` content attributes.
 *
 * @param {string} value - Raw input string (may come from DB/user content)
 * @param {number} [maxLen=300] - Maximum output length
 * @returns {string} Sanitized string safe for meta content/attribute values
 */
export function sanitizeMetaString(value, maxLen = 300) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  const controlRegex = /[\x00-\x1f\x7f]/g;
  return value
    .replace(/<[^>]*>/g, '')
    .replace(controlRegex, '')
    .trim()
    .slice(0, maxLen);
}
