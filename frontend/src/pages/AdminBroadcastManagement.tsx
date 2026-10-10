import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Bell,
  Send,
  Users,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Filter,
  Radio,
  Clock,
  History
} from 'lucide-react';

export const AdminBroadcastManagement: React.FC = () => {
  const { apiPost, apiGet } = useAuth();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetTier, setTargetTier] = useState<'ALL' | 'BASIC' | 'PREMIUM' | 'VIP'>('ALL');
  const [notificationType, setNotificationType] = useState('ANNOUNCEMENT');
  const [sending, setSending] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([
    {
      id: 1,
      title: '⚡ Expiry Day Live Scalping Strategy Masterclass Today at 11:00 AM IST',
      targetTier: 'ALL',
      type: 'ANNOUNCEMENT',
      sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      recipients: 142
    },
    {
      id: 2,
      title: '📈 Bank Nifty Major Order Block Mitigation Alert (VIP Exclusive)',
      targetTier: 'VIP',
      type: 'SIGNAL_ALERT',
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      recipients: 38
    }
  ]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill out both title and announcement message.');
      return;
    }

    try {
      setSending(true);
      const res = await apiPost('/admin/broadcast', {
        title: title.trim(),
        message: message.trim(),
        targetTier,
        type: notificationType
      });

      alert(res.message || 'Broadcast announcement successfully sent!');
      setRecentBroadcasts(prev => [
        {
          id: Date.now(),
          title: title.trim(),
          targetTier,
          type: notificationType,
          sentAt: new Date().toISOString(),
          recipients: res.recipientCount || 0
        },
        ...prev
      ]);

      setTitle('');
      setMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#d2fd2a]/20 text-[#d2fd2a]">
              <Radio className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">ANNOUNCEMENT & BROADCAST CENTER</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Dispatch real-time in-app bell alerts, market emergency updates, and tier-specific notifications to members.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Broadcast Composer (7 Cols) */}
        <div className="lg:col-span-7 bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-dark-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-[#d2fd2a]" />
              Compose Instant Notification
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-dark-800 text-gray-400">
              Direct Push Protocol
            </span>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            {/* Target Audience Segment Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2">Target Member Tier:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'ALL', label: 'All Users', desc: 'Free & Paid' },
                  { id: 'BASIC', label: 'Basic', desc: 'Entry Tier' },
                  { id: 'PREMIUM', label: 'Pro/Premium', desc: 'Core Sub' },
                  { id: 'VIP', label: 'VIP Members', desc: 'Elite Desk' }
                ].map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setTargetTier(tier.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      targetTier === tier.id
                        ? 'bg-[#d2fd2a] text-black border-[#d2fd2a] shadow-[0_0_12px_rgba(210,253,42,0.3)]'
                        : 'bg-dark-950 border-dark-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-black block">{tier.label}</span>
                    <span className="text-[10px] opacity-75 block mt-0.5">{tier.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Notification Category</label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="ANNOUNCEMENT">General Announcement</option>
                <option value="SIGNAL_ALERT">Live Market Signal Alert</option>
                <option value="WEBINAR_REMINDER">Live Masterclass / Webinar Alert</option>
                <option value="COURSE_UPDATE">New Course / Lesson Published</option>
                <option value="RISK_WARNING">High Volatility / Risk Warning</option>
              </select>
            </div>

            {/* Announcement Title */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Announcement Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ⚡ Special Bank Nifty Expiry Session Starting at 2 PM"
                className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d2fd2a]"
              />
            </div>

            {/* Announcement Message Body */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">Message Content</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full announcement or trade alert details to appear in the user's notification center..."
                className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d2fd2a]"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#d2fd2a] hover:bg-[#bcf018] text-black font-black text-xs shadow-xl transition-all"
              >
                {sending ? (
                  <span>Dispatching Broadcast...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Instant Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: History & Delivery Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              Recent Broadcast Dispatches
            </h3>

            <div className="space-y-3">
              {recentBroadcasts.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-dark-950 border border-dark-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#d2fd2a]/20 text-[#d2fd2a]">
                      Tier: {b.targetTier}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(b.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{b.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-dark-800">
                    <span>Delivered to {b.recipients} users</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sent
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcastManagement;
