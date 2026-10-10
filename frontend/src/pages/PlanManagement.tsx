import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Check, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  ShieldAlert,
  RefreshCw,
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Tag, 
  Layers, 
  Sparkles,
  X,
  Search,
  Calendar,
  Zap,
  Shield,
  Percent,
  CheckCircle
} from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price: number;
  promoPrice: number | null;
  validityDays: number;
  allowedTrades: number;
  accessTier: 'BASIC' | 'PREMIUM' | 'VIP';
  features: string[];
  riskInfo: string;
  isActive: boolean;
  isVisible: boolean;
}

export const PlanManagement: React.FC = () => {
  const { apiGet, apiPost, apiPut, apiPatch, apiDelete } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Filter and search states
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '' as number | '',
    promoPrice: '' as number | '' | null,
    validityDays: 30,
    allowedTrades: 2,
    accessTier: 'BASIC' as 'BASIC' | 'PREMIUM' | 'VIP',
    features: '',
    riskInfo: '',
    isActive: true,
    isVisible: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/admin/plans');
      setPlans(data || []);
    } catch (err: any) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      promoPrice: '',
      validityDays: 30,
      allowedTrades: 2,
      accessTier: 'BASIC',
      features: 'High-Probability Trade Signals\nEntry & Precise Stop-Loss Levels\nVIP Telegram Alerts\nRisk Management Guidance',
      riskInfo: 'Trading derivative contracts involves market risk. Trade setups are for educational and analytical purposes only.',
      isActive: true,
      isVisible: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: { name: string; price: number; promo?: number; validity: number; trades: number; tier: 'BASIC' | 'PREMIUM' | 'VIP'; features: string }) => {
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      price: preset.price,
      promoPrice: preset.promo || '',
      validityDays: preset.validity,
      allowedTrades: preset.trades,
      accessTier: preset.tier,
      features: preset.features,
    }));
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: Number(plan.price) || '',
      promoPrice: plan.promoPrice ? Number(plan.promoPrice) : '',
      validityDays: plan.validityDays,
      allowedTrades: plan.allowedTrades,
      accessTier: plan.accessTier,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      riskInfo: plan.riskInfo || '',
      isActive: plan.isActive,
      isVisible: plan.isVisible,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.validityDays || !formData.allowedTrades) {
      setError('Please fill in all mandatory plan tier fields (Plan Name, Price, Validity, Allowed Trades)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const parsedFeatures = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        promoPrice: formData.promoPrice ? Number(formData.promoPrice) : null,
        validityDays: Number(formData.validityDays),
        allowedTrades: Number(formData.allowedTrades),
        accessTier: formData.accessTier,
        features: parsedFeatures,
        riskInfo: formData.riskInfo.trim() || 'Trading involves market risk.',
        isActive: formData.isActive,
        isVisible: formData.isVisible,
      };

      if (editingPlan) {
        await apiPut(`/admin/plans/${editingPlan.id}`, payload);
        setMessage(`Plan tier "${formData.name}" updated successfully.`);
      } else {
        await apiPost('/admin/plans', payload);
        setMessage(`New pricing plan "${formData.name}" created successfully.`);
      }

      handleCloseModal();
      fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleField = async (planId: number, field: 'isActive' | 'isVisible') => {
    try {
      setSubmitting(true);
      await apiPatch(`/admin/plans/${planId}/toggle`, { field });
      setMessage(`Plan ${field === 'isActive' ? 'status' : 'visibility'} updated.`);
      fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Toggle failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (planId: number, planName: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove "${planName}"?`)) return;
    try {
      setSubmitting(true);
      await apiDelete(`/admin/plans/${planId}`);
      setMessage(`Plan "${planName}" has been deactivated.`);
      fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Deactivation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered plans list
  const filteredPlans = plans.filter(p => {
    const matchesFilter = 
      activeFilter === 'ALL' || 
      (activeFilter === 'ACTIVE' && p.isActive) ||
      (activeFilter === 'INACTIVE' && !p.isActive) ||
      (activeFilter === 'PUBLIC' && p.isVisible) ||
      (activeFilter === 'VIP' && p.accessTier === 'VIP') ||
      (activeFilter === 'PREMIUM' && p.accessTier === 'PREMIUM') ||
      (activeFilter === 'BASIC' && p.accessTier === 'BASIC');
      
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.accessTier.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Quick count metrics
  const counts = {
    ALL: plans.length,
    ACTIVE: plans.filter(p => p.isActive).length,
    VIP: plans.filter(p => p.accessTier === 'VIP').length,
    PREMIUM: plans.filter(p => p.accessTier === 'PREMIUM').length,
    BASIC: plans.filter(p => p.accessTier === 'BASIC').length,
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0f17] border border-white/10 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#d2fd2a] animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d2fd2a]">MONETIZATION SUITE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">TRADING PLANS MANAGER</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Configure subscription tiers, validity dates, trade credit caps, promotional prices, and member visibility.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchPlans}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#141722] hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all text-gray-300 hover:text-white"
            title="Reload Plan List"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#d2fd2a] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Plans</span>
          </button>

          {/* Primary Create Button */}
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(210,253,42,0.35)] transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span>Create Pricing Plan</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300 flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="rounded-2xl bg-[#d2fd2a]/10 border border-[#d2fd2a]/30 p-4 text-xs text-[#d2fd2a] flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <CheckCircle className="h-4 w-4 shrink-0 text-[#d2fd2a]" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#090b10] border border-white/5 p-4 rounded-2xl">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Plans', count: counts.ALL },
            { id: 'ACTIVE', label: 'Active', count: counts.ACTIVE },
            { id: 'VIP', label: 'VIP Tier', count: counts.VIP },
            { id: 'PREMIUM', label: 'Premium Tier', count: counts.PREMIUM },
            { id: 'BASIC', label: 'Basic Tier', count: counts.BASIC },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-[#d2fd2a] text-black shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeFilter === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search plan name or tier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#11131c] border border-white/10 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d2fd2a]"
          />
        </div>
      </div>

      {/* Plans Directory Grid */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="h-8 w-8 text-[#d2fd2a] animate-spin" />
            <span className="text-xs text-gray-400 font-medium">Loading subscription tiers...</span>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-16 text-center space-y-4 shadow-xl">
            <div className="h-14 w-14 rounded-2xl bg-[#d2fd2a]/10 text-[#d2fd2a] flex items-center justify-center mx-auto">
              <Layers className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No subscription plans found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {searchQuery || activeFilter !== 'ALL'
                  ? 'Try changing your search term or active tier filter.'
                  : 'Start by creating your first subscription pricing tier.'}
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs inline-flex items-center gap-2 shadow-[0_0_15px_rgba(210,253,42,0.3)] transition-transform hover:scale-105"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create First Plan</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map(plan => {
              const hasPromo = !!plan.promoPrice && Number(plan.promoPrice) < Number(plan.price);
              const activePrice = hasPromo ? Number(plan.promoPrice) : Number(plan.price);
              const originalPrice = Number(plan.price);
              const discountPercent = hasPromo ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;

              return (
                <div 
                  key={plan.id} 
                  className={`group bg-[#0e1017] hover:bg-[#11141e] border border-white/10 hover:border-[#d2fd2a]/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 ${
                    !plan.isActive ? 'opacity-65 border-dashed border-dark-700' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                          plan.accessTier === 'VIP'
                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                            : plan.accessTier === 'PREMIUM'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {plan.accessTier} TIER
                        </span>

                        {hasPromo && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#d2fd2a]/15 text-[#d2fd2a] border border-[#d2fd2a]/30 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>{discountPercent}% OFF</span>
                          </span>
                        )}
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Edit Plan Parameters"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(plan.id, plan.name)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                          title="Deactivate / Delete Plan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-[#d2fd2a] transition-colors tracking-tight">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price Banner */}
                  <div className="bg-[#08090d] p-4 rounded-2xl border border-white/5 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">
                        ₹{activePrice.toLocaleString('en-IN')}
                      </span>
                      {hasPromo && (
                        <span className="text-xs text-gray-500 line-through font-semibold">
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-medium">/ {plan.validityDays} Days</span>
                    </div>
                  </div>

                  {/* Plan Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center bg-[#08090d]/60 p-3 rounded-2xl border border-white/5 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">Validity</span>
                      <span className="font-black text-white block">
                        {plan.validityDays} Days
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#d2fd2a]">Trade Credits</span>
                      <span className="font-black text-[#d2fd2a] block">
                        {plan.allowedTrades} Trade Allocations
                      </span>
                    </div>
                  </div>

                  {/* Features Checklist */}
                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <div className="space-y-2 text-xs text-gray-300 py-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                        Included Entitlements
                      </span>
                      {plan.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#d2fd2a] shrink-0" />
                          <span className="text-xs text-gray-300 truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risk Info */}
                  {plan.riskInfo && (
                    <div className="text-[10px] text-gray-400 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="font-bold text-gray-300 block mb-0.5 uppercase tracking-wide">Risk Disclosure</span>
                      <p className="line-clamp-2 leading-relaxed">{plan.riskInfo}</p>
                    </div>
                  )}

                  {/* Status & Visibility Toggle Controls */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleField(plan.id, 'isActive')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        plan.isActive 
                          ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                      }`}
                      title="Click to toggle Active status"
                    >
                      {plan.isActive ? <><CheckCircle2 className="h-3.5 w-3.5" /> Active</> : <><XCircle className="h-3.5 w-3.5" /> Inactive</>}
                    </button>

                    <button
                      onClick={() => handleToggleField(plan.id, 'isVisible')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        plan.isVisible 
                          ? 'bg-white/5 text-gray-300 hover:text-white border border-white/10' 
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                      title="Click to toggle Public Visibility on Website"
                    >
                      {plan.isVisible ? <><Eye className="h-3.5 w-3.5 text-[#d2fd2a]" /> Public</> : <><EyeOff className="h-3.5 w-3.5 text-amber-400" /> Hidden</>}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: CREATE / EDIT PRICING PLAN                                  */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0d0f17] p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-[#d2fd2a]"></span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d2fd2a]">
                    {editingPlan ? 'TIER CUSTOMIZER' : 'NEW TIER CREATOR'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Pricing Tier'}
                </h3>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets */}
            {!editingPlan && (
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Quick Tier Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Basic Starter', price: 499, validity: 7, trades: 2, tier: 'BASIC' as const, features: 'Basic intraday trade setups\nEntry & stop loss alerts\nIn-app notification dispatch' },
                    { name: 'Pro Scalper', price: 1499, promo: 1199, validity: 30, trades: 5, tier: 'PREMIUM' as const, features: 'High-conviction index & options setups\nReal-time trailing stop loss\nScalper AI assistant 100 queries\nVIP webinars access' },
                    { name: 'VIP Institutional Elite', price: 3499, promo: 2999, validity: 90, trades: 15, tier: 'VIP' as const, features: 'VIP direct trader desk setups\nFull multi-target & moonbag updates\nUnlimited Scalper AI intelligence\nExclusive masterclass workshops\nPriority WhatsApp channel' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#d2fd2a]/20 border border-white/10 hover:border-[#d2fd2a]/40 text-gray-300 hover:text-[#d2fd2a] text-xs font-bold transition-all"
                    >
                      +{preset.name} (₹{preset.price})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Plan Name & Access Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Scalper Elite"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Signal Access Tier *
                  </label>
                  <select
                    value={formData.accessTier}
                    onChange={e => setFormData(prev => ({ ...prev, accessTier: e.target.value as any }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  >
                    <option value="BASIC">BASIC TIER</option>
                    <option value="PREMIUM">PREMIUM TIER</option>
                    <option value="VIP">VIP TIER</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Price & Promo Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 1499"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Promo Discount Price (Optional ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1199"
                    value={formData.promoPrice || ''}
                    onChange={e => setFormData(prev => ({ ...prev, promoPrice: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-[#d2fd2a] p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Validity & Allowed Trades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Validity Duration (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 30"
                    value={formData.validityDays}
                    onChange={e => setFormData(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Allowed Trade Credits Cap *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 2"
                    value={formData.allowedTrades}
                    onChange={e => setFormData(prev => ({ ...prev, allowedTrades: Number(e.target.value) }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer bg-[#08090d] p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 accent-[#d2fd2a] rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-white block">Active Status</span>
                    <span className="text-[10px] text-gray-500">Allow users to subscribe to this plan</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer bg-[#08090d] p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={e => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                    className="h-4 w-4 accent-[#d2fd2a] rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-white block">Public Visibility</span>
                    <span className="text-[10px] text-gray-500">Show on public pricing page</span>
                  </div>
                </label>
              </div>

              {/* Row 5: Features */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Plan Features Checklist (One feature per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="High-conviction index setups&#10;Entry & Stop-loss alerts&#10;Live trailing SL updates"
                  value={formData.features}
                  onChange={e => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Row 6: Risk Disclosure */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Risk Disclosure Statement
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Trading derivative contracts involves financial risk..."
                  value={formData.riskInfo}
                  onChange={e => setFormData(prev => ({ ...prev, riskInfo: e.target.value }))}
                  className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(210,253,42,0.35)] transition-transform hover:scale-105"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : editingPlan ? (
                    'Save Adjustments'
                  ) : (
                    'Create Pricing Tier'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
