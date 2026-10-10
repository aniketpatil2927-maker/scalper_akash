import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Gift, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Percent, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  X,
  RefreshCw
} from 'lucide-react';

export const AdminCouponsManagement: React.FC = () => {
  const { apiGet, apiPost, apiPut } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '20',
    minOrderAmount: '499',
    maxDiscount: '1000',
    appliesTo: 'ALL',
    usageLimit: '500',
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/coupons/admin');
      setCoupons(data);
    } catch (err: any) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/coupons/admin', {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: parseFloat(formData.minOrderAmount),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: parseInt(formData.usageLimit),
      });
      setShowModal(false);
      fetchCoupons();
      alert('Promotional coupon created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">CROSS-PRODUCT PROMOTIONAL COUPONS</h1>
          <p className="text-xs text-gray-400 mt-1">
            Create unified discount codes applicable across Subscriptions, Paid Courses, and Live Webinars.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="lime-gradient-btn"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Applies To</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Redemptions</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-gray-300">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-black text-accent-cyan text-sm">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 font-bold text-white">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-dark-800 text-[10px] font-bold text-gray-300">
                      {c.appliesTo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    ₹{c.minOrderAmount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-bold text-emerald-400">{c.usedCount}</span> / {c.usageLimit}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(c.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-dark-800">
              <h3 className="text-base font-black text-white">Create Coupon Code</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SCALPER20"
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Applies To</label>
                  <select
                    value={formData.appliesTo}
                    onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="ALL">All Products</option>
                    <option value="SUBSCRIPTION">Subscriptions Only</option>
                    <option value="COURSE">Courses Only</option>
                    <option value="WEBINAR">Webinars Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Valid Until</label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lime-gradient-btn !py-2 !px-5"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
