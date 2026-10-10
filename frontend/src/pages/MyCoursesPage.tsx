import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  PlayCircle, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  Zap,
  Sparkles
} from 'lucide-react';

export const MyCoursesPage: React.FC = () => {
  const { apiGet, user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/courses/my-courses');
      setEnrollments(data);
    } catch (err: any) {
      console.error('Failed to fetch enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-white tracking-tight">MY LEARNING & CERTIFICATIONS</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[10px] font-bold">
              STUDENT PORTAL
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Track your course progress, complete lessons, and earn verified Scalper Akash masterclass certificates.
          </p>
        </div>

        <Link
          to="/dashboard/catalog"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan font-bold text-xs transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          <span>Browse Course Marketplace</span>
        </Link>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.length === 0 && !loading && (
          <div className="col-span-full bg-dark-900 border border-dark-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">No courses enrolled yet</h3>
              <p className="text-xs text-gray-400 mt-1">
                Explore our catalog to start mastering high-probability scalping and orderflow trading.
              </p>
            </div>
            <Link
              to="/dashboard/catalog"
              className="lime-gradient-btn"
            >
              <span>Explore Courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {enrollments.map((enr) => {
          const course = enr.Course;
          const progress = Number(enr.progressPercentage || 0);
          const isCompleted = progress >= 100;

          return (
            <div
              key={enr.id}
              className="flex flex-col bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Thumbnail */}
              <div className="relative h-44 w-full bg-dark-950 overflow-hidden">
                <img
                  src={course?.thumbnailUrl}
                  alt={course?.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80" />

                {isCompleted && (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[10px] font-extrabold text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>COMPLETED</span>
                  </div>
                )}
              </div>

              {/* Course Info & Progress */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-cyan">
                    {course?.CourseCategory?.name || 'Trading Course'}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1 mt-1">
                    {course?.title}
                  </h3>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-accent-cyan">{progress}%</span>
                    </div>
                    <div className="w-full bg-dark-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-accent-cyan to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-dark-800 flex items-center justify-between gap-2">
                  <Link
                    to={`/course/${course?.slug}`}
                    className="flex-1 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <PlayCircle className="h-4 w-4 text-accent-cyan" />
                    <span>Continue</span>
                  </Link>

                  {enr.certificateId && (
                    <Link
                      to={`/verify/certificate/${enr.certificateId}`}
                      className="py-2.5 px-3 rounded-xl bg-accent-gold/20 hover:bg-accent-gold/30 border border-accent-gold/40 text-accent-gold font-bold text-xs flex items-center space-x-1 transition-colors"
                      title="View Verified Certificate"
                    >
                      <Award className="h-4 w-4" />
                      <span>Certificate</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
