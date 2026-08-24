import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(() => loadFromStorage(STORAGE_KEY_ATTEMPTS, 0));
  const [lockoutUntil, setLockoutUntil] = useState(() => loadFromStorage(STORAGE_KEY_LOCKOUT, null));
  const [captcha, setCaptcha] = useState(() => generateCaptcha());
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  const isLocked = useMemo(() => {
    if (!lockoutUntil) return false;
    return Date.now() < lockoutUntil;
  }, [lockoutUntil]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
    setChecking(false);
  }, [isAuthenticated, user?.role, navigate]);

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

  const refreshCaptcha = () => setCaptcha(generateCaptcha());

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
      setFailedAttempts(0);
      setLockoutUntil(null);
      saveToStorage(STORAGE_KEY_ATTEMPTS, 0);
      saveToStorage(STORAGE_KEY_LOCKOUT, null);
      navigate('/admin/dashboard');
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">TR</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-400">Sign in with your admin credentials</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@trtech.co.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              required
              autoComplete="username"
              disabled={isLocked}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              required
              minLength={8}
              autoComplete="current-password"
              disabled={isLocked}
            />
          </div>

          {failedAttempts >= MAX_FAILED_ATTEMPTS && !isLocked && (
            <div className="space-y-2">
              <Label htmlFor="captcha" className="text-slate-300">CAPTCHA: {captcha.question}</Label>
              <Input
                id="captcha"
                type="text"
                inputMode="numeric"
                placeholder="Enter answer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
                disabled={isLocked}
              />
            </div>
          )}

          {isLocked && (
            <p className="text-sm text-red-400 text-center">
              Locked out. Please wait {Math.ceil((lockoutUntil - Date.now()) / 1000)}s before trying again.
            </p>
          )}

          <Button type="submit" disabled={isLoading || isLocked} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
