/**
 * SecurityPage.jsx
 *
 * Purpose: Allow the authenticated user to change their password and view active sessions.
 * Structure:
 *   - SecurityPage component: password change form + active sessions list
 *
 * Features:
 * - Password change form with current password, new password, and confirmation fields
 * - Show/hide password toggle for all password inputs
 * - Validation: passwords must match, minimum 8 characters
 * - Calls changePassword via AccountContext on submit
 * - Clears form fields on successful password change
 * - Active sessions list showing device type, browser, location, and last activity
 * - Current session indicator badge
 * - Revoke session button (placeholder with toast notification)
 */

import React, { useState } from 'react';
import { useAccount } from '../../components/AccountContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';

export function SecurityPage() {
  // Get changePassword action and sessions list from account context
  const { changePassword, sessions } = useAccount();

  // Local state for password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false); // Toggle for password visibility
  const [isLoading, setIsLoading] = useState(false);

  // Submit handler for password change with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate that new passwords match
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    // Validate minimum length
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsLoading(false);

    // Clear form on success
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Security</h1>
          <p className="text-lg text-muted-foreground mt-1">Manage your password and active sessions</p>
        </div>

        {/* Change password card */}
        <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Change Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password field with show/hide toggle */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white border-border text-foreground pr-10"
                  required
                />
                {/* Toggle button for password visibility */}
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
              <Input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white border-border text-foreground"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            {/* Confirm new password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white border-border text-foreground"
                required
              />
            </div>

            {/* Submit button */}
            <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </Card>

        {/* Active sessions card */}
        <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Sessions</h2>
          {!sessions || sessions.length === 0 ? (
            <p className="text-muted-foreground">No active sessions found</p>
          ) : (
            <div className="space-y-4">
              {/* Each session entry with device, browser, location, and last activity */}
              {sessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">
                      {session.deviceType || 'Unknown Device'} - {session.browser || 'Unknown Browser'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.location || 'Unknown location'} - Last active {new Date(session.lastActivityAt || session.createdAt).toLocaleDateString()}
                    </p>
                    {/* Badge indicating the current active session */}
                    {session.isCurrent && <Badge className="mt-1 bg-primary text-primary-foreground text-xs">Current Session</Badge>}
                  </div>
                  {/* Revoke button: only shown for non-current sessions */}
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info('Session revoke coming soon')}
                      className="text-destructive hover:text-destructive"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default SecurityPage;
