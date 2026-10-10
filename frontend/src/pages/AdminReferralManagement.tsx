import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Settings, 
  ShieldAlert, 
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const AdminReferralManagement: React.FC = () => {
  const { apiGet, apiPatch, apiPut } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'AFFILIATES' | 'COMMISSIONS' | 'CONFIG'>('AFFILIATES');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const [ovRes, affRes, commRes, confRes] = await Promise.all([
        apiGet('/referrals/admin/overview'),
        apiGet('/referrals/admin/affiliates'),
        apiGet('/referrals/admin/commissions'),
        apiGet('/referrals/admin/program-config'),
      ]);
      setOverview(ovRes);
      setAffiliates(affRes);
      setCommissions(commRes);
      setConfig(confRes);
    } catch (err: any) {
      console.error('Failed to load referral admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommissionStatus = async (id: number, status: string) => {
    try {
      await apiPatch(`/referrals/admin/commissions/${id}`, { status });
      fetchReferralData();
      alert(`Commission marked as ${status}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update commission status');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPut('/referrals/admin/program-config', config);
      alert('Referral program settings updated successfully!');
      fetchReferralData();
    } catch (err: any) {
      alert(err.message || 'Failed to save config');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">AFFILIATE & REFERRAL ENGINE</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage affiliate partners, commission approvals, program percentage rates, and fraud holding rules.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('AFFILIATES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AFFILIATES' ? 'bg-accent-cyan text-dark-950 font-black' : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
          >
            Affiliates ({affiliates.length})
          </button>
          <button
            onClick={() => setActiveTab('COMMISSIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'COMMISSIONS' ? 'bg-accent-cyan text-dark-950 font-black' : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
          >
            Commissions ({commissions.length})
          </button>
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CONFIG' ? 'bg-accent-cyan text-dark-950 font-black' : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
          >
            Program Rules
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Affiliates</span>
            <div className="text-2xl font-black text-white mt-1">{overview.totalAffiliates}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Attributed Conversions</span>
            <div className="text-2xl font-black text-accent-cyan mt-1">{overview.convertedReferrals} ({overview.conversionRate}%)</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Pending Commissions</span>
            <div className="text-2xl font-black text-accent-gold mt-1">₹{overview.pendingCommissions.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Paid Out</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹{overview.paidCommissions.toLocaleString('en-IN')}</div>
          </div>
        </div>
      )}

      {/* Tab 1: Affiliates List */}
      {activeTab === 'AFFILIATES' && (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Affiliate Partner</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Total Referrals</th>
                  <th className="px-4 py-3">Paid Conversions</th>
                  <th className="px-4 py-3">Total Earned</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800 text-gray-300">
                {affiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      {aff.fullName}
                      <span className="block text-[10px] text-gray-500 font-normal">{aff.email}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-accent-cyan">
                      {aff.referralCode}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{aff.referralsCount}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{aff.conversionsCount}</td>
                    <td className="px-4 py-3 font-black text-white">₹{aff.totalEarned.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {aff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Commissions Ledger */}
      {activeTab === 'COMMISSIONS' && (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Affiliate</th>
                  <th className="px-4 py-3">Order Amount</th>
                  <th className="px-4 py-3">Commission (₹)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800 text-gray-300">
                {commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {comm.Referrer?.fullName || `Affiliate #${comm.referrerId}`}
                    </td>
                    <td className="px-4 py-3 text-gray-300">₹{comm.orderAmount}</td>
                    <td className="px-4 py-3 font-black text-emerald-400">
                      ₹{comm.commissionAmount} ({comm.commissionRate}%)
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        comm.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                        comm.status === 'PAID' ? 'bg-blue-500/20 text-blue-400' :
                        comm.status === 'REVERSED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {comm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      {comm.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateCommissionStatus(comm.id, 'APPROVED')}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateCommissionStatus(comm.id, 'REVERSED')}
                            className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-bold"
                          >
                            Reverse
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Program Config */}
      {activeTab === 'CONFIG' && config && (
        <div className="max-w-2xl bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">PROGRAM COMMISSION RULES</h3>
          
          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-bold mb-1">Program Name</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Default Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={config.defaultCommissionRate}
                  onChange={(e) => setConfig({ ...config, defaultCommissionRate: parseFloat(e.target.value) })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1">Safety Holding Period (Days)</label>
                <input
                  type="number"
                  value={config.holdingPeriodDays}
                  onChange={(e) => setConfig({ ...config, holdingPeriodDays: parseInt(e.target.value) })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-1">Minimum Payout Threshold (₹)</label>
              <input
                type="number"
                value={config.minPayoutAmount}
                onChange={(e) => setConfig({ ...config, minPayoutAmount: parseFloat(e.target.value) })}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-accent-cyan text-dark-950 font-black text-xs shadow-lg hover:bg-accent-cyan/90 transition-colors"
            >
              Save Program Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
