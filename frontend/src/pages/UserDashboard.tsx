import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CommunityChannels } from '../components/CommunityChannels.js';
import { TraderScoreCard } from '../components/TraderScoreCard';
import { 
  Calculator, 
  BookOpen, 
  MessageSquare, 
  Users, 
  FlaskConical, 
  ShoppingBag, 
  Award,
  Sparkles,
  ArrowRight
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
  analysis: string | null;
  commentary: string | null;
  publishedAt: string | null;
  allocatedAt: string;
  TradeUpdates?: any[];
}

export const UserDashboard: React.FC = () => {
  const { apiGet, subscription, user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    fetchMyTrades();
  }, []);

  const fetchMyTrades = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/trades');
      setTrades(data);
      if (data.length > 0) {
        setSelectedTrade(data[0]); // default to first trade for details view
      }
    } catch (err) {
      console.error('Failed to load user trades:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeTrades = trades.filter(t => ['ACTIVE', 'PUBLISHED'].includes(t.status));
  const completedTrades = trades.filter(t => !['ACTIVE', 'PUBLISHED', 'DRAFT'].includes(t.status));

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-dark-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Scalper Akash Complete Ecosystem
          </div>
          <h1 className="text-2xl font-black text-white">Welcome, {user?.fullName}</h1>
          <p className="text-xs text-gray-400 mt-1">Access your live trading desk, playbooks, quant strategy lab, and calculators.</p>
        </div>
        <button 
          onClick={fetchMyTrades}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-700 hover:bg-dark-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className="h-3 w-3" /> Refresh Signals
        </button>
      </div>

      {/* Akash Trader Score Meter */}
      <TraderScoreCard />

      {/* V2 Ecosystem Hub Launchers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <Link to="/dashboard/tools" className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all group shadow-lg">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 mb-2 group-hover:scale-110 transition-transform">
            <Calculator className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">12 Calculators</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Risk & Position Size</span>
        </Link>

        <Link to="/dashboard/playbooks" className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all group shadow-lg">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Playbooks</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Execution Rules</span>
        </Link>

        <Link to="/dashboard/strategy-lab" className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all group shadow-lg">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 mb-2 group-hover:scale-110 transition-transform">
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Strategy Lab</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Quant Backtester</span>
        </Link>

        <Link to="/dashboard/community" className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all group shadow-lg">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Community</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Live Discussions</span>
        </Link>

        <Link to="/dashboard/mentorship" className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all group shadow-lg">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 mb-2 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Mentorship</span>
          <span className="text-[10px] text-slate-400 mt-0.5">1-on-1 Sessions</span>
        </Link>

        <Link to="/dashboard/marketplace" className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center transition-all group shadow-lg">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 mb-2 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Marketplace</span>
          <span className="text-[10px] text-slate-400 mt-0.5">eBooks & Bundles</span>
        </Link>
      </div>

      {/* Plan Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscription ? (
          <>
            <div className="rounded-xl bg-dark-800 p-6 flex flex-col justify-between glow-card-emerald animate-fade-in">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Active Plan</span>
                <span className="text-lg font-black text-white">{subscription.planName}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-accent-emerald">
                <CheckCircle className="h-4 w-4" /> Account is active and eligible
              </div>
            </div>

            <div className="rounded-xl bg-dark-800 p-6 flex flex-col justify-between glow-card animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Plan Expiration</span>
                <span className="text-lg font-black text-white flex items-center gap-1.5">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  {new Date(subscription.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <span className="mt-4 text-xs text-gray-400">
                Auto-expires in {Math.max(0, Math.ceil((new Date(subscription.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
              </span>
            </div>

            <div className="rounded-xl bg-dark-800 p-6 flex flex-col justify-between glow-card animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Trade Opportunities</span>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-2xl font-black text-white">{subscription.remainingTrades} / {subscription.allowedTrades}</span>
                  <span className="text-xs text-gray-400">Remaining credits</span>
                </div>
              </div>
              <div className="mt-4 w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-accent-blue h-1.5 transition-all" 
                  style={{ width: `${(subscription.remainingTrades / subscription.allowedTrades) * 100}%` }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <div className="md:col-span-3 rounded-xl border border-accent-gold bg-accent-gold/5 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-accent-gold mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Active Subscription</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto mb-4">
              You must purchase a trading plan to receive high-conviction trade setups.
            </p>
            <Link 
              to="/dashboard/plans" 
              className="lime-gradient-btn"
            >
              Browse Trading Plans
            </Link>
          </div>
        )}
      </div>

      {/* Official Telegram & WhatsApp VIP Community Channels */}
      <CommunityChannels isVip={!!subscription} />

      {/* Trading Performance & Desk Telemetry */}
      {subscription && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '450ms' }}>
          
          {/* Real Live Signals Telemetry Banner (2 columns) */}
          <div className="md:col-span-2 rounded-xl bg-dark-800 p-6 glow-card flex flex-col justify-between">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Live Telemetry</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Assigned Signals Allocation & Status</h3>
              </div>
              <Link 
                to="/dashboard/analytics" 
                className="text-xs font-bold text-accent-cyan bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Advanced Analytics &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto py-2">
              <div className="p-3 bg-dark-900/60 border border-dark-750 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Allocated</span>
                <span className="text-xl font-black text-white mt-0.5 block">{trades.length}</span>
                <span className="text-[9px] text-gray-500">Total setups</span>
              </div>
              <div className="p-3 bg-dark-900/60 border border-dark-750 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">In-Market</span>
                <span className="text-xl font-black text-accent-cyan mt-0.5 block">{activeTrades.length}</span>
                <span className="text-[9px] text-accent-cyan">Active trades</span>
              </div>
              <div className="p-3 bg-dark-900/60 border border-dark-750 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Target Won</span>
                <span className="text-xl font-black text-accent-emerald mt-0.5 block">
                  {trades.filter(t => t.status === 'TARGET_HIT').length}
                </span>
                <span className="text-[9px] text-accent-emerald">Profit locked</span>
              </div>
              <div className="p-3 bg-dark-900/60 border border-dark-750 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Risk Guard</span>
                <span className="text-xl font-black text-accent-rose mt-0.5 block">
                  {trades.filter(t => t.status === 'STOP_LOSS_HIT').length}
                </span>
                <span className="text-[9px] text-accent-rose">SL contained</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-dark-700/60 pt-3 mt-2">
              <span>Automated 2-Trade Allocation Active</span>
              <Link to="/dashboard/journal" className="text-accent-emerald font-semibold hover:underline">
                Open Personal Trading Journal &rarr;
              </Link>
            </div>
          </div>

          {/* Key Trade Analytics (1 column) */}
          <div className="md:col-span-1 rounded-xl bg-dark-800 p-6 glow-card flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-3">Desk Analytics</span>
              <h3 className="text-sm font-bold text-white mb-4">Signal Specifications</h3>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total Assigned</span>
                  <span className="font-semibold text-white">{trades.length} Setups</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-dark-700/60 pt-2">
                  <span className="text-gray-400">Active Positions</span>
                  <span className="font-semibold text-accent-cyan">{activeTrades.length} In-Market</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-dark-700/60 pt-2">
                  <span className="text-gray-400">Completed Positions</span>
                  <span className="font-semibold text-white">{completedTrades.length} Closed</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-dark-700/60 pt-2">
                  <span className="text-gray-400">Execution Discipline</span>
                  <span className="font-semibold text-accent-emerald">Strict 1:2+ R:R</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-dark-700/60 flex items-center justify-between text-[10px]">
              <span className="text-gray-500">Live Trade Stream</span>
              <span className="text-accent-emerald font-semibold uppercase tracking-wider">Operational</span>
            </div>
          </div>

        </div>
      )}

      {/* Main Signal Display Board */}
      {subscription && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Trades Left Column */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-accent-blue" />
              <span>Active Signals ({activeTrades.length})</span>
            </h2>

            {loading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-6 w-6 text-accent-blue animate-spin" />
              </div>
            ) : activeTrades.length === 0 ? (
              <div className="rounded-xl border border-dark-700 bg-dark-900/40 p-8 text-center text-xs text-gray-500">
                No active signals yet. You will be notified immediately when the trader publishes new setups.
              </div>
            ) : (
              <div className="space-y-4">
                {activeTrades.map(trade => (
                  <div 
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    className={`p-4 cursor-pointer transition-all replica-card ${
                      selectedTrade?.id === trade.id 
                        ? 'replica-card-active font-semibold' 
                        : 'text-gray-400'
                    }`}
                  >
                    {/* Card Header matching mockup style */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan font-black text-xs border border-accent-cyan/20">
                          {trade.asset.charAt(0)}
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-white block leading-none">{trade.asset}</span>
                          <span className="text-[9px] text-gray-500 font-medium">Perpetual Futures</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                        trade.direction === 'BUY' 
                          ? 'bg-accent-cyan/15 text-accent-cyan' 
                          : 'bg-accent-rose/15 text-accent-rose'
                      }`}>
                        {trade.direction}
                      </span>
                    </div>

                    {/* ROI / Pricing Focus */}
                    <div className="my-3 text-left">
                      <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Potential ROI Target</span>
                      <span className="text-2xl font-black text-white block mt-0.5">
                        +{((Number(trade.target1) - Number(trade.entryPrice)) / Number(trade.entryPrice) * 100).toFixed(2)}%
                      </span>
                    </div>

                    {/* Real Risk-Reward Visual Ratio */}
                    <div className="my-3 p-2.5 rounded-lg bg-dark-900/60 border border-dark-750">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-1.5">
                        <span>Risk : Reward Ratio</span>
                        <span className="text-accent-emerald">
                          1 : {Math.abs((Number(trade.target1) - Number(trade.entryPrice)) / (Number(trade.entryPrice) - Number(trade.stopLoss) || 1)).toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-dark-750 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-accent-rose h-full" style={{ width: '30%' }} />
                        <div className="bg-accent-emerald h-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    {/* Stats Footer Row */}
                    <div className="grid grid-cols-3 gap-1 border-t border-dark-700/60 pt-2.5 mt-2.5 text-center text-[10px]">
                      <div className="border-r border-dark-700/50">
                        <span className="text-gray-500 block uppercase font-medium">Entry</span>
                        <span className="font-bold text-white mt-0.5 block">₹{Number(trade.entryPrice).toLocaleString()}</span>
                      </div>
                      <div className="border-r border-dark-700/50">
                        <span className="text-gray-500 block uppercase font-medium">Target 1</span>
                        <span className="font-bold text-accent-cyan mt-0.5 block">₹{Number(trade.target1).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase font-medium">Stop Loss</span>
                        <span className="font-bold text-accent-rose mt-0.5 block">₹{Number(trade.stopLoss).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trade Details Right Column (2x span) */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5 mb-4">
              <FileText className="h-4 w-4 text-accent-blue" />
              <span>Signal Specifications</span>
            </h2>

            {selectedTrade ? (
              <div className="rounded-xl bg-dark-800 p-6 space-y-6 shadow-2xl glass-panel animate-fade-in">
                
                {/* Details Header */}
                <div className="flex justify-between items-center border-b border-dark-700 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{selectedTrade.asset}</span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        selectedTrade.direction === 'BUY' 
                          ? 'bg-accent-emerald/10 text-accent-emerald' 
                          : 'bg-accent-rose/10 text-accent-rose'
                      }`}>
                        {selectedTrade.direction}
                      </span>
                    </h3>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Signal Published: {selectedTrade.publishedAt ? new Date(selectedTrade.publishedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">STATUS</span>
                    <span className="inline-block mt-0.5 px-3 py-1 rounded text-xs font-bold bg-dark-900 border border-dark-700 text-accent-blue">
                      {selectedTrade.status}
                    </span>
                  </div>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-dark-900/50 p-4 border border-dark-750">
                    <span className="text-[10px] text-gray-400 block uppercase">Entry Range</span>
                    <span className="text-base font-extrabold text-white mt-1 block">₹{Number(selectedTrade.entryPrice).toLocaleString()}</span>
                  </div>

                  <div className="rounded-lg bg-dark-900/50 p-4 border border-dark-750">
                    <span className="text-[10px] text-gray-400 block uppercase">Stop Loss</span>
                    <span className="text-base font-extrabold text-accent-rose mt-1 block">₹{Number(selectedTrade.stopLoss).toLocaleString()}</span>
                  </div>

                  <div className="rounded-lg bg-dark-900/50 p-4 border border-dark-750">
                    <span className="text-[10px] text-gray-400 block uppercase">Target 1</span>
                    <span className="text-base font-extrabold text-accent-emerald mt-1 block">₹{Number(selectedTrade.target1).toLocaleString()}</span>
                  </div>

                  <div className="rounded-lg bg-dark-900/50 p-4 border border-dark-750">
                    <span className="text-[10px] text-gray-400 block uppercase">Target 2 / 3</span>
                    <span className="text-xs font-bold text-white mt-1 block">
                      T2: ₹{selectedTrade.target2 ? Number(selectedTrade.target2).toLocaleString() : '--'} <br />
                      T3: ₹{selectedTrade.target3 ? Number(selectedTrade.target3).toLocaleString() : '--'}
                    </span>
                  </div>
                </div>

                {/* Technical Analysis Section */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Trader's Technical Analysis</span>
                  <div className="rounded-lg bg-dark-900 border border-dark-750 p-4 text-xs leading-relaxed text-gray-300">
                    {selectedTrade.analysis || 'Technical commentary and chart patterns will be updated shortly.'}
                  </div>
                </div>

                {/* Commentary Updates Log */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Real-time Trade Updates Log</span>
                  {selectedTrade.TradeUpdates && selectedTrade.TradeUpdates.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTrade.TradeUpdates.map((update: any) => (
                        <div key={update.id} className="rounded-lg border border-dark-750 p-3 flex justify-between gap-4">
                          <div className="text-xs">
                            <span className="font-bold text-accent-gold">{update.updateType}</span>
                            <p className="text-gray-400 mt-1">{update.commentary}</p>
                          </div>
                          <span className="text-[9px] text-gray-500 shrink-0">{new Date(update.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dark-750 border-dashed p-4 text-center text-xs text-gray-500">
                      No status adjustments or stop-loss movements logged yet.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="rounded-xl border border-dark-700 bg-dark-900/40 p-12 text-center text-xs text-gray-500">
                Select an active signal from the left list to view technical drawings, commentaries, and target logs.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Trade History Row */}
      {subscription && completedTrades.length > 0 && (
        <div className="border-t border-dark-800 pt-8">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>Closed Signals History ({completedTrades.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTrades.map(trade => (
              <div key={trade.id} className="rounded-xl border border-dark-700 bg-dark-900/40 p-4 opacity-75">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white">{trade.asset}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    trade.status === 'TARGET_HIT' 
                      ? 'bg-accent-emerald/10 text-accent-emerald' 
                      : trade.status === 'STOP_LOSS_HIT' 
                      ? 'bg-accent-rose/10 text-accent-rose'
                      : 'bg-dark-700 text-gray-400'
                  }`}>
                    {trade.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400">
                  <div>
                    <span>Entry</span>
                    <span className="block font-semibold text-white">₹{Number(trade.entryPrice).toLocaleString()}</span>
                  </div>
                  <div>
                    <span>Target 1</span>
                    <span className="block font-semibold text-accent-emerald">₹{Number(trade.target1).toLocaleString()}</span>
                  </div>
                  <div>
                    <span>SL</span>
                    <span className="block font-semibold text-accent-rose">₹{Number(trade.stopLoss).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-3 border-t border-dark-800 pt-2 flex justify-between">
                  <span>Outcome: {trade.commentary || 'Setup Closed'}</span>
                  <span>{new Date(trade.allocatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

interface ActivityProps {
  className?: string;
}

const Activity: React.FC<ActivityProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
