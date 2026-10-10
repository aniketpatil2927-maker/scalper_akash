import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, ArrowUpRight, Sparkles, BookOpen } from 'lucide-react';

interface TraderScoreData {
  totalScore: number;
  grade: string;
  tierLabel: string;
  components: {
    riskManagement: { score: number; max: number; label: string };
    discipline: { score: number; max: number; label: string };
    consistency: { score: number; max: number; label: string };
    journalAdherence: { score: number; max: number; label: string };
  };
  weakAreas: string[];
  recommendations: string[];
  recentTradesAnalyzed: number;
  winRate?: number;
  profitFactor?: number;
}

export const TraderScoreCard: React.FC = () => {
  const [scoreData, setScoreData] = useState<TraderScoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/score/trader-score', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setScoreData(data);
      }
    } catch (err) {
      console.error('Failed to fetch trader score:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse h-64"></div>;
  }

  if (!scoreData) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic Execution Quotient
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Akash Trader Score™
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30">
                Grade {scoreData.grade}
              </span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Calculated from your journal compliance, risk controls, and execution discipline.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/80 px-6 py-4 rounded-2xl">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Discipline Index</div>
              <div className="text-xs font-bold text-emerald-400">{scoreData.tierLabel}</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
              {scoreData.totalScore}
            </div>
          </div>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {Object.entries(scoreData.components).map(([key, comp]) => {
            const pct = (comp.score / comp.max) * 100;
            return (
              <div key={key} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-slate-400 font-medium">{comp.label}</span>
                  <span className="font-bold text-white">{comp.score} / {comp.max}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actionable Recommendations */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
            <div className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Areas for Improvement
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scoreData.weakAreas.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
            <div className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Tailored Next Steps
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scoreData.recommendations.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderScoreCard;
