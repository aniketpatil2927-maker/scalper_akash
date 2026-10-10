import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Video,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

interface Mentor {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string;
  experienceYears: number;
  expertise: string[];
  tradingStyle: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
}

interface Booking {
  id: number;
  sessionType: string;
  scheduledAt: string;
  durationMins: number;
  amount: number;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  Mentor?: { name: string; avatarUrl: string; tradingStyle: string };
}

export const MentorshipPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [sessionType, setSessionType] = useState<string>('60_MIN');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'MY_SESSIONS'>('DIRECTORY');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMentors();
    fetchMyBookings();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/mentorship/mentors');
      if (res.ok) {
        const data = await res.json();
        setMentors(data);
      }
    } catch (err) {
      console.error('Failed to load mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/mentorship/my-bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyBookings(data);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !scheduledDate) return;

    try {
      const token = localStorage.getItem('token');
      const rate = sessionType === '30_MIN' ? selectedMentor.hourlyRate * 0.6 : selectedMentor.hourlyRate;

      const res = await fetch('http://localhost:5000/api/mentorship/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          sessionType,
          scheduledAt: scheduledDate,
          notes: bookingNotes,
          amount: rate,
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedMentor(null);
          fetchMyBookings();
          setActiveTab('MY_SESSIONS');
        }, 1500);
      }
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              1-on-1 Elite Mentorship
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Akash Mentorship & Advisory
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Book private strategy reviews, psychology coaching, and live trade breakdown sessions with verified senior traders.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('DIRECTORY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'DIRECTORY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              Mentor Directory
            </button>
            <button
              onClick={() => setActiveTab('MY_SESSIONS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'MY_SESSIONS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400'
              }`}
            >
              My Booked Sessions ({myBookings.length})
            </button>
          </div>
        </div>

        {/* Directory Tab */}
        {activeTab === 'DIRECTORY' && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-slate-500 text-sm">Loading mentors...</div>
            ) : mentors.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">Mentors currently calibrating schedules</h3>
                <p className="text-slate-400 text-xs mt-1">Check back shortly or request a direct support session.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((m) => (
                  <div
                    key={m.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={m.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-white">{m.name}</h3>
                          <div className="text-xs text-blue-400 font-semibold">{m.tradingStyle}</div>
                          <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="font-bold">{m.rating}</span>
                            <span className="text-slate-500 text-[10px]">({m.experienceYears}+ yrs exp)</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">{m.bio}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {m.expertise?.map((exp, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-medium">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Session Rate</div>
                        <div className="text-lg font-black text-white">₹{Number(m.hourlyRate).toLocaleString('en-IN')}<span className="text-xs text-slate-400 font-normal"> / hr</span></div>
                      </div>
                      <button
                        onClick={() => setSelectedMentor(m)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
                      >
                        Book Session
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Sessions Tab */}
        {activeTab === 'MY_SESSIONS' && (
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No active mentorship bookings</h3>
                <p className="text-slate-400 text-xs mt-1">Browse our verified mentor directory to schedule a 1-on-1 session.</p>
              </div>
            ) : (
              myBookings.map((b) => (
                <div key={b.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{b.sessionType.replace('_', ' ')} SESSION</div>
                      <h4 className="text-base font-bold text-white">Mentor: {b.Mentor?.name || 'Scalper Akash Lead'}</h4>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(b.scheduledAt).toLocaleString()} ({b.durationMins} mins)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {b.status}
                    </span>
                    {b.meetingLink && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white">Book Mentorship Session</h3>
                <p className="text-xs text-slate-400 mt-0.5">With {selectedMentor.name}</p>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                <h4 className="text-lg font-bold text-white">Session Confirmed!</h4>
                <p className="text-xs text-slate-400 mt-1">Your calendar invite and meeting link have been generated.</p>
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Session Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSessionType('30_MIN')}
                      className={`p-3 rounded-xl border text-xs font-bold text-left ${
                        sessionType === '30_MIN' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>30-Min Fast Audit</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">₹{(selectedMentor.hourlyRate * 0.6).toFixed(0)}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType('60_MIN')}
                      className={`p-3 rounded-xl border text-xs font-bold text-left ${
                        sessionType === '60_MIN' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>60-Min Deep Dive</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">₹{selectedMentor.hourlyRate}</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">What would you like to focus on?</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. My option scalping entries, risk management, reviewing my last 10 losing trades..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-600/20"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;
