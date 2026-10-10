import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Zap, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowRight,
  PlayCircle,
  Lock,
  Sparkles
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string;
  instructor: string;
  difficulty: string;
  durationMinutes: number;
  price: number;
  discountPrice: number | null;
  accessType: string;
  requiredTier: string;
  CourseCategory?: {
    id: number;
    name: string;
    slug: string;
  };
  CourseModules?: any[];
}

export const CoursesMarketplacePage: React.FC = () => {
  const { apiGet, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeCategory, selectedDifficulty]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, catsRes] = await Promise.all([
        apiGet(`/courses${activeCategory !== 'ALL' ? `?category=${activeCategory}` : ''}`),
        apiGet('/courses/categories'),
      ]);
      setCourses(coursesRes);
      setCategories(catsRes);
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    if (selectedDifficulty !== 'ALL' && c.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim() && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#08090d] text-gray-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#d2fd2a]/10 border border-[#d2fd2a]/30 text-[#d2fd2a] text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(210,253,42,0.15)]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Institutional Trading Curriculum</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          SCALPER AKASH TRADING ACADEMY
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          From high-speed index scalping formulas to institutional orderflow footprint analysis. Master proven strategies designed for Indian & Global Markets.
        </p>
      </div>

      {/* Categories Bar & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0e1017] border border-white/10 p-4 rounded-2xl shadow-xl">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'ALL'
                ? 'bg-[#d2fd2a] text-black shadow-md'
                : 'bg-[#08090d] text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#d2fd2a] text-black shadow-md'
                  : 'bg-[#08090d] text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search lessons & setups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#08090d] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d2fd2a]"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 && !loading && (
          <div className="col-span-full text-center py-16 text-gray-500">
            No courses found matching your criteria.
          </div>
        )}

        {filteredCourses.map((course) => {
          const hours = Math.floor(course.durationMinutes / 60);
          const mins = course.durationMinutes % 60;
          const durationStr = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

          return (
            <div
              key={course.id}
              className="group flex flex-col bg-[#0e1017] border border-white/10 hover:border-[#d2fd2a]/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:-translate-y-1"
            >
              {/* Thumbnail Container */}
              <div className="relative h-48 w-full overflow-hidden bg-[#08090d]">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent opacity-80" />

                {/* Difficulty & Access Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#08090d]/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-gray-300">
                    {course.difficulty}
                  </span>
                  {course.accessType === 'FREE' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[10px] font-extrabold text-emerald-400">
                      FREE
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 backdrop-blur-md border border-violet-500/40 text-[10px] font-extrabold text-violet-300">
                      {course.requiredTier} TIER
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-[11px] text-gray-300 font-medium">
                  <Clock className="h-3.5 w-3.5 text-[#d2fd2a]" />
                  <span>{durationStr}</span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d2fd2a]">
                    {course.CourseCategory?.name || 'Scalping Mastery'}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-[#d2fd2a] transition-colors line-clamp-1 mt-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {course.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    {course.accessType === 'FREE' ? (
                      <span className="text-sm font-black text-emerald-400">Free Access</span>
                    ) : (
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-black text-white">
                          ₹{(course.discountPrice || course.price).toLocaleString('en-IN')}
                        </span>
                        {course.discountPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{course.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/course/${course.slug}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#d2fd2a]/10 hover:bg-[#d2fd2a] hover:text-black border border-[#d2fd2a]/30 text-[#d2fd2a] font-extrabold text-xs transition-all"
                  >
                    <span>View Curriculum</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
