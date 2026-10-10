import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Gift, 
  CreditCard,
  Send,
  X
} from 'lucide-react';

interface ReferralStats {
  clicks: number;
  registrations: number;
  conversions: number;
  conversionRate: number;
  pendingCommission: number;
  approvedCommission: number;
  paidCommission: number;
  totalEarnings: number;
  availableForPayout: number;
  minPayoutAmount: number;
}

export const ReferralDashboardPage: React.FC = () => {
  const { apiGet, apiPost } = useAuth();
  const [data, setData] = useState<{
    referralCode: string;
    referralLink: string;
    stats: ReferralStats;
    referrals: any[];
    commissions: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    bankName: '',
    holderName: '',
  });
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/referrals/dashboard');
      setData(res);
      if (res?.stats?.availableForPayout) {
        setPayoutAmount(res.stats.availableForPayout.toString());
      }
    } catch (err: any) {
      console.error('Failed to fetch referral dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingPayout(true);
      const accountDetails = paymentMethod === 'UPI' 
        ? { upiId } 
        : bankDetails;

      await apiPost('/referrals/payout-request', {
        amount: parseFloat(payoutAmount),
        paymentMethod,
        accountDetails,
      });

      setShowPayoutModal(false);
      setSuccessMsg('Payout request submitted successfully! Funds will be reviewed and transferred within 24-48 business hours.');
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to submit payout request');
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-white tracking-tight">REFER & EARN PARTNER CONSOLE</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[10px] font-bold">
              UP TO 20% COMMISSION
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Earn recurring revenue by referring fellow traders to Scalper Akash subscriptions, courses & webinars.
          </p>
        </div>

        {data && (
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={data.stats.availableForPayout < data.stats.minPayoutAmount}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 disabled:opacity-40 text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition-all"
          >
            <DollarSign className="h-4 w-4" />
            <span>Request Payout (₹{data.stats.availableForPayout.toLocaleString('en-IN')})</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Share Link Banner */}
      {data && (
        <div className="bg-gradient-to-r from-dark-900 via-dark-950 to-dark-900 border border-accent-cyan/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-accent-cyan block">
                YOUR UNIQUE PARTNER LINK
              </span>
              <p className="text-sm font-bold text-white">
                Share this link with your community. All registrations & purchases are securely attributed to you.
              </p>
            </div>

            <div className="flex items-center bg-dark-900 border border-dark-700 rounded-xl p-1 max-w-lg w-full">
              <input
                type="text"
                readOnly
                value={data.referralLink}
                className="bg-transparent text-xs text-gray-200 px-3 py-2 flex-1 focus:outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-accent-cyan hover:bg-accent-cyan/90 text-dark-950 font-black text-xs transition-colors flex-shrink-0 shadow-sm"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-1">
              <span>Registrations</span>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{data.stats.registrations}</div>
            <div className="text-[10px] text-gray-400 mt-1">{data.stats.clicks} total link visits</div>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-1">
              <span>Paid Subscribers</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{data.stats.conversions}</div>
            <div className="text-[10px] text-gray-400 mt-1">{data.stats.conversionRate}% conversion rate</div>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-1">
              <span>Pending Commission</span>
              <Clock className="h-4 w-4 text-accent-gold" />
            </div>
            <div className="text-2xl font-black text-accent-gold">
              ₹{data.stats.pendingCommission.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Holding (7-day safety period)</div>
          </div>

          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs text-gray-400 font-semibold mb-1">
              <span>Total Withdrawn</span>
              <ShieldCheck className="h-4 w-4 text-accent-cyan" />
            </div>
            <div className="text-2xl font-black text-white">
              ₹{data.stats.paidCommission.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Total lifetime payout</div>
          </div>
        </div>
      )}

      {/* Referrals & Commissions History */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referred Members */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-white tracking-wide mb-4">REFERRED CLIENTS</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Joined</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800 text-gray-300">
                  {data.referrals.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-500">
                        No clients registered via your link yet.
                      </td>
                    </tr>
                  )}
                  {data.referrals.map((r: any) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2.5 font-semibold text-white">
                        {r.ReferredUser?.fullName || 'Trader Member'}
                      </td>
                      <td className="px-3 py-2.5 text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          r.status === 'CONVERTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commission Transactions */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-white tracking-wide mb-4">COMMISSION LEDGER</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Order (₹)</th>
                    <th className="px-3 py-2">Commission</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800 text-gray-300">
                  {data.commissions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">
                        No commission transactions yet.
                      </td>
                    </tr>
                  )}
                  {data.commissions.map((c: any) => (
                    <tr key={c.id}>
                      <td className="px-3 py-2.5 text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-white">
                        ₹{c.orderAmount}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-emerald-400">
                        ₹{c.commissionAmount} ({c.commissionRate}%)
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          c.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                          c.status === 'PAID' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-dark-800 mb-4">
              <h3 className="text-base font-black text-white">Request Commission Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={data?.stats?.minPayoutAmount || 1000}
                  max={data?.stats?.availableForPayout || 0}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-accent-cyan"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Available approved balance: ₹{data?.stats?.availableForPayout.toLocaleString('en-IN')} (Min: ₹{data?.stats?.minPayoutAmount})
                </span>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Payout Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      paymentMethod === 'UPI' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan' : 'bg-dark-950 border-dark-800 text-gray-400'
                    }`}
                  >
                    UPI Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BANK_TRANSFER')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      paymentMethod === 'BANK_TRANSFER' ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan' : 'bg-dark-950 border-dark-800 text-gray-400'
                    }`}
                  >
                    Direct Bank NEFT
                  </button>
                </div>
              </div>

              {paymentMethod === 'UPI' ? (
                <div>
                  <label className="block text-gray-400 font-bold mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okaxis"
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      value={bankDetails.holderName}
                      onChange={(e) => setBankDetails({ ...bankDetails, holderName: e.target.value })}
                      className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-bold mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={bankDetails.ifsc}
                        onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                        className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-extrabold shadow-lg"
                >
                  {submittingPayout ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
