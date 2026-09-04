import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'TR-Tech Repairs and Designs | Tech Repairs, Graphic Design & Quality Products South Africa';
const DEFAULT_DESCRIPTION =
  'TR-Tech Repairs and Designs offers expert tech repairs, professional graphic design, and quality tech products in South Africa. Fast, reliable service since 2020.';
const DEFAULT_IMAGE = 'https://trtech.co.za/og-image.jpg';
const SITE_URL = 'https://trtech.co.za';

/**
 * Page-level SEO component.
 *
 * Usage (at the top of any page component, inside the main container):
 *   <Seo title="Shop — TR-Tech" description="Browse our range of ..." />
 *
 * Falls back to DEFAULT_* constants for any prop omitted, so pages that
 * only set a title still get a valid meta description + OG tags.
 */
export function Seo({ title, description, image, noindex = false, canonical }) {
  const location = useLocation();
  const fullTitle = title ? `${title} — TR-Tech` : DEFAULT_TITLE;
  const fullDescription = description || DEFAULT_DESCRIPTION;
  const fullImage = image || DEFAULT_IMAGE;
  const canonicalUrl = canonical || `${SITE_URL}${location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_ZA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
}

export default Seo;
