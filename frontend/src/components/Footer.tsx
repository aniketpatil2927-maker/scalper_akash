import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import { TelegramIcon, WhatsAppIcon, TELEGRAM_CHANNEL_URL, WHATSAPP_CHANNEL_URL } from './CommunityChannels.js';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#08090d] text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d2fd2a] text-black font-black text-xs shadow-[0_0_12px_rgba(210,253,42,0.4)]">
                ⚡
              </div>
              <span className="font-extrabold text-white tracking-wider text-sm">
                SCALPER <span className="text-[#d2fd2a]">AKASH</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400">
              Empowering self-directed traders with institutional-grade market setups, high-probability signals, and risk-controlled trade execution.
            </p>
          </div>
          
          <div>
            <span className="text-white font-bold tracking-wider text-xs uppercase block mb-4">PLATFORM & TOOLS</span>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/tools" className="hover:text-[#d2fd2a] transition-colors">12 Pro Calculators</Link></li>
              <li><Link to="/playbooks" className="hover:text-[#d2fd2a] transition-colors">Trading Playbooks</Link></li>
              <li><Link to="/strategy-lab" className="hover:text-[#d2fd2a] transition-colors">Strategy Lab & Backtest</Link></li>
              <li><Link to="/marketplace" className="hover:text-[#d2fd2a] transition-colors">Digital Marketplace</Link></li>
              <li><Link to="/mentorship" className="hover:text-[#d2fd2a] transition-colors">1-on-1 Mentorship</Link></li>
              <li><Link to="/courses" className="hover:text-[#d2fd2a] transition-colors">Courses & LMS</Link></li>
              <li><Link to="/blog" className="hover:text-[#d2fd2a] transition-colors">Knowledge Center & Blog</Link></li>
              <li><Link to="/certificates" className="hover:text-[#d2fd2a] transition-colors">Verify Certificate</Link></li>
              <li><Link to="/about" className="hover:text-[#d2fd2a] transition-colors">About Akash</Link></li>
            </ul>
          </div>

          <div>
            <span className="text-white font-bold tracking-wider text-xs uppercase block mb-4">COMMUNITY CHANNELS</span>
            <div className="space-y-2.5">
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-[#229ED9] transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-[#229ED9]/15 text-[#229ED9] flex items-center justify-center">
                  <TelegramIcon className="h-3.5 w-3.5" />
                </div>
                <span>Telegram VIP Channel</span>
                <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </a>

              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-[#25D366] transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                </div>
                <span>WhatsApp Support</span>
                <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </a>
            </div>
          </div>

          <div>
            <span className="text-white font-bold tracking-wider text-xs uppercase block mb-4">SUPPORT & DESK</span>
            <p className="text-xs text-gray-400 mb-2">Direct assistance & inquiries:</p>
            <p className="text-xs text-[#d2fd2a] font-bold mb-2">support@scalperakash.com</p>
            <p className="text-xs text-gray-400 mb-1">WhatsApp Chat Support:</p>
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#d2fd2a] font-bold hover:underline"
            >
              +91 9987618061
            </a>
          </div>
        </div>

        {/* Risk Disclaimer (Mandatory Regulatory Alert) */}
        <div className="rounded-xl bg-[#0e1017] border border-white/5 p-5 mb-8">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="h-5 w-5 text-[#d2fd2a] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block mb-1">REGULATORY & RISK DISCLAIMER</span>
              <p className="text-[11px] leading-relaxed text-gray-400">
                Trading financial assets (including Indian NSE/BSE equities, index futures, and options) involves substantial risk of loss and is not suitable for all investors. Scalper Akash is strictly an educational platform and is not registered with SEBI as an investment advisor or research analyst. All setups, entry ranges, stop-loss zones, and targets shared are provided purely for educational and analytical purposes. We do not provide guaranteed returns or personalized financial advice. Always trade within your risk capacity.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 text-[11px]">
          <p>© {new Date().getFullYear()} Scalper Akash. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
