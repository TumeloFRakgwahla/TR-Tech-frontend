import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { sanitizeMetaString } from '../lib/sanitize';

const DEFAULT_TITLE = 'TR-Tech Repairs and Designs | Tech Repairs, Graphic Design & Quality Products South Africa';
const DEFAULT_DESCRIPTION =
  'TR-Tech Repairs and Designs offers expert tech repairs, professional graphic design, and quality tech products in South Africa. Fast, reliable service since 2020.';
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_URL = import.meta.env.VITE_SITE_URL || '';

export function Seo({ title, description, image, noindex = false, canonical }) {
  const location = useLocation();
  const safeTitle = sanitizeMetaString(title || '', 100);
  const fullTitle = safeTitle ? `${safeTitle} — TR-Tech` : DEFAULT_TITLE;
  const fullDescription = sanitizeMetaString(description || '') || DEFAULT_DESCRIPTION;
  const fullImage = sanitizeMetaString(image || '', 500) || DEFAULT_IMAGE;
  const canonicalUrl = sanitizeMetaString(canonical || `${SITE_URL}${location.pathname}`, 500);
  // Absolute image URL for OG/social tags (relative paths don't work in OG crawlers)
  const fullImageUrl = fullImage.startsWith('http') ? fullImage : `${SITE_URL}${fullImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
       <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_ZA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
       <meta name="twitter:image" content={fullImageUrl} />
    </Helmet>
  );
}

export default Seo;
