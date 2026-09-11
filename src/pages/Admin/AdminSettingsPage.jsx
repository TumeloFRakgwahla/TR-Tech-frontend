import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { SectionCard } from '../../components/ui/dashboard-card';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { settingsAPI } from '../../services/api';
import { useAdminAuth } from '../../components/AdminAuthContext';
import { Save, RefreshCw, Globe, Mail, Shield, Bell, Palette, Monitor, Building2, Server } from 'lucide-react';
import { getStatusConfig } from '../../lib/admin-utils';

const EMPTY_SETTINGS = {
  business: {
    businessName: 'TR-Tech Repairs & Designs',
    tagline: 'Professional Tech Repairs & Designs',
    email: 'info@trtech.co.za',
    phone: '+27 79 100 2552',
    whatsapp: '+27 79 100 2552',
    website: 'https://www.trtech.co.za',
    vatNumber: '',
    registrationNumber: '',
    currency: 'ZAR (R)',
    timezone: 'Africa/Johannesburg',
    address: '123 Main Street, Johannesburg, South Africa',
  },
  general: {
    siteName: 'TR-Tech Repairs & Designs',
    siteEmail: 'info@trtech.co.za',
    phone: '+27 79 100 2552',
    address: '123 Main Street, Johannesburg, South Africa',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
  },
  notifications: {
    newOrderReceived: true,
    lowStockAlert: true,
    repairJobCompleted: true,
    paymentReceived: true,
    newCustomerRegistration: false,
    dailySummaryReport: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipWhitelist: '',
    loginAlerts: true,
  },
  appearance: {
    theme: 'dark',
    sidebarCollapsed: false,
    compactMode: false,
    language: 'en',
  },
};

