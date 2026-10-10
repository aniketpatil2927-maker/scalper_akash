import React, { useState, useEffect } from 'react';
import {
  Users,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  Search,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

interface Booking {
  id: number;
  sessionType: string;
  scheduledAt: string;
  durationMins: number;
  amount: number;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  User?: { id: number; fullName: string; email: string; mobile: string };
  Mentor?: { name: string };
}

export const AdminMentorshipManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<string>('CONFIRMED');
  const [newMeetingLink, setNewMeetingLink] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/mentorship/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/mentorship/admin/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          meetingLink: newMeetingLink,
        }),
      });

      if (res.ok) {
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (err) {
      console.error('Failed to update booking:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Mentorship Operations ERP
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Mentorship Bookings & Schedules
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Approve private sessions, assign video meeting links, and monitor mentor revenue attribution.
            </p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Client / Subscriber</th>
                  <th className="py-4 px-6">Mentor</th>
                  <th className="py-4 px-6">Session Type</th>
                  <th className="py-4 px-6">Scheduled Time</th>
                  <th className="py-4 px-6">Fee</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Meeting Link</th>
                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">Loading bookings...</td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">No mentorship sessions booked yet.</td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">{b.User?.fullName || 'Client'}</div>
                        <div className="text-slate-400 text-[11px]">{b.User?.email}</div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-200">{b.Mentor?.name || 'Scalper Akash Lead'}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold uppercase text-[10px]">
                          {b.sessionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {new Date(b.scheduledAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-400">
                        ₹{Number(b.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                        {b.meetingLink ? (
                          <a href={b.meetingLink} target="_blank" rel="noreferrer" className="text-blue-400 underline flex items-center gap-1">
                            Link Assigned <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-amber-400">Pending link</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setNewStatus(b.status);
                            setNewMeetingLink(b.meetingLink || 'https://meet.google.com/ska-trd-ment');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Manage Mentorship Session</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Session Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  value={newMeetingLink}
                  onChange={(e) => setNewMeetingLink(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              {selectedBooking.notes && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-500 font-bold block mb-1">Client Focus Areas:</span>
                  <p className="text-slate-300">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-blue-600/20"
                >
                  Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMentorshipManagement;
