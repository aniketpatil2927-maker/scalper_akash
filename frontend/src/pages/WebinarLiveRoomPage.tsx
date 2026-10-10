import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import {
  Video,
  Play,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Send,
  Download,
  Award,
  ExternalLink,
  ChevronLeft,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const WebinarLiveRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apiGet, user } = useAuth();
  const navigate = useNavigate();

  const [webinar, setWebinar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; isMentor?: boolean }>>([
    { sender: 'Scalper Akash', text: 'Welcome everyone! Today we will break down live 5-min Bank Nifty ORB executions.', time: '09:15 AM', isMentor: true },
    { sender: 'Vikram S.', text: 'Good morning Akash sir! Ready with notebook.', time: '09:16 AM' },
    { sender: 'Ananya R.', text: 'Sir what is the minimum lot size recommended for 50k capital?', time: '09:18 AM' }
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'CHAT' | 'RESOURCES' | 'CERTIFICATE'>('CHAT');

  useEffect(() => {
    fetchWebinarDetails();
  }, [id]);

  const fetchWebinarDetails = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/webinars/${id}`);
      setWebinar(data);
    } catch (err) {
      console.error('Failed to load webinar room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        sender: user?.fullName || 'Trader Member',
        text: newMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMentor: user?.roles?.includes('ADMIN') || user?.roles?.includes('TRADER')
      }
    ]);
    setNewMsg('');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d2fd2a]"></div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Video className="w-16 h-16 text-gray-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Masterclass Room Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">The requested live session does not exist or has concluded.</p>
        <Link to="/webinars" className="lime-gradient-btn">
          &larr; Back to Masterclasses
        </Link>
      </div>
    );
  }

  const isLive = webinar.status === 'LIVE';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/webinars"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Masterclasses</span>
        </Link>

        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              LIVE NOW
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-[#d2fd2a]/15 border border-[#d2fd2a]/30 text-[#d2fd2a] text-xs font-black">
              MASTERCLASS REPLAY ROOM
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Stream Player + Interactive Live Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Video Stream & Overview (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Video Player Card */}
          <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group flex items-center justify-center">
            {webinar.recordingUrl || webinar.meetingUrl ? (
              <iframe
                src={webinar.recordingUrl || webinar.meetingUrl}
                title={webinar.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#d2fd2a]/20 text-[#d2fd2a] flex items-center justify-center mx-auto shadow-lg">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Live Broadcast Standby</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    The host has scheduled this live session. Stream connectivity and interactive feeds will activate at the scheduled time.
                  </p>
                </div>
                {webinar.meetingUrl && (
                  <a
                    href={webinar.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#d2fd2a] hover:bg-[#bcf018] text-black text-xs font-black shadow-lg transition-all"
                  >
                    <span>Open Direct Meeting Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Session Metadata Card */}
          <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-800">
              <div>
                <h1 className="text-lg font-black text-white">{webinar.title}</h1>
                <p className="text-xs text-gray-400 mt-1">{webinar.shortDescription}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-dark-800 text-gray-300 text-xs font-bold">
                  {webinar.speaker || 'Scalper Akash'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              {webinar.description}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-dark-950 rounded-xl border border-dark-800 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Scheduled Time</span>
                <span className="text-xs font-bold text-white mt-0.5 block">
                  {new Date(webinar.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="p-3 bg-dark-950 rounded-xl border border-dark-800 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Replay Access</span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                  {webinar.recordingAccessDays || 365} Days Unlimited
                </span>
              </div>
              <div className="p-3 bg-dark-950 rounded-xl border border-dark-800 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Session Pass</span>
                <span className="text-xs font-bold text-[#d2fd2a] mt-0.5 block">
                  {webinar.accessType || 'ENROLLED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat & Resources Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-dark-900 border border-dark-800 rounded-3xl p-5 shadow-2xl flex flex-col h-[640px]">
          {/* Panel Tab Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-dark-950 rounded-xl border border-dark-800 mb-4">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'CHAT' ? 'bg-[#d2fd2a] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Live Q&A
            </button>
            <button
              onClick={() => setActiveTab('RESOURCES')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'RESOURCES' ? 'bg-[#d2fd2a] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('CERTIFICATE')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'CERTIFICATE' ? 'bg-[#d2fd2a] text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Badge
            </button>
          </div>

          {/* Tab 1: Live Chat & Q&A */}
          {activeTab === 'CHAT' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl ${
                      msg.isMentor
                        ? 'bg-[#d2fd2a]/10 border border-[#d2fd2a]/30'
                        : 'bg-dark-950 border border-dark-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${msg.isMentor ? 'text-[#d2fd2a]' : 'text-gray-300'}`}>
                        {msg.sender} {msg.isMentor && '⚡'}
                      </span>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-dark-800 flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Ask a question or comment..."
                  className="flex-1 bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d2fd2a]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#d2fd2a] hover:bg-[#bcf018] text-black shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Downloadable Session Resources */}
          {activeTab === 'RESOURCES' && (
            <div className="flex-1 overflow-y-auto space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#d2fd2a]" />
                  <span>Masterclass Cheat Sheet (PDF)</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Printable summary of the 5-minute ORB entry and risk sizing matrix.
                </p>
                <a
                  href="/downloads/scalping-blueprint.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-[#d2fd2a] font-bold text-[11px]"
                >
                  Download PDF &rarr;
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>TradingView Indicator Script</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  PineScript code for automated Opening Range High/Low detection.
                </p>
                <a
                  href="/downloads/pinescript-suite.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-cyan-400 font-bold text-[11px]"
                >
                  Download Script (.zip) &rarr;
                </a>
              </div>
            </div>
          )}

          {/* Tab 3: Attendance Badge & Certificate */}
          {activeTab === 'CERTIFICATE' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Masterclass Completion Badge</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Verified attendee credential for {user?.fullName || 'Member'}.
                </p>
              </div>
              <Link
                to="/certificates"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold shadow-lg hover:bg-emerald-400 transition-all"
              >
                View Credential Vault
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebinarLiveRoomPage;
