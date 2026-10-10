import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import {
  BookOpen,
  CheckSquare,
  Search,
  Zap,
  ShieldAlert,
  Target,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Bookmark,
  Heart,
  Share2,
  FileText,
  Video,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';

interface PlaybookItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  marketConditions: string;
  setupRules: string;
  entryRules: string;
  stopLossRules: string;
  targetRules: string;
  riskRewardRatio: string;
  checklist: string[];
  chartUrl: string | null;
  pdfUrl: string | null;
  videoUrl: string | null;
  tierRequired: string;
  likesCount: number;
  viewsCount: number;
}

export const PlaybooksPage: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<PlaybookItem[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPlaybooks();
  }, [activeCategory, searchQuery]);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/playbooks?category=${activeCategory}&search=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data);
      }
    } catch (err) {
      console.error('Failed to load playbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Setups' },
    { id: 'SCALPING', label: '1-Min Scalping' },
    { id: 'INTRADAY', label: 'Intraday Momentum' },
    { id: 'BREAKOUT', label: 'Opening Range Breakout' },
    { id: 'OPTIONS', label: 'Options Buying / Selling' },
    { id: 'TREND', label: 'Trend Following' },
    { id: 'REVERSAL', label: 'Key Level Reversals' },
    { id: 'RISK_MANAGEMENT', label: 'Risk Protocols' },
    { id: 'PSYCHOLOGY', label: 'Trading Psychology' },
  ];

  const handleToggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const completedCount = selectedPlaybook
    ? selectedPlaybook.checklist.filter(c => checkedItems[c]).length
    : 0;
  const checklistTotal = selectedPlaybook ? selectedPlaybook.checklist.length : 0;
  const isReadyToTrade = checklistTotal > 0 && completedCount === checklistTotal;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Institutional Playbook Vault
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Scalper Akash Trading Playbooks
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Proven algorithmic and price action trade setups with strict rules, interactive execution checklists & risk models.
            </p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search setups or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Playbooks Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading verified playbooks...</div>
        ) : playbooks.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No playbooks found in this category</h3>
            <p className="text-slate-400 text-xs mt-1">Try selecting 'All Setups' or changing your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playbooks.map((pb) => (
              <div
                key={pb.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                      {pb.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400">
                      R:R {pb.riskRewardRatio}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {pb.title}
                  </h3>

                  <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {pb.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Market Regime:</span>
                      <span className="text-slate-200 font-medium">{pb.marketConditions}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Checklist Points:</span>
                      <span className="text-blue-400 font-semibold">{pb.checklist?.length || 5} Criteria</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedPlaybook(pb);
                      setCheckedItems({});
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Open Full Playbook
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playbook Detail Modal / Reader */}
      {selectedPlaybook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                    {selectedPlaybook.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    Target Expectancy: {selectedPlaybook.riskRewardRatio}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">{selectedPlaybook.title}</h2>
              </div>
              <button
                onClick={() => setSelectedPlaybook(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              {/* Setup Description */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Strategy Overview</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {selectedPlaybook.description}
                </p>
              </div>

              {/* Rules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-blue-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Entry Trigger Condition
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPlaybook.entryRules}</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-rose-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Stop Loss Invalidation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPlaybook.stopLossRules}</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-emerald-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Target & Profit Taking
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPlaybook.targetRules}</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-amber-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Ideal Market Conditions
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedPlaybook.marketConditions}</p>
                </div>
              </div>

              {/* Interactive Pre-Trade Checklist */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                      Interactive Pre-Trade Verification Checklist
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Check all boxes before entering the trade. Never execute if any criterion fails.
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isReadyToTrade ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {completedCount} / {checklistTotal} Ready
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedPlaybook.checklist.map((item, idx) => {
                    const isChecked = checkedItems[item] || false;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleCheck(item)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-950/40 border-blue-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-medium leading-relaxed">{item}</span>
                      </div>
                    );
                  })}
                </div>

                {isReadyToTrade && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    All criteria confirmed! Trade setup is verified for disciplined execution.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/60">
              <button
                onClick={() => setSelectedPlaybook(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white"
              >
                Close Playbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybooksPage;
