import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Plus, Edit, Trash2, Mail, Tag, Image } from 'lucide-react';

export function MarketingManagement() {
  const coupons = [
    {
      id: 1,
      code: 'SAVE20',
      discount: '20%',
      type: 'Percentage',
      minOrder: 100,
      uses: 234,
      expires: '2026-07-15',
      status: 'Active',
    },
    {
      id: 2,
      code: 'SUMMER50',
      discount: 'R50',
      type: 'Fixed',
      minOrder: 500,
      uses: 89,
      expires: '2026-08-31',
      status: 'Active',
    },
    {
      id: 3,
      code: 'WELCOME10',
      discount: '10%',
      type: 'Percentage',
      minOrder: 0,
      uses: 567,
      expires: '2026-12-31',
      status: 'Active',
    },
  ];

  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale 2026',
      type: 'Email',
      sent: 5420,
      opened: 3214,
      clicked: 892,
      status: 'Completed',
    },
    {
      id: 2,
      name: 'New Product Launch',
      type: 'Email',
      sent: 3890,
      opened: 2145,
      clicked: 634,
      status: 'Active',
    },
  ];

  const banners = [
    {
      id: 1,
      title: 'Flash Sale',
      location: 'Homepage Hero',
      clicks: 1234,
      status: 'Active',
    },
    {
      id: 2,
      title: 'New Arrivals',
      location: 'Category Page',
      clicks: 567,
      status: 'Active',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Marketing Management</h1>
        <p className="text-slate-400">
          Manage coupons, campaigns, and promotional content
        </p>
      </div>

      <Tabs defaultValue="coupons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
          <TabsTrigger value="coupons" className="text-white data-[state=active]:bg-blue-600">
            <Tag className="h-4 w-4 mr-2" />
            Coupons
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="text-white data-[state=active]:bg-blue-600">
            <Mail className="h-4 w-4 mr-2" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="banners" className="text-white data-[state=active]:bg-blue-600">
            <Image className="h-4 w-4 mr-2" />
            Banners
          </TabsTrigger>
        </TabsList>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Coupon Management</h2>
              <p className="text-slate-400">
                Create and manage discount codes
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </div>

          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Code</TableHead>
                  <TableHead className="text-white">Discount</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Min. Order</TableHead>
                  <TableHead className="text-white">Uses</TableHead>
                  <TableHead className="text-white">Expires</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-semibold text-white">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-400">
                      {coupon.discount}
                    </TableCell>
                    <TableCell className="text-white">{coupon.type}</TableCell>
                    <TableCell className="text-white">R{coupon.minOrder}</TableCell>
                    <TableCell className="text-white">{coupon.uses}</TableCell>
                    <TableCell className="text-white">{coupon.expires}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">{coupon.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-slate-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Email Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Email Campaigns</h2>
              <p className="text-slate-400">
                Manage email marketing campaigns
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <p className="text-slate-400 text-sm mb-1">
                Total Campaigns
              </p>
              <p className="text-3xl font-bold text-blue-400">12</p>
            </Card>
            <Card className="p-6 bg-slate-800 border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Emails Sent</p>
              <p className="text-3xl font-bold text-purple-400">45,320</p>
            </Card>
            <Card className="p-6 bg-slate-800 border-slate-700">
              <p className="text-slate-400 text-sm mb-1">Open Rate</p>
              <p className="text-3xl font-bold text-green-400">62.4%</p>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Campaign Name</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Sent</TableHead>
                  <TableHead className="text-white">Opened</TableHead>
                  <TableHead className="text-white">Clicked</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-semibold text-white">
                      {campaign.name}
                    </TableCell>
                    <TableCell className="text-white">{campaign.type}</TableCell>
                    <TableCell className="text-white">{campaign.sent.toLocaleString()}</TableCell>
                    <TableCell className="text-white">
                      {campaign.opened.toLocaleString()}{' '}
                      <span className="text-slate-400 text-sm">
                        (
                        {((campaign.opened / campaign.sent) * 100).toFixed(1)}
                        %)
                      </span>
                    </TableCell>
                    <TableCell className="text-white">
                      {campaign.clicked.toLocaleString()}{' '}
                      <span className="text-slate-400 text-sm">
                        (
                        {((campaign.clicked / campaign.sent) * 100).toFixed(1)}
                        %)
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          campaign.status === 'Active'
                            ? 'bg-green-600'
                            : 'bg-slate-600'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-slate-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Promotional Banners</h2>
              <p className="text-slate-400">
                Manage website banners and promotions
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </div>

          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Location</TableHead>
                  <TableHead className="text-white">Clicks</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="font-semibold text-white">
                      {banner.title}
                    </TableCell>
                    <TableCell className="text-white">{banner.location}</TableCell>
                    <TableCell className="text-white">{banner.clicks.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">{banner.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-slate-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}