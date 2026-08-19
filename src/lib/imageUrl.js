import { API_BASE_URL } from '../constants';

export function getProductImageUrl(url) {
  if (!url) return '';

  if (url.startsWith('/uploads/')) {
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    if (url.startsWith(baseUrl + '/uploads/')) {
      return url.replace(baseUrl, '');
    }
    return url;
  }

  const baseUrl = API_BASE_URL.replace(/\/api$/, '');

  if (url.startsWith('/')) return `${baseUrl}${url}`;

  return `${baseUrl}/${url}`;
}
