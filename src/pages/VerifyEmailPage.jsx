import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { toast } from 'sonner';
import { ShieldCheck, Shield, Loader2, MailWarning } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  const token = searchParams.get('token');

  const verify = useCallback(async () => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    try {
      const response = await authAPI.verifyEmail(token);
      if (response.success) {
        setStatus('verified');
      } else {
        setStatus('error');
        toast.error(response.message || 'Verification failed');
      }
    } catch (error) {
      const message = error.message || '';
      if (message.includes('expired') || message.includes('Invalid')) {
        setStatus('invalid');
      } else {
        setStatus('error');
        toast.error(error.message || 'Verification failed');
      }
    }
  }, [token]);

  useEffect(() => {
    void verify().catch((err) => console.error('Verification error:', err));
  }, [verify]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setResending(true);
    try {
      const response = await authAPI.resendVerification(email);
      if (response.success) {
        toast.success('Verification email sent. Please check your inbox.');
        if (response.verificationUrl) {
          console.log('[verify-email-dev] Verification URL:', response.verificationUrl);
          toast.success(
            () => (
              <div className="flex flex-col gap-1">
                <p>Verification email sent (check console in dev mode).</p>
                <a href={response.verificationUrl} className="underline text-sm">
                  Click here to verify (dev link)
                </a>
              </div>
            ),
            { duration: 15000 }
          );
        }
      } else {
        toast.error(response.message || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Seo title={status === 'verified' ? 'Email Verified' : status === 'invalid' ? 'Token Expired' : 'Verify Email'} noindex={status !== 'verified'} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full mx-auto text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Verifying your email</h1>
              <p className="text-muted-foreground">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'verified' && (
            <>
              <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified</h1>
              <p className="text-muted-foreground mb-6">
                Your email address has been successfully verified.
              </p>
              <Link to="/">
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]">
                  Continue to Home
                </button>
              </Link>
            </>
          )}

          {(status === 'invalid' || status === 'error') && (
            <>
              {status === 'invalid' ? (
                <MailWarning className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              ) : (
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              )}
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {status === 'invalid' ? 'Link Expired or Invalid' : 'Verification Failed'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {status === 'invalid'
                  ? 'This verification link has expired or is invalid. Verification links expire after 24 hours.'
                  : 'Something went wrong while verifying your email. Please try resending.'}
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50 min-h-[44px]"
                />
                <button
                  onClick={handleResend}
                  disabled={resending || !email}
                  className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]"
                >
                  {resending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
                <Link to="/auth/login">
                  <button className="w-full px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors min-h-[44px]">
                    Back to Login
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <BottomNav />
      <Footer />
    </div>
  );
}

export default VerifyEmailPage;
