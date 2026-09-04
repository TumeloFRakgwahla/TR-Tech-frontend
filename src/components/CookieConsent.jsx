import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'trtech_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
      window.dispatchEvent(new CustomEvent('trtech:cookie-consent', { detail: { visible: true } }));
    }
    return () => {
      if (visible) {
        window.dispatchEvent(new CustomEvent('trtech:cookie-consent', { detail: { visible: false } }));
      }
    };
  }, [visible]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
    window.dispatchEvent(new CustomEvent('trtech:cookie-consent', { detail: { visible: false } }));
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
    window.dispatchEvent(new CustomEvent('trtech:cookie-consent', { detail: { visible: false } }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 text-center md:text-left">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies. Read our{' '}
            <a href="/about#privacy" className="text-primary underline hover:text-primary/80">Privacy Policy</a> for more information.
          </p>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px]"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors min-h-[40px]"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
