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
