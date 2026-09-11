import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { KPICard, SectionCard } from '../../components/ui/dashboard-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Mail, Tag, Image as ImageIcon, Loader2, Send, BarChart3, LayoutDashboard } from 'lucide-react';
import { marketingAPI } from '../../services/api';
import { toast } from 'sonner';
import { getStatusConfig } from '../../lib/admin-utils';
import { ConfirmationDialog } from '../../components/admin/ConfirmationDialog';

export function MarketingManagement() {
  const [coupons, setCoupons] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', type: 'Percentage', minOrder: 0, expires: '' });
  const [campaignForm, setCampaignForm] = useState({ name: '', type: 'Email', content: '' });
  const [promotionForm, setPromotionForm] = useState({ title: '', image: '', link: '', location: '', startDate: '', endDate: '' });
  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [couponsRes, campaignsRes, promotionsRes] = await Promise.all([
          marketingAPI.getCoupons({ limit: 50 }),
          marketingAPI.getCampaigns({ limit: 50 }),
          marketingAPI.getPromotions({ limit: 50 }),
        ]);
        if (!controller.signal.aborted) {
          setCoupons(couponsRes.data || []);
          setCampaigns(campaignsRes.data || []);
          setPromotions(promotionsRes.data || []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Failed to load marketing data');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    loadData();
    return () => controller.abort();
  }, []);

  const handleCreateCoupon = useCallback(async () => {
    try {
      if (!couponForm.code || !couponForm.discount) {
        toast.error('Code and discount are required');
        return;
      }
      const res = await marketingAPI.createCoupon({ ...couponForm, minOrder: Number(couponForm.minOrder) });
      toast.success('Coupon created');
      setCoupons([res.data, ...coupons]);
      setCouponDialogOpen(false);
      setCouponForm({ code: '', discount: '', type: 'Percentage', minOrder: 0, expires: '' });
    } catch { toast.error('Failed to create coupon'); }
  }, [couponForm, coupons]);

  const handleCreateCampaign = useCallback(async () => {
    try {
      if (!campaignForm.name || !campaignForm.type) {
        toast.error('Name and type are required');
        return;
      }
      const res = await marketingAPI.createCampaign(campaignForm);
      toast.success('Campaign created');
      setCampaigns([res.data, ...campaigns]);
      setCampaignDialogOpen(false);
      setCampaignForm({ name: '', type: 'Email', content: '' });
    } catch { toast.error('Failed to create campaign'); }
  }, [campaignForm, campaigns]);

  const handleCreatePromotion = useCallback(async () => {
    try {
      if (!promotionForm.title || !promotionForm.image || !promotionForm.location) {
        toast.error('Title, image, and location are required');
        return;
      }
      const res = await marketingAPI.createPromotion(promotionForm);
      toast.success('Promotion created');
      setPromotions([res.data, ...promotions]);
      setPromotionDialogOpen(false);
      setPromotionForm({ title: '', image: '', link: '', location: '', startDate: '', endDate: '' });
    } catch { toast.error('Failed to create promotion'); }
  }, [promotionForm, promotions]);

  const handleDeleteCoupon = useCallback(async (id) => {
    try {
      await marketingAPI.deleteCoupon(id);
      toast.success('Coupon deleted');
      setCoupons(coupons.filter((c) => (c._id || c.id) !== id));
    } catch { toast.error('Delete failed'); }
  }, [coupons]);

  const confirmDeleteCoupon = (id) => {
    setDeleteType('coupon');
    setDeleteId(id);
  };

  const handleDeleteCampaign = useCallback(async (id) => {
    try {
      await marketingAPI.deleteCampaign(id);
      toast.success('Campaign deleted');
      setCampaigns(campaigns.filter((c) => (c._id || c.id) !== id));
    } catch { toast.error('Delete failed'); }
  }, [campaigns]);

  const confirmDeleteCampaign = (id) => {
    setDeleteType('campaign');
    setDeleteId(id);
  };

  const handleDeletePromotion = useCallback(async (id) => {
    try {
      await marketingAPI.deletePromotion(id);
      toast.success('Promotion deleted');
      setPromotions(promotions.filter((p) => (p._id || p.id) !== id));
    } catch { toast.error('Delete failed'); }
  }, [promotions]);

  const confirmDeletePromotion = (id) => {
    setDeleteType('promotion');
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId || !deleteType) return;
    if (deleteType === 'coupon') await handleDeleteCoupon(deleteId);
    else if (deleteType === 'campaign') await handleDeleteCampaign(deleteId);
    else if (deleteType === 'promotion') await handleDeletePromotion(deleteId);
    setDeleteType(null);
    setDeleteId(null);
  };

  const totalCampaigns = campaigns.length;
  const totalSent = campaigns.reduce((sum, c) => sum + (Number(c.sent) || 0), 0);
  const avgOpenRate = useMemo(() => totalSent > 0 ? ((campaigns.reduce((sum, c) => sum + (Number(c.opened) || 0), 0) / totalSent) * 100).toFixed(1) : 0, [campaigns]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Retry</Button>
      </div>
    );
  }

  return (
    <><div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-4">
        <span className="flex items-center gap-2">
          <Link className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5" to="/admin" data-discover="true">
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
            Dashboard
          </Link>
        </span>
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right h-4 w-4 text-slate-500" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
          <span className="text-slate-400 font-medium">Marketing</span>
        </span>
      </nav>
      <div className="mb-4 py-4">
        <h1 className="text-2xl font-bold text-white">Marketing</h1>
        <p className="text-slate-300">Manage coupons, campaigns, and promotional content</p>
      </div>

      <Tabs defaultValue="coupons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="coupons" className="text-white data-[state=active]:bg-blue-600">
            <Tag className="h-4 w-4 mr-2" />
            Coupons
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="text-white data-[state=active]:bg-blue-600">
            <Mail className="h-4 w-4 mr-2" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="promotions" className="text-white data-[state=active]:bg-blue-600">
            <ImageIcon className="h-4 w-4 mr-2" />
            Promotions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coupons">
          <SectionCard title="Coupon Management" description="Create and manage discount codes" action={<Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Code</Label>
                  <Input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="SUMMER24" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Discount</Label>
                    <Input value={couponForm.discount} onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })} placeholder="20%" className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Type</Label>
                    <select value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })} className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white">
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed">Fixed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Min. Order (R)</Label>
                    <Input type="number" value={couponForm.minOrder} onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">Expires</Label>
                    <Input type="date" value={couponForm.expires} onChange={(e) => setCouponForm({ ...couponForm, expires: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCouponDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                <Button onClick={handleCreateCoupon} className="bg-blue-600 hover:bg-blue-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}>
            <Card className="bg-slate-800/80 border-slate-700 overflow-hidden table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Code</TableHead>
                    <TableHead className="text-white">Discount</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Min. Order</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-400">No coupons found</TableCell></TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon._id || coupon.id}>
                        <TableCell className="font-mono font-semibold text-white">{coupon.code}</TableCell>
                        <TableCell className="font-semibold text-blue-400">{coupon.discount}</TableCell>
                        <TableCell className="text-white">{coupon.type}</TableCell>
                        <TableCell className="text-white">R{coupon.minOrder}</TableCell>
                        <TableCell><Badge className={getStatusConfig(coupon.status, 'marketing').color}>{coupon.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={() => confirmDeleteCoupon(coupon._id || coupon.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </SectionCard>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <KPICard title="Total Campaigns" value={totalCampaigns.toLocaleString()} icon={Mail} color="text-blue-400" bgColor="bg-blue-600/20" />
            <KPICard title="Emails Sent" value={totalSent.toLocaleString()} icon={Send} color="text-purple-400" bgColor="bg-purple-600/20" />
            <KPICard title="Open Rate" value={`${avgOpenRate}%`} icon={BarChart3} color="text-green-400" bgColor="bg-green-600/20" />
          </div>
          <SectionCard title="Email Campaigns" description="Manage email marketing campaigns" action={<Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Name</Label>
                  <Input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="Campaign name" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Type</Label>
                  <select value={campaignForm.type} onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })} className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white">
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">Content</Label>
                  <Input value={campaignForm.content} onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })} placeholder="Check out our latest deals!" className="bg-slate-700 border-slate-600 text-white" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCampaignDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}>
            <Card className="bg-slate-800/80 border-slate-700 overflow-hidden table-responsive">
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
                  {campaigns.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">No campaigns found</TableCell></TableRow>
                  ) : (
                    campaigns.map((campaign) => (
                      <TableRow key={campaign._id || campaign.id}>
                        <TableCell className="font-semibold text-white">{campaign.name}</TableCell>
                        <TableCell className="text-white">{campaign.type}</TableCell>
                        <TableCell className="text-white">{(campaign.sent || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-white">{(campaign.opened || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-white">{(campaign.clicked || 0).toLocaleString()}</TableCell>
                        <TableCell><Badge className={getStatusConfig(campaign.status, 'marketing').color}>{campaign.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={() => confirmDeleteCampaign(campaign._id || campaign.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </SectionCard>
        </TabsContent>

        <TabsContent value="promotions">
          <SectionCard title="Promotional Banners" description="Manage website banners and promotions" action={<Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create Promotion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Title</Label>
                  <Input value={promotionForm.title} onChange={(e) => setPromotionForm({ ...promotionForm, title: e.target.value })} placeholder="Summer Sale Banner" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Image URL</Label>
                  <Input value={promotionForm.image} onChange={(e) => setPromotionForm({ ...promotionForm, image: e.target.value })} placeholder="https://..." className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Link URL</Label>
                  <Input value={promotionForm.link} onChange={(e) => setPromotionForm({ ...promotionForm, link: e.target.value })} placeholder="https://..." className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-white">Location</Label>
                  <Input value={promotionForm.location} onChange={(e) => setPromotionForm({ ...promotionForm, location: e.target.value })} placeholder="homepage" className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Start Date</Label>
                    <Input type="date" value={promotionForm.startDate} onChange={(e) => setPromotionForm({ ...promotionForm, startDate: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-white">End Date</Label>
                    <Input type="date" value={promotionForm.endDate} onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPromotionDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
                <Button onClick={handleCreatePromotion} className="bg-blue-600 hover:bg-blue-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>}>
            <Card className="bg-slate-800/80 border-slate-700 overflow-hidden table-responsive">
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
                  {promotions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400">No promotions found</TableCell></TableRow>
                  ) : (
                    promotions.map((promo) => (
                      <TableRow key={promo._id || promo.id}>
                        <TableCell className="font-semibold text-white">{promo.title}</TableCell>
                        <TableCell className="text-white">{promo.location}</TableCell>
                        <TableCell className="text-white">{(promo.clicks || 0).toLocaleString()}</TableCell>
                        <TableCell><Badge className={getStatusConfig(promo.status, 'marketing').color}>{promo.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700"><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:bg-slate-700" onClick={() => confirmDeletePromotion(promo._id || promo.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
    <ConfirmationDialog
      open={!!deleteType}
      onOpenChange={(open) => { if (!open) { setDeleteType(null); setDeleteId(null); } }}
      title={`Delete ${deleteType}`}
      description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={handleConfirmDelete}
      variant="destructive"
    />
  </>
  );
}

export default MarketingManagement;
