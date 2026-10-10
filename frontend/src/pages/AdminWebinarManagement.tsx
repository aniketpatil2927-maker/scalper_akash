import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Video, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  PlayCircle, 
  Link as LinkIcon, 
  Clock,
  X,
  CheckCircle
} from 'lucide-react';

export const AdminWebinarManagement: React.FC = () => {
  const { apiGet, apiPost, apiPut, apiDelete } = useAuth();
  const [webinars, setWebinars] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState<number | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    speaker: 'Scalper Akash',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 3600 * 1000).toISOString().slice(0, 16),
    timezone: 'IST (UTC+5:30)',
    price: '999',
    discountPrice: '499',
    capacity: '250',
    meetingUrl: 'https://meet.google.com/xyz-trade-demo',
    accessType: 'PAID',
    status: 'SCHEDULED',
  });

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const [listRes, analyticsRes] = await Promise.all([
        apiGet('/webinars'),
        apiGet('/webinars/admin/analytics').catch(() => null),
      ]);
      setWebinars(listRes);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      console.error('Failed to load webinars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/webinars/admin/create', {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        capacity: parseInt(formData.capacity),
      });
      setShowCreateModal(false);
      fetchWebinars();
      alert('Live masterclass scheduled successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule webinar');
    }
  };

  const handleAttachRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRecordingModal) return;
    try {
      await apiPost(`/webinars/admin/${showRecordingModal}/recording`, {
        recordingUrl,
      });
      setShowRecordingModal(null);
      setRecordingUrl('');
      fetchWebinars();
      alert('Recording attached and masterclass marked completed!');
    } catch (err: any) {
      alert(err.message || 'Failed to attach recording');
    }
  };

  const handleDeleteWebinar = async (id: number) => {
    if (!window.confirm('Delete this webinar?')) return;
    try {
      await apiDelete(`/webinars/admin/${id}`);
      fetchWebinars();
    } catch (err: any) {
      alert(err.message || 'Failed to delete webinar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">LIVE WEBINARS & WORKSHOP MANAGER</h1>
          <p className="text-xs text-gray-400 mt-1">
            Schedule live masterclasses, set seat capacities, manage Google Meet room URLs, and upload recordings.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="lime-gradient-btn"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Schedule New Masterclass</span>
        </button>
      </div>

      {/* Analytics KPI */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Masterclasses</span>
            <div className="text-2xl font-black text-white mt-1">{analytics.totalWebinars}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Upcoming Sessions</span>
            <div className="text-2xl font-black text-accent-cyan mt-1">{analytics.upcomingWebinars}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Completed Sessions</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{analytics.completedWebinars}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Registrations</span>
            <div className="text-2xl font-black text-accent-gold mt-1">{analytics.totalRegistrations}</div>
          </div>
        </div>
      )}

      {/* Webinars Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Scheduled Time</th>
                <th className="px-4 py-3">Capacity / Booked</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-gray-300">
              {webinars.map((w) => (
                <tr key={w.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-white max-w-xs truncate">
                    {w.title}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(w.scheduledAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-bold text-accent-cyan">{w.registeredCount || 0}</span> / {w.capacity} seats
                  </td>
                  <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                    {Number(w.price) === 0 ? 'Free' : `₹${(w.discountPrice || w.price).toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      w.status === 'LIVE' ? 'bg-red-500/20 text-red-400 animate-pulse' :
                      w.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => { setShowRecordingModal(w.id); setRecordingUrl(w.recordingUrl || ''); }}
                      className="p-1 text-gray-400 hover:text-accent-cyan"
                      title="Attach Recording"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWebinar(w.id)}
                      className="p-1 text-gray-400 hover:text-accent-rose"
                      title="Delete Webinar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Webinar Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-dark-800 mb-4">
              <h3 className="text-base font-black text-white">Schedule Live Masterclass</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebinar} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Webinar Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. BankNifty Expiry Day Live Scalping Room"
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Google Meet / Live Stream URL</label>
                <input
                  type="text"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Full Workshop Agenda</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lime-gradient-btn !py-2 !px-5"
                >
                  Schedule Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Recording Modal */}
      {showRecordingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-dark-800 mb-4">
              <h3 className="text-base font-black text-white">Attach Session Recording</h3>
              <button onClick={() => setShowRecordingModal(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAttachRecording} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Recording Video URL (YouTube unlisted / S3 / MP4)</label>
                <input
                  type="text"
                  required
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRecordingModal(null)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent-cyan text-dark-950 font-black shadow-lg"
                >
                  Save Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
