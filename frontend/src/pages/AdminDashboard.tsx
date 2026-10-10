import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  Layers, 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  TrendingDown, 
  BookOpen, 
  Video, 
  Zap, 
  Award, 
  Sparkles,
  Share2,
  Percent,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  CreditCard,
  Target,
  FileText,
  Calendar,
  ChevronRight,
  Coins
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { apiGet } = useAuth();
  const [data, setData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpisData, revData] = await Promise.all([
        apiGet('/admin/dashboard'),
        apiGet('/revenue/admin/analytics').catch(() => null),
      ]);
      setData(kpisData);
      setRevenueData(revData);
    } catch (err) {
      console.error('Failed to load admin KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 text-[#d2fd2a] animate-spin mb-2" />
        <span className="text-xs text-gray-400 font-medium">Loading executive platform revenue telemetry...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const totalRevenue = revenueData?.totalRevenue ?? kpis.totalRevenue ?? 0;
  const netRevenue = revenueData?.netRevenue ?? Math.round(totalRevenue * 0.978);
  const mrr = revenueData?.mrr ?? 0;
  const arr = revenueData?.arr ?? (mrr * 12);
  const totalUsers = kpis.totalUsers || 0;
  const arpu = revenueData?.arpu ?? (totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(0) : 0);

  const subRevenue = revenueData?.subscriptionRevenue ?? 0;
  const courseRevenue = revenueData?.courseRevenue ?? 0;
  const webinarRevenue = revenueData?.webinarRevenue ?? 0;

  const totalCommissions = revenueData?.referralCommissions?.total ?? 0;
  const paidCommissions = revenueData?.referralCommissions?.paid ?? 0;
  const pendingCommissions = revenueData?.referralCommissions?.pending ?? 0;

  const totalFinishedSignals = (kpis.successfulTrades || 0) + (kpis.stoppedTrades || 0);
  const calculatedWinRate = totalFinishedSignals > 0 
    ? `${((kpis.successfulTrades / totalFinishedSignals) * 100).toFixed(1)}%`
    : (kpis.tradesPublished > 0 ? '100.0%' : '0.0%');

  const paidSubscribers = kpis.activeSubscribers || 0;
  const conversionRate = totalUsers > 0 ? `${((paidSubscribers / totalUsers) * 100).toFixed(1)}%` : '0.0%';

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0f17] border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d2fd2a] animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d2fd2a]">EXECUTIVE REVENUE ERP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">PLATFORM REVENUE & OPERATIONS</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium max-w-2xl">
            Unified financial telemetry, subscription run-rate, course marketplace volume, masterclasses, and affiliate network disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2.5 rounded-full bg-[#141722] hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#d2fd2a]" />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRIMARY REVENUE & MONETIZATION METRIC CARDS (8-Card Responsive Grid)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Gross Revenue */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-[#d2fd2a]/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Gross Platform Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-[#d2fd2a]/10 border border-[#d2fd2a]/20 flex items-center justify-center text-[#d2fd2a] group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{Number(totalRevenue).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">Net Settled</span>
            <span className="font-extrabold text-[#d2fd2a]">₹{Number(netRevenue).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* MRR & ARR */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-violet-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Monthly Recurring (MRR)</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-violet-400">
            ₹{Number(mrr).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">ARR Run-Rate</span>
            <span className="font-extrabold text-white">₹{Number(arr).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Signals Subscription Pool */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Advisory Subscriptions</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{Number(subRevenue).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">Active Paid Members</span>
            <span className="font-extrabold text-cyan-400">{paidSubscribers} active</span>
          </div>
        </div>

        {/* Signal Hit Rate */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Signal Win Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {calculatedWinRate}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">Target vs SL</span>
            <span className="font-extrabold text-emerald-400">
              {kpis.successfulTrades || 0} hits / {kpis.stoppedTrades || 0} sl
            </span>
          </div>
        </div>

        {/* Academy Courses Volume */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Academy Courses Sales</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            ₹{Number(courseRevenue).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">Course Marketplace</span>
            <Link to="/admin/courses" className="font-bold text-blue-400 hover:underline flex items-center gap-0.5">
              Manage <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Live Masterclasses */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Live Masterclasses</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            ₹{Number(webinarRevenue).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">Workshops & Q&A</span>
            <Link to="/admin/webinars" className="font-bold text-amber-400 hover:underline flex items-center gap-0.5">
              Schedule <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Affiliate Commission Pool */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-pink-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Affiliate Network Pool</span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Share2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{Number(totalCommissions).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">Pending Payouts</span>
            <Link to="/admin/referrals/payouts" className="font-extrabold text-pink-400 hover:underline flex items-center gap-0.5">
              ₹{Number(pendingCommissions).toLocaleString('en-IN')} Due <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Scalper AI Utilization */}
        <div className="bg-[#0e1017] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all group">
          <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-3">
            <span>Scalper AI Engine</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#d2fd2a]">
            100%
          </div>
          <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-white/5">
            <span className="text-gray-400">Engine Telemetry</span>
            <Link to="/admin/ai-assistant" className="font-bold text-[#d2fd2a] hover:underline flex items-center gap-0.5">
              Quotas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE QUICK ACTIONS HUB                                            */}
      {/* ========================================================================= */}
      <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#d2fd2a]" />
            <span>EXECUTIVE COMMAND ACTIONS</span>
          </h3>
          <span className="text-[10px] text-gray-500 uppercase font-extrabold">Instant Shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/trades"
            className="p-3.5 rounded-2xl bg-[#08090d] hover:bg-white/5 border border-white/5 hover:border-[#d2fd2a]/40 text-left transition-all group"
          >
            <Zap className="h-5 w-5 text-[#d2fd2a] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block group-hover:text-[#d2fd2a] transition-colors">Author Signal</span>
            <span className="text-[10px] text-gray-500">Live Trading Desk</span>
          </Link>

          <Link
            to="/admin/plans"
            className="p-3.5 rounded-2xl bg-[#08090d] hover:bg-white/5 border border-white/5 hover:border-violet-500/40 text-left transition-all group"
          >
            <Layers className="h-5 w-5 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block group-hover:text-violet-300 transition-colors">Pricing Tiers</span>
            <span className="text-[10px] text-gray-500">Subscription Plans</span>
          </Link>

          <Link
            to="/admin/courses"
            className="p-3.5 rounded-2xl bg-[#08090d] hover:bg-white/5 border border-white/5 hover:border-blue-500/40 text-left transition-all group"
          >
            <BookOpen className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block group-hover:text-blue-300 transition-colors">New Course</span>
            <span className="text-[10px] text-gray-500">Curriculum Builder</span>
          </Link>

          <Link
            to="/admin/webinars"
            className="p-3.5 rounded-2xl bg-[#08090d] hover:bg-white/5 border border-white/5 hover:border-amber-500/40 text-left transition-all group"
          >
            <Calendar className="h-5 w-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">Masterclass</span>
            <span className="text-[10px] text-gray-500">Live Workshops</span>
          </Link>

          <Link
            to="/admin/referrals/payouts"
            className="p-3.5 rounded-2xl bg-[#08090d] hover:bg-white/5 border border-white/5 hover:border-pink-500/40 text-left transition-all group"
          >
            <Coins className="h-5 w-5 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block group-hover:text-pink-300 transition-colors">Disburse Funds</span>
            <span className="text-[10px] text-gray-500">Affiliate Payouts</span>
          </Link>

          <Link
            to="/admin/coupons"
            className="p-3.5 rounded-2xl bg-[#08090d] hover:bg-white/5 border border-white/5 hover:border-emerald-500/40 text-left transition-all group"
          >
            <Percent className="h-5 w-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors">Promo Coupons</span>
            <span className="text-[10px] text-gray-500">Discount Engine</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. UNIT ECONOMICS & FINANCIAL EFFICIENCY ROW                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#090b10] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Avg Revenue Per User</span>
            <span className="text-xl font-black text-white mt-0.5 block">₹{Number(arpu).toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-gray-500 font-medium">{totalUsers} registered accounts</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-gray-300">
            <Users className="h-5 w-5 text-[#d2fd2a]" />
          </div>
        </div>

        <div className="bg-[#090b10] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Paid Member Ratio</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{conversionRate}</span>
            <span className="text-[10px] text-emerald-400 font-bold">{paidSubscribers} active subscribers</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-gray-300">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#090b10] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Pricing Plans</span>
            <span className="text-xl font-black text-white mt-0.5 block">{kpis.activePlans || 0} Tiers</span>
            <span className="text-[10px] text-cyan-400 font-bold">Public catalog visible</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-gray-300">
            <Target className="h-5 w-5 text-cyan-400" />
          </div>
        </div>

        <div className="bg-[#090b10] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Pending Orders Queue</span>
            <span className="text-xl font-black text-white mt-0.5 block">{kpis.pendingPayments || 0}</span>
            <span className="text-[10px] text-gray-500 font-medium">Checkout initiations</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-gray-300">
            <Shield className="h-5 w-5 text-violet-400" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. REVENUE CHARTS & CONTRIBUTION BREAKDOWN                                */}
      {/* ========================================================================= */}
      {revenueData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Monthly Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-white tracking-wide">REVENUE TRAJECTORY</h3>
                <p className="text-xs text-gray-400 font-medium">Monthly cashflow volume across Signals, Academy, and Masterclasses</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1.5 text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d2fd2a]" />
                  <span>Gross (₹)</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              {revenueData.monthlyRevenueTrend && revenueData.monthlyRevenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData.monthlyRevenueTrend}>
                    <defs>
                      <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d2fd2a" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#d2fd2a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c202e" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1c202e', borderRadius: '16px', fontSize: '12px' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#d2fd2a" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-500">
                  No monthly revenue entries recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Revenue By Product Type Pie */}
          <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white tracking-wide mb-1">VERTICAL CONTRIBUTION</h3>
              <p className="text-xs text-gray-400 mb-4 font-medium">Revenue split by monetization engine</p>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              {totalRevenue > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData.productBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueData.productBreakdown?.map((entry: any, index: number) => {
                        const colors = ['#d2fd2a', '#8b5cf6', '#06b6d4', '#10b981'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090a0f', borderColor: '#1c202e', borderRadius: '16px', fontSize: '12px' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Gross']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-gray-500 text-center">
                  Zero revenue transactions recorded yet.
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-2">
              {revenueData.productBreakdown?.map((item: any, idx: number) => {
                const colors = ['#d2fd2a', '#8b5cf6', '#06b6d4', '#10b981'];
                const col = colors[idx % colors.length];
                return (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col }} />
                      <span className="text-gray-300 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">₹{Number(item.value).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RECENT ORDERS & OPERATIONAL SIGNALS MATRIX                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions */}
        <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-white tracking-wide">RECENT UNIFIED PURCHASES</h3>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase">Live Stream</span>
          </div>

          <div className="overflow-x-auto">
            {revenueData?.recentTransactions && revenueData.recentTransactions.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08090d] border-b border-[#1c202e] text-gray-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Product</th>
                    <th className="px-3 py-2.5">Amount</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c202e] text-gray-300">
                  {revenueData.recentTransactions.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-3 font-semibold text-white">{ord.User?.fullName || `User #${ord.userId}`}</td>
                      <td className="px-3 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#141722] text-[#d2fd2a] border border-white/5">
                          {ord.orderType}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-white">₹{ord.finalAmount}</td>
                      <td className="px-3 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-xs text-gray-500">
                No orders or transactions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Signal Execution Matrix */}
        <div className="bg-[#0e1017] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white tracking-wide">SIGNALS DESK EXECUTION MATRIX</h3>
            <Link to="/admin/trades" className="text-xs font-bold text-[#d2fd2a] hover:underline flex items-center gap-1">
              <span>Open Desk</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#08090d] border border-[#1c202e] rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Published Signals</span>
              <div className="text-2xl font-black text-white mt-1">{kpis.tradesPublished || 0}</div>
              <span className="text-[10px] text-gray-500">Lifetime authored setups</span>
            </div>
            
            <div className="bg-[#08090d] border border-[#1c202e] rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Currently Active</span>
              <div className="text-2xl font-black text-[#d2fd2a] mt-1">{kpis.activeTrades || 0}</div>
              <span className="text-[10px] text-[#d2fd2a] font-medium">In-market positions</span>
            </div>

            <div className="bg-[#08090d] border border-[#1c202e] rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Targets Achieved</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{kpis.successfulTrades || 0}</div>
              <span className="text-[10px] text-emerald-500 font-medium">High conviction wins</span>
            </div>

            <div className="bg-[#08090d] border border-[#1c202e] rounded-2xl p-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Stop Losses Triggered</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{kpis.stoppedTrades || 0}</div>
              <span className="text-[10px] text-rose-500 font-medium">Strict risk contained</span>
            </div>
          </div>

          {/* Allocation Engine Status */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-gray-300">Two-Trade Allocation Engine</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              OPERATIONAL
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
