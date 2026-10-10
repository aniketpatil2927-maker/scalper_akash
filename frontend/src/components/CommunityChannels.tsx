import React, { useState } from 'react';
import { ExternalLink, Check, Copy, MessageCircle, Send, BellRing, Sparkles, ShieldCheck } from 'lucide-react';

export const TelegramIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.17 8.17 0 01-5.82 2.42c-1.47 0-2.91-.39-4.17-1.14l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.29 3.8 2.52 1.09 2.52.73 2.98.68.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.3z"/>
  </svg>
);

export const TELEGRAM_CHANNEL_URL = "https://t.me/Akashscalpertrading";
export const WHATSAPP_CHANNEL_URL = "https://wa.me/919987618061";

interface CommunityChannelsProps {
  variant?: 'card' | 'compact' | 'banner';
  isVip?: boolean;
}

export const CommunityChannels: React.FC<CommunityChannelsProps> = ({ 
  variant = 'card',
  isVip = true
}) => {
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const handleCopy = (text: string, type: 'telegram' | 'whatsapp') => {
    navigator.clipboard.writeText(text);
    if (type === 'telegram') {
      setCopiedTelegram(true);
      setTimeout(() => setCopiedTelegram(false), 2000);
    } else {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2.5 items-center">
        <a
          href={TELEGRAM_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-bold transition-all shadow-sm group"
        >
          <TelegramIcon className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
          <span>Telegram Channel</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>

        <a
          href={WHATSAPP_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 text-xs font-bold transition-all shadow-sm group"
        >
          <WhatsAppIcon className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
          <span>WhatsApp Support</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-6 shadow-2xl glass-panel">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-700/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
                <Sparkles className="h-2.5 w-2.5" />
                {isVip ? 'VIP Member Channels' : 'Official Channels'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Live Broadcasts
              </span>
            </div>
            <h2 className="text-lg font-black text-white">Join Scalper Akash Communities</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Instant trade alerts, live market updates, commentary, and exclusive setup breakdowns.
            </p>
          </div>
        </div>

        {/* 2 Channel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Telegram Channel Card */}
          <div className="rounded-xl bg-dark-950/80 border border-[#229ED9]/25 hover:border-[#229ED9]/50 p-5 space-y-4 transition-all group shadow-lg hover:shadow-[#229ED9]/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] flex items-center justify-center shadow-[0_0_15px_rgba(34,158,217,0.25)] group-hover:scale-105 transition-transform">
                  <TelegramIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#229ED9] transition-colors">
                    Official Telegram Channel
                  </h3>
                  <span className="text-[11px] text-gray-400 block mt-0.5">@Akashscalpertrading</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#229ED9]/10 text-[#229ED9]">
                Instant Alerts
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Get real-time entry alerts, trailing stop loss updates, technical charts, and audio briefings directly on Telegram.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#229ED9]/20"
              >
                <TelegramIcon className="h-4 w-4" />
                <span>Join Telegram</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                onClick={() => handleCopy(TELEGRAM_CHANNEL_URL, 'telegram')}
                className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-400 hover:text-white border border-dark-700 text-xs transition-colors"
                title="Copy Link"
              >
                {copiedTelegram ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* WhatsApp Support Card */}
          <div className="rounded-xl bg-dark-950/80 border border-[#25D366]/25 hover:border-[#25D366]/50 p-5 space-y-4 transition-all group shadow-lg hover:shadow-[#25D366]/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center shadow-[0_0_15px_rgba(37,211,102,0.25)] group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#25D366] transition-colors">
                    Official WhatsApp Support
                  </h3>
                  <span className="text-[11px] text-gray-400 block mt-0.5">+91 9987618061</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#25D366]/10 text-[#25D366]">
                Direct Support
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Get one-on-one help with your VIP subscriptions, trade inquiries, payment activations, and direct assistance.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#25D366]/20"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>Message Support</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <button
                onClick={() => handleCopy(WHATSAPP_CHANNEL_URL, 'whatsapp')}
                className="p-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-400 hover:text-white border border-dark-700 text-xs transition-colors"
                title="Copy Link"
              >
                {copiedWhatsApp ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

        </div>

        {/* Verified security note */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-dark-950/60 p-3 rounded-xl border border-dark-800/80">
          <ShieldCheck className="h-4 w-4 text-accent-cyan shrink-0" />
          <span>Only use the official links above. Scalper Akash will never ask for your account password or private keys in direct messages.</span>
        </div>

      </div>
    </div>
  );
};