export function AdminSettingsPage() {
  const { user } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsAPI.get();
      if (data.settings) {
        setSettings(prev => ({
          business: { ...prev.business, ...data.settings.business },
          general: { ...prev.general, ...data.settings.general },
          notifications: { ...prev.notifications, ...data.settings.notifications },
          security: { ...prev.security, ...data.settings.security },
          appearance: { ...prev.appearance, ...data.settings.appearance },
        }));
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully');
      localStorage.setItem('trtech_admin_settings', JSON.stringify(settings));
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(EMPTY_SETTINGS);
    toast.success('Settings reset to defaults');
  };

  const clearPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password form cleared');
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      await settingsAPI.update({ password: { currentPassword, newPassword } });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const clearCache = async () => {
    setIsSaving(true);
    try {
      await settingsAPI.update({ action: 'clear-cache' });
      toast.success('Cache cleared successfully');
    } catch {
      toast.error('Failed to clear cache');
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = async () => {
    setIsSaving(true);
    try {
      await settingsAPI.update({ action: 'export-data' });
      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSystem = async () => {
    setIsSaving(true);
    try {
      await settingsAPI.update({ action: 'reset-system' });
      toast.success('System reset successfully');
    } catch {
      toast.error('Failed to reset system');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  if (isLoading) {
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
      <div className="flex items-center justify-between mb-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-300">Manage system preferences and configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetSettings} className="border-slate-600 text-white hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="business" className="data-[state=active]:bg-blue-600">
            <Building2 className="h-4 w-4 mr-2" />
            Business Info
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-600">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-blue-600">
            <Server className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <SectionCard title="Business Details" description="Manage your business information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Business Name</Label>
                <Input
                  value={settings.business.businessName}
                  onChange={(e) => updateSetting('business', 'businessName', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Tagline</Label>
                <Input
                  value={settings.business.tagline}
                  onChange={(e) => updateSetting('business', 'tagline', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Email Address</Label>
                <Input
                  type="email"
                  value={settings.business.email}
                  onChange={(e) => updateSetting('business', 'email', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Phone Number</Label>
                <Input
                  value={settings.business.phone}
                  onChange={(e) => updateSetting('business', 'phone', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">WhatsApp Number</Label>
                <Input
                  value={settings.business.whatsapp}
                  onChange={(e) => updateSetting('business', 'whatsapp', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Website</Label>
                <Input
                  value={settings.business.website}
                  onChange={(e) => updateSetting('business', 'website', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">VAT Number</Label>
                <Input
                  value={settings.business.vatNumber}
                  onChange={(e) => updateSetting('business', 'vatNumber', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Registration Number</Label>
                <Input
                  value={settings.business.registrationNumber}
                  onChange={(e) => updateSetting('business', 'registrationNumber', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Currency</Label>
                <Select
                  value={settings.business.currency}
                  onValueChange={(value) => updateSetting('business', 'currency', value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="ZAR (R)">ZAR (R)</SelectItem>
                    <SelectItem value="USD ($)">USD ($)</SelectItem>
                    <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                    <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Timezone</Label>
                <Select
                  value={settings.business.timezone}
                  onValueChange={(value) => updateSetting('business', 'timezone', value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="Africa/Johannesburg">Africa/Johannesburg</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-white">Business Address</Label>
                <Input
                  value={settings.business.address}
                  onChange={(e) => updateSetting('business', 'address', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SectionCard title="Notification Preferences" description="Configure how and when you receive alerts">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">New Order Received</Label>
                  <p className="text-sm text-slate-400">Get notified when a customer places a new order</p>
                </div>
                <Switch
                  checked={settings.notifications.newOrderReceived}
                  onCheckedChange={(checked) => updateSetting('notifications', 'newOrderReceived', checked)}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Low Stock Alert</Label>
                  <p className="text-sm text-slate-400">Alert when product stock falls below minimum threshold</p>
                </div>
                <Switch
                  checked={settings.notifications.lowStockAlert}
                  onCheckedChange={(checked) => updateSetting('notifications', 'lowStockAlert', checked)}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Repair Job Completed</Label>
                  <p className="text-sm text-slate-400">Notify when a repair job is marked complete</p>
                </div>
                <Switch
                  checked={settings.notifications.repairJobCompleted}
                  onCheckedChange={(checked) => updateSetting('notifications', 'repairJobCompleted', checked)}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Payment Received</Label>
                  <p className="text-sm text-slate-400">Confirm when a payment is successfully received</p>
                </div>
                <Switch
                  checked={settings.notifications.paymentReceived}
                  onCheckedChange={(checked) => updateSetting('notifications', 'paymentReceived', checked)}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">New Customer Registration</Label>
                  <p className="text-sm text-slate-400">Alert when a new customer registers</p>
                </div>
                <Switch
                  checked={settings.notifications.newCustomerRegistration}
                  onCheckedChange={(checked) => updateSetting('notifications', 'newCustomerRegistration', checked)}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Daily Summary Report</Label>
                  <p className="text-sm text-slate-400">Receive a daily performance report at 8:00 AM</p>
                </div>
                <Switch
                  checked={settings.notifications.dailySummaryReport}
                  onCheckedChange={(checked) => updateSetting('notifications', 'dailySummaryReport', checked)}
                />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SectionCard title="Security Settings" description="Manage authentication and access controls">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Login Alerts</Label>
                  <p className="text-sm text-slate-400">Get notified of new login attempts</p>
                </div>
                <Switch
                  checked={settings.security.loginAlerts}
                  onCheckedChange={(checked) => updateSetting('security', 'loginAlerts', checked)}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="space-y-2">
                <Label className="text-white">Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Change Password" description="Update your account password">
            <div className="grid grid-cols-1 gap-6 max-w-xl">
              <div className="space-y-2">
                <Label className="text-white">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={clearPasswordForm} className="border-slate-600 text-white hover:bg-slate-700">
                  Clear
                </Button>
                <Button onClick={updatePassword} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <SectionCard title="Appearance" description="Customize the look and feel of your admin panel">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">Theme</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant={settings.appearance.theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => updateSetting('appearance', 'theme', 'dark')}
                    className="border-slate-600"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={settings.appearance.theme === 'light' ? 'default' : 'outline'}
                    onClick={() => updateSetting('appearance', 'theme', 'light')}
                    className="border-slate-600"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                </div>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Compact Mode</Label>
                  <p className="text-sm text-slate-400">Reduce spacing for more content density</p>
                </div>
                <Switch
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SectionCard title="System Information" description="Application and server details">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Application</span>
                <span className="text-white">TR-Tech Admin Dashboard</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Version</span>
                <span className="text-white">v2.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Last Updated</span>
                <span className="text-white">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Server Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Backup Status</span>
                <span className="text-white">Last backup: {new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={clearCache} disabled className="bg-slate-700 text-slate-500 cursor-not-allowed" title="Not yet implemented">
                Clear Cache
              </Button>
              <Button variant="secondary" onClick={exportData} disabled className="bg-slate-700 text-slate-500 cursor-not-allowed" title="Not yet implemented">
                Export Data
              </Button>
              <Button variant="outline" onClick={resetSystem} disabled className="border-red-600 text-red-400 opacity-50 cursor-not-allowed" title="Not yet implemented">
                Reset System
              </Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminSettingsPage;
