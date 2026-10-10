import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Target,
  Award,
  Users,
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Institutional Trading Philosophy
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Democratizing Systematic, High-Probability Financial Trading
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            Scalper Akash is a modern trading technology, education, and analytics ecosystem founded to eliminate gambling habits and instill mathematical edge, strict risk management, and quantitative execution discipline.
          </p>
        </div>
      </section>

      {/* 4 Pillars of Scalper Akash */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Our 4 Core Pillars</h2>
          <p className="text-slate-400 text-xs mt-1">Built to empower retail traders to think and execute like institutions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. TRADE</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-time actionable market setups, multi-target execution plans, and dynamic risk-to-reward calculators with live telemetry.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. LEARN</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Comprehensive Trading Academy, video modules, downloadable playbooks, live webinars, and verifiable certifications.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. ANALYZE</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Automated Trading Journal, Akash Trader Score, quantitative Strategy Lab backtesting, and AI performance coaching.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4. CONNECT</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Active verified community lounges, 1-on-1 mentor booking, and digital marketplace resource sharing.
            </p>
          </div>
        </div>
      </section>

      {/* Risk Philosophy & Transparency */}
      <section className="py-16 px-4 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="text-2xl font-black text-white">Our Non-Negotiable Risk Philosophy</h3>
                <p className="text-xs text-slate-400 mt-0.5">Capital preservation always precedes profit acceleration.</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Financial markets are stochastic and inherently volatile. We reject 'get-rich-quick' schemes, guaranteed return promises, and overleveraged trading. Our system mandates a strict 1–2% max risk per trade rule, predefined stop loss levels on every single setup, and continuous journal self-auditing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero fabricated results or unrealistic win-rate claims</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Distinct separation between historical backtests & live signals</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Comprehensive regulatory and risk disclosures provided</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
