import { Card } from '../../components/ui/card';

export default function AccountDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Account Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-1">Welcome to your account dashboard.</p>
      </div>
      <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <p className="text-muted-foreground">Manage your profile, addresses, orders, repairs, and more from the sidebar.</p>
      </Card>
    </div>
  );
}
