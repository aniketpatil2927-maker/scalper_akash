import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.js';
import { Link } from 'react-router-dom';
import {
  Send,
  Globe,
  Lock,
  Sparkles,
  Pin,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Crown
} from 'lucide-react';
import { TELEGRAM_CHANNEL_URL, TelegramIcon } from './CommunityChannels.js';

export interface TelegramFeedPost {
  id: number;
  title: string;
  content: string;
  audience: 'PUBLIC' | 'PAID_MEMBERS';
  targetTier: 'ALL' | 'BASIC' | 'PREMIUM' | 'VIP';
  category: string;
  mediaUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  telegramChannelId: string | null;
  pinMessage: boolean;
  sentAt: string;
  Author?: {
    id: number;
    fullName: string;
  };
}

interface TelegramLiveFeedProps {
  maxItems?: number;
  showFilters?: boolean;
}

export const TelegramLiveFeed: React.FC<TelegramLiveFeedProps> = ({
  maxItems = 15,
  showFilters = true,
}) => {
  const { user, token, subscription } = useAuth();
  const [posts, setPosts] = useState<TelegramFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLIC' | 'PAID_MEMBERS'>('ALL');
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [activePlanName, setActivePlanName] = useState<string | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      if (token) {
        // Fetch via subscriber feed if user is logged in
        const res = await fetch(`${API_BASE_URL}/telegram/subscriber-feed`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setIsSubscriber(Boolean(data.isSubscriber));
          setActivePlanName(data.activePlan || null);
          return;
        }
      }

      // Fallback or unauthenticated / non-subscriber: fetch public feed
      const publicRes = await fetch(`${API_BASE_URL}/telegram/public-feed`);
      if (publicRes.ok) {
        const publicPosts = await publicRes.json();
        setPosts(publicPosts || []);
        setIsSubscriber(false);
      }
    } catch (err) {
      console.error('Failed to fetch Telegram feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [token, subscription]);

  const filteredPosts = posts
    .filter((post) => {
      if (activeTab === 'ALL') return true;
      return post.audience === activeTab;
    })
    .slice(0, maxItems);

  return (
    <div className="bg-[#0e1017] border border-[#1e2333] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-5 border-b border-[#1e2333] bg-gradient-to-r from-[#111422] via-[#0e1017] to-[#121b29] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shadow-[0_0_15px_rgba(34,158,217,0.25)]">
            <TelegramIcon className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-white tracking-wide">
                Live Telegram Signals & Alerts
              </h3>
              <span className="flex items-center space-x-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Feed</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time broadcasts dispatched from Scalper Akash Trading Desk
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#229ED9] hover:bg-[#1b8fc7] text-white text-xs font-bold transition-all shadow-md group"
          >
            <span>Open Channel</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <button
            onClick={fetchFeed}
            disabled={loading}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ccff00]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Subscription Status Banner */}
      <div className="px-5 py-2.5 bg-black/40 border-b border-[#1e2333] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          {isSubscriber ? (
            <>
              <Crown className="w-4 h-4 text-[#ccff00]" />
              <span className="text-white font-semibold">
                VIP Member Access Unlocked:{' '}
                <span className="text-[#ccff00] font-black">{activePlanName || 'Active Trading Plan'}</span>
              </span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 text-[#229ED9]" />
              <span className="text-gray-300">
                Viewing <span className="text-white font-bold">Public Updates</span>. Exclusive VIP trade calls are restricted to paid plan subscribers.
              </span>
            </>
          )}
        </div>

        {!isSubscriber && (
          <Link
            to="/pricing"
            className="inline-flex items-center space-x-1 font-black text-[#ccff00] hover:underline"
          >
            <span>Unlock VIP Channel</span>
            <Sparkles className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      {showFilters && (
        <div className="flex items-center space-x-2 px-5 py-3 border-b border-[#1e2333] bg-[#0b0c12]">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'ALL'
                ? 'bg-[#ccff00] text-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Broadcasts ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab('PUBLIC')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'PUBLIC'
                ? 'bg-[#229ED9] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Public Open</span>
          </button>

          <button
            onClick={() => setActiveTab('PAID_MEMBERS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'PAID_MEMBERS'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Subscribers Only (VIP)</span>
          </button>
        </div>
      )}

      {/* Feed List */}
      <div className="p-5 space-y-4 max-h-[640px] overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-gray-500">
            <RefreshCw className="w-7 h-7 animate-spin text-[#ccff00]" />
            <p className="text-xs">Fetching live updates from Telegram channels...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-2">
            <Send className="w-8 h-8 mx-auto opacity-30 text-[#229ED9]" />
            <p className="text-sm font-bold text-gray-300">No broadcasts found</p>
            <p className="text-xs">Check back soon or follow the official Telegram channel for updates.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`p-4 rounded-xl border transition-all ${
                post.audience === 'PAID_MEMBERS'
                  ? 'bg-gradient-to-r from-amber-500/[0.04] to-transparent border-amber-500/25 hover:border-amber-500/40'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              {/* Post Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center space-x-2">
                  {post.pinMessage && (
                    <span className="flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Pin className="w-2.5 h-2.5" />
                      <span>Pinned</span>
                    </span>
                  )}

                  {post.audience === 'PUBLIC' ? (
                    <span className="flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/30">
                      <Globe className="w-2.5 h-2.5" />
                      <span>Public Open</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5" />
                      <span>VIP Subscribers</span>
                      {post.targetTier !== 'ALL' && <span>• {post.targetTier}</span>}
                    </span>
                  )}

                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
                    {post.category}
                  </span>
                </div>

                <div className="text-[11px] text-gray-400 font-mono">
                  {new Date(post.sentAt).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
              </div>

              {/* Title */}
              <h4 className="text-sm font-black text-white mb-2 leading-snug">
                {post.title}
              </h4>

              {/* Content Body */}
              <div className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed mb-3">
                {post.content}
              </div>

              {/* Media Attachment if present */}
              {post.mediaUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10 max-h-60 bg-black/50">
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    className="w-full h-auto object-cover max-h-60 hover:scale-[1.01] transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* CTA Action Button */}
              {post.buttonText && post.buttonUrl && (
                <div className="mt-2.5">
                  <a
                    href={post.buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] border border-[#229ED9]/40 text-xs font-bold transition-all shadow-sm group"
                  >
                    <span>{post.buttonText}</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
