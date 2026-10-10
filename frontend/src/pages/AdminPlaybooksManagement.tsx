import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

interface Playbook {
  id: number;
  title: string;
  category: string;
  marketConditions: string;
  riskRewardRatio: string;
  tierRequired: string;
  status: string;
  checklist: string[];
}

export const AdminPlaybooksManagement: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('SCALPING');
  const [description, setDescription] = useState<string>('');
  const [marketConditions, setMarketConditions] = useState<string>('Trending High-Volume Regime');
  const [setupRules, setSetupRules] = useState<string>('');
  const [entryRules, setEntryRules] = useState<string>('');
  const [stopLossRules, setStopLossRules] = useState<string>('');
  const [targetRules, setTargetRules] = useState<string>('');
  const [riskRewardRatio, setRiskRewardRatio] = useState<string>('1:2');
  const [tierRequired, setTierRequired] = useState<string>('BASIC');
  const [checklistRaw, setChecklistRaw] = useState<string>('1. 9-EMA crossed above 21-EMA\n2. RSI is above 55\n3. Volume is 1.5x above 20-SMA\n4. Risk does not exceed 1.5% of account');

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/playbooks/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data);
      }
    } catch (err) {
      console.error('Failed to load admin playbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const checklist = checklistRaw.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      title,
      category,
      description,
      marketConditions,
      setupRules,
      entryRules,
      stopLossRules,
      targetRules,
      riskRewardRatio,
      tierRequired,
      checklist,
      status: 'PUBLISHED',
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/playbooks/admin/${editingId}`
        : `${API_BASE_URL}/playbooks/admin/create`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        fetchPlaybooks();
      }
    } catch (err) {
      console.error('Save playbook failed:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this playbook?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/playbooks/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPlaybooks();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Content & Strategy ERP
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Trading Playbooks Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Create, edit, and publish verified trade setups, execution checklists, and subscriber tier entitlements.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setTitle('');
              setDescription('');
              setSetupRules('');
              setEntryRules('');
              setStopLossRules('');
              setTargetRules('');
              setShowModal(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Playbook
          </button>
        </div>

        {/* Playbooks Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Playbook Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Target R:R</th>
                  <th className="py-4 px-6">Tier Required</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">Loading playbooks...</td>
                  </tr>
                ) : playbooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">No playbooks created yet.</td>
                  </tr>
                ) : (
                  playbooks.map((pb) => (
                    <tr key={pb.id} className="hover:bg-slate-800/40">
                      <td className="py-4 px-6 font-bold text-white text-sm">{pb.title}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold uppercase text-[10px]">
                          {pb.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-emerald-400">{pb.riskRewardRatio}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px]">
                          {pb.tierRequired}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {pb.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(pb.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                {editingId ? 'Edit Playbook' : 'Create New Playbook'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlaybook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Playbook Title</label>
                <input
                  type="text"
                  placeholder="e.g. Scalper Akash 1-Min EMA Momentum Blast"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="SCALPING">Scalping</option>
                    <option value="INTRADAY">Intraday</option>
                    <option value="BREAKOUT">Breakout</option>
                    <option value="OPTIONS">Options</option>
                    <option value="TREND">Trend Following</option>
                    <option value="REVERSAL">Reversal</option>
                    <option value="RISK_MANAGEMENT">Risk Management</option>
                    <option value="PSYCHOLOGY">Psychology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">R:R Ratio</label>
                  <input
                    type="text"
                    value={riskRewardRatio}
                    onChange={(e) => setRiskRewardRatio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plan Required</label>
                  <select
                    value={tierRequired}
                    onChange={(e) => setTierRequired(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="FREE">Free</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="VIP">VIP</option>
                    <option value="ELITE">Elite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Concept</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Entry Trigger Rule</label>
                  <textarea
                    rows={2}
                    value={entryRules}
                    onChange={(e) => setEntryRules(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stop Loss Invalidation</label>
                  <textarea
                    rows={2}
                    value={stopLossRules}
                    onChange={(e) => setStopLossRules(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Checklist Criteria (One item per line)</label>
                <textarea
                  rows={4}
                  value={checklistRaw}
                  onChange={(e) => setChecklistRaw(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-600/20"
                >
                  Publish Playbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlaybooksManagement;
