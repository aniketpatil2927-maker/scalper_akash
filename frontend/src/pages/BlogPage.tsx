import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  Tag,
  User,
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  thumbnailUrl: string;
  tags: string[];
  readTimeMins: number;
  publishedAt: string;
}

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/blog/posts?category=${activeCategory}&search=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Articles' },
    { id: 'Trading Education', label: 'Trading Education' },
    { id: 'Options Strategies', label: 'Options Strategies' },
    { id: 'Risk Management', label: 'Risk Protocols' },
    { id: 'Trading Psychology', label: 'Trading Psychology' },
    { id: 'Market Analysis', label: 'Daily Market Analysis' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Scalper Akash Knowledge Center
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Trading Guides, Research & Market Analysis
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Actionable insights on Price Action, Options Greek Mechanics, System Design, and Trader Psychology.
            </p>
          </div>
        </div>

        {/* Selected Post Reader View */}
        {selectedPost ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl max-w-4xl mx-auto mb-12">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold mb-6 inline-flex items-center gap-1"
            >
              &larr; Back to all articles
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase">
                {selectedPost.category}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{selectedPost.readTimeMins} min read</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-400 pb-6 border-b border-slate-800 mb-6">
              <span>By <strong>{selectedPost.author}</strong></span>
              <span>•</span>
              <span>{new Date(selectedPost.publishedAt).toLocaleDateString()}</span>
            </div>

            {selectedPost.thumbnailUrl && (
              <div className="rounded-2xl overflow-hidden mb-8 border border-slate-800 max-h-96">
                <img src={selectedPost.thumbnailUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-line">
              {selectedPost.content}
            </div>
          </div>
        ) : (
          <div>
            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === c.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Articles Grid */}
            {loading ? (
              <div className="text-center py-20 text-slate-500 text-sm">Loading articles...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No articles found in this category</h3>
                <p className="text-slate-400 text-xs mt-1">Select 'All Articles' or check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl cursor-pointer group"
                  >
                    <div>
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.thumbnailUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=800'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                            {post.category}
                          </span>
                          <span className="text-[10px] text-slate-500">{post.readTimeMins} min read</span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {post.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>By {post.author}</span>
                      <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Article <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
