/**
 * Sanitize & Constants Test Suite
 * -------------------------------
 * Tests for sanitization utilities (`src/lib/sanitize.js`) and validation
 * of exported constants (`src/constants`).
 *
 * Structure:
 *   1. sanitizeWhatsAppInput — tests HTML tag stripping, newline replacement,
 *      whitespace trimming, type safety, and empty-string handling
 *   2. createWhatsAppUrl — tests WhatsApp URL construction with sanitization,
 *      default phone number usage, and phone number normalization
 *   3. constants — validates that constant values are correct and complete
 *      (WhatsApp number, API base URL, fallback categories, order statuses,
 *      payment methods)
 */

import { describe, it, expect } from 'vitest';
import { sanitizeWhatsAppInput, createWhatsAppUrl } from '../lib/sanitize';
import { WHATSAPP_NUMBER, API_BASE_URL, FALLBACK_CATEGORIES, ORDER_STATUSES, PAYMENT_METHODS } from '../constants';

/**
 * Test suite for sanitizeWhatsAppInput.
 * Tests XSS prevention (HTML tag stripping), newline-to-space conversion,
 * leading/trailing whitespace removal, type-guarding for non-strings,
 * and empty-string pass-through.
 */

describe('sanitizeWhatsAppInput', () => {
  // Strips all HTML tags to prevent XSS — script tags should be fully removed
  it('removes HTML tags', () => {
    expect(sanitizeWhatsAppInput('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  // Normalizes line breaks (\n and \r\n) into single spaces for WhatsApp
  it('replaces newlines with spaces', () => {
    expect(sanitizeWhatsAppInput('line1\nline2\r\nline3')).toBe('line1 line2 line3');
  });

  // Removes leading and trailing whitespace before sending to WhatsApp
  it('trims whitespace', () => {
    expect(sanitizeWhatsAppInput('  hello  ')).toBe('hello');
  });

  // Non-string inputs (null, undefined, numbers) return empty string to
  // prevent type errors when constructing the WhatsApp URL
  it('returns empty string for non-string input', () => {
    expect(sanitizeWhatsAppInput(null)).toBe('');
    expect(sanitizeWhatsAppInput(undefined)).toBe('');
    expect(sanitizeWhatsAppInput(123)).toBe('');
  });

  // An empty string should remain an empty string after sanitization
  it('handles empty string', () => {
    expect(sanitizeWhatsAppInput('')).toBe('');
  });
});

/**
 * Test suite for createWhatsAppUrl.
 * Verifies WhatsApp URL construction, input sanitization, default phone
 * number fallback, and phone number normalization.
 */

describe('createWhatsAppUrl', () => {
  // Constructs a valid wa.me URL with the message URL-encoded
  it('creates valid WhatsApp URL', () => {
    const url = createWhatsAppUrl('Hello World', '27791002552');
    // The space in "Hello World" is encoded as %20 per URL spec
    expect(url).toBe('https://wa.me/27791002552?text=Hello%20World');
  });

  // Input is sanitized (newlines removed) before encoding for WhatsApp
  it('sanitizes message before encoding', () => {
    const url = createWhatsAppUrl('Hello\nWorld', '27791002552');
    // Newline is replaced with a space, then the space is encoded as %20
    expect(url).toBe('https://wa.me/27791002552?text=Hello%20World');
  });

  // When no phone number is provided, the WHATSAPP_NUMBER constant is used
  it('uses default phone number when not provided', () => {
    const url = createWhatsAppUrl('Test');
    expect(url).toContain('wa.me/27791002552');
  });

  // Non-numeric characters (spaces, + signs) are stripped from the phone number
  it('strips non-numeric characters from phone number', () => {
    const url = createWhatsAppUrl('Test', '+27 79 100 2552');
    expect(url).toBe('https://wa.me/27791002552?text=Test');
  });
});

/**
 * Test suite for exported constants.
 * Validates that critical configuration constants have the expected values
 * and contain all required entries for application functionality.
 */

describe('constants', () => {
  // The WhatsApp phone number must match the business contact number
  it('exports valid WhatsApp number', () => {
    expect(WHATSAPP_NUMBER).toBe('27791002552');
  });

  // API base URL must point to the correct backend v1 endpoint
  it('exports valid API base URL', () => {
    expect(API_BASE_URL).toBe('http://localhost:5000/api/v1');
  });

  // Fallback categories are used when the API is unavailable
  it('exports non-empty product categories', () => {
    expect(FALLBACK_CATEGORIES.length).toBeGreaterThan(0);
    expect(FALLBACK_CATEGORIES).toContain('Smartphones');
    expect(FALLBACK_CATEGORIES).toContain('Laptops');
  });

  // Order statuses must include all lifecycle states
  it('exports valid order statuses', () => {
    expect(ORDER_STATUSES).toContain('Pending');
    expect(ORDER_STATUSES).toContain('Completed');
    expect(ORDER_STATUSES).toContain('Cancelled');
  });

  // Payment methods must match what the checkout flow supports
  it('exports valid payment methods', () => {
    expect(PAYMENT_METHODS).toContain('Cash');
    expect(PAYMENT_METHODS).toContain('Card');
    expect(PAYMENT_METHODS).toContain('Transfer');
  });
});
