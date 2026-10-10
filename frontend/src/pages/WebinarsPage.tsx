import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  PlayCircle, 
  Play,
  ArrowRight, 
  CheckCircle, 
  Lock, 
  Sparkles,
  ExternalLink,
  Zap,
  Flame
} from 'lucide-react';

export const WebinarsPage: React.FC = () => {
  const { apiGet, apiPost, user } = useAuth();
  const navigate = useNavigate();
  const [webinars, setWebinars] = useState<any[]>([]);
  const [myWebinars, setMyWebinars] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'REGISTERED' | 'RECORDINGS'>('UPCOMING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const [allRes, myRes] = await Promise.all([
        apiGet('/webinars'),
        user ? apiGet('/webinars/my-webinars').catch(() => []) : Promise.resolve([]),
      ]);
      setWebinars(allRes);
      setMyWebinars(myRes);
    } catch (err: any) {
      console.error('Failed to fetch webinars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (webinar: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (webinar.accessType === 'PUBLIC' || Number(webinar.price) === 0) {
        await apiPost(`/webinars/${webinar.id}/register`, {});
        alert('Seat reserved successfully!');
        fetchWebinars();
        return;
      }

      // Paid webinar checkout
      const orderRes = await apiPost('/orders', {
        orderType: 'WEBINAR',
        itemId: webinar.id,
      });

      await apiPost('/payments/verify', {
        orderId: orderRes.orderId,
        paymentGatewayId: `pay_mock_${Date.now()}`,
        status: 'SUCCESS',
      });

      alert('Payment successful! Your webinar seat is confirmed.');
      fetchWebinars();
    } catch (err: any) {
      alert(err.message || 'Failed to register');
    }
  };

  const registeredWebinarIds = new Set(myWebinars.map(m => m.webinarId));

  const upcomingWebinars = webinars.filter(w => w.status === 'SCHEDULED' || w.status === 'LIVE');
  const pastRecordings = webinars.filter(w => w.recordingUrl || w.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-bold uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5" />
          <span>Live Interactive Masterclasses</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          LIVE WORKSHOPS & MASTERCLASS VAULT
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Join Scalper Akash for live market-hours trade screenings, Q&A breakdowns, and on-demand recordings of past VIP masterclasses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-dark-900 border border-dark-800 rounded-2xl p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-accent-cyan text-dark-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming Masterclasses ({upcomingWebinars.length})
          </button>
          <button
            onClick={() => setActiveTab('REGISTERED')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'REGISTERED'
                ? 'bg-accent-cyan text-dark-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Booked Sessions ({myWebinars.length})
          </button>
          <button
            onClick={() => setActiveTab('RECORDINGS')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'RECORDINGS'
                ? 'bg-accent-cyan text-dark-950 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Recording Vault ({pastRecordings.length})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'UPCOMING' && upcomingWebinars.map((w) => {
          const isRegistered = registeredWebinarIds.has(w.id);
          const isLive = w.status === 'LIVE';

          return (
            <div
              key={w.id}
              className="flex flex-col bg-dark-900 border border-dark-800 hover:border-accent-cyan/40 rounded-2xl overflow-hidden shadow-xl transition-all"
            >
              <div className="relative h-48 w-full bg-dark-950 overflow-hidden">
                <img src={w.thumbnailUrl} alt={w.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />

                <div className="absolute top-3 left-3 flex gap-1.5">
                  {isLive ? (
                    <span className="px-3 py-1 rounded-full bg-red-600/90 text-white font-black text-[10px] flex items-center space-x-1 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      <span>LIVE NOW</span>
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-full bg-dark-950/80 backdrop-blur-md border border-dark-700 text-[10px] font-bold text-gray-300">
                      SCHEDULED
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/20 backdrop-blur-md border border-accent-gold/40 text-[10px] font-extrabold text-accent-gold">
                    {w.accessType}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[11px] text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>{new Date(w.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[#ccff00] font-bold">
                    <Flame className="h-3.5 w-3.5" />
                    <span>{w.seatsRemaining} seats left</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">{w.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {w.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
                  <div>
                    {w.accessType === 'PUBLIC' || Number(w.price) === 0 ? (
                      <span className="text-sm font-black text-emerald-400">Free Access</span>
                    ) : (
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-black text-white">
                          ₹{(w.discountPrice || w.price).toLocaleString('en-IN')}
                        </span>
                        {w.discountPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{w.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isRegistered ? (
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold text-xs">
                      <CheckCircle className="h-4 w-4" />
                      <span>Seat Reserved</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(w)}
                      className="lime-gradient-btn !py-2 !px-4 !text-xs"
                    >
                      Book Seat
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {activeTab === 'REGISTERED' && myWebinars.map((reg) => {
          const w = reg.Webinar;
          return (
            <div key={reg.id} className="flex flex-col bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  CONFIRMED SEAT
                </span>
                <span className="text-xs text-gray-400">{new Date(w?.scheduledAt).toLocaleString()}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{w?.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{w?.shortDescription}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/webinars/${w?.id}/room`}
                  className="flex-1 py-2.5 rounded-xl bg-[#d2fd2a] hover:bg-[#bcf018] text-black font-black text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
                >
                  <Video className="h-4 w-4" />
                  <span>Enter Interactive Masterclass Room</span>
                </Link>

                {w?.meetingUrl && (
                  <a
                    href={w.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-300 font-bold text-xs flex items-center justify-center space-x-1 border border-dark-700 transition-all"
                  >
                    <span>Direct Meet</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {activeTab === 'RECORDINGS' && pastRecordings.map((rec) => (
          <div key={rec.id} className="flex flex-col bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl group">
            <div className="relative aspect-video w-full bg-dark-950 flex items-center justify-center">
              <img
                src={rec.thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'}
                alt={rec.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
              />
              <Link 
                to={`/webinars/${rec.id}/room`} 
                className="absolute p-4 rounded-full bg-[#d2fd2a] text-black shadow-xl hover:scale-110 transition-transform"
              >
                <Play className="h-6 w-6 fill-current" />
              </Link>
            </div>
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#d2fd2a]">VIP Recording Vault</span>
                <h3 className="text-sm font-bold text-white group-hover:text-[#d2fd2a] transition-colors">{rec.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{rec.shortDescription}</p>
              </div>
              <Link
                to={`/webinars/${rec.id}/room`}
                className="w-full py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-[#d2fd2a] font-bold text-xs flex items-center justify-center space-x-1 border border-dark-700 transition-colors"
              >
                <span>Watch in Replay Room</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
