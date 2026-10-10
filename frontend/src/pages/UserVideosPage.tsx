import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Search, 
  Filter, 
  Crown, 
  Lock, 
  Unlock, 
  Clock, 
  Calendar, 
  Eye, 
  Paperclip, 
  ExternalLink, 
  Sparkles, 
  X, 
  CheckCircle, 
  RefreshCw, 
  Video, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface ResourceItem {
  title: string;
  url: string;
}

interface VideoSession {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: string | null;
  category: string;
  accessType: 'ALL_MEMBERS' | 'PLAN_MEMBERS';
  requiredTier: 'BASIC' | 'PREMIUM' | 'VIP';
  allowedPlanIds: number[] | null;
  instructor: string;
  sessionDate: string | null;
  viewsCount: number;
  resourceUrls: ResourceItem[] | null;
  isLocked: boolean;
  lockReason?: string;
  createdAt: string;
}

export const UserVideosPage: React.FC = () => {
  const { apiGet, apiPost, subscription, user } = useAuth();
  const [videos, setVideos] = useState<VideoSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccessTab, setSelectedAccessTab] = useState<'ALL' | 'ALL_MEMBERS' | 'PLAN_MEMBERS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');

  // Video player modal
  const [activePlayerVideo, setActivePlayerVideo] = useState<VideoSession | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/videos');
      setVideos(data);
    } catch (err) {
      console.error('Failed to load video sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlayer = async (video: VideoSession) => {
    if (video.isLocked) return;
    setActivePlayerVideo(video);
    // Track view count
    try {
      await apiPost(`/videos/${video.id}/view`, {});
      setVideos(prev => 
        prev.map(v => v.id === video.id ? { ...v, viewsCount: (v.viewsCount || 0) + 1 } : v)
      );
    } catch (err) {
      // Ignore view counter error
    }
  };

  const getEmbedVideoUrl = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`;
    }
    return url;
  };

  // Categories list
  const categoriesList = ['ALL', ...Array.from(new Set(videos.map(v => v.category))).filter(Boolean)];

  // Filtered and sorted
  const filteredVideos = videos.filter(video => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchDesc = (video.description || '').toLowerCase().includes(q);
      const matchInstructor = (video.instructor || '').toLowerCase().includes(q);
      const matchCat = video.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchInstructor && !matchCat) return false;
    }

    if (selectedAccessTab !== 'ALL' && video.accessType !== selectedAccessTab) {
      return false;
    }

    if (selectedCategory !== 'ALL' && video.category !== selectedCategory) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'NEWEST') {
      return new Date(b.sessionDate || b.createdAt).getTime() - new Date(a.sessionDate || a.createdAt).getTime();
    }
    if (sortBy === 'POPULAR') {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    if (sortBy === 'OLDEST') {
      return new Date(a.sessionDate || a.createdAt).getTime() - new Date(b.sessionDate || b.createdAt).getTime();
    }
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in text-gray-200 pb-16">
      {/* Top Banner / Plan Status Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-6 shadow-xl overflow-hidden">
        <div className="planetary-arc !top-[-300px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-cyan/15 text-accent-cyan text-xs font-bold border border-accent-cyan/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trader Learning Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Live Sessions & Video Masterclasses
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Watch recorded live trading room sessions, opening range breakout strategies, options orderflow analysis, and risk management masterclasses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {subscription ? (
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-dark-950/80 border border-accent-cyan/30 backdrop-blur-md">
                <div className="h-9 w-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Active Subscription
                  </span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {subscription.planName}
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-dark-950/80 border border-accent-gold/40 backdrop-blur-md">
                <div className="h-9 w-9 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Free Member
                  </span>
                  <Link
                    to="/dashboard/plans"
                    className="text-xs font-bold text-accent-gold hover:underline flex items-center gap-1"
                  >
                    Upgrade to VIP <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-dark-900 border border-dark-700/80 shadow-md">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session title, topic..."
              className="w-full pl-10 pr-4 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Access tabs */}
          <div className="flex items-center p-1 bg-dark-950 rounded-xl border border-dark-700 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setSelectedAccessTab('ALL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedAccessTab === 'ALL'
                  ? 'bg-accent-cyan text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Masterclasses ({videos.length})
            </button>
            <button
              onClick={() => setSelectedAccessTab('ALL_MEMBERS')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedAccessTab === 'ALL_MEMBERS'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Free / All Members ({videos.filter(v => v.accessType === 'ALL_MEMBERS').length})
            </button>
            <button
              onClick={() => setSelectedAccessTab('PLAN_MEMBERS')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedAccessTab === 'PLAN_MEMBERS'
                  ? 'bg-accent-gold text-dark-950 shadow-md font-extrabold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              VIP Exclusive ({videos.filter(v => v.accessType === 'PLAN_MEMBERS').length})
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2 self-end md:self-auto text-xs">
            <span className="text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-950 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="NEWEST">Newest Sessions</option>
              <option value="POPULAR">Most Popular</option>
              <option value="OLDEST">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-dark-800 text-accent-cyan border-accent-cyan shadow-[0_0_10px_rgba(255,107,0,0.2)]'
                    : 'bg-dark-900/80 text-gray-400 border-dark-700/80 hover:text-white hover:border-dark-600'
                }`}
              >
                {cat === 'ALL' ? '🌟 All Topics' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-900/40 rounded-2xl border border-dark-800">
          <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin mb-3" />
          <p className="text-sm font-semibold text-gray-300">Loading masterclasses...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-dark-900/40 rounded-2xl border border-dark-800 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-dark-800 flex items-center justify-center text-gray-500 mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No sessions match your filter</h3>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Try adjusting your search terms or select another category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedAccessTab('ALL');
              setSelectedCategory('ALL');
            }}
            className="text-xs text-accent-cyan font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isLocked = video.isLocked;
            return (
              <div
                key={video.id}
                className={`group relative flex flex-col justify-between rounded-2xl bg-dark-900 border transition-all duration-300 overflow-hidden ${
                  isLocked
                    ? 'border-dark-700/60 hover:border-accent-gold/40 shadow-md'
                    : 'border-dark-700/80 hover:border-accent-cyan/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,107,0,0.15)]'
                }`}
              >
                {/* Thumbnail container */}
                <div className="relative aspect-video w-full bg-dark-950 overflow-hidden">
                  <img
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60'}
                    alt={video.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isLocked ? 'filter blur-[2px] brightness-75 scale-100' : 'group-hover:scale-105'
                    }`}
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent"></div>

                  {/* Play Action / Lock Overlay */}
                  {isLocked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-950/60 backdrop-blur-[2px] p-4 text-center">
                      <div className="h-12 w-12 rounded-full bg-dark-900/90 border border-accent-gold/50 text-accent-gold flex items-center justify-center mb-2 shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white">VIP Exclusive Masterclass</span>
                      <span className="text-[10px] text-accent-gold mt-0.5 font-semibold">
                        {video.lockReason || `Requires ${video.requiredTier} Plan`}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenPlayer(video)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    >
                      <div className="h-12 w-12 rounded-full bg-[#ccff00] text-black flex items-center justify-center shadow-lg shadow-[#ccff00]/40 transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </button>
                  )}

                  {/* Access Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isLocked ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-dark-950/90 backdrop-blur-md text-accent-gold border border-accent-gold/40 shadow-sm">
                        <Lock className="w-3 h-3" />
                        {video.requiredTier} Plan Only
                      </span>
                    ) : video.accessType === 'PLAN_MEMBERS' ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-dark-950/90 backdrop-blur-md text-accent-gold border border-accent-gold/40 shadow-sm">
                        <Crown className="w-3 h-3 text-accent-gold" />
                        VIP Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-dark-950/90 backdrop-blur-md text-emerald-400 border border-emerald-500/40 shadow-sm">
                        <Unlock className="w-3 h-3" />
                        All Members Free
                      </span>
                    )}
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/80 text-white backdrop-blur-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent-cyan" />
                    {video.duration || '45m'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                      <span className="px-2 py-0.5 rounded bg-dark-800 text-gray-300 font-semibold border border-dark-700">
                        {video.category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {video.sessionDate ? new Date(video.sessionDate).toLocaleDateString() : 'Recorded'}
                      </span>
                    </div>

                    <h3
                      onClick={() => !isLocked && handleOpenPlayer(video)}
                      className={`text-sm font-bold leading-snug line-clamp-2 ${
                        isLocked ? 'text-gray-300' : 'text-white group-hover:text-accent-cyan cursor-pointer'
                      }`}
                    >
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Instructor & Attachments footer */}
                  <div className="pt-2 border-t border-dark-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="text-gray-300 font-medium">
                      By {video.instructor}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-3.5 h-3.5" />
                        {video.viewsCount || 0}
                      </span>
                      {Array.isArray(video.resourceUrls) && video.resourceUrls.length > 0 && (
                        <span className="flex items-center gap-1 text-accent-cyan font-medium">
                          <Paperclip className="w-3.5 h-3.5" />
                          {video.resourceUrls.length} Files
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="p-3 bg-dark-950/60 border-t border-dark-800">
                  {isLocked ? (
                    <Link
                      to="/dashboard/plans"
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-accent-gold/20 to-amber-600/30 hover:from-accent-gold/30 hover:to-amber-600/40 border border-accent-gold/50 text-accent-gold font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Upgrade Plan to Unlock</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleOpenPlayer(video)}
                      className="w-full py-2 px-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors group-hover:bg-accent-cyan"
                    >
                      <Play className="w-3.5 h-3.5 text-accent-cyan group-hover:text-white fill-current" />
                      <span>Watch Session</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* THEATER VIDEO PLAYER MODAL */}
      {activePlayerVideo && activePlayerVideo.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl overflow-hidden text-gray-200 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-dark-950 border-b border-dark-800">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{activePlayerVideo.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                    <span>Instructor: {activePlayerVideo.instructor}</span>
                    <span>•</span>
                    <span>{activePlayerVideo.category}</span>
                    <span>•</span>
                    <span>{activePlayerVideo.duration}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivePlayerVideo(null)}
                className="p-1.5 rounded-lg bg-dark-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full bg-black">
              {activePlayerVideo.videoUrl.includes('youtube.com') || activePlayerVideo.videoUrl.includes('youtu.be') || activePlayerVideo.videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={getEmbedVideoUrl(activePlayerVideo.videoUrl)}
                  title={activePlayerVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={activePlayerVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              )}
            </div>

            {/* Video Information & Resource Attachments */}
            <div className="p-4 bg-dark-900 space-y-3 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-dark-800 text-accent-cyan border border-dark-700">
                    {activePlayerVideo.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-500" /> {activePlayerVideo.viewsCount || 0} views
                  </span>
                </div>

                <span className="text-xs text-gray-400">
                  Recorded on: {activePlayerVideo.sessionDate ? new Date(activePlayerVideo.sessionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {activePlayerVideo.description && (
                <div className="p-3 rounded-xl bg-dark-950 border border-dark-800 text-xs text-gray-300 leading-relaxed">
                  <h4 className="font-bold text-white mb-1">Session Overview & Key Concepts:</h4>
                  <p>{activePlayerVideo.description}</p>
                </div>
              )}

              {Array.isArray(activePlayerVideo.resourceUrls) && activePlayerVideo.resourceUrls.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Downloadable Resources & Files:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePlayerVideo.resourceUrls.map((res, i) => (
                      <a
                        key={i}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 border border-dark-700 text-accent-cyan text-xs font-semibold transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{res.title}</span>
                        <ExternalLink className="w-3 h-3 text-gray-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
