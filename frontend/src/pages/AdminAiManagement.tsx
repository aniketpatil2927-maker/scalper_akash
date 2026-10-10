import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Bot, 
  MessageSquare, 
  Cpu, 
  Database, 
  Users, 
  Layers, 
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AdminAiManagement: React.FC = () => {
  const { apiGet } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/ai/admin/stats');
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load AI stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">AI TRADING ASSISTANT & QUOTAS</h1>
          <p className="text-xs text-gray-400 mt-1">
            Monitor model query volume, subscriber quota consumption, and real-time execution logs.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 hover:text-white text-xs font-bold flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Queries Processed</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalQueries}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Active Conversations</span>
            <div className="text-2xl font-black text-accent-cyan mt-1">{stats.totalConversations}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Messages Exchanged</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{stats.totalMessages}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Tokens Consumed</span>
            <div className="text-2xl font-black text-accent-gold mt-1">{stats.totalTokens.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Tier Quota Overview */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">TIER QUOTA ALLOCATION RULES</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-950 border border-dark-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-300">Basic Tier</span>
              <span className="px-2 py-0.5 rounded bg-dark-800 text-[10px] font-bold text-gray-400">10 Queries/mo</span>
            </div>
            <p className="text-[11px] text-gray-500">Essential market questions & trade signal entry explanations.</p>
          </div>

          <div className="bg-dark-950 border border-dark-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-accent-cyan">Premium Tier</span>
              <span className="px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-[10px] font-bold text-accent-cyan">50 Queries/mo</span>
            </div>
            <p className="text-[11px] text-gray-500">Personal performance analysis, setup breakdown & weekly AI summaries.</p>
          </div>

          <div className="bg-dark-950 border border-dark-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-accent-gold">VIP Tier</span>
              <span className="px-2 py-0.5 rounded bg-accent-gold/10 border border-accent-gold/30 text-[10px] font-bold text-accent-gold">250 Queries/mo</span>
            </div>
            <p className="text-[11px] text-gray-500">High-volume intelligence, custom strategy tuning & risk sizing formulas.</p>
          </div>
        </div>
      </div>

      {/* Recent Query Logs */}
      {stats && (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">RECENT QUERY AUDIT LOGS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Queries</th>
                  <th className="px-4 py-3">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800 text-gray-300">
                {stats.recentLogs?.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-white">{log.User?.fullName || `User #${log.userId}`}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-dark-800 text-[10px] font-bold">{log.feature}</span></td>
                    <td className="px-4 py-3 font-bold text-accent-cyan">+{log.queryCount}</td>
                    <td className="px-4 py-3 text-gray-400">{log.tokensUsed} tokens</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
