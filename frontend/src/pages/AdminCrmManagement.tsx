import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
  BarChart2,
} from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  stage: string;
  source: string;
  notes: string | null;
  leadValue: number;
  lastContactDate: string | null;
  createdAt: string;
}

interface CrmStats {
  totalLeads: number;
  totalPipelineValue: number;
  conversionRate: number;
  stageCounts: Record<string, number>;
}

export const AdminCrmManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [stage, setStage] = useState<string>('NEW');
  const [source, setSource] = useState<string>('WEBSITE');
  const [leadValue, setLeadValue] = useState<number>(4999);
  const [notes, setNotes] = useState<string>('');

  const stages = [
    { id: 'NEW', label: 'New Inquiries', color: 'border-blue-500/40 text-blue-400' },
    { id: 'CONTACTED', label: 'Contacted', color: 'border-amber-500/40 text-amber-400' },
    { id: 'INTERESTED', label: 'Interested / Demo', color: 'border-purple-500/40 text-purple-400' },
    { id: 'FREE_USER', label: 'Free Course User', color: 'border-cyan-500/40 text-cyan-400' },
    { id: 'PAID', label: 'Basic / Pro Paid', color: 'border-emerald-500/40 text-emerald-400' },
    { id: 'VIP', label: 'VIP / Mentorship', color: 'border-yellow-500/40 text-yellow-400' },
    { id: 'RENEWAL', label: 'Renewal Due', color: 'border-rose-500/40 text-rose-400' },
  ];

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [activeStageFilter, searchQuery]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/crm/leads?stage=${activeStageFilter}&search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Failed to fetch CRM leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/crm/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/crm/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone, stage, source, leadValue, notes }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setName('');
        setEmail('');
        setPhone('');
        setNotes('');
        fetchLeads();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to add lead:', err);
    }
  };

  const handleUpdateStage = async (leadId: number, newStage: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/crm/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, stage: newStage } : l)));
        fetchStats();
      }
    } catch (err) {
      console.error('Stage update failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS CRM & Lead Pipeline ERP
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Customer Relationship Management (CRM)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track conversion funnels, follow-ups, subscriber lifecycles, and high-ticket mentorship leads.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>

        {/* Stats Summary Telemetry */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase font-bold">Total Active Leads</div>
              <div className="text-3xl font-black text-white mt-1">{stats.totalLeads}</div>
              <div className="text-[10px] text-slate-500 mt-1">Across all pipeline stages</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase font-bold">Pipeline Deal Value</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                ₹{Number(stats.totalPipelineValue).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Estimated annual run-rate</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase font-bold">Lead-to-Paid Conversion</div>
              <div className="text-3xl font-black text-blue-400 mt-1">{stats.conversionRate}%</div>
              <div className="text-[10px] text-slate-500 mt-1">Free to Paid subscriber velocity</div>
            </div>
          </div>
        )}

        {/* Kanban Stages / Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveStageFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeStageFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Stages
            </button>
            {stages.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStageFilter(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeStageFilter === s.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label} ({stats?.stageCounts[s.id] || 0})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Lead / Contact</th>
                  <th className="py-4 px-6">Source</th>
                  <th className="py-4 px-6">Pipeline Stage</th>
                  <th className="py-4 px-6">Est. Value</th>
                  <th className="py-4 px-6">Notes</th>
                  <th className="py-4 px-6">Move Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">Loading leads...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">No leads found in this filter.</td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">{l.name}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {l.email}
                          {l.phone && (
                            <>
                              <span>•</span>
                              <Phone className="w-3 h-3 text-slate-500" />
                              {l.phone}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300">
                          {l.source}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {l.stage}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-400">
                        ₹{Number(l.leadValue).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-slate-300 max-w-xs truncate">
                        {l.notes || '—'}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={l.stage}
                          onChange={(e) => handleUpdateStage(l.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          {stages.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Add Lead to Sales Pipeline
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2.5 text-xs text-white"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2.5 text-xs text-white"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="TELEGRAM">Telegram</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WEBINAR">Free Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Est. Value (₹)</label>
                  <input
                    type="number"
                    value={leadValue}
                    onChange={(e) => setLeadValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes & Context</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Interested in Bank Nifty scalping option strategy; requested a callback..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-600/20"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCrmManagement;
