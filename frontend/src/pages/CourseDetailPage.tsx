import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Clock, 
  Award, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  ArrowRight,
  Share2,
  Check,
  Zap,
  BookOpen
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { apiGet, apiPost, user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({});
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [slug]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/courses/${slug}`);
      setCourse(data.course);
      setIsEnrolled(data.isEnrolled);
      setEnrollment(data.enrollment);

      // Open first module by default
      if (data.course?.CourseModules?.length > 0) {
        setOpenModules({ [data.course.CourseModules[0].id]: true });
        // Set first lesson active
        if (data.course.CourseModules[0].CourseLessons?.length > 0) {
          setActiveLesson(data.course.CourseModules[0].CourseLessons[0]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: number) => {
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEnrollOrBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);

      // If course is free or included in user's active tier
      if (course.accessType === 'FREE') {
        const res = await apiPost(`/courses/${course.id}/enroll`, {});
        setIsEnrolled(true);
        setEnrollment(res.enrollment);
        alert('Enrolled successfully! You can start learning now.');
        return;
      }

      // If paid, create unified order and verify
      const orderRes = await apiPost('/orders', {
        orderType: 'COURSE',
        itemId: course.id,
        couponCode: couponApplied ? couponApplied.code : undefined,
      });

      // Simulate payment gateway verification
      const verifyRes = await apiPost('/payments/verify', {
        orderId: orderRes.orderId,
        paymentGatewayId: `pay_mock_${Date.now()}`,
        status: 'SUCCESS',
      });

      setIsEnrolled(true);
      alert('Payment successful! Course enrolled.');
      fetchCourseDetails();
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const amount = course.discountPrice || course.price;
      const res = await apiPost('/coupons/validate', {
        code: couponCode,
        productType: 'COURSE',
        amount,
      });
      setCouponApplied(res);
    } catch (err: any) {
      alert(err.message || 'Invalid coupon code');
    }
  };

  if (loading || !course) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        <span>Loading course syllabus...</span>
      </div>
    );
  }

  const price = course.discountPrice || course.price;
  const finalPrice = couponApplied ? couponApplied.finalAmount : price;

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Course Hero Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-dark-900 border border-dark-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-bold text-xs">
              {course.CourseCategory?.name || 'Scalping'}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-xs font-semibold text-gray-400">Instructor: {course.instructor}</span>
            <span className="text-gray-500">•</span>
            <span className="text-xs font-semibold text-accent-gold">{course.difficulty}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-400">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-accent-cyan" />
              <span>{course.durationMinutes} Minutes total video</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Award className="h-4 w-4 text-accent-gold" />
              <span>Verified Certificate of Completion</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Lifetime Access & Updates</span>
            </div>
          </div>
        </div>

        {/* Purchase Card */}
        <div className="bg-dark-950 border border-dark-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              {course.accessType === 'FREE' ? (
                <span className="text-3xl font-black text-emerald-400">Free Access</span>
              ) : (
                <>
                  <span className="text-3xl font-black text-white">
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </span>
                  {course.discountPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{course.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </>
              )}
            </div>

            {course.accessType !== 'FREE' && !isEnrolled && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-bold text-gray-200"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[10px] text-emerald-400 font-bold">
                    ✓ Saved ₹{couponApplied.discountAmount} with code {couponApplied.code}!
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {isEnrolled ? (
              <Link
                to="/dashboard/courses"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Continue Learning in Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={handleEnrollOrBuy}
                disabled={enrolling}
                className="w-full lime-gradient-btn !py-3.5 !text-xs disabled:opacity-50"
              >
                <span>{enrolling ? 'Processing...' : (course.accessType === 'FREE' ? 'Enroll For Free' : 'Buy Course Now')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <p className="text-[10px] text-center text-gray-500">
              30-day satisfaction guarantee • Instant access on web & mobile
            </p>
          </div>
        </div>
      </div>

      {/* Course Video Player & Curriculum Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Video Preview Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {activeLesson && (activeLesson.isPreview || isEnrolled) ? (
                <iframe
                  src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                  title={activeLesson.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <Lock className="h-12 w-12 text-gray-600 mx-auto" />
                  <p className="text-sm font-bold text-gray-300">
                    This lesson is locked. Enroll to unlock all full-length HD videos & resources.
                  </p>
                </div>
              )}
            </div>

            {activeLesson && (
              <div className="p-6 space-y-2 border-t border-dark-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{activeLesson.title}</h3>
                  <span className="text-xs font-semibold text-gray-400">{activeLesson.durationMinutes} mins</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{activeLesson.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Modules & Lessons Syllabus Accordion */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-dark-800">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Course Syllabus</h3>
            <span className="text-xs text-gray-400 font-semibold">
              {course.CourseModules?.length || 0} Modules
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
            {course.CourseModules?.map((mod: any, index: number) => {
              const isOpen = !!openModules[mod.id];
              return (
                <div key={mod.id} className="border border-dark-800 rounded-xl overflow-hidden bg-dark-950">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-gray-200 hover:bg-dark-800/60 transition-colors"
                  >
                    <span>{index + 1}. {mod.title}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-2 space-y-1 bg-dark-900 border-t border-dark-800">
                      {mod.CourseLessons?.map((les: any) => {
                        const isSelected = activeLesson?.id === les.id;
                        return (
                          <div
                            key={les.id}
                            onClick={() => setActiveLesson(les)}
                            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-colors ${
                              isSelected ? 'bg-accent-cyan/10 text-accent-cyan font-bold border border-accent-cyan/30' : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              {les.isPreview || isEnrolled ? (
                                <PlayCircle className="h-4 w-4 flex-shrink-0 text-accent-cyan" />
                              ) : (
                                <Lock className="h-4 w-4 flex-shrink-0 text-gray-600" />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold">{les.durationMinutes}m</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
