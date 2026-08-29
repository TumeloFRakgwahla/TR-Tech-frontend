/**
 * AccountRepairsPage.jsx
 *
 * Purpose: Displays a searchable list of the authenticated user's repair requests.
 * Structure:
 *   - repairStatusConfig: maps status strings to Tailwind badge classes
 *   - AccountRepairsPage component: main page with search and repair cards
 *
 * Features:
 * - Pulls repair data from AccountContext
 * - Searchable by repair number or device type
 * - Shows status badges, device info, submission date, estimated completion and cost
 * - Links each repair card to its detail page (/account/repairs/:id)
 * - Loading state with spinner, empty state with CTA to book a repair
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../../components/AccountContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Wrench, ArrowRight, Loader2 } from 'lucide-react';

// Maps each repair status to Tailwind CSS classes for badge styling
const repairStatusConfig = {
  Received: 'bg-muted text-muted-foreground',
  Diagnosed: 'bg-primary text-primary-foreground',
  'Awaiting Parts': 'bg-secondary text-foreground',
  'In Repair': 'bg-primary text-primary-foreground',
  'Quality Check': 'bg-secondary text-foreground',
  'Ready for Pickup': 'bg-green-100 text-green-700',
  Completed: 'bg-green-100 text-green-700',
};

export function AccountRepairsPage() {
  // Get repairs array and loading flag from account context
  const { repairs, loading } = useAccount();
  // Local state for the search input
  const [searchQuery, setSearchQuery] = useState('');

  // Filter repairs by search query (matches repair number or device type)
  const filteredRepairs = repairs.filter((repair) => {
    const repairNumber = (repair.repairNumber || repair._id || '').toLowerCase();
    const deviceType = (repair.device?.type || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return repairNumber.includes(q) || deviceType.includes(q);
  });

  // Loading state: spinner while repairs are being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Repairs</h1>
          <p className="text-lg text-muted-foreground mt-1">Track and manage your repair requests</p>
        </div>

        {/* Search input for filtering repairs */}
        <Card className="p-4 mb-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by repair number or device type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-border text-foreground"
            />
          </div>
        </Card>

        {filteredRepairs.length === 0 ? (
          /* Empty state: no repairs found for the current search / no repairs at all */
          <Card className="p-12 text-center bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No repairs found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search' : "You haven't submitted any repair requests yet"}
            </p>
            {/* CTA only shown when there is no active search */}
            {!searchQuery && (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/book-repair">Book a Repair</Link>
              </Button>
            )}
          </Card>
        ) : (
          /* Repair list: one card per repair */
          <div className="space-y-4">
            {filteredRepairs.map((repair) => (
              <Card key={repair._id} className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Wrench icon in a muted rounded box */}
                    <div className="p-3 bg-muted rounded-lg">
                      <Wrench className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      {/* Repair number: uses human-friendly repairNumber or falls back to last 6 chars of _id */}
                      <h3 className="font-semibold text-foreground">
                        Repair #{repair.repairNumber || repair._id.slice(-6).toUpperCase()}
                      </h3>
                      {/* Device type / brand / model line */}
                      <p className="text-sm text-muted-foreground">
                        {repair.device?.type} {repair.device?.brand ? `- ${repair.device.brand}` : ''} {repair.device?.model ? `- ${repair.device.model}` : ''}
                      </p>
                      {/* Submission date formatted for South Africa locale */}
                      <p className="text-sm text-muted-foreground mt-1">
                        Submitted on {new Date(repair.createdAt).toLocaleDateString('en-ZA', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      {/* Optional estimated completion date */}
                      {repair.estimatedCompletion && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Est. Completion: {new Date(repair.estimatedCompletion).toLocaleDateString('en-ZA', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Right column: status badge and estimated cost */}
                  <div className="text-right">
                    <Badge className={repairStatusConfig[repair.status] || 'bg-muted text-muted-foreground'}>
                      {repair.status}
                    </Badge>
                    {repair.estimatedCost && (
                      <p className="text-sm font-medium text-foreground mt-2">
                        Est: R{repair.estimatedCost.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                {/* Footer with link to repair detail page */}
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
                    <Link to={`/account/repairs/${repair._id}`} className="flex items-center gap-1">
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountRepairsPage;
