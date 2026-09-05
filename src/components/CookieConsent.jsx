import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'trtech_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'trtech_cookie_preferences';

const CATEGORIES = [
  {
    id: 'essential',
    title: 'Essential',
    description: 'Required for the site to function (cart, auth, security). Always on.',
    required: true,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Anonymous usage data to help us improve the site.',
    required: false,
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Personalised offers and remarketing. Off by default.',
    required: false,
  },
];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
      window.dispatchEvent(new CustomEvent('trtech:cookie-consent', { detail: { visible: true } }));
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem(COOKIE_PREFERENCES_KEY) || '{}');
        setPreferences((p) => ({ ...p, ...stored, essential: true }));
      } catch {
        // ignore parse errors and use defaults
      }
    }
    return () => {
      if (visible) {
        window.dispatchEvent(new CustomEvent('trtech:cookie-consent', { detail: { visible: false } }));
      }
    };
  }, [visible]);

  const hideBanner = () => {
    setVisible(false);
    setShowSettings(false);
    window.dispatchEvent(new CustomEvent('trtech:cookie-consent', { detail: { visible: false } }));
  };

  const handleAcceptAll = () => {
    const all = { essential: true, analytics: true, marketing: true };
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(all));
    setPreferences(all);
    hideBanner();
  };

  const handleDeclineAll = () => {
    const min = { essential: true, analytics: false, marketing: false };
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(min));
    setPreferences(min);
    hideBanner();
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'custom');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    hideBanner();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 text-center md:text-left">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
              Read our{' '}
              <Link
                to="/about#privacy"
                className="text-primary underline hover:text-primary/80"
              >
                Privacy Policy
              </Link> for more information.
            </p>
            <div className="flex flex-wrap gap-2 justify-center flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px]"
              >
                Customize
              </button>
              <button
                onClick={handleDeclineAll}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px]"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors min-h-[40px]"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-base font-semibold text-gray-900">Cookie preferences</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-sm text-gray-500 hover:text-gray-800 min-h-[40px] min-w-[40px] inline-flex items-center justify-center"
                aria-label="Back to consent summary"
              >
                Back
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Choose which categories of cookies you allow. Essential cookies are required for the site to work and cannot be turned off.
            </p>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(preferences[cat.id])}
                    disabled={cat.required}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, [cat.id]: e.target.checked }))
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    aria-describedby={`cookie-${cat.id}-desc`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{cat.title}</span>
                      {cat.required && (
                        <span className="text-xs text-gray-500">Always on</span>
                      )}
                    </div>
                    <p id={`cookie-${cat.id}-desc`} className="text-xs text-gray-500 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleDeclineAll}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px]"
              >
                Decline All
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors min-h-[40px]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
