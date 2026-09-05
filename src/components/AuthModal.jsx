import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { User, Mail, Lock, Phone, MapPin, ArrowLeft, Eye, EyeOff, Check, ShoppingBag, Sparkles, ShieldCheck, X, User2 } from 'lucide-react';

export function AuthModal({ open, onOpenChange, onSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    province: '',
  });

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setStep(1);
      setErrors({});
      setShowPassword(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        street: '',
        city: '',
        postalCode: '',
        province: '',
      });
    }
  }, [open, initialMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password && mode === 'login') {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'register') {
      if (step === 1) {
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
      }
      if (step === 2) {
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validate()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'register' && step === 1) {
      handleNextStep();
      return;
    }

    if (!validate()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const result = await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            province: formData.province,
          },
        });

        if (result.success) {
          toast.success('Account created successfully!');
          onOpenChange(false);
          onSuccess?.();
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Welcome back!');
          onOpenChange(false);
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const switchMode = () => {
    setMode(mode === 'register' ? 'login' : 'register');
    setStep(1);
    setErrors({});
  };

  const handleBack = () => {
    if (mode === 'register' && step === 2) {
      setStep(1);
      setErrors({});
    } else {
      handleClose();
    }
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { level: 0, label: '', color: '' };
    if (pwd.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (pwd.length < 8) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(pwd)) return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
    return { level: 3, label: 'Good', color: 'bg-blue-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-[420px] bg-white text-gray-900 border-0 shadow-2xl p-0 overflow-hidden auth-modal-custom rounded-2xl" data-testid="auth-modal">
        
        {/* Modern Header Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern - matching hero section gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          
          <div className="relative px-5 py-5 sm:px-6">
            {/* Navigation Row - ArrowLeft and X aligned */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center backdrop-blur-sm"
                aria-label={step === 2 ? 'Go back to step 1' : 'Back'}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 -mr-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DialogHeader>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-3 border border-white/10">
                  {mode === 'login' ? (
                    <User className="h-7 w-7 text-white" />
                  ) : (
                    <User className="h-7 w-7 text-white" />
                  )}
                </div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {mode === 'register'
                    ? (step === 1 ? 'Create your account' : 'Secure your account')
                    : 'Welcome back'}
                </DialogTitle>
                <DialogDescription className="text-sm text-white/60 mt-1 max-w-[250px] mx-auto leading-relaxed">
                  {mode === 'register'
                    ? (step === 1 ? 'Join us for a seamless shopping experience' : 'Create a strong password to protect your account')
                    : 'Sign in to access your orders, repairs, and more'}
                </DialogDescription>
              </div>

              {/* Step Indicator for Register */}
              {mode === 'register' && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-white' : 'bg-white/20'}`} />
                  <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
                </div>
              )}
            </DialogHeader>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-5 py-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            
            {/* Login Form */}
            {mode === 'login' && (
              <>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-slate-700 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className={`h-12 pl-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm ${errors.email ? 'border-red-300 bg-red-50/50' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="auth-email"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</Label>
                      <button
                        type="button"
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-slate-700 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className={`h-12 pl-11 pr-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm ${errors.password ? 'border-red-300 bg-red-50/50' : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        data-testid="auth-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password}</p>}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-slate-500 focus:ring-offset-0"
                  />
                  <label htmlFor="remember" className="ml-2.5 text-xs text-gray-600">Keep me signed in</label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-xl shadow-sm transition-all text-sm"
                  disabled={loading}
                  data-testid="auth-submit"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </Button>
              </>
            )}

            {/* Register Step 1 */}
            {mode === 'register' && step === 1 && (
              <>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={`h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm ${errors.firstName ? 'border-red-300 bg-red-50/50' : ''}`}
                        data-testid="auth-firstName"
                      />
                      {errors.firstName && <p className="text-xs text-red-500 font-medium pl-1">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={`h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm ${errors.lastName ? 'border-red-300 bg-red-50/50' : ''}`}
                        data-testid="auth-lastName"
                      />
                      {errors.lastName && <p className="text-xs text-red-500 font-medium pl-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-slate-700 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className={`h-12 pl-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm ${errors.email ? 'border-red-300 bg-red-50/50' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="auth-email"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-slate-700 transition-colors" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+27 82 123 4567"
                        className="h-12 pl-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm"
                        value={formData.phone}
                        onChange={handleChange}
                        data-testid="auth-phone"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-xl shadow-sm transition-all text-sm"
                  disabled={loading}
                  data-testid="auth-continue"
                >
                  Continue
                </Button>
              </>
            )}

            {/* Register Step 2 */}
            {mode === 'register' && step === 2 && (
              <>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Create Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-slate-700 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className={`h-12 pl-11 pr-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm ${errors.password ? 'border-red-300 bg-red-50/50' : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        data-testid="auth-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password}</p>}
                    {formData.password && (
                      <div className="pt-1.5 pl-1">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${passwordStrength.level >= 3 ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-500 uppercase tracking-wider">Confirm Password</Label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-slate-700 transition-colors" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className={`h-12 pl-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm ${errors.confirmPassword ? 'border-red-300 bg-red-50/50' : ''}`}
                        data-testid="auth-confirmPassword"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 font-medium pl-1">{errors.confirmPassword}</p>}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 pl-1">
                        <Check className="h-3.5 w-3.5" /> Passwords match
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address (Optional)</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-slate-700 transition-colors" />
                      <Input
                        name="street"
                        placeholder="Street address"
                        className="h-12 pl-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm"
                        value={formData.street}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className="h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm"
                      />
                      <Input
                        name="postalCode"
                        placeholder="Postal code"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm"
                      />
                    </div>
                    <Input
                      name="province"
                      placeholder="Province"
                      value={formData.province}
                      onChange={handleChange}
                      className="h-12 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-xl shadow-sm transition-all text-sm"
                  disabled={loading}
                  data-testid="auth-submit"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : 'Create Account'}
                </Button>
              </>
            )}

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-4 text-gray-400">
                  {mode === 'register' ? 'Already a member?' : "New to TR-Tech?"}
                </span>
              </div>
            </div>

            {/* Switch Mode Button */}
            <button
              type="button"
              onClick={switchMode}
              className="w-full h-12 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-slate-400 hover:text-slate-900 hover:bg-gray-50 transition-all"
              data-testid="auth-switch-mode"
            >
              {mode === 'register' ? 'Sign in to existing account' : 'Create new account'}
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
