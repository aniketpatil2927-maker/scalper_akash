import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.js';
import {
  Send,
  Globe,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Image as ImageIcon,
  Link as LinkIcon,
  Pin,
  Settings,
  Trash2,
  RefreshCw,
  Eye,
  ExternalLink,
  Bot,
  Layers,
  Search,
  Check,
  X
} from 'lucide-react';

interface TelegramPostItem {
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
  telegramMessageId: string | null;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  responseLog?: string | null;
  pinMessage: boolean;
  sentAt: string;
  Author?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export const AdminTelegramPostManagement: React.FC = () => {
  const { apiPost, apiGet, apiDelete } = useAuth();

  // Composer Form States
  const [audience, setAudience] = useState<'PUBLIC' | 'PAID_MEMBERS'>('PUBLIC');
  const [targetTier, setTargetTier] = useState<'ALL' | 'BASIC' | 'PREMIUM' | 'VIP'>('ALL');
  const [category, setCategory] = useState<string>('SIGNAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [pinMessage, setPinMessage] = useState(false);
  const [sendInAppNotification, setSendInAppNotification] = useState(true);

  // Status & List States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryingPostId, setRetryingPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<TelegramPostItem[]>([]);
  const [stats, setStats] = useState({ total: 0, publicCount: 0, paidCount: 0, liveSentCount: 0 });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [filterAudience, setFilterAudience] = useState<'ALL' | 'PUBLIC' | 'PAID_MEMBERS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Bot Config & Settings Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [publicChannelId, setPublicChannelId] = useState('');
  const [paidChannelId, setPaidChannelId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Feedback Notification
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchConfig();
  }, [filterAudience]);

  const showAlert = (type: 'success' | 'error' | 'warning', message: string) => {
    setAlertBanner({ type, message });
    setTimeout(() => setAlertBanner(null), 7000);
  };

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const url = filterAudience === 'ALL'
        ? `${API_BASE_URL}/admin/telegram/posts`
        : `${API_BASE_URL}/admin/telegram/posts?audience=${filterAudience}`;
      const res = await apiGet(url.replace(API_BASE_URL, ''));
      setPosts(res.posts || []);
      if (res.stats) setStats(res.stats);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await apiGet('/admin/telegram/config');
      setBotToken(res.botTokenMasked || '');
      setPublicChannelId(res.publicChannelId || '@Akashscalpertrading');
      setPaidChannelId(res.paidChannelId || '@Akashscalpertrading_vip');
      setIsConfigured(res.isConfigured);
    } catch (err: any) {
      console.error('Failed to fetch config:', err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/admin/telegram/config', {
        botToken,
        publicChannelId,
        paidChannelId,
      });
      showAlert('success', 'Telegram credentials saved successfully!');
      setShowConfigModal(false);
      fetchConfig();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to save Telegram credentials');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult(null);
      const res = await apiPost('/admin/telegram/test', {
        botToken,
        publicChannelId,
        paidChannelId,
      });
      setTestResult({
        success: true,
        message: res.message || 'Connected successfully to Telegram Bot API!'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect. Verify Bot Token in @BotFather.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showAlert('error', 'Please fill out both the post title and message body.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        content: content.trim(),
        audience,
        targetTier,
        category,
        mediaUrl: mediaUrl.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        buttonUrl: buttonUrl.trim() || undefined,
        pinMessage,
        sendInAppNotification,
      };

      const res = await apiPost('/admin/telegram/post', payload);
      
      if (res.status === 'SENT') {
        showAlert('success', res.message || 'Post published LIVE to Telegram channel!');
      } else if (res.status === 'SIMULATED') {
        showAlert('warning', res.message || 'Post saved in Simulated mode. Add your Telegram Bot Token to publish live!');
      } else {
        showAlert('error', res.message || 'Failed to dispatch to Telegram channel');
      }

      // Reset form
      setTitle('');
      setContent('');
      setMediaUrl('');
      setButtonText('');
      setButtonUrl('');
      setPinMessage(false);

      fetchPosts();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to send Telegram post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to remove this Telegram post record?')) return;
    try {
      await apiDelete(`/admin/telegram/posts/${id}`);
      showAlert('success', 'Telegram post record removed.');
      fetchPosts();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to delete post');
    }
  };

  const handleRetryPost = async (id: number) => {
    try {
      setRetryingPostId(id);
      const res = await apiPost(`/admin/telegram/posts/${id}/retry`, {});
      showAlert('success', res.message || 'Post broadcasted live to Telegram!');
      fetchPosts();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to retry Telegram dispatch');
      fetchPosts();
    } finally {
      setRetryingPostId(null);
    }
  };

  // Quick Template Injector
  const applyTemplate = (type: string) => {
    if (type === 'SIGNAL') {
      setCategory('SIGNAL');
      setTitle('⚡ BANKNIFTY 50800 CE SCALP ENTRY');
      setContent('🔥 Setup: 1-Min Order Block Rejection + Volume Spike\n\n🎯 Entry: 340 - 345\n🛑 Stop Loss: 318 (Strict)\n🚀 Target 1: 375\n🚀 Target 2: 410\n\n⚠️ Risk Notice: Keep position sizing within 2% max risk per trade.');
    } else if (type === 'TARGET_HIT') {
      setCategory('TARGET_HIT');
      setTitle('🎯 TARGET 2 SMASHED: +65 POINTS SECURED!');
      setContent('Boom! Bank Nifty 50800 CE reached 410 from 345 entry.\n\n✅ 1:3 Risk to Reward Achieved\n💰 Book 80% partial profits and trail SL to cost for runners.\n\nDiscipline > Emotion.');
    } else if (type === 'MARKET_ANALYSIS') {
      setCategory('MARKET_ANALYSIS');
      setTitle('📊 PRE-MARKET STRUCTURE & LIQUIDITY SWEEP ANALYSIS');
      setContent('Nifty closed near daily resistance with heavy Call writing at 24500.\n\nKey Levels for Today:\n• Bullish confirmation only above 24530\n• High probability short below 24420 with 24350 target\n\nWait for 15-min opening candle range break.');
    }
  };

  const currentChannelName = audience === 'PUBLIC'
    ? (publicChannelId || '@scalper_akash_free')
    : (paidChannelId || '@scalper_akash_vip');

  const filteredPosts = posts.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-16 text-gray-200">
      {/* Alert Banner */}
      {alertBanner && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all shadow-xl ${
          alertBanner.type === 'success'
            ? 'bg-[#ccff00]/15 border border-[#ccff00]/40 text-[#ccff00]'
            : alertBanner.type === 'warning'
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
            : 'bg-red-500/15 border border-red-500/40 text-red-400'
        }`}>
          <div className="flex items-center space-x-3">
            {alertBanner.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{alertBanner.message}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0e111a] border border-[#1e2333] p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0088cc]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30 shadow-[0_0_20px_rgba(0,136,204,0.3)]">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">TELEGRAM POST & BROADCAST HUB</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/40">
                  Live Telegram Bot
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Post live scalping signals, market updates, and exclusive alerts directly to your Public & VIP Telegram channels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#161a26] border border-white/10 hover:border-[#0088cc]/50 text-white hover:text-[#0088cc] text-xs font-bold transition-all shadow-md"
          >
            <Settings className="w-4 h-4" />
            <span>Bot & Channel Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e111a] border border-[#1e2333] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Broadcasts</div>
            <div className="text-xl font-black text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 text-gray-300">
            <Radio className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#0e111a] border border-[#1e2333] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#0088cc] tracking-wider">Public Channel Posts</div>
            <div className="text-xl font-black text-white mt-1">{stats.publicCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0088cc]/10 text-[#0088cc]">
            <Globe className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#0e111a] border border-[#1e2333] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#ccff00] tracking-wider">VIP Subscriber Posts</div>
            <div className="text-xl font-black text-white mt-1">{stats.paidCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#ccff00]/10 text-[#ccff00]">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[#0e111a] border border-[#1e2333] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Bot Integration</div>
            <div className="text-xs font-extrabold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isConfigured ? 'Live Connected' : 'Ready (Simulated)'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Telegram Channel Setup & Admin Status Card */}
      <div className="bg-[#0e111a] border border-[#1e2333] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#0088cc]" />
                Telegram Channel Permission Status
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0088cc]/15 text-[#0088cc] border border-[#0088cc]/30 font-mono">
                Bot: @akashpatil_03bot
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10 font-mono">
                Target Channel: {publicChannelId || '@Akashscalpertrading'}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-amber-400">Important Telegram Requirement:</strong> For Telegram to permit <b className="text-white">@akashpatil_03bot</b> to broadcast signals into <b className="text-[#0088cc]">{publicChannelId || '@Akashscalpertrading'}</b>, open Telegram &gt; Channel <b className="text-white">@Akashscalpertrading</b> &gt; <b>Channel Settings</b> &gt; <b>Administrators</b> &gt; <b>Add Administrator</b> &gt; search <b className="text-[#0088cc]">@akashpatil_03bot</b> &gt; enable <strong className="text-emerald-400">"Post Messages"</strong> &gt; Save.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2 rounded-xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] border border-[#0088cc]/30 text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Checking Access...' : 'Verify Channel Admin Access'}</span>
            </button>
            <a
              href={`https://t.me/${(publicChannelId || 'Akashscalpertrading').replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Channel in Telegram</span>
            </a>
          </div>
        </div>

        {testResult && (
          <div className={`mt-3.5 p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
            testResult.success
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <span>{testResult.message}</span>
            </div>
            <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Composer (7 Cols) & Real-Time Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Post Composer Form */}
        <div className="lg:col-span-7 space-y-6">
          {!isConfigured && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-amber-300 font-black text-sm">
                    Telegram Bot Not Connected (Simulated Mode Active)
                  </div>
                  <div className="text-gray-400 mt-0.5">
                    Your posts are saved in <strong>Simulated</strong> mode. To publish live to your Telegram channel (<strong>@Akashscalpertrading</strong>), connect your Bot Token.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black whitespace-nowrap shadow-md transition-colors"
              >
                Connect Bot Token
              </button>
            </div>
          )}

          <form onSubmit={handleSendPost} className="bg-[#0e111a] border border-[#1e2333] rounded-3xl p-6 shadow-2xl space-y-6">
            
            {/* 1. Audience Selector: Public vs Paid Members */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2.5">
                Target Audience & Channel
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Public Option */}
                <button
                  type="button"
                  onClick={() => setAudience('PUBLIC')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    audience === 'PUBLIC'
                      ? 'bg-[#0088cc]/10 border-[#0088cc] shadow-[0_0_20px_rgba(0,136,204,0.2)]'
                      : 'bg-[#141824] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-[#0088cc]/20 text-[#0088cc]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-white uppercase">Public Post</span>
                    </div>
                    {audience === 'PUBLIC' && <div className="w-2.5 h-2.5 rounded-full bg-[#0088cc]" />}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Open for anyone. Posts to your Free Telegram Channel (<span className="text-[#0088cc] font-mono">{publicChannelId}</span>) & public site feed.
                  </p>
                </button>

                {/* Paid Members Option */}
                <button
                  type="button"
                  onClick={() => setAudience('PAID_MEMBERS')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    audience === 'PAID_MEMBERS'
                      ? 'bg-[#ccff00]/10 border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                      : 'bg-[#141824] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-[#ccff00]/20 text-[#ccff00]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-white uppercase">Paid Members Only</span>
                    </div>
                    {audience === 'PAID_MEMBERS' && <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Exclusive to Plan Subscribers. Posts to VIP Private Channel (<span className="text-[#ccff00] font-mono">{paidChannelId}</span>) & locked portal.
                  </p>
                </button>
              </div>
            </div>

            {/* Target Tier (if Paid Members selected) */}
            {audience === 'PAID_MEMBERS' && (
              <div className="p-3.5 rounded-2xl bg-[#141824] border border-[#ccff00]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center space-x-2 text-xs font-bold text-white">
                  <Layers className="w-4 h-4 text-[#ccff00]" />
                  <span>Subscribers Plan Tier:</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {(['ALL', 'BASIC', 'PREMIUM', 'VIP'] as const).map(tier => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setTargetTier(tier)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all ${
                        targetTier === tier
                          ? 'bg-[#ccff00] text-black shadow-sm'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {tier === 'ALL' ? 'All Active Plans' : `${tier} Tier`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Picker & Quick Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  Post Category
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Templates:</span>
                  <button
                    type="button"
                    onClick={() => applyTemplate('SIGNAL')}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-[#ccff00] hover:bg-[#ccff00]/10 font-bold transition-colors"
                  >
                    + Scalp Signal
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('TARGET_HIT')}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-emerald-400 hover:bg-emerald-500/10 font-bold transition-colors"
                  >
                    + Target Hit
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('MARKET_ANALYSIS')}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-[#0088cc] hover:bg-[#0088cc]/10 font-bold transition-colors"
                  >
                    + Market Analysis
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'SIGNAL', label: '⚡ Signal', color: 'border-[#ccff00]/40 text-[#ccff00]' },
                  { id: 'MARKET_ANALYSIS', label: '📊 Analysis', color: 'border-[#0088cc]/40 text-[#0088cc]' },
                  { id: 'TARGET_HIT', label: '🎯 Target Hit', color: 'border-emerald-500/40 text-emerald-400' },
                  { id: 'EDUCATIONAL', label: '💡 Playbook', color: 'border-purple-500/40 text-purple-400' },
                  { id: 'ANNOUNCEMENT', label: '📢 Notice', color: 'border-amber-500/40 text-amber-400' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      category === cat.id
                        ? `bg-white/10 ${cat.color} font-black shadow-sm`
                        : 'bg-[#141824] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Title */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                Post Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. ⚡ BANKNIFTY 51200 CE BUY SCALP ALERT"
                className="w-full bg-[#141824] border border-white/10 focus:border-[#ccff00] rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  Message Content (Telegram Markdown/HTML Formatted)
                </label>
                <span className="text-[10px] text-gray-500 font-mono">{content.length} characters</span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                placeholder="Type your signal setup, entry price, targets, stop-loss, and trade rationale here..."
                className="w-full bg-[#141824] border border-white/10 focus:border-[#ccff00] rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono leading-relaxed"
                required
              />
            </div>

            {/* Media Attachment (TradingView Chart / Proof Screenshot) */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#0088cc]" />
                <span>Media Attachment URL (Optional Chart Screenshot or Photo)</span>
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                placeholder="https://s3.tradingview.com/snapshots/... or image direct link"
                className="w-full bg-[#141824] border border-white/10 focus:border-[#0088cc] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
              />
            </div>

            {/* Inline Telegram Button (Optional) */}
            <div className="p-4 rounded-2xl bg-[#141824] border border-white/5 space-y-3">
              <div className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>Interactive Telegram Button (Optional Call-to-Action)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={buttonText}
                  onChange={e => setButtonText(e.target.value)}
                  placeholder="Button Label (e.g. Join VIP Group)"
                  className="bg-[#0e111a] border border-white/10 focus:border-[#ccff00] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={e => setButtonUrl(e.target.value)}
                  placeholder="URL (e.g. https://t.me/... or website)"
                  className="bg-[#0e111a] border border-white/10 focus:border-[#ccff00] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Options Checkboxes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center space-x-2.5 text-xs text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinMessage}
                  onChange={e => setPinMessage(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ccff00] bg-[#141824] border-white/20 focus:ring-0"
                />
                <span className="flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-amber-400" />
                  Pin Message to Top of Channel
                </span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendInAppNotification}
                  onChange={e => setSendInAppNotification(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ccff00] bg-[#141824] border-white/20 focus:ring-0"
                />
                <span>Also dispatch In-App Bell Alert to website users</span>
              </label>
            </div>

            {/* Dispatch Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2.5 transition-all shadow-xl ${
                audience === 'PUBLIC'
                  ? 'bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-[0_0_25px_rgba(0,136,204,0.4)]'
                  : 'bg-[#ccff00] hover:bg-[#b8e600] text-black shadow-[0_0_25px_rgba(204,255,0,0.4)]'
              } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.99]'}`}
            >
              <Send className={`w-4 h-4 ${isSubmitting ? 'animate-bounce' : ''}`} />
              <span>
                {isSubmitting
                  ? 'Broadcasting to Telegram...'
                  : audience === 'PUBLIC'
                    ? `Publish to Public Telegram Channel (${currentChannelName})`
                    : `Publish to VIP Paid Channel (${currentChannelName})`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Real-Time Live Telegram Message Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0e111a] border border-[#1e2333] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-[#0088cc]" />
                <h2 className="text-xs font-black uppercase text-white tracking-wider">
                  Live Telegram Preview
                </h2>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                audience === 'PUBLIC'
                  ? 'bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30'
                  : 'bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30'
              }`}>
                {audience === 'PUBLIC' ? '🌐 Public Channel' : '🔒 VIP Paid Channel'}
              </span>
            </div>

            {/* Simulated Telegram Message Bubble */}
            <div className="bg-[#18222d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden font-sans">
              {/* Channel Header inside bubble */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#0088cc] flex items-center justify-center font-bold text-white text-[10px]">
                    SA
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1">
                      <span>Scalper Akash</span>
                      <CheckCircle2 className="w-3 h-3 text-[#0088cc]" />
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">{currentChannelName}</div>
                  </div>
                </div>
                {pinMessage && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </span>
                )}
              </div>

              {/* Attached Image Preview */}
              {mediaUrl && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 max-h-48">
                  <img
                    src={mediaUrl}
                    alt="Attached Chart"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Message Content */}
              <div className="space-y-2 text-xs leading-relaxed text-gray-100">
                <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>{category === 'SIGNAL' ? '⚡' : category === 'MARKET_ANALYSIS' ? '📊' : category === 'TARGET_HIT' ? '🎯' : '📢'}</span>
                  <span>{title || 'Your Post Title Will Appear Here'}</span>
                </div>

                <div className="whitespace-pre-line text-gray-200 font-mono text-[11px] bg-black/20 p-2.5 rounded-xl border border-white/5">
                  {content || 'Enter your message in the composer to preview how your formatted Telegram post looks in real time...'}
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400">
                  <span className={audience === 'PAID_MEMBERS' ? 'text-[#ccff00] font-bold' : 'text-[#0088cc] font-bold'}>
                    {audience === 'PAID_MEMBERS' ? `🔒 [VIP SUBSCRIBERS - ${targetTier} TIER]` : '🌐 [FREE PUBLIC CHANNEL UPDATE]'}
                  </span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                </div>
              </div>

              {/* Inline Action Button in Telegram */}
              {buttonText && buttonUrl && (
                <div className="pt-2">
                  <a
                    href={buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-[#2b5278] hover:bg-[#32618e] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    <span>{buttonText}</span>
                    <ExternalLink className="w-3 h-3 text-gray-300" />
                  </a>
                </div>
              )}
            </div>

            {/* Target Channel Destination Indicator */}
            <div className="mt-4 p-3 rounded-xl bg-[#141824] border border-white/5 text-[11px] space-y-1">
              <div className="text-gray-400 flex items-center justify-between">
                <span>Active Destination:</span>
                <span className="font-mono text-white font-bold">{currentChannelName}</span>
              </div>
              <div className="text-gray-500 text-[10px]">
                {audience === 'PAID_MEMBERS'
                  ? 'Restricted to users who have purchased an active trading plan.'
                  : 'Broadcasted to public channel and visible across all public platform feeds.'}
              </div>
            </div>
          </div>

          {/* Quick BotFather Guide Card */}
          <div className="bg-[#0e111a] border border-[#1e2333] rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-white tracking-wider">
              <Bot className="w-4 h-4 text-[#0088cc]" />
              <span>Telegram Bot Automation Setup</span>
            </div>
            <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Message <b className="text-[#0088cc]">@BotFather</b> on Telegram and send <code className="text-[#ccff00]">/newbot</code>.</li>
              <li>Copy the generated <b className="text-white">HTTP API Token</b> into Settings.</li>
              <li>Add your Bot as an <b className="text-white">Administrator</b> to both your Public & VIP channels with permission to <i>Post Messages</i>.</li>
            </ol>
            <button
              onClick={() => setShowConfigModal(true)}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors"
            >
              Open Bot Credentials Config
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sent Broadcast History Table */}
      <div className="bg-[#0e111a] border border-[#1e2333] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ccff00]" />
              <span>DISPATCHED TELEGRAM POSTS ARCHIVE</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              History of all messages sent to Telegram channels with audience tags, delivery status, and logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="bg-[#141824] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-1 bg-[#141824] p-1 rounded-xl border border-white/10">
              {(['ALL', 'PUBLIC', 'PAID_MEMBERS'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterAudience(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterAudience === tab
                      ? 'bg-[#ccff00] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'PUBLIC' ? 'Public Only' : 'VIP Paid Only'}
                </button>
              ))}
            </div>

            <button
              onClick={fetchPosts}
              className="p-2 rounded-xl bg-[#141824] border border-white/10 text-gray-300 hover:text-white transition-colors"
              title="Refresh History"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loadingPosts ? (
          <div className="py-12 text-center text-xs text-gray-400 font-mono">
            Loading Telegram posts archive...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 font-mono">
            No Telegram posts found for this filter. Dispatch a new post above!
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-black text-gray-400 tracking-wider">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Title & Preview</th>
                  <th className="py-3 px-3">Audience & Channel</th>
                  <th className="py-3 px-3">Delivery Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 text-gray-400 whitespace-nowrap text-[11px] font-mono">
                      {new Date(post.sentAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-white/5 text-gray-300 border border-white/10">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-bold text-white truncate">{post.title}</div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">{post.content}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        {post.audience === 'PUBLIC' ? (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#0088cc]/15 text-[#0088cc] border border-[#0088cc]/30">
                            🌐 Public
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
                            🔒 Paid VIP ({post.targetTier})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {post.telegramChannelId || 'Default Channel'}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {post.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          <Check className="w-2.5 h-2.5" /> Live Sent
                        </span>
                      ) : post.status === 'SIMULATED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                          ⚡ Simulated
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30 whitespace-nowrap">
                            ✕ Failed
                          </span>
                          {post.responseLog && (
                            <div 
                              className="text-[10px] text-red-300/90 max-w-[240px] truncate font-mono cursor-help bg-red-500/10 p-1 rounded border border-red-500/20" 
                              title={post.responseLog}
                            >
                              {post.responseLog.includes('Administrator') 
                                ? 'Bot needs Admin permission in channel' 
                                : post.responseLog}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.status !== 'SENT' && (
                          <button
                            type="button"
                            onClick={() => handleRetryPost(post.id)}
                            disabled={retryingPostId === post.id}
                            className="px-2.5 py-1 rounded-lg bg-[#ccff00]/10 hover:bg-[#ccff00]/20 text-[#ccff00] text-[11px] font-bold border border-[#ccff00]/30 transition-all flex items-center gap-1"
                            title="Retry Dispatching to Telegram"
                          >
                            <RefreshCw className={`w-3 h-3 ${retryingPostId === post.id ? 'animate-spin' : ''}`} />
                            <span>Retry</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete Post Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bot Credentials & Channel Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#1e2333] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#0088cc]/20 text-[#0088cc]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Telegram Bot & Channel Settings</h3>
                  <p className="text-xs text-gray-400">Configure your official Telegram Bot credentials and target channels</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Bot Token */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Telegram Bot Token (from @BotFather)
                </label>
                <input
                  type="text"
                  value={botToken}
                  onChange={e => setBotToken(e.target.value)}
                  placeholder="e.g. 7123456789:AAHxxxxx_xxxxxxxxxxxxxxxx"
                  className="w-full bg-[#141824] border border-white/10 focus:border-[#0088cc] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Obtain this by chatting with @BotFather on Telegram and creating a new bot.
                </p>
              </div>

              {/* Public Channel ID */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#0088cc]" />
                  <span>Public Channel Username or ID (Open For Anyone)</span>
                </label>
                <input
                  type="text"
                  value={publicChannelId}
                  onChange={e => setPublicChannelId(e.target.value)}
                  placeholder="e.g. @Akashscalpertrading or -100xxxxxxxxxx"
                  className="w-full bg-[#141824] border border-white/10 focus:border-[#0088cc] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                  required
                />
              </div>

              {/* Paid Channel ID */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>VIP / Paid Channel ID (Exclusive to Subscribers)</span>
                </label>
                <input
                  type="text"
                  value={paidChannelId}
                  onChange={e => setPaidChannelId(e.target.value)}
                  placeholder="e.g. @Akashscalpertrading_vip or -100xxxxxxxxxx"
                  className="w-full bg-[#141824] border border-white/10 focus:border-[#ccff00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  For private channels, make your bot an Admin and use the numeric ID (starts with -100).
                </p>
              </div>

              {/* Test Connection Button & Result */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#141824] border border-white/10 hover:border-[#0088cc]/50 text-xs font-bold text-gray-200 hover:text-white flex items-center justify-center space-x-2 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#0088cc] ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'Testing Telegram Bot...' : 'Test Bot Token Connection'}</span>
                </button>

                {testResult && (
                  <div className={`mt-2.5 p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                    testResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors shadow-lg"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
