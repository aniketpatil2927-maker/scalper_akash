import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Pin,
  Send,
  Plus,
  Search,
  Lock,
  User,
  Sparkles,
  TrendingUp,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  X,
  MessageCircle,
} from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  User?: { id: number; fullName: string };
}

interface Post {
  id: number;
  userId: number;
  channel: string;
  title: string;
  content: string;
  chartData: any;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  User?: { id: number; fullName: string };
  CommunityComments?: Comment[];
}

export const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // New Post Form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newChannel, setNewChannel] = useState<string>('GENERAL');
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, [activeChannel, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/community/posts?channel=${activeChannel}&search=${searchQuery}`);
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          channel: newChannel,
          imageUrl: newImageUrl || null,
        }),
      });

      if (res.ok) {
        setNewTitle('');
        setNewContent('');
        setNewImageUrl('');
        setShowCreateModal(false);
        fetchPosts();
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev =>
          prev.map(p => (p.id === postId ? { ...p, likesCount: data.likesCount } : p))
        );
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              const existing = p.CommunityComments || [];
              return {
                ...p,
                commentsCount: p.commentsCount + 1,
                CommunityComments: [...existing, newComment],
              };
            }
            return p;
          })
        );
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  const channels = [
    { id: 'ALL', label: 'All Channels' },
    { id: 'GENERAL', label: 'General Lounge' },
    { id: 'MARKET_DISCUSSION', label: 'Live Market' },
    { id: 'SCALPING', label: 'Scalping Room' },
    { id: 'OPTIONS', label: 'Options Strategies' },
    { id: 'STRATEGY', label: 'Strategy Lab' },
    { id: 'BEGINNERS', label: 'Beginners Q&A' },
    { id: 'VIP', label: 'VIP Lounge' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Trader Network
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Community & Market Discussions
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Collaborate, share trade setups, discuss market dynamics, and learn with fellow Scalper Akash members.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>

        {/* Channel Navigation & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeChannel === ch.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search posts or tickers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading community feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No discussions yet in this channel</h3>
            <p className="text-slate-400 text-xs mt-1">Be the first to share a trade setup or question!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl hover:border-slate-700/80 transition-all shadow-xl"
              >
                {/* Post Top Meta */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                      {post.User?.fullName ? post.User.fullName.charAt(0) : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {post.User?.fullName || 'Community Member'}
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-blue-400 uppercase font-semibold">
                          {post.channel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {post.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <Pin className="w-3 h-3" />
                      Pinned Announcement
                    </span>
                  )}
                </div>

                {/* Title & Body */}
                <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{post.content}</p>

                {/* Optional Chart Image */}
                {post.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 max-h-96">
                    <img src={post.imageUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Action Bar */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400 font-semibold">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500/80" />
                    <span>{post.likesCount} Likes</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span>{post.commentsCount} Comments</span>
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40 p-4 rounded-xl">
                    <div className="space-y-2.5">
                      {post.CommunityComments && post.CommunityComments.length > 0 ? (
                        post.CommunityComments.map((c) => (
                          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
                            <div className="flex justify-between text-slate-400 mb-1">
                              <span className="font-bold text-slate-200">{c.User?.fullName || 'Member'}</span>
                              <span className="text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-300">{c.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-2 text-slate-500 text-xs">No comments yet.</div>
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Write a constructive reply..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Create New Community Post
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Discussion Channel</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="GENERAL">General Lounge</option>
                  <option value="MARKET_DISCUSSION">Live Market Discussion</option>
                  <option value="SCALPING">Scalping Room</option>
                  <option value="OPTIONS">Options Strategies</option>
                  <option value="STRATEGY">Strategy Lab</option>
                  <option value="BEGINNERS">Beginners Q&A</option>
                  <option value="VIP">VIP Members Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Post Title</label>
                <input
                  type="text"
                  placeholder="e.g. Nifty 5-min Breakout Setup with Volume Confirmation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Content & Setup Rationale</label>
                <textarea
                  rows={5}
                  placeholder="Explain your trade thesis, levels, key support/resistance..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chart Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-600/20"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
