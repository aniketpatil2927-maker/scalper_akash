import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import {
  ShoppingBag,
  Download,
  Star,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileText,
  Video,
  ArrowRight,
  Search,
  Tag,
  X,
  CreditCard,
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  slug: string;
  type: string;
  price: number;
  discountPrice: number | null;
  description: string;
  features: string[];
  thumbnailUrl: string;
  downloadUrl: string | null;
  rating: number;
  salesCount: number;
}

export const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeType, setActiveType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchasedProducts, setPurchasedProducts] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProducts();
  }, [activeType, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/marketplace/products?type=${activeType}&search=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/marketplace/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setPurchasedProducts(prev => ({ ...prev, [productId]: true }));
        alert('Product unlocked successfully! You can download your resources now.');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  const types = [
    { id: 'ALL', label: 'All Resources' },
    { id: 'EBOOK', label: 'eBooks & Guides' },
    { id: 'PLAYBOOK', label: 'Playbook Bundles' },
    { id: 'TEMPLATE', label: 'Trading Templates' },
    { id: 'MENTORSHIP', label: 'Mentorship Packs' },
    { id: 'COURSE', label: 'Masterclasses' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Digital Trading Assets & Library
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Akash Marketplace & Resource Vault
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              High-impact trading eBooks, institutional checklist PDFs, systematic templates, and recorded masterclasses.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeType === t.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading resources...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No products found in this category</h3>
            <p className="text-slate-400 text-xs mt-1">Select 'All Resources' or check back soon for new digital drops.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const isPurchased = purchasedProducts[p.id];
              return (
                <div
                  key={p.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={p.thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600'}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-blue-400 uppercase tracking-wider border border-slate-800">
                        {p.type}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-bold">{p.rating}</span>
                          <span className="text-[10px] text-slate-500">({p.salesCount} sold)</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {p.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="mt-4 space-y-1.5">
                        {p.features?.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Price</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">
                          ₹{p.discountPrice ? Number(p.discountPrice).toLocaleString('en-IN') : Number(p.price).toLocaleString('en-IN')}
                        </span>
                        {p.discountPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            ₹{Number(p.price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {isPurchased ? (
                      <a
                        href={p.downloadUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCheckout(p.id)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
                      >
                        Unlock Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
