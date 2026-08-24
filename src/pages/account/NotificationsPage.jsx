import React, { useState } from 'react';
import { useAccount } from '../../components/AccountContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Bell, Loader2 } from 'lucide-react';

export function NotificationsPage() {
  const { notifications, updateNotificationPreferences, loading } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    emailOrderUpdates: true,
    emailPromotions: true,
    emailNewsletter: false,
    smsOrderUpdates: true,
    smsPromotions: false,
    whatsappUpdates: true,
    pushNotifications: false,
    frequency: 'instant',
  });

  React.useEffect(() => {
    if (notifications) {
      setPrefs({
        emailOrderUpdates: notifications.emailOrderUpdates ?? true,
        emailPromotions: notifications.emailPromotions ?? true,
        emailNewsletter: notifications.emailNewsletter ?? false,
        smsOrderUpdates: notifications.smsOrderUpdates ?? true,
        smsPromotions: notifications.smsPromotions ?? false,
        whatsappUpdates: notifications.whatsappUpdates ?? true,
        pushNotifications: notifications.pushNotifications ?? false,
        frequency: notifications.frequency || 'instant',
      });
    }
  }, [notifications]);

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await updateNotificationPreferences(prefs);
    setIsLoading(false);
  };

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
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Notification Preferences</h1>
          <p className="text-lg text-muted-foreground mt-1">Choose how you want to receive updates</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-foreground mb-4">Email Notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'emailOrderUpdates', label: 'Order Updates', desc: 'Receive emails about your order status' },
                { key: 'emailPromotions', label: 'Promotions', desc: 'Get notified about deals and offers' },
                { key: 'emailNewsletter', label: 'Newsletter', desc: 'Weekly digest of new products and services' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      prefs[item.key] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        prefs[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-foreground mb-4">SMS Notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'smsOrderUpdates', label: 'Order Updates', desc: 'Receive SMS about your order status' },
                { key: 'smsPromotions', label: 'Promotions', desc: 'Get notified about deals and offers via SMS' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      prefs[item.key] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        prefs[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-foreground mb-4">WhatsApp Notifications</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">WhatsApp Updates</p>
                <p className="text-sm text-muted-foreground">Receive repair status updates via WhatsApp</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('whatsappUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.whatsappUpdates ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs.whatsappUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </Card>

          <Card className="p-6 mb-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notification Frequency</h2>
            <div className="space-y-2">
              {[
                { value: 'instant', label: 'Instant', desc: 'Receive notifications immediately' },
                { value: 'daily', label: 'Daily Digest', desc: 'Get one email per day with all updates' },
                { value: 'weekly', label: 'Weekly Digest', desc: 'Get one email per week with all updates' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                    prefs.frequency === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div>
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={prefs.frequency === option.value}
                    onChange={(e) => setPrefs({ ...prefs, frequency: e.target.value })}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default NotificationsPage;
