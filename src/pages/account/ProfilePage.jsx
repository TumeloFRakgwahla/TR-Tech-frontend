/**
 * ProfilePage.jsx
 *
 * Purpose: Allow the authenticated user to view and update their profile information.
 * Structure:
 *   - ProfilePage component: form with fields for name, email, phone, DOB, and gender
 *
 * Features:
 * - Controlled form inputs for first name, last name, email, phone, date of birth, gender
 * - Profile data loaded from AccountContext (profile) with fallback to AuthContext (user)
 * - Date ofBirth formatted to YYYY-MM-DD for date input compatibility
 * - Avatar initial generated from first name
 * - Save action calls updateProfile via context and redirects to /account on success
 * - Cancel button navigates back without saving
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../components/AccountContext';
import { useAuth } from '../../components/AuthContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User, Mail, Phone, Loader2 } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  // Get user from auth context as fallback for initial form values
  const { user } = useAuth();
  // Get profile data and update action from account context
  const { profile, updateProfile, loading } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Local form state for profile fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
  });

  // Populate form when profile or user data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        // Extract YYYY-MM-DD portion for date input value
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender || 'prefer-not-to-say',
      });
    } else if (user) {
      // Fallback to auth user data if profile not yet loaded
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: '',
        gender: 'prefer-not-to-say',
      });
    }
  }, [profile, user]);

  // Generic change handler for all form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit handler: calls updateProfile and redirects on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender,
    });

    setIsLoading(false);
    if (result.success) {
      navigate('/account');
    }
  };

  // Loading state while profile is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Profile Information</h1>
          <p className="text-lg text-muted-foreground mt-1">Update your personal details and preferences</p>
        </div>

        <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile picture section with initial avatar */}
            <div className="flex items-center gap-4 mb-6">
              {/* Avatar circle with first letter of first name */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {(formData.firstName || 'U').charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Profile Picture</h2>
                <p className="text-sm text-muted-foreground">Upload a photo to personalize your account</p>
              </div>
            </div>

            {/* First name and last name side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 bg-white border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-white border-border text-foreground"
                  required
                />
              </div>
            </div>

            {/* Email address with mail icon */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-white border-border text-foreground"
                  required
                />
              </div>
            </div>

            {/* Phone number with phone icon */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 bg-white border-border text-foreground"
                  required
                />
              </div>
            </div>

            {/* Date of birth and gender side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-foreground">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="bg-white border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-white text-foreground focus:border-primary focus:ring-primary"
                >
                  <option value="prefer-not-to-say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Form actions: cancel or save */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/account')}
                className="flex-1 border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
