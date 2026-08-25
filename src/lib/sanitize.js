import { WHATSAPP_NUMBER } from '../constants';

export function sanitizeWhatsAppInput(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

export function createWhatsAppUrl(message, phoneNumber = WHATSAPP_NUMBER) {
  const safeMessage = sanitizeWhatsAppInput(message);
  const safePhone = String(phoneNumber).replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(safeMessage);
  return `https://wa.me/${safePhone}?text=${encoded}`;
}
