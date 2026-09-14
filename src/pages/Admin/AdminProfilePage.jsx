import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { SectionCard } from '../../components/ui/dashboard-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { accountAPI, adminAuthAPI } from '../../services/api';
import { useAdminAuth } from '../../components/AdminAuthContext';
import { Save, Loader2, User, Lock, Activity } from 'lucide-react';
import { Breadcrumbs } from '../../components/admin/Breadcrumbs';

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
};

const EMPTY_PASSWORD = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function AdminProfilePage() {
  const { user, setUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      setIsLoadingProfile(false);
    }
  }, [user]);

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const data = await adminAuthAPI.updateProfile(profile);
      setUser(data.user);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await accountAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm(EMPTY_PASSWORD);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="admin-section-card">
          <div className="admin-section-body">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-700 rounded w-1/4"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Profile</h1>
          <p className="text-slate-300">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <SectionCard title="Profile Information" description="Update your personal details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">First Name</Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Last Name</Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-white">Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={saveProfile} disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-700">
                {isSavingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SectionCard title="Change Password" description="Update your password to keep your account secure">
            <form onSubmit={changePassword} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label className="text-white">Current Password</Label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              <Button type="submit" disabled={isChangingPassword} className="bg-blue-600 hover:bg-blue-700">
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <SectionCard title="Recent Activity" description="Your recent account activity">
            <div className="space-y-4">
              {user?.lastLogin && (
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Last Login</p>
                    <p className="text-sm text-slate-400">{new Date(user.lastLogin).toLocaleString()}</p>
                  </div>
                  <Badge className="admin-badge-success">Active</Badge>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Account Created</p>
                  <p className="text-sm text-slate-400">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <Badge className="admin-badge-info">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Role</p>
                  <p className="text-sm text-slate-400 capitalize">{user?.role || 'Admin'}</p>
                </div>
                <Badge className="admin-badge-blue">Primary</Badge>
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminProfilePage;
