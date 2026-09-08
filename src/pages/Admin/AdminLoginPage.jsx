import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../components/AdminAuthContext';
import Seo from '../../components/Seo';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Loader2, Eye, EyeOff, Shield, Lock, Zap } from 'lucide-react';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 1000;
const STORAGE_KEY_ATTEMPTS = 'trtech_admin_failed_attempts';
const STORAGE_KEY_LOCKOUT = 'trtech_admin_lockout_until';

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { question: `What is ${a} + ${b}?`, answer: a + b };
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable
  }
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(() => loadFromStorage(STORAGE_KEY_ATTEMPTS, 0));
  const [lockoutUntil, setLockoutUntil] = useState(() => loadFromStorage(STORAGE_KEY_LOCKOUT, null));
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAdminAuth();

  const isLocked = useMemo(() => {
    if (!lockoutUntil) return false;
    return Date.now() < lockoutUntil;
  }, [lockoutUntil]);

  useEffect(() => {
    if (isAuthenticated && ['admin', 'manager', 'staff'].includes(user?.role)) {
      navigate('/admin/dashboard', { replace: true });
    }
    if (!isAuthenticated || !['admin', 'manager', 'staff'].includes(user?.role)) {
      setChecking(false);
    }
  }, [isAuthenticated, user?.role, navigate, loginSuccess]);

  useEffect(() => {
    if (isLocked) {
      const remaining = lockoutUntil - Date.now();
      const timer = setTimeout(() => {
        setLockoutUntil(null);
        setFailedAttempts(0);
        saveToStorage(STORAGE_KEY_LOCKOUT, null);
        saveToStorage(STORAGE_KEY_ATTEMPTS, 0);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [isLocked, lockoutUntil]);

  const refreshCaptcha = useCallback(() => setCaptcha(generateCaptcha()), []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLocked) {
      toast.error(`Too many failed attempts. Please wait ${Math.ceil((lockoutUntil - Date.now()) / 1000)}s.`);
      setIsLoading(false);
      return;
    }

    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      toast.error('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      if (Number(captchaAnswer) !== captcha.answer) {
        toast.error('Incorrect CAPTCHA. Please try again.');
        refreshCaptcha();
        setCaptchaAnswer('');
        setIsLoading(false);
        return;
      }
    }

    const result = await login(emailTrimmed, passwordTrimmed);
    if (result.success) {
      setLoginSuccess(true);
      setFailedAttempts(0);
      setLockoutUntil(null);
      saveToStorage(STORAGE_KEY_ATTEMPTS, 0);
      saveToStorage(STORAGE_KEY_LOCKOUT, null);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      saveToStorage(STORAGE_KEY_ATTEMPTS, newAttempts);
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(until);
        saveToStorage(STORAGE_KEY_LOCKOUT, until);
        toast.error(`Too many failed attempts. Locked for ${LOCKOUT_DURATION_MS / 1000}s.`);
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
      refreshCaptcha();
      setCaptchaAnswer('');
    }
    setIsLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <img src="./TR_Tech_logo.png" alt="TR-Tech" className="w-12 h-12 object-contain" />
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo title="Admin Login — TR-Tech" noindex description="Admin login portal for TR-Tech Repairs and Designs content management system." />
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-md p-8 bg-slate-900/80 border-slate-700/60 shadow-2xl backdrop-blur relative">
          <div className="text-center mb-8">
            <img src="./TR_Tech_logo.png" alt="TR-Tech" className="w-14 h-14 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 text-sm">Sign in with your admin credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@trtech.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                required
                autoComplete="username"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {failedAttempts >= MAX_FAILED_ATTEMPTS && !isLocked && (
              <div className="space-y-2">
                <Label htmlFor="captcha" className="text-slate-300 text-sm font-medium">CAPTCHA: {captcha.question}</Label>
                <Input
                  id="captcha"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter answer"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  required
                  disabled={isLocked}
                />
              </div>
            )}

            {isLocked && (
              <div className="flex items-center gap-2 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
                <Lock className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">
                  Locked out. Please wait {Math.ceil((lockoutUntil - Date.now()) / 1000)}s before trying again.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Zap className="h-3 w-3" />
              <span>Protected by rate limiting and CAPTCHA</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
