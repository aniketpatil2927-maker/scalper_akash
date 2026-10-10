import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  TrendingUp, 
  TrendingDown, 
  Send, 
  Trash, 
  Edit3, 
  X,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  Play,
  CheckCircle,
  Clock,
  Radio,
  Users,
  MessageSquare,
  Shield,
  Layers,
  Sparkles,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Zap,
  Target,
  ShieldAlert,
  Percent,
  Check
} from 'lucide-react';

interface Trade {
  id: number;
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: string;
  stopLoss: string;
  target1: string;
  target2: string | null;
  target3: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  accessTier: 'BASIC' | 'PREMIUM' | 'VIP';
  analysis: string | null;
  commentary: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export const TradeManagement: React.FC = () => {
  const { apiGet, apiPost, apiPut } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Filter and search states
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    asset: '',
    direction: 'BUY' as 'BUY' | 'SELL',
    entryPrice: '' as number | '',
    stopLoss: '' as number | '',
    target1: '' as number | '',
    target2: '' as number | '' | null,
    target3: '' as number | '' | null,
    riskLevel: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    accessTier: 'BASIC' as 'BASIC' | 'PREMIUM' | 'VIP',
    analysis: '',
    commentary: '',
    isScheduled: false,
    publishImmediately: false,
    scheduledAt: '',
  });

  // Modals / Overlays
  const [publishConfirmation, setPublishConfirmation] = useState<Trade | null>(null);
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [closeStatus, setCloseStatus] = useState<'CLOSED' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'CANCELLED'>('CLOSED');
  const [closeCommentary, setCloseCommentary] = useState('');

  // Eligible Subscribers Preview Modal
  const [subscribersModalTrade, setSubscribersModalTrade] = useState<Trade | null>(null);
  const [eligibleSubscribersData, setEligibleSubscribersData] = useState<any>(null);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Broadcast Update Modal
  const [broadcastTrade, setBroadcastTrade] = useState<Trade | null>(null);
  const [broadcastCommentary, setBroadcastCommentary] = useState('');
  const [broadcastStopLoss, setBroadcastStopLoss] = useState<number | ''>('');
  const [broadcastTarget1, setBroadcastTarget1] = useState<number | ''>('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/trader/trades');
      setTrades(data || []);
    } catch (err: any) {
      console.error('Failed to load trader trades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTrade(null);
    setFormData({
      asset: '',
      direction: 'BUY',
      entryPrice: '',
      stopLoss: '',
      target1: '',
      target2: '',
      target3: '',
      riskLevel: 'MEDIUM',
      accessTier: 'BASIC',
      analysis: '',
      commentary: '',
      isScheduled: false,
      publishImmediately: false,
      scheduledAt: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setFormData({
      asset: trade.asset,
      direction: trade.direction,
      entryPrice: Number(trade.entryPrice) || '',
      stopLoss: Number(trade.stopLoss) || '',
      target1: Number(trade.target1) || '',
      target2: trade.target2 ? Number(trade.target2) : '',
      target3: trade.target3 ? Number(trade.target3) : '',
      riskLevel: trade.riskLevel,
      accessTier: trade.accessTier,
      analysis: trade.analysis || '',
      commentary: trade.commentary || '',
      isScheduled: trade.status === 'SCHEDULED',
      publishImmediately: false,
      scheduledAt: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrade(null);
  };

  const handleSubmit = async (e: React.FormEvent, shouldPublish = false) => {
    e.preventDefault();
    if (!formData.asset || !formData.entryPrice || !formData.stopLoss || !formData.target1) {
      setError('Please fill in all mandatory trade setup fields (Asset, Entry, Stop Loss, Target 1)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const payload = {
        asset: formData.asset.trim().toUpperCase(),
        direction: formData.direction,
        entryPrice: Number(formData.entryPrice),
        stopLoss: Number(formData.stopLoss),
        target1: Number(formData.target1),
        target2: formData.target2 ? Number(formData.target2) : null,
        target3: formData.target3 ? Number(formData.target3) : null,
        riskLevel: formData.riskLevel,
        accessTier: formData.accessTier,
        analysis: formData.analysis || null,
        commentary: formData.commentary || null,
      };

      if (editingTrade) {
        await apiPut(`/trader/trades/${editingTrade.id}`, payload);
        setMessage(`Trade signal ${formData.asset} updated successfully.`);
      } else {
        const created = await apiPost('/trader/trades', payload);
        
        // If immediate publish was requested
        if (shouldPublish || formData.publishImmediately) {
          await apiPost(`/trader/trades/${created.id}/publish`, {});
          setMessage(`🚀 Trade signal ${formData.asset} created and broadcasted live to ${formData.accessTier} subscribers!`);
        } else {
          setMessage(`Trade signal ${formData.asset} saved successfully as draft.`);
        }
      }

      handleCloseModal();
      fetchTrades();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSubscribersPreview = async (trade: Trade) => {
    setSubscribersModalTrade(trade);
    try {
      setLoadingSubscribers(true);
      const res = await apiGet(`/trader/trades/${trade.id}/subscribers`);
      setEligibleSubscribersData(res);
    } catch (err: any) {
      console.error('Failed to load eligible subscribers:', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (!publishConfirmation) return;
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const res = await apiPost(`/trader/trades/${publishConfirmation.id}/publish`, {});
      setMessage(res.message || `Signal published and allocated to eligible subscribers!`);
      setPublishConfirmation(null);
      fetchTrades();
    } catch (err: any) {
      setError(err.message || 'Publishing failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTrade) return;
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const res = await apiPost(`/trader/trades/${broadcastTrade.id}/broadcast`, {
        commentary: broadcastCommentary,
        stopLoss: broadcastStopLoss ? Number(broadcastStopLoss) : undefined,
        target1: broadcastTarget1 ? Number(broadcastTarget1) : undefined,
        updateType: broadcastStopLoss ? 'STOP_LOSS_UPDATE' : 'COMMENTARY',
      });

      setMessage(res.message || 'Live update dispatched to subscribers!');
      setBroadcastTrade(null);
      setBroadcastCommentary('');
      setBroadcastStopLoss('');
      setBroadcastTarget1('');
      fetchTrades();
    } catch (err: any) {
      setError(err.message || 'Broadcast failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingTrade) return;
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      await apiPost(`/trader/trades/${closingTrade.id}/close`, {
        status: closeStatus,
        commentary: closeCommentary,
      });

      setMessage(`Trade closed successfully with outcome: ${closeStatus}`);
      setClosingTrade(null);
      setCloseCommentary('');
      fetchTrades();
    } catch (err: any) {
      setError(err.message || 'Closing failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered trades list
  const filteredTrades = trades.filter(t => {
    const matchesFilter = activeFilter === 'ALL' || t.status === activeFilter;
    const matchesSearch = !searchQuery || 
      t.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.accessTier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Quick stats counts
  const counts = {
    ALL: trades.length,
    ACTIVE: trades.filter(t => t.status === 'ACTIVE').length,
    DRAFT: trades.filter(t => t.status === 'DRAFT').length,
    TARGET_HIT: trades.filter(t => t.status === 'TARGET_HIT').length,
    STOP_LOSS_HIT: trades.filter(t => t.status === 'STOP_LOSS_HIT').length,
    CLOSED: trades.filter(t => t.status === 'CLOSED').length,
    SCHEDULED: trades.filter(t => t.status === 'SCHEDULED').length,
  };

  // Live Risk-Reward calculation for modal
  const calcMetrics = () => {
    const entry = Number(formData.entryPrice);
    const sl = Number(formData.stopLoss);
    const tgt = Number(formData.target1);

    if (!entry || !sl || !tgt) return null;

    const isBuy = formData.direction === 'BUY';
    const riskPts = isBuy ? entry - sl : sl - entry;
    const rewardPts = isBuy ? tgt - entry : entry - tgt;

    const riskPercent = ((riskPts / entry) * 100).toFixed(1);
    const rewardPercent = ((rewardPts / entry) * 100).toFixed(1);
    const rrRatio = riskPts > 0 ? (rewardPts / riskPts).toFixed(2) : '0';

    return { riskPts, rewardPts, riskPercent, rewardPercent, rrRatio };
  };

  const modalMetrics = calcMetrics();

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0f17] border border-white/10 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#d2fd2a] animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d2fd2a]">SIGNALS COMMAND CENTER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">TRADES DESK MANAGEMENT</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Author high-probability setups, preview subscriber reach, dispatch live updates, and manage the trade lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={fetchTrades}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#141722] hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all text-gray-300 hover:text-white"
            title="Reload Signal Feed"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#d2fd2a] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Desk</span>
          </button>

          {/* Primary Create Button */}
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(210,253,42,0.35)] transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span>Create Trade Signal</span>
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
          <Check className="h-4 w-4 shrink-0 text-[#d2fd2a]" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#090b10] border border-white/5 p-4 rounded-2xl">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Signals', count: counts.ALL },
            { id: 'ACTIVE', label: 'Active', count: counts.ACTIVE },
            { id: 'DRAFT', label: 'Drafts', count: counts.DRAFT },
            { id: 'TARGET_HIT', label: 'Target Hit', count: counts.TARGET_HIT },
            { id: 'STOP_LOSS_HIT', label: 'Stop Loss Hit', count: counts.STOP_LOSS_HIT },
            { id: 'CLOSED', label: 'Closed', count: counts.CLOSED },
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
            placeholder="Search symbol (e.g. NIFTY, VIP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#11131c] border border-white/10 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d2fd2a]"
          />
        </div>
      </div>

      {/* Signals Directory Cards Grid */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="h-8 w-8 text-[#d2fd2a] animate-spin" />
            <span className="text-xs text-gray-400 font-medium">Loading trade setups...</span>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="bg-[#0d0f17] border border-white/10 rounded-3xl p-16 text-center space-y-4 shadow-xl">
            <div className="h-14 w-14 rounded-2xl bg-[#d2fd2a]/10 text-[#d2fd2a] flex items-center justify-center mx-auto">
              <Radio className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No trade signals found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {searchQuery || activeFilter !== 'ALL' 
                  ? 'Try adjusting your filter or search query.' 
                  : 'Start publishing high-conviction trades to active subscribers.'}
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs inline-flex items-center gap-2 shadow-[0_0_15px_rgba(210,253,42,0.3)] transition-transform hover:scale-105"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create First Signal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrades.map(trade => {
              const entry = Number(trade.entryPrice);
              const sl = Number(trade.stopLoss);
              const t1 = Number(trade.target1);
              const isBuy = trade.direction === 'BUY';
              
              const rewardPts = isBuy ? (t1 - entry) : (entry - t1);
              const riskPts = isBuy ? (entry - sl) : (sl - entry);
              const rewardPct = ((rewardPts / entry) * 100).toFixed(1);
              const riskPct = ((riskPts / entry) * 100).toFixed(1);
              const rrRatio = riskPts > 0 ? (rewardPts / riskPts).toFixed(2) : '0';

              return (
                <div 
                  key={trade.id} 
                  className="group bg-[#0e1017] hover:bg-[#11141e] border border-white/10 hover:border-[#d2fd2a]/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 ${
                          isBuy 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          <span>{trade.direction}</span>
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          trade.accessTier === 'VIP'
                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                            : trade.accessTier === 'PREMIUM'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {trade.accessTier} TIER
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          trade.riskLevel === 'HIGH'
                            ? 'bg-rose-500/10 text-rose-400'
                            : trade.riskLevel === 'LOW'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {trade.riskLevel} RISK
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white group-hover:text-[#d2fd2a] transition-colors tracking-tight">
                        {trade.asset}
                      </h3>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Authored: {new Date(trade.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider block text-center ${
                        trade.status === 'ACTIVE'
                          ? 'bg-[#d2fd2a]/15 text-[#d2fd2a] border-[#d2fd2a]/40 shadow-[0_0_10px_rgba(210,253,42,0.2)]'
                          : trade.status === 'TARGET_HIT'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : trade.status === 'STOP_LOSS_HIT'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : trade.status === 'SCHEDULED'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {trade.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Levels Display Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-[#08090d] p-3.5 rounded-2xl border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">Entry</span>
                      <span className="font-black text-white text-xs block">
                        ₹{entry.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400">Stop Loss</span>
                      <span className="font-black text-rose-400 text-xs block">
                        ₹{sl.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-rose-500 font-semibold block leading-none">
                        -{Math.abs(riskPts)} ({riskPct}%)
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">Target 1</span>
                      <span className="font-black text-emerald-400 text-xs block">
                        ₹{t1.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-semibold block leading-none">
                        +{Math.abs(rewardPts)} ({rewardPct}%)
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#d2fd2a]">R : R Ratio</span>
                      <span className="font-black text-white text-xs block">
                        1 : {rrRatio}
                      </span>
                      <span className="text-[8px] text-gray-500 block truncate">
                        {trade.target2 ? `T2: ₹${Number(trade.target2).toLocaleString('en-IN')}` : 'Single Target'}
                      </span>
                    </div>
                  </div>

                  {/* Market Analysis Commentary */}
                  {trade.analysis && (
                    <div className="text-xs text-gray-300 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider block mb-1">
                        Technical Setup & Rationale
                      </span>
                      <p className="line-clamp-2 leading-relaxed text-gray-300">
                        {trade.analysis}
                      </p>
                    </div>
                  )}

                  {/* Card Action Footer */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    
                    {/* View Audience Reach */}
                    <button
                      onClick={() => handleOpenSubscribersPreview(trade)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="View Eligible Subscribers for this signal"
                    >
                      <Users className="h-3.5 w-3.5 text-[#d2fd2a]" />
                      <span>Subscribers</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Publish CTA for DRAFT or SCHEDULED */}
                      {['DRAFT', 'SCHEDULED'].includes(trade.status) && (
                        <button
                          onClick={() => setPublishConfirmation(trade)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                          title="Publish & Allocate Trade"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Publish Now</span>
                        </button>
                      )}

                      {/* Live Broadcast Update for ACTIVE signals */}
                      {trade.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setBroadcastTrade(trade);
                            setBroadcastStopLoss(Number(trade.stopLoss));
                            setBroadcastTarget1(Number(trade.target1));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#d2fd2a]/15 hover:bg-[#d2fd2a]/25 text-[#d2fd2a] border border-[#d2fd2a]/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Dispatch Live Trail SL / Commentary Broadcast"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Broadcast Update</span>
                        </button>
                      )}

                      {/* Edit Signal Details */}
                      {['DRAFT', 'SCHEDULED', 'ACTIVE'].includes(trade.status) && (
                        <button
                          onClick={() => handleEdit(trade)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Edit Details"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Settle / Close Signal */}
                      {trade.status === 'ACTIVE' && (
                        <button
                          onClick={() => setClosingTrade(trade)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="Close or Set Trade Outcome"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Close Trade</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: CREATE / EDIT TRADE SIGNAL                                  */}
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
                    {editingTrade ? 'SIGNAL ADJUSTMENT DESK' : 'NEW SIGNAL CREATOR'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {editingTrade ? `Edit Signal: ${editingTrade.asset}` : 'Create High-Conviction Trade Signal'}
                </h3>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Symbol Shortcuts */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Quick Preset Symbols
              </span>
              <div className="flex flex-wrap gap-2">
                {['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'CRUDEOIL', 'BTC/USDT', 'RELIANCE'].map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, asset: sym }))}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#d2fd2a]/20 border border-white/10 hover:border-[#d2fd2a]/40 text-gray-300 hover:text-[#d2fd2a] text-[10px] font-bold transition-all"
                  >
                    +{sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Risk-Reward Strip */}
            {modalMetrics && (
              <div className="p-4 rounded-2xl bg-[#08090d] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#d2fd2a]" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Risk-to-Reward Ratio</span>
                    <span className="text-sm font-black text-white block">1 : {modalMetrics.rrRatio} R:R</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold block">Expected Gain</span>
                    <span className="font-extrabold text-emerald-400">+{modalMetrics.rewardPts} pts (+{modalMetrics.rewardPercent}%)</span>
                  </div>
                  <div className="h-6 w-[1px] bg-white/10" />
                  <div>
                    <span className="text-[10px] text-rose-400 font-bold block">Defensive Risk</span>
                    <span className="font-extrabold text-rose-400">-{modalMetrics.riskPts} pts (-{modalMetrics.riskPercent}%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={e => handleSubmit(e, false)} className="space-y-4">
              
              {/* Row 1: Symbol & Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Asset Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BANKNIFTY 48200 CE"
                    value={formData.asset}
                    onChange={e => setFormData(prev => ({ ...prev, asset: e.target.value }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Direction (Setup Bias) *
                  </label>
                  <select
                    value={formData.direction}
                    onChange={e => setFormData(prev => ({ ...prev, direction: e.target.value as any }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  >
                    <option value="BUY">🟢 BUY (Bullish Long)</option>
                    <option value="SELL">🔴 SELL (Bearish Short)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Entry & Stop Loss */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Entry Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 310"
                    value={formData.entryPrice}
                    onChange={e => setFormData(prev => ({ ...prev, entryPrice: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Stop Loss (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 260"
                    value={formData.stopLoss}
                    onChange={e => setFormData(prev => ({ ...prev, stopLoss: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-rose-400 p-3 focus:border-rose-500 focus:outline-none font-black"
                  />
                </div>
              </div>

              {/* Row 3: Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Target 1 (Primary) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 380"
                    value={formData.target1}
                    onChange={e => setFormData(prev => ({ ...prev, target1: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-emerald-400 p-3 focus:border-emerald-500 focus:outline-none font-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Target 2 (Extended)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={formData.target2 || ''}
                    onChange={e => setFormData(prev => ({ ...prev, target2: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Target 3 (Moonbag)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={formData.target3 || ''}
                    onChange={e => setFormData(prev => ({ ...prev, target3: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Row 4: Risk Rating & Access Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Risk Rating
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={e => setFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  >
                    <option value="LOW">🛡️ LOW RISK (1-2% SL)</option>
                    <option value="MEDIUM">⚡ MEDIUM RISK (Scalping)</option>
                    <option value="HIGH">🔥 HIGH RISK (Hero/Zero)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Subscriber Access Tier
                  </label>
                  <select
                    value={formData.accessTier}
                    onChange={e => setFormData(prev => ({ ...prev, accessTier: e.target.value as any }))}
                    className="w-full rounded-xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:border-[#d2fd2a] focus:outline-none font-bold"
                  >
                    <option value="BASIC">BASIC TIER & Above</option>
                    <option value="PREMIUM">PREMIUM TIER & VIP</option>
                    <option value="VIP">VIP TIER (Exclusive Only)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Technical Rationale */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Market Analysis & Technical Setup Rationale
                </label>
                <textarea
                  rows={3}
                  placeholder="Bullish breakout above 15m VWAP resistance with institutional delta volume confirmation..."
                  value={formData.analysis}
                  onChange={e => setFormData(prev => ({ ...prev, analysis: e.target.value }))}
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
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#1c202e] hover:bg-[#252b3d] text-white font-bold text-xs transition-colors border border-white/10"
                >
                  {submitting ? 'Saving...' : editingTrade ? 'Save Changes' : 'Save as Draft'}
                </button>

                {!editingTrade && (
                  <button
                    type="button"
                    onClick={e => handleSubmit(e, true)}
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(210,253,42,0.35)] transition-transform hover:scale-105"
                  >
                    {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Publish & Allocate Now</>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. Modal: Publish Confirmation Screen                                    */}
      {/* ========================================================================= */}
      {publishConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#d2fd2a]/40 bg-[#0d0f17] p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#d2fd2a]" />
                <span>Confirm Signal Publishing</span>
              </h3>
              <button onClick={() => setPublishConfirmation(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="rounded-2xl bg-[#08090d] border border-white/10 p-4 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Asset & Direction:</span>
                <span className="font-bold text-white">{publishConfirmation.asset} ({publishConfirmation.direction})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Access Tier:</span>
                <span className="font-bold text-[#d2fd2a]">{publishConfirmation.accessTier} TIER</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entry & Stop Loss:</span>
                <span className="font-semibold text-white">₹{Number(publishConfirmation.entryPrice).toLocaleString('en-IN')} | SL: ₹{Number(publishConfirmation.stopLoss).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#d2fd2a]/10 border border-[#d2fd2a]/20 p-4 text-xs text-gray-200 leading-relaxed">
              <strong className="text-[#d2fd2a]">Two-Trade Allocation Engine:</strong> Publishing this signal will instantly allocate it to all active, eligible subscribers in the <strong>{publishConfirmation.accessTier}</strong> tier, deducting exactly 1 trade credit and triggering instant alerts.
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePublishConfirm}
                disabled={submitting}
                className="flex-1 py-3 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Confirm & Publish Now</>}
              </button>
              <button
                onClick={() => setPublishConfirmation(null)}
                className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Modal: View Eligible Subscribers                                      */}
      {/* ========================================================================= */}
      {subscribersModalTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0d0f17] p-6 space-y-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#d2fd2a]" />
                  <span>Eligible Subscribers Audience</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Showing active users matching {subscribersModalTrade.accessTier} Tier for {subscribersModalTrade.asset}
                </p>
              </div>
              <button onClick={() => setSubscribersModalTrade(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingSubscribers ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="h-6 w-6 text-[#d2fd2a] animate-spin" />
                </div>
              ) : !eligibleSubscribersData?.subscribers || eligibleSubscribersData.subscribers.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">
                  No active subscribers currently match the {subscribersModalTrade.accessTier} Tier with trade credits remaining.
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#d2fd2a] mb-2 flex items-center justify-between">
                    <span>Total Qualified Audience:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d2fd2a]/20 text-[#d2fd2a]">
                      {eligibleSubscribersData.eligibleCount} subscriber(s)
                    </span>
                  </div>
                  {eligibleSubscribersData.subscribers.map((sub: any, i: number) => (
                    <div key={i} className="rounded-2xl bg-[#08090d] p-3.5 border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{sub.user.fullName}</span>
                        <span className="text-gray-400 text-[11px]">{sub.user.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-[#d2fd2a]/15 text-[#d2fd2a] font-bold text-[10px] block mb-1">
                          {sub.remainingTrades} Credits Left
                        </span>
                        <span className="text-[10px] text-gray-500">Exp: {new Date(sub.expiryDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSubscribersModalTrade(null)}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Modal: Send Broadcast Update                                          */}
      {/* ========================================================================= */}
      {broadcastTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#d2fd2a]/40 bg-[#0d0f17] p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#d2fd2a]" />
                <span>Broadcast Live Update ({broadcastTrade.asset})</span>
              </h3>
              <button onClick={() => setBroadcastTrade(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Commentary Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Target 1 achieved! Trailing stop loss to cost 48,200..."
                  value={broadcastCommentary}
                  onChange={e => setBroadcastCommentary(e.target.value)}
                  className="w-full rounded-2xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:outline-none focus:border-[#d2fd2a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Updated Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={broadcastStopLoss}
                    onChange={e => setBroadcastStopLoss(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-2xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:outline-none focus:border-[#d2fd2a]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Updated Target 1 (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={broadcastTarget1}
                    onChange={e => setBroadcastTarget1(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-2xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:outline-none focus:border-[#d2fd2a]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-full bg-[#d2fd2a] hover:bg-[#bce622] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Dispatch Update</>}
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastTrade(null)}
                  className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Modal: Close / Settle Signal Panel                                    */}
      {/* ========================================================================= */}
      {closingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-[#0d0f17] p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-rose-400" />
                <span>Close Signal ({closingTrade.asset})</span>
              </h3>
              <button onClick={() => setClosingTrade(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Outcome Status</label>
                <select
                  value={closeStatus}
                  onChange={e => setCloseStatus(e.target.value as any)}
                  className="w-full rounded-2xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:outline-none focus:border-rose-500"
                >
                  <option value="TARGET_HIT">🎯 TARGET_HIT (Profit Target Reached)</option>
                  <option value="STOP_LOSS_HIT">🛡️ STOP_LOSS_HIT (Defensive Stop Loss Triggered)</option>
                  <option value="CLOSED">🔒 CLOSED (Manual Order Exit)</option>
                  <option value="CANCELLED">❌ CANCELLED (Void / Cancel Before Entry)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Outcome Commentary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Target 1 reached at 380 (+70 pts). Booking profit and closing setup..."
                  value={closeCommentary}
                  onChange={e => setCloseCommentary(e.target.value)}
                  className="w-full rounded-2xl bg-[#08090d] border border-white/10 text-xs text-white p-3 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm Outcome & Close'}
                </button>
                <button
                  type="button"
                  onClick={() => setClosingTrade(null)}
                  className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
