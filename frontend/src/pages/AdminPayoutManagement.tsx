import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  CreditCard,
  RefreshCw,
  X,
  ExternalLink
} from 'lucide-react';

export const AdminPayoutManagement: React.FC = () => {
  const { apiGet, apiPatch } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/referrals/admin/payouts');
      setPayouts(data);
    } catch (err: any) {
      console.error('Failed to load payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (status: 'PAID' | 'REJECTED' | 'UNDER_REVIEW') => {
    if (!selectedPayout) return;
    try {
      await apiPatch(`/referrals/admin/payouts/${selectedPayout.id}`, {
        status,
        transactionRef,
        adminNotes,
      });
      setSelectedPayout(null);
      setTransactionRef('');
      setAdminNotes('');
      fetchPayouts();
      alert(`Payout marked as ${status}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update payout');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">AFFILIATE PAYOUT REQUESTS</h1>
          <p className="text-xs text-gray-400 mt-1">
            Review and execute withdrawal requests to partner bank accounts and UPI IDs.
          </p>
        </div>
        <button
          onClick={fetchPayouts}
          className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 hover:text-white text-xs font-bold flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Payouts Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Requested Date</th>
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Amount (₹)</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Account / VPA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-gray-300">
              {payouts.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No affiliate payout requests found.
                  </td>
                </tr>
              )}
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(p.requestedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {p.Referrer?.fullName || `Affiliate #${p.referrerId}`}
                  </td>
                  <td className="px-4 py-3 font-black text-white text-sm">
                    ₹{Number(p.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-dark-800 text-[10px] font-bold text-accent-cyan">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-[11px]">
                    {p.paymentMethod === 'UPI' ? p.accountDetails?.upiId : `${p.accountDetails?.accountNumber} (${p.accountDetails?.ifsc})`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      p.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                      p.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      p.status === 'UNDER_REVIEW' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {p.status !== 'PAID' && p.status !== 'REJECTED' ? (
                      <button
                        onClick={() => setSelectedPayout(p)}
                        className="px-3 py-1.5 rounded-lg bg-accent-cyan text-dark-950 font-black text-xs hover:bg-accent-cyan/90 transition-colors"
                      >
                        Process
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-mono">
                        {p.transactionRef || 'Completed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Payout Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-dark-800">
              <h3 className="text-base font-black text-white">Process Affiliate Payout</h3>
              <button onClick={() => setSelectedPayout(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-dark-950 border border-dark-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Affiliate:</span>
                <span className="font-bold text-white">{selectedPayout.Referrer?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="font-black text-accent-cyan text-sm">₹{Number(selectedPayout.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Destination:</span>
                <span className="font-mono text-gray-200">
                  {selectedPayout.paymentMethod === 'UPI' ? selectedPayout.accountDetails?.upiId : `${selectedPayout.accountDetails?.accountNumber} (${selectedPayout.accountDetails?.ifsc})`}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Bank / UPI Transaction Reference (UTR)</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UTR/2026/09/849201948"
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Admin Notes (Optional)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Approved and wired via HDFC Corporate"
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => handleProcessPayout('REJECTED')}
                  className="px-3 py-2 rounded-xl bg-red-600/20 text-red-400 font-bold hover:bg-red-600/30"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessPayout('PAID')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black shadow-lg"
                >
                  Mark as Paid & Dispatched
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
