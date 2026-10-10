import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Search, 
  User, 
  Ban, 
  CheckCircle, 
  PlusCircle, 
  MinusCircle, 
  Award,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';

interface ManageUser {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_OTP';
  referralCode: string | null;
  createdAt: string;
}

interface Plan {
  id: number;
  name: string;
  accessTier: string;
}

export const UserManagement: React.FC = () => {
  const { apiGet, apiPost, apiPut } = useAuth();
  const [users, setUsers] = useState<ManageUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Modals / Inputs
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showAssignPlan, setShowAssignPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  const [customValidity, setCustomValidity] = useState<number>(30);

  const [showAdjustCredits, setShowAdjustCredits] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<number>(0);
  const [creditAction, setCreditAction] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [creditCount, setCreditCount] = useState<number>(1);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      const data = await apiGet(`/admin/users${query ? `?search=${query}` : ''}`);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await apiGet('/plans');
      setPlans(data);
      if (data.length > 0) setSelectedPlanId(data[0].id);
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleSelectUser = async (userId: number) => {
    try {
      setError(null);
      setMessage(null);
      const data = await apiGet(`/admin/users/${userId}`);
      setSelectedUser(data);
      if (data.Subscriptions && data.Subscriptions.length > 0) {
        setSelectedSubId(data.Subscriptions[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user details');
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await apiPut(`/admin/users/${userId}/status`, { status: targetStatus });
      
      setMessage(`User status updated to ${targetStatus}`);
      await handleSelectUser(userId);
      fetchUsers(search); // refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to toggle status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      await apiPost(`/admin/users/${selectedUser.id}/assign-plan`, {
        planId: Number(selectedPlanId),
        validityDays: Number(customValidity),
      });

      setMessage('Plan manually assigned and active.');
      setShowAssignPlan(false);
      await handleSelectUser(selectedUser.id);
    } catch (err: any) {
      setError(err.message || 'Failed to assign plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustCreditsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedSubId) return;
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);

      await apiPost(`/admin/users/${selectedUser.id}/adjust-credits`, {
        subscriptionId: Number(selectedSubId),
        actionType: creditAction,
        count: Number(creditCount),
        reason: adjustmentReason,
      });

      setMessage('Credits adjusted successfully and user notified.');
      setShowAdjustCredits(false);
      setAdjustmentReason('');
      await handleSelectUser(selectedUser.id);
    } catch (err: any) {
      setError(err.message || 'Failed to adjust credits');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-dark-800 pb-6">
        <h1 className="text-2xl font-black text-white">User Administration</h1>
        <p className="text-xs text-gray-400 mt-1">Review profiles, assign plans, adjust trade credit lines, or manage locks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Search & List Column */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg bg-dark-900 border border-dark-700 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-accent-blue focus:ring-0 focus:outline-none"
              />
            </div>
            <button 
              type="submit"
              className="px-4 py-3 rounded-lg bg-dark-850 hover:bg-dark-805 text-white font-semibold text-xs border border-dark-700 transition-colors"
            >
              Filter
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 text-accent-blue animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dark-700 bg-dark-900/40 p-8 text-center text-xs text-gray-500">
              No registered user records match this filter.
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {users.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`p-4 cursor-pointer transition-all replica-card ${
                      selectedUser?.id === u.id 
                        ? 'replica-card-active font-semibold' 
                        : 'text-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">{u.fullName}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        u.status === 'ACTIVE' 
                          ? 'bg-accent-cyan/15 text-accent-cyan' 
                          : u.status === 'SUSPENDED' 
                          ? 'bg-accent-rose/15 text-accent-rose' 
                          : 'bg-dark-700 text-gray-400'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">{u.email}</span>
                    <span className="text-[10px] text-gray-500 block mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Detail & Control Center Right Column */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            
            {error && (
              <div className="mb-4 rounded-lg bg-accent-rose/10 border border-accent-rose/25 p-3 text-xs text-accent-rose">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/25 p-3 text-xs text-accent-cyan">
                {message}
              </div>
            )}

            {selectedUser ? (
              <div className="rounded-xl bg-dark-800 p-6 space-y-6 glass-panel shadow-2xl">
              
              {/* User Title Panel */}
              <div className="flex justify-between items-start border-b border-dark-700 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-accent-blue" />
                    <span>{selectedUser.fullName}</span>
                  </h3>
                  <span className="text-xs text-gray-400 block mt-1">{selectedUser.email} | {selectedUser.mobile}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={submitting}
                    onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                      selectedUser.status === 'ACTIVE' 
                        ? 'bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose' 
                        : 'bg-accent-emerald/10 hover:bg-accent-emerald/20 text-accent-emerald'
                    }`}
                  >
                    {selectedUser.status === 'ACTIVE' ? (
                      <><Ban className="h-3.5 w-3.5" /> Suspend Account</>
                    ) : (
                      <><CheckCircle className="h-3.5 w-3.5" /> Activate Account</>
                    )}
                  </button>
                </div>
              </div>

              {/* Subscription Summary */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Subscription</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAssignPlan(true)}
                      className="px-3 py-1.5 rounded bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-[10px] font-bold transition-colors flex items-center gap-1"
                    >
                      <Award className="h-3 w-3" /> Manually Override Plan
                    </button>
                    {selectedUser.Subscriptions && selectedUser.Subscriptions.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedSubId(selectedUser.Subscriptions[0].id);
                          setShowAdjustCredits(true);
                        }}
                        className="px-3 py-1.5 rounded bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold text-[10px] font-bold transition-colors flex items-center gap-1"
                      >
                        <Sliders className="h-3 w-3" /> Adjust Credits
                      </button>
                    )}
                  </div>
                </div>

                {selectedUser.Subscriptions && selectedUser.Subscriptions.length > 0 ? (
                  <div className="rounded-lg bg-dark-900 border border-dark-750 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Plan Tier</span>
                      <span className="text-xs font-extrabold text-white mt-1 block">
                        {selectedUser.Subscriptions[0].Plan?.name || 'Assigned Plan'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Trade Credits</span>
                      <span className="text-xs font-extrabold text-white mt-1 block">
                        {selectedUser.Subscriptions[0].remainingTrades} / {selectedUser.Subscriptions[0].allowedTrades}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Status</span>
                      <span className="text-xs font-extrabold text-accent-emerald mt-1 block">
                        {selectedUser.Subscriptions[0].status}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Expiration</span>
                      <span className="text-xs font-extrabold text-white mt-1 block">
                        {new Date(selectedUser.Subscriptions[0].expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-dark-700 p-6 text-center text-xs text-gray-500">
                    This user does not have any active subscriptions.
                  </div>
                )}
              </div>

              {/* Transactions & Invoices logs */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Billing History</h4>
                {selectedUser.Invoices && selectedUser.Invoices.length > 0 ? (
                  <div className="rounded-lg bg-dark-900 border border-dark-750 overflow-hidden divide-y divide-dark-750">
                    {selectedUser.Invoices.map((inv: any) => (
                      <div key={inv.id} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-white block">{inv.invoiceNumber}</span>
                          <span className="text-[10px] text-gray-500">{new Date(inv.createdAt).toLocaleString()}</span>
                        </div>
                        <span className="font-bold text-accent-emerald">₹{Number(inv.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-dark-700 p-4 text-center text-xs text-gray-500">
                    No payment invoices logged.
                  </div>
                )}
              </div>

              {/* Manual Actions Modals forms overlay */}
              {showAssignPlan && (
                <div className="rounded-lg border border-accent-blue bg-dark-900 p-4 space-y-4">
                  <h5 className="text-xs font-bold text-white uppercase flex items-center justify-between">
                    <span>Manually Override / Assign Plan</span>
                    <button onClick={() => setShowAssignPlan(false)} className="text-gray-400 hover:text-white">✕</button>
                  </h5>
                  <form onSubmit={handleAssignPlanSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Select Target Plan</label>
                      <select 
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                        className="w-full rounded bg-dark-850 border border-dark-700 text-xs text-white p-2.5 focus:outline-none"
                      >
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.accessTier})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Custom Validity Days</label>
                      <input 
                        type="number"
                        min={1}
                        value={customValidity}
                        onChange={(e) => setCustomValidity(Number(e.target.value))}
                        className="w-full rounded bg-dark-850 border border-dark-700 text-xs text-white p-2.5 focus:outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full py-2 bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs rounded transition-colors"
                    >
                      Confirm Assignment
                    </button>
                  </form>
                </div>
              )}

              {showAdjustCredits && (
                <div className="rounded-lg border border-accent-gold bg-dark-900 p-4 space-y-4">
                  <h5 className="text-xs font-bold text-white uppercase flex items-center justify-between">
                    <span>Adjust Trade Credits Pool</span>
                    <button onClick={() => setShowAdjustCredits(false)} className="text-gray-400 hover:text-white">✕</button>
                  </h5>
                  <form onSubmit={handleAdjustCreditsSubmit} className="space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-gray-300">
                        <input 
                          type="radio" 
                          name="act" 
                          checked={creditAction === 'ADD'} 
                          onChange={() => setCreditAction('ADD')}
                        />
                        <span>Add Credits</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-300">
                        <input 
                          type="radio" 
                          name="act" 
                          checked={creditAction === 'SUBTRACT'} 
                          onChange={() => setCreditAction('SUBTRACT')}
                        />
                        <span>Subtract Credits</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Credits Count</label>
                      <input 
                        type="number"
                        min={1}
                        value={creditCount}
                        onChange={(e) => setCreditCount(Number(e.target.value))}
                        className="w-full rounded bg-dark-850 border border-dark-700 text-xs text-white p-2.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Audit Log Reason (Mandatory)</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Compensating for canceled signal TRD-001"
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="w-full rounded bg-dark-850 border border-dark-700 text-xs text-white p-2.5 focus:outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full py-2 bg-accent-gold hover:bg-yellow-600 text-dark-950 font-bold text-xs rounded transition-colors"
                    >
                      Confirm Adjustment
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-xl border border-dark-700 bg-dark-900/40 p-12 text-center text-xs text-gray-500">
              Select a user from the directory to review profiles, invoices, subscriptions, or make credit adjustments.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
