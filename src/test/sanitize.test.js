import { describe, it, expect } from 'vitest';
import { sanitizeWhatsAppInput, createWhatsAppUrl } from '../lib/sanitize';
import { WHATSAPP_NUMBER, API_BASE_URL, PRODUCT_CATEGORIES, ORDER_STATUSES, PAYMENT_METHODS } from '../constants';

describe('sanitizeWhatsAppInput', () => {
  it('removes HTML tags', () => {
    expect(sanitizeWhatsAppInput('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('replaces newlines with spaces', () => {
    expect(sanitizeWhatsAppInput('line1\nline2\r\nline3')).toBe('line1 line2 line3');
  });

  it('trims whitespace', () => {
    expect(sanitizeWhatsAppInput('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeWhatsAppInput(null)).toBe('');
    expect(sanitizeWhatsAppInput(undefined)).toBe('');
    expect(sanitizeWhatsAppInput(123)).toBe('');
  });

  it('handles empty string', () => {
    expect(sanitizeWhatsAppInput('')).toBe('');
  });
});

describe('createWhatsAppUrl', () => {
  it('creates valid WhatsApp URL', () => {
    const url = createWhatsAppUrl('Hello World', '27791002552');
    expect(url).toBe('https://wa.me/27791002552?text=Hello%20World');
  });

  it('sanitizes message before encoding', () => {
    const url = createWhatsAppUrl('Hello\nWorld', '27791002552');
    expect(url).toBe('https://wa.me/27791002552?text=Hello%20World');
  });

  it('uses default phone number when not provided', () => {
    const url = createWhatsAppUrl('Test');
    expect(url).toContain('wa.me/27791002552');
  });

  it('strips non-numeric characters from phone number', () => {
    const url = createWhatsAppUrl('Test', '+27 79 100 2552');
    expect(url).toBe('https://wa.me/27791002552?text=Test');
  });
});

describe('constants', () => {
  it('exports valid WhatsApp number', () => {
    expect(WHATSAPP_NUMBER).toBe('27791002552');
  });

  it('exports valid API base URL', () => {
    expect(API_BASE_URL).toBe('http://localhost:5000/api/v1');
  });

  it('exports non-empty product categories', () => {
    expect(PRODUCT_CATEGORIES.length).toBeGreaterThan(0);
    expect(PRODUCT_CATEGORIES).toContain('Smartphones');
    expect(PRODUCT_CATEGORIES).toContain('Laptops');
  });

  it('exports valid order statuses', () => {
    expect(ORDER_STATUSES).toContain('Pending');
    expect(ORDER_STATUSES).toContain('Completed');
    expect(ORDER_STATUSES).toContain('Cancelled');
  });

  it('exports valid payment methods', () => {
    expect(PAYMENT_METHODS).toContain('Cash');
    expect(PAYMENT_METHODS).toContain('Card');
    expect(PAYMENT_METHODS).toContain('Transfer');
  });
});
