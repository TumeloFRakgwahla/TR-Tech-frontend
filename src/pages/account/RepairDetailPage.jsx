import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from '../../components/AccountContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Wrench, Smartphone, Laptop, Monitor, Tablet, Info, FileText, DollarSign, Loader2 } from 'lucide-react';

const deviceIcons = {
  Smartphone: Smartphone,
  Laptop: Laptop,
  'Desktop Computer': Monitor,
  Tablet: Tablet,
  Other: Info,
};

const repairStatusConfig = {
  Received: { color: 'bg-muted text-muted-foreground', label: 'Received' },
  Diagnosed: { color: 'bg-primary text-primary-foreground', label: 'Diagnosed' },
  'Awaiting Parts': { color: 'bg-secondary text-foreground', label: 'Awaiting Parts' },
  'In Repair': { color: 'bg-primary text-primary-foreground', label: 'In Repair' },
  'Quality Check': { color: 'bg-secondary text-foreground', label: 'Quality Check' },
  'Ready for Pickup': { color: 'bg-green-100 text-green-700', label: 'Ready for Pickup' },
  Completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
};

export function RepairDetailPage() {
  const { id } = useParams();
  const { repairs, loading } = useAccount();
  const repair = repairs.find((r) => r._id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl text-center py-16">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Repair Not Found</h1>
          <p className="text-muted-foreground mb-6">The repair request you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/account/repairs">Back to Repairs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = repairStatusConfig[repair.status] || repairStatusConfig['Received'];
  const DeviceIcon = deviceIcons[repair.device?.type] || Info;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground mb-4">
            <Link to="/account/repairs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Repairs
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Repair #{repair.repairNumber || repair._id.slice(-6).toUpperCase()}
              </h1>
              <p className="text-muted-foreground mt-1">
                Submitted on {new Date(repair.createdAt).toLocaleDateString('en-ZA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Badge className={`${status.color} text-sm font-medium px-3 py-1`}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DeviceIcon className="h-5 w-5 text-primary" />
                Device Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground">{repair.device?.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Brand</p>
                  <p className="font-medium text-foreground">{repair.device?.brand || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Model</p>
                  <p className="font-medium text-foreground">{repair.device?.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Serial Number</p>
                  <p className="font-medium text-foreground">{repair.device?.serialNumber || 'N/A'}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Issue Description
              </h2>
              <p className="text-foreground whitespace-pre-wrap">{repair.issue?.description || repair.issue || 'No description provided'}</p>
              {repair.additionalInfo && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-1">Additional Information</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{repair.additionalInfo}</p>
                </div>
              )}
            </Card>

            {repair.diagnosis && (
              <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Diagnosis
                </h2>
                <p className="text-foreground">{repair.diagnosis}</p>
              </Card>
            )}

            {repair.statusHistory && repair.statusHistory.length > 0 && (
              <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4">Status History</h2>
                <div className="space-y-4">
                  {repair.statusHistory.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        {index < repair.statusHistory.length - 1 && <div className="w-0.5 h-8 bg-border mt-1"></div>}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-foreground">{entry.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString('en-ZA', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Cost Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Cost</span>
                  <span className="font-medium text-foreground">
                    {repair.estimatedCost ? `R${repair.estimatedCost.toFixed(2)}` : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actual Cost</span>
                  <span className="font-medium text-foreground">
                    {repair.actualCost ? `R${repair.actualCost.toFixed(2)}` : 'TBD'}
                  </span>
                </div>
                {repair.partsUsed && repair.partsUsed.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="font-medium text-foreground mb-2">Parts Used</p>
                    <div className="space-y-1">
                      {repair.partsUsed.map((part, index) => (
                        <div key={index} className="flex justify-between text-muted-foreground">
                          <span>{part.name} x{part.quantity}</span>
                          <span>R{part.cost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {repair.warranty?.hasWarranty && (
              <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-2">Warranty</h2>
                <p className="text-sm text-muted-foreground">{repair.warranty.terms || 'Standard warranty applies'}</p>
              </Card>
            )}

            <Card className="p-6 bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-2">Customer Information</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{repair.customerInfo?.name || 'N/A'}</p>
                <p>{repair.customerInfo?.email || 'N/A'}</p>
                <p>{repair.customerInfo?.phone || 'N/A'}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RepairDetailPage;
