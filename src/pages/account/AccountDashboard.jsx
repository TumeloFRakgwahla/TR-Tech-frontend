/**
 * AccountDashboard.jsx
 *
 * Purpose: Landing page for the authenticated user's account section.
 * Structure: Simple presentational component that displays a welcome heading
 * and a guidance card directing users to manage their data via the sidebar.
 *
 * Features:
 * - Acts as the default route content when navigating to /account
 * - Provides a brief introduction to the account management area
 */

import { Card } from '../../components/ui/card';

// Default export: renders the account dashboard landing page
export default function AccountDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page header with title and subtitle */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Account Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-1">Welcome to your account dashboard.</p>
      </div>

      {/* Guidance card: tells the user how to navigate account features */}
      <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <p className="text-muted-foreground">Manage your profile, addresses, orders, repairs, and more from the sidebar.</p>
      </Card>
    </div>
  );
}
