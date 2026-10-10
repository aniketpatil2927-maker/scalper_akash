import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  ShieldAlert, 
  Percent, 
  Calendar, 
  Filter, 
  Zap, 
  Layers, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Flame
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

interface OverviewStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  netPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  riskReward: string;
  maxDrawdown: number;
  bestStrategy: string;
  currentStreak: number;
  bestStreak: number;
}

export const AnalyticsPage: React.FC = () => {
  const { apiGet } = useAuth();
  const [range, setRange] = useState('ALL');
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, chartsRes] = await Promise.all([
        apiGet(`/analytics/overview?range=${range}`),
        apiGet(`/analytics/charts?range=${range}`),
      ]);
      setStats(overviewRes);
      setChartData(chartsRes);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header with Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-white tracking-tight">ADVANCED TRADING ANALYTICS</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[10px] font-bold">
              PRO INSIGHTS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Deep performance metrics, cumulative equity curves, and strategy breakdown from your logged trades.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center bg-dark-950 border border-dark-800 rounded-xl p-1 gap-1">
          {['TODAY', '7D', '30D', '90D', '1Y', 'ALL'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r 
                  ? 'bg-accent-cyan text-dark-950 shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Win Rate */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
              <span>Win Rate</span>
              <Percent className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.winRate}%</div>
            <div className="text-[10px] text-gray-400 mt-1">
              <span className="text-emerald-400 font-bold">{stats.winningTrades} Wins</span> / <span className="text-accent-rose">{stats.losingTrades} Losses</span>
            </div>
          </div>

          {/* Net P&L */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
              <span>Net P&L</span>
              <TrendingUp className={`h-4 w-4 ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-accent-rose'}`} />
            </div>
            <div className={`text-2xl font-black ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-accent-rose'}`}>
              ₹{stats.netPnl.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Across {stats.totalTrades} total trades</div>
          </div>

          {/* Profit Factor */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
              <span>Profit Factor</span>
              <Zap className="h-4 w-4 text-accent-gold" />
            </div>
            <div className="text-2xl font-black text-white">{stats.profitFactor}</div>
            <div className="text-[10px] text-gray-400 mt-1">Ratio of Gross Win / Loss</div>
          </div>

          {/* Risk:Reward */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
              <span>Avg Risk:Reward</span>
              <Target className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">1:{stats.riskReward}</div>
            <div className="text-[10px] text-gray-400 mt-1">Avg Win: ₹{stats.avgWin}</div>
          </div>

          {/* Max Drawdown */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
              <span>Max Drawdown</span>
              <ShieldAlert className="h-4 w-4 text-accent-rose" />
            </div>
            <div className="text-2xl font-black text-accent-rose">
              -₹{stats.maxDrawdown.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Peak-to-valley loss</div>
          </div>

          {/* Winning Streak */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
              <span>Win Streak</span>
              <Flame className="h-4 w-4 text-[#ccff00]" />
            </div>
            <div className="text-2xl font-black text-[#ccff00]">
              {stats.currentStreak > 0 ? `+${stats.currentStreak} ⚡` : `${stats.currentStreak}`}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Best streak: {stats.bestStreak} trades</div>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equity / Cumulative P&L Curve */}
          <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-white tracking-wide">CUMULATIVE EQUITY CURVE</h3>
                <p className="text-xs text-gray-400">Net return progression over consecutive executed trades</p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-cyan" />
                <span className="text-gray-300 font-semibold">Cumulative Net P&L (₹)</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.pnlCurve}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5BC" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00E5BC" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Cumulative P&L']}
                  />
                  <Area type="monotone" dataKey="cumulativePnl" stroke="#00E5BC" strokeWidth={3} fillOpacity={1} fill="url(#colorPnl)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategy Distribution Bar Chart */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-white tracking-wide mb-1">PROFIT BY SETUP</h3>
            <p className="text-xs text-gray-400 mb-4">Which strategy generates your highest gains</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.strategyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis type="number" stroke="#737373" fontSize={10} tickFormatter={(val) => `₹${val}`} />
                  <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={11} width={90} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Net Profit']}
                  />
                  <Bar dataKey="pnl" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Metrics Row */}
      {chartData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Win / Loss Doughnut */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-white tracking-wide mb-1">WIN / LOSS RATIO</h3>
            <p className="text-xs text-gray-400 mb-4">Distribution of profitable vs losing setups</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.winLossData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.winLossData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 text-xs text-gray-300 mt-2">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Wins: {chartData.winLossData[0]?.value}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span>Losses: {chartData.winLossData[1]?.value}</span>
              </div>
            </div>
          </div>

          {/* Instrument Performance Breakdown */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-white tracking-wide mb-1">ASSET BREAKDOWN</h3>
            <p className="text-xs text-gray-400 mb-4">P&L by instrument traded</p>

            <div className="space-y-3">
              {chartData.instrumentData.map((inst: any) => (
                <div key={inst.name} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-950 border border-dark-800">
                  <span className="text-xs font-bold text-gray-200">{inst.name}</span>
                  <span className={`text-xs font-black ${inst.pnl >= 0 ? 'text-emerald-400' : 'text-accent-rose'}`}>
                    ₹{inst.pnl.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Achievement Rates */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-white tracking-wide mb-1">TARGET HIT FREQUENCY</h3>
            <p className="text-xs text-gray-400 mb-4">Percentage of trades reaching targets</p>

            <div className="space-y-3">
              {chartData.targetData.map((t: any) => (
                <div key={t.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">{t.name}</span>
                    <span className="text-accent-cyan font-bold">{t.rate}%</span>
                  </div>
                  <div className="w-full bg-dark-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${t.name.includes('Stop') ? 'bg-accent-rose' : 'bg-accent-cyan'}`}
                      style={{ width: `${t.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
