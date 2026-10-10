import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  HelpCircle, 
  ArrowRight, 
  TrendingDown, 
  Award, 
  Zap, 
  Check, 
  ShieldAlert, 
  RefreshCw, 
  CreditCard, 
  BarChart3, 
  Sparkles, 
  Wallet, 
  Play, 
  Calendar, 
  BookOpen, 
  Bot, 
  Flame, 
  Globe, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { CommunityChannels } from '../components/CommunityChannels.js';

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
}

export const LandingPage: React.FC = () => {
  const { apiGet, user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tradesSummary, setTradesSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, publicTrades] = await Promise.all([
        apiGet('/plans').catch(() => []),
        apiGet('/trades/public').catch(() => null),
      ]);
      setPlans(plansData || []);
      setTradesSummary(publicTrades);
    } catch (err: any) {
      console.error('Error fetching platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (planId: number) => {
    if (!user) {
      navigate(`/register?planId=${planId}`);
    } else {
      navigate(`/checkout?planId=${planId}`);
    }
  };

  useEffect(() => {
    document.title = "Scalper Akash | Empower Your Trading with Expert Insights";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Master the market with Scalper Akash. High-conviction index setups, stock options levels, and risk-managed equity swing trades. Real-time entries, stop-losses, and profit booking updates.');
  }, []);

  const winRate = tradesSummary?.winRate || '100.0%';
  const activeCount = tradesSummary?.activeCount ?? 0;
  const totalSetups = tradesSummary?.totalSetups ?? 0;
  const recentSignals = tradesSummary?.signals || [];

  return (
    <div className="bg-[#0b0c10] text-gray-100 min-h-screen selection:bg-[#d2fd2a] selection:text-black overflow-x-hidden relative">
      
      {/* Dynamic Animated Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-25 pointer-events-none" />

      {/* Dynamic Ambient Aurora Lights */}
      <div className="absolute -top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-[#7c5cfc]/20 blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[25%] right-[5%] w-[450px] h-[450px] rounded-full bg-[#d2fd2a]/10 blur-[150px] pointer-events-none animate-aurora" />
      
      {/* 1. HERO SECTION (1:1 High-Precision Replica & 100% Viewport Screen Fit) */}
      <section className="relative h-[calc(100vh-4rem)] max-h-[840px] min-h-[560px] pt-3 sm:pt-4 pb-4 sm:pb-6 px-3 sm:px-6 overflow-hidden max-w-7xl mx-auto flex flex-col items-center justify-between">
        
        {/* Main Headline with Clean Compact Hierarchy */}
        <div className="w-full text-center z-10 pt-1 sm:pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold text-[#d2fd2a] mb-2 backdrop-blur-md shadow-[0_0_15px_rgba(210,253,42,0.15)]">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#d2fd2a] animate-ping" />
            <span>INSTITUTIONAL PRECISION SIGNALS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.08] select-none max-w-4xl mx-auto drop-shadow-md">
            Empower Your <span className="text-[#7c5cfc]">Trading</span><br />
            with Expert Insights
          </h1>
        </div>

        {/* Central Visual Composition Container */}
        <div className="relative w-full max-w-4xl lg:max-w-5xl h-[360px] sm:h-[400px] md:h-[440px] flex items-center justify-center my-auto">
          
          {/* Deep Purple Ambient Aura */}
          <div 
            className="absolute top-[20%] left-[28%] -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] h-[340px] sm:h-[440px] rounded-full pointer-events-none opacity-60 blur-[90px] animate-pulse-glow"
            style={{
              background: 'radial-gradient(circle, #7c5cfc 0%, #4c1d95 60%, transparent 80%)'
            }}
          />

          {/* Clean Solid Studio Composite Graphic (Man + Neon Circle in Flawless Studio Quality) */}
          <div className="relative z-10 w-[300px] sm:w-[380px] md:w-[430px] h-full flex flex-col items-center justify-center">
            <img 
              src="/images/hero-trader-composite.jpg" 
              alt="Scalper Akash Lead Trader"
              className="w-full h-auto max-h-[350px] sm:max-h-[390px] md:max-h-[430px] object-contain select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded-3xl"
              onError={(e: any) => {
                e.target.src = '/images/hero-trader-clean.png';
              }}
            />

            {/* Overlapping Floating Bottom Action Capsule */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-3 p-1.5 sm:p-2 bg-[#12131a]/95 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.95)] whitespace-nowrap">
              <Link 
                to="/pricing" 
                className="px-6 sm:px-7 py-2 sm:py-2.5 rounded-full bg-[#d2fd2a] hover:bg-[#bcf018] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
              >
                Start now
              </Link>
              <Link 
                to="/courses" 
                className="px-6 sm:px-7 py-2 sm:py-2.5 rounded-full bg-white hover:bg-gray-100 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
              >
                Browse Academy
              </Link>
            </div>
          </div>

          {/* 4 Floating Cards */}

          {/* CARD 1: Top-Left Titanium Card */}
          <div 
            className="absolute top-[1%] sm:top-[3%] left-[1%] sm:left-[3%] md:left-[5%] z-20 hidden md:block animate-float-1"
            style={{
              transform: 'rotate(-14deg)'
            }}
          >
            <div className="w-40 sm:w-44 md:w-48 p-3 sm:p-3.5 rounded-2xl bg-[#14151b]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] text-left hover:rotate-0 transition-transform duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-300 tracking-wide">Scalper Access</span>
                <span className="h-2 w-2 rounded-full bg-[#d2fd2a] animate-pulse"></span>
              </div>
              <div className="text-xs sm:text-sm font-mono font-bold tracking-widest text-[#d2fd2a] mb-2.5">
                VIP DESK
              </div>
              <div className="flex justify-between items-end">
                <div className="text-[7px] sm:text-[8px] text-gray-500 uppercase tracking-wider font-semibold">
                  STATUS<br />
                  <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex -space-x-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#7c5cfc] opacity-90"></div>
                  <div className="w-4 h-4 rounded-full bg-[#d2fd2a] opacity-90"></div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Top-Right "Desk Telemetry" Card */}
          <div 
            className="absolute top-[1%] sm:top-[3%] right-[1%] sm:right-[3%] md:right-[5%] z-20 hidden md:block animate-float-2"
            style={{
              transform: 'rotate(8deg)'
            }}
          >
            <div className="w-44 sm:w-48 md:w-52 p-3 sm:p-3.5 rounded-2xl bg-[#14151b]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] text-left hover:rotate-0 transition-transform duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-200">Win Rate</span>
                <span className="text-[8px] sm:text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Verified
                </span>
              </div>
              
              <div className="text-center text-lg font-black text-[#d2fd2a] py-1">
                {winRate}
              </div>

              {/* Dynamic Progress indicator */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-[#d2fd2a] h-full" style={{ width: winRate }} />
              </div>
            </div>
          </div>

          {/* CARD 3: Bottom-Left Net Signals Card */}
          <div 
            className="absolute bottom-[4%] sm:bottom-[6%] left-[1%] sm:left-[3%] md:left-[5%] z-20 hidden md:block animate-float-3"
            style={{
              transform: 'rotate(-8deg)'
            }}
          >
            <div className="w-40 sm:w-44 md:w-48 p-3 sm:p-3.5 rounded-2xl bg-[#14151b]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] text-left hover:rotate-0 transition-transform duration-300">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="text-[10px] sm:text-[11px] text-gray-300 font-bold block">Live Setups</span>
                  <span className="text-[8px] sm:text-[9px] text-gray-500 font-medium">In-Market</span>
                </div>
                <span className="text-xs sm:text-sm font-black text-[#d2fd2a]">
                  {activeCount} Active
                </span>
              </div>
              <div className="h-8 w-full relative flex items-center justify-center">
                <span className="text-[10px] text-gray-400 font-medium">2-Trade Allocation</span>
              </div>
            </div>
          </div>

          {/* CARD 4: Bottom-Right AI Assistant Pill Card */}
          <div 
            className="absolute bottom-[4%] sm:bottom-[6%] right-[1%] sm:right-[3%] md:right-[5%] z-20 hidden md:block animate-float-4"
            style={{
              transform: 'rotate(6deg)'
            }}
          >
            <div className="px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-2xl bg-[#14151b]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] flex items-center gap-2.5 text-left hover:rotate-0 transition-transform duration-300">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#7c5cfc]/20 border border-[#7c5cfc]/40 flex items-center justify-center text-[#7c5cfc] flex-shrink-0 shadow-[0_0_15px_rgba(124,92,252,0.3)]">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white tracking-tight">
                  Scalper AI
                </div>
                <div className="text-[7px] sm:text-[8px] text-gray-400 font-medium">
                  24/7 Market Queries
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. LIVE SIGNAL TERMINAL FEED */}
      <section className="relative px-4 sm:px-6 py-12 max-w-6xl mx-auto">
        <div className="mx-auto rounded-3xl border border-white/10 bg-[#0e1017]/80 p-6 shadow-2xl glass-panel relative z-10 text-left">
          
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between border-b border-[#1c202e] pb-4 mb-6 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-[#d2fd2a]/80"></span>
              <span className="ml-2 font-mono text-[11px] text-gray-300 bg-[#08090d] px-3 py-1 rounded-lg border border-[#1c202e] select-none">
                terminal://scalper-akash.desk
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d2fd2a] animate-ping"></span>
              <span className="text-[11px] font-black text-[#d2fd2a] uppercase tracking-wider">Live Institutional Feed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (3/12): Navigation / Status */}
            <div className="lg:col-span-3 lg:border-r border-[#1c202e] lg:pr-4 space-y-4">
              <div className="font-extrabold text-white text-xs tracking-wider flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d2fd2a] text-black font-black text-xs shadow-[0_0_12px_rgba(210,253,42,0.4)]">
                  S
                </div>
                <span>SIGNAL DESK</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="px-3.5 py-2.5 bg-[#d2fd2a]/10 text-white rounded-xl border-l-2 border-[#d2fd2a] font-bold flex items-center justify-between">
                  <span>Active Setups</span>
                  <span className="text-[10px] bg-[#d2fd2a] text-black px-2 py-0.5 rounded-full font-black">{activeCount}</span>
                </div>
                <div className="px-3.5 py-2 text-gray-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>Total Authored</span>
                  <span className="text-[10px] bg-[#08090d] px-2 py-0.5 rounded text-gray-400 border border-[#1c202e]">{totalSetups}</span>
                </div>
                <Link to="/courses" className="px-3.5 py-2 text-gray-400 hover:text-white transition-colors block">
                  Academy Courses
                </Link>
                <Link to="/webinars" className="px-3.5 py-2 text-gray-400 hover:text-white transition-colors block">
                  Live Masterclasses
                </Link>
              </div>
              
              <div className="rounded-xl bg-[#08090d] p-4 border border-[#1c202e] text-xs">
                <span className="text-gray-400 block uppercase font-bold tracking-wider text-[10px] mb-1">Win Rate (Verified)</span>
                <span className="text-xl font-black text-[#d2fd2a] block">{winRate}</span>
                <span className="text-[10px] text-gray-500">Live target achievement ratio.</span>
              </div>
            </div>

            {/* Center Column (9/12): Live Signals Feed */}
            <div className="lg:col-span-9 space-y-4">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span>Conviction Setups Stream</span>
                <span className="text-[10px] text-[#d2fd2a] font-semibold">Live System Data</span>
              </div>
              
              {recentSignals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentSignals.map((sig: any) => (
                    <div key={sig.id} className="bg-[#08090d]/80 p-4 rounded-2xl border border-white/10 hover:border-[#d2fd2a]/40 transition-all shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase border ${
                            sig.direction === 'BUY' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {sig.direction}
                          </span>
                          <h4 className="text-sm font-black text-white mt-1">{sig.asset}</h4>
                        </div>
                        <span className="text-[10px] text-[#d2fd2a] font-black bg-[#d2fd2a]/10 px-2.5 py-0.5 rounded-full border border-[#d2fd2a]/30">
                          {sig.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#1c202e]">
                        <div>
                          <span className="text-gray-500 block text-[10px]">Entry Zone</span>
                          <span className="text-white font-bold">₹{sig.entryPrice}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Target 1</span>
                          <span className="text-[#d2fd2a] font-bold">₹{sig.target1}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Stop Loss</span>
                          <span className="text-rose-400 font-bold">₹{sig.stopLoss}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#08090d] border border-[#1c202e] text-center text-xs text-gray-500">
                  No trade setups published yet.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 3. Platform Pillars (AI, Signals, Academy, Masterclasses) */}
      <section className="py-20 border-t border-[#1c202e] px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141722] border border-white/10 px-4 py-1.5 text-xs font-bold text-[#d2fd2a] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Complete Trading Ecosystem</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">Everything You Need to Win</h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            From algorithmic market intelligence and institutional signals to certified masterclasses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: 'Institutional Trade Signals',
              desc: 'High-conviction Index Option & Equity Swing setups with precise entries, multi-targets, and stop losses.',
              color: 'text-[#d2fd2a]',
              bg: 'bg-[#d2fd2a]/10 border-[#d2fd2a]/20'
            },
            {
              icon: Bot,
              title: 'AI Trading Assistant',
              desc: 'Ask complex strategy queries, evaluate Option Greeks, and receive instant personalized risk audits.',
              color: 'text-violet-400',
              bg: 'bg-violet-500/10 border-violet-500/20'
            },
            {
              icon: BookOpen,
              title: 'Academy & Video Courses',
              desc: 'Comprehensive self-paced video modules from price action mastery to advanced algorithmic systems.',
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10 border-cyan-500/20'
            },
            {
              icon: Calendar,
              title: 'Live Webinars & Masterclasses',
              desc: 'Interactive live market rooms with real-time screen shares, live Q&A, and full recording vaults.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="p-6 rounded-3xl bg-[#0e1017] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-6 ${item.bg} ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Pricing Plans Section */}
      <section id="plans" className="py-12 sm:py-16 border-t border-[#1c202e] px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141722] border border-white/10 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-[#d2fd2a] mb-2 shadow-[0_0_15px_rgba(210,253,42,0.15)]">
            <Zap className="h-3 w-3" />
            <span>Select Your Package</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">Choose Your Trading Plan</h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Get instant access to high-conviction trade alerts and institutional-grade setups.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 text-[#d2fd2a] animate-spin mb-3" />
            <span className="text-xs text-gray-400 animate-pulse">Loading active plans...</span>
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isVIP = plan.accessTier === 'VIP';
              const isPremium = plan.accessTier === 'PREMIUM';
              
              return (
                <div key={plan.id} className="flex">
                  <div 
                    className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative shadow-xl backdrop-blur-xl transition-all duration-300 flex-1 ${
                      isPremium 
                        ? 'bg-[#10131d] border-2 border-[#d2fd2a] shadow-[0_0_35px_rgba(210,253,42,0.18)] md:-translate-y-2' 
                        : isVIP 
                          ? 'bg-[#10131d] border border-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
                          : 'bg-[#0e1017] border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isPremium && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#d2fd2a] px-3.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider shadow-md">
                        Most Popular
                      </span>
                    )}
                    
                    {isVIP && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-md">
                        VIP Elite
                      </span>
                    )}

                    <div>
                      {/* Header */}
                      <div className="mb-3 border-b border-[#1c202e] pb-3">
                        <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-white">₹{plan.price}</span>
                          <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">/ {plan.validityDays} Days</span>
                        </div>
                        {plan.promoPrice && (
                          <span className="text-[10px] text-rose-400 line-through block mt-0.5">
                            Was ₹{plan.price} (Promo: ₹{plan.promoPrice})
                          </span>
                        )}
                      </div>

                      {/* Trade setup pool */}
                      <div className="rounded-xl bg-[#08090d] py-2 px-3 border border-[#1c202e] text-center mb-3">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Allocation Pool</span>
                        <span className="text-xs sm:text-sm font-black text-[#d2fd2a]">{plan.allowedTrades} Trade Setups Guaranteed</span>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-4">
                        {(Array.isArray(plan.features) ? plan.features : typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : []).slice(0, 4).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-gray-300">
                            <Check className="h-3.5 w-3.5 text-[#d2fd2a] shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      {/* Risk disclaimer box */}
                      <div className="rounded-xl bg-[#08090d]/60 p-2.5 border border-[#1c202e] mb-4 flex gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-bold text-white block uppercase">Risk Tier: {plan.accessTier}</span>
                          <p className="text-[8.5px] text-gray-400 leading-tight line-clamp-2">{plan.riskInfo}</p>
                        </div>
                      </div>

                      {/* Purchase button */}
                      <button
                        onClick={() => handlePurchase(plan.id)}
                        className={`w-full py-2.5 px-4 rounded-full text-xs font-black transition-all ${
                          isPremium 
                            ? 'lime-gradient-btn !py-2.5 !text-xs !shadow-md' 
                            : isVIP
                              ? 'purple-gradient-btn !py-2.5 !text-xs !shadow-md'
                              : 'glass-pill-btn !py-2.5 !text-xs'
                        }`}
                      >
                        Choose {plan.name}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-500">
            No active pricing plans configured yet.
          </div>
        )}
      </section>

      {/* 5. Substantiated Track Record */}
      <section className="py-20 border-t border-[#1c202e] bg-[#0e1017]/50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-white text-center mb-4">Substantiated Performance</h2>
          <p className="text-sm text-gray-400 text-center max-w-xl mx-auto mb-16">
            Transparent metrics verified across multi-year cycles. Past performance does not guarantee future results.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Verified Win Rate', value: winRate, desc: 'Based on closed setups' },
              { label: 'Target Hits', value: `${tradesSummary?.successfulHits ?? 0}`, desc: 'Target 1 & 2 booked' },
              { label: 'Total Authored Trades', value: `${totalSetups}`, desc: 'Across Intraday & Swings' },
              { label: 'Risk Guard Stops', value: `${tradesSummary?.stopLossHits ?? 0}`, desc: 'Strict risk contained' },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[#08090d] border border-[#1c202e] text-center">
                <span className="text-xs text-gray-400 block font-medium mb-1">{stat.label}</span>
                <span className="text-3xl font-black text-[#d2fd2a] block mb-2">{stat.value}</span>
                <span className="text-[11px] text-gray-500">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Community & Social Channels */}
      <section className="py-20 border-t border-[#1c202e] px-4 sm:px-6 max-w-7xl mx-auto">
        <CommunityChannels />
      </section>

    </div>
  );
};

export default LandingPage;
