import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';

export function AuthModal({ open, onOpenChange, onSuccess }) {
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
      setMode('register');
      setErrors({});
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
  }, [open]);

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'register') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validate()) {
      setLoading(false);
      return;
    }

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
          onOpenChange(false);
          onSuccess?.();
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
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
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-[450px] bg-white text-gray-900 border-gray-200 shadow-xl" data-testid="auth-modal">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            {mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {mode === 'register'
              ? 'Register to checkout faster and track your orders'
              : 'Login to your account to checkout'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.firstName ? 'border-red-500' : ''}`}
                    data-testid="auth-firstName"
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.lastName ? 'border-red-500' : ''}`}
                    data-testid="auth-lastName"
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`pl-10 bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    data-testid="auth-email"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+27 82 123 4567"
                    className="pl-10 bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    data-testid="auth-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className={`pl-10 bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.password ? 'border-red-500' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      data-testid="auth-password"
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    data-testid="auth-confirmPassword"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Delivery Address (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    name="street"
                    placeholder="Street Address"
                    className="pl-10 mb-2 bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary"
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
                    className="bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary"
                  />
                  <Input
                    name="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary"
                  />
                </div>
                <Input
                  name="province"
                  placeholder="Province"
                  value={formData.province}
                  onChange={handleChange}
                  className="bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary"
                />
              </div>
            </>
          )}

          {mode === 'login' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`pl-10 bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    data-testid="auth-email"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className={`pl-10 bg-white border-gray-200 text-gray-900 focus:border-primary focus:ring-primary ${errors.password ? 'border-red-500' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    data-testid="auth-password"
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            disabled={loading}
            data-testid="auth-submit"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </>
            ) : mode === 'register' ? 'Create Account' : 'Login'}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">
                {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={switchMode}
            className="w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            data-testid="auth-switch-mode"
          >
            {mode === 'register' ? 'Login instead' : 'Register instead'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
