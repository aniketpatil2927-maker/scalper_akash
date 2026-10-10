import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import {
  MessageSquare,
  Pin,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

interface Post {
  id: number;
  channel: string;
  title: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  status: string;
  createdAt: string;
  User?: { fullName: string; email: string };
}

export const AdminCommunityManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, [searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/community/posts?search=${searchQuery}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (postId: number, updates: { isPinned?: boolean; isLocked?: boolean; status?: string }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/community/admin/posts/${postId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Moderation failed:', err);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to remove this post?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/community/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPosts();
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
              SaaS Community Operations ERP
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Community Moderation & Feed Control
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Pin institutional announcements, lock controversial threads, and moderate trader discussions.
            </p>
          </div>
        </div>

        {/* Posts Moderation Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Channel</th>
                  <th className="py-4 px-6">Post Content</th>
                  <th className="py-4 px-6">Engagement</th>
                  <th className="py-4 px-6">Flags</th>
                  <th className="py-4 px-6">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">Loading community feed...</td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">No posts found.</td>
                  </tr>
                ) : (
                  posts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">{p.User?.fullName || 'Trader'}</div>
                        <div className="text-slate-500 text-[11px]">{p.User?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold uppercase text-[10px]">
                          {p.channel}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-bold text-slate-200">{p.title}</div>
                        <div className="text-slate-400 text-[11px] truncate mt-0.5">{p.content}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {p.likesCount} Likes • {p.commentsCount} Comments
                      </td>
                      <td className="py-4 px-6 space-x-1">
                        {p.isPinned && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                            Pinned
                          </span>
                        )}
                        {p.isLocked && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                            Locked
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleModerate(p.id, { isPinned: !p.isPinned })}
                            className={`p-2 rounded-lg text-xs font-bold ${
                              p.isPinned ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title="Toggle Pin"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleModerate(p.id, { isLocked: !p.isLocked })}
                            className={`p-2 rounded-lg text-xs font-bold ${
                              p.isLocked ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title="Toggle Lock"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Remove Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
};

export default AdminCommunityManagement;
