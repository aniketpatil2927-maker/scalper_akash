import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Eye, 
  Users, 
  Award, 
  DollarSign, 
  CheckCircle,
  X,
  PlayCircle
} from 'lucide-react';

export const AdminCourseManagement: React.FC = () => {
  const { apiGet, apiPost, apiPut, apiDelete } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating/editing courses
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '1',
    shortDescription: '',
    description: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    instructor: 'Scalper Akash',
    difficulty: 'ALL_LEVELS',
    durationMinutes: '120',
    price: '1999',
    discountPrice: '1499',
    accessType: 'PAID',
    requiredTier: 'BASIC',
  });

  useEffect(() => {
    fetchAdminCourses();
  }, []);

  const fetchAdminCourses = async () => {
    try {
      setLoading(true);
      const [coursesRes, catsRes, analyticsRes] = await Promise.all([
        apiGet('/courses'),
        apiGet('/courses/categories'),
        apiGet('/courses/admin/analytics').catch(() => null),
      ]);
      setCourses(coursesRes);
      setCategories(catsRes);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/courses/admin/create', {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        durationMinutes: parseInt(formData.durationMinutes),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      });
      setShowCreateModal(false);
      fetchAdminCourses();
      alert('Course published successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiDelete(`/courses/admin/${id}`);
      fetchAdminCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">COURSE & CURRICULUM MANAGER</h1>
          <p className="text-xs text-gray-400 mt-1">
            Build trading courses, publish video modules, configure access tiers, and view completion rates.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="lime-gradient-btn"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Analytics Row */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Courses</span>
            <div className="text-2xl font-black text-white mt-1">{analytics.totalCourses}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Total Enrollments</span>
            <div className="text-2xl font-black text-accent-cyan mt-1">{analytics.totalEnrollments}</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Completion Rate</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{analytics.completionRate}%</div>
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
            <span className="text-xs text-gray-400 font-semibold">Certificates Issued</span>
            <div className="text-2xl font-black text-accent-gold mt-1">{analytics.certificatesIssued}</div>
          </div>
        </div>
      )}

      {/* Course Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Price (₹)</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-gray-300">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-dark-800/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-white max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {c.CourseCategory?.name || 'General'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-dark-800 text-[10px] font-bold text-gray-300">
                      {c.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {c.accessType === 'FREE' ? 'Free' : `₹${(c.discountPrice || c.price).toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-cyan/10 text-accent-cyan">
                      {c.accessType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-1 text-gray-400 hover:text-accent-rose"
                      title="Delete Course"
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

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-dark-800 mb-4">
              <h3 className="text-base font-black text-white">Create New Course</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterclass in High-Frequency Order Flow"
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ALL_LEVELS">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Regular Price (₹)</label>
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
                  <label className="block text-gray-400 font-bold mb-1">Access Tier</label>
                  <select
                    value={formData.requiredTier}
                    onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="BASIC">Basic Tier</option>
                    <option value="PREMIUM">Premium Tier</option>
                    <option value="VIP">VIP Tier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="One sentence summary for course card"
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Full Curriculum Overview</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed breakdown of what students will master..."
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
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
