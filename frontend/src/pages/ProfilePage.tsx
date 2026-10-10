import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, Phone, Mail, Award, Calendar, Receipt, Clipboard, RefreshCw } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: string;
  createdAt: string;
  Order?: {
    Plan?: {
      name: string;
    };
  };
}

export const ProfilePage: React.FC = () => {
  const { user, subscription, apiGet } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceHistory();
  }, []);

  const fetchInvoiceHistory = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/payments/history');
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load invoice history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferral = () => {
    if (!user) return;
    const refCode = user.referralCode || `REF-${user.id}X9`;
    navigator.clipboard.writeText(refCode);
    alert(`Referral code copied: ${refCode}`);
  };

  if (!user) return null;

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-dark-800 pb-6">
        <h1 className="text-2xl font-black text-white">Account Profile</h1>
        <p className="text-xs text-gray-400 mt-1">Manage user contact details, active plans, and download receipt history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card Left */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dark-900 border border-dark-700 text-accent-blue text-xl font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{user.fullName}</h3>
              <span className="text-[10px] text-gray-400 mt-0.5 inline-block px-2.5 py-0.5 rounded bg-dark-900 border border-dark-700">
                ACTIVE TRADER
              </span>
            </div>

            <div className="border-t border-dark-700 pt-4 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                <span>{user.mobile}</span>
              </div>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-5 space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Invite Partners</span>
            <p className="text-[11px] text-gray-400 leading-normal">Invite users to register. They receive discounts, and you earn premium trade credits.</p>
            <div className="flex gap-2">
              <span className="flex-1 rounded bg-dark-900 border border-dark-700 px-3 py-2 text-xs font-mono font-bold text-accent-gold text-center">
                {user.referralCode || `REF-${user.id}X9`}
              </span>
              <button
                onClick={handleCopyReferral}
                className="px-3 py-2 rounded bg-dark-700 hover:bg-dark-600 text-white transition-colors"
                title="Copy Code"
              >
                <Clipboard className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Column Right (2x span) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Active Subscription Panel */}
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-700 pb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-accent-blue" />
              <span>Current Signal Subscription</span>
            </h3>

            {subscription ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block uppercase text-[10px]">Active Plan</span>
                  <span className="font-bold text-white mt-0.5 block">{subscription.planName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px]">Opportunities credits</span>
                  <span className="font-bold text-accent-emerald mt-0.5 block">
                    {subscription.remainingTrades} / {subscription.allowedTrades} Available
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px]">Start Date</span>
                  <span className="text-gray-300 mt-0.5 block">Immediate Activation</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px]">Expiry Date</span>
                  <span className="text-gray-300 mt-0.5 block">{new Date(subscription.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-gray-500 bg-dark-900/50 rounded border border-dark-750 border-dashed">
                You do not have any active subscription packages.
              </div>
            )}
          </div>

          {/* Transaction Invoices Logs */}
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-700 pb-3 flex items-center gap-1.5">
              <Receipt className="h-4 w-4 text-accent-emerald" />
              <span>Payment Billing Invoices</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-5 w-5 text-accent-blue animate-spin" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 bg-dark-900/50 rounded border border-dark-750 border-dashed">
                No billing invoice logs recorded.
              </div>
            ) : (
              <div className="divide-y divide-dark-700">
                {invoices.map(inv => (
                  <div key={inv.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-gray-400">
                        {inv.Order?.Plan?.name || 'Subscription Package'} | {new Date(inv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-black text-accent-emerald">₹{Number(inv.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
