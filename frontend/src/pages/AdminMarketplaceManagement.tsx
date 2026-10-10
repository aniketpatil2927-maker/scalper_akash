import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  DollarSign,
  X,
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  type: string;
  price: number;
  discountPrice: number | null;
  salesCount: number;
  isActive: boolean;
}

export const AdminMarketplaceManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('EBOOK');
  const [price, setPrice] = useState<number>(999);
  const [discountPrice, setDiscountPrice] = useState<number>(499);
  const [description, setDescription] = useState<string>('');
  const [featuresRaw, setFeaturesRaw] = useState<string>('Complete Setup Rules\nHigh-Resolution Chart Setups\nDirect Author Notes');
  const [downloadUrl, setDownloadUrl] = useState<string>('https://scalperakash.com/downloads/playbook-mastery.pdf');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/marketplace/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const features = featuresRaw.split('\n').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE_URL}/marketplace/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          type,
          price,
          discountPrice,
          description,
          features,
          downloadUrl,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle('');
        setDescription('');
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/marketplace/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Marketplace & Inventory ERP
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Marketplace & Digital Resources Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add eBooks, indicator packs, playbook bundles, and digital resource downloads.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Product Title</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Discount Price</th>
                  <th className="py-4 px-6">Total Sales</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">Loading products...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">No products added yet.</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-4 px-6 font-bold text-white text-sm">{p.title}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold uppercase text-[10px]">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 font-bold text-emerald-400">
                        {p.discountPrice ? `₹${Number(p.discountPrice).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">{p.salesCount} sold</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                Create Digital Product
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Option Scalper Playbook Edition 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="EBOOK">eBook</option>
                    <option value="PLAYBOOK">Playbook Bundle</option>
                    <option value="TEMPLATE">Template</option>
                    <option value="MENTORSHIP">Mentorship Pack</option>
                    <option value="COURSE">Masterclass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Discount Price</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresRaw}
                  onChange={(e) => setFeaturesRaw(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Download File URL</label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white"
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketplaceManagement;
