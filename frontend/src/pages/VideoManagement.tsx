import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext.js';
import { 
  Play, 
  PlusCircle, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Sparkles, 
  X, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Grid, 
  List, 
  Video, 
  Paperclip, 
  ExternalLink,
  Crown,
  Lock,
  Unlock,
  CheckCircle2,
  ChevronDown,
  Layers,
  Upload,
  FileVideo,
  Image as ImageIcon,
  HardDrive,
  Link as LinkIcon
} from 'lucide-react';

interface ResourceItem {
  title: string;
  url: string;
}

interface VideoSession {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: string | null;
  category: string;
  accessType: 'ALL_MEMBERS' | 'PLAN_MEMBERS';
  requiredTier: 'BASIC' | 'PREMIUM' | 'VIP';
  allowedPlanIds: number[] | null;
  instructor: string;
  sessionDate: string | null;
  isPublished: boolean;
  viewsCount: number;
  resourceUrls: ResourceItem[] | null;
  createdAt: string;
}

interface Plan {
  id: number;
  name: string;
  accessTier: 'BASIC' | 'PREMIUM' | 'VIP';
  price: number;
}

interface VideoStats {
  totalVideos: number;
  allMembersVideos: number;
  planExclusiveVideos: number;
  publishedVideos: number;
  draftVideos: number;
  totalViews: number;
  categoriesCount: number;
  categoriesList: string[];
}

export const VideoManagement: React.FC = () => {
  const { apiGet, apiPost, apiPut, apiDelete } = useAuth();
  
  const [videos, setVideos] = useState<VideoSession[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccessType, setSelectedAccessType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoSession | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoSession | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoSession | null>(null);

  // Upload from Device state
  const [videoSourceMode, setVideoSourceMode] = useState<'DEVICE' | 'URL'>('DEVICE');
  const [thumbnailSourceMode, setThumbnailSourceMode] = useState<'DEVICE' | 'URL'>('DEVICE');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ video?: string; thumbnail?: string }>({});
  const [uploadedVideoFile, setUploadedVideoFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadedThumbnailFile, setUploadedThumbnailFile] = useState<{ name: string } | null>(null);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '45 mins',
    category: 'Live Trading',
    customCategory: '',
    accessType: 'ALL_MEMBERS' as 'ALL_MEMBERS' | 'PLAN_MEMBERS',
    requiredTier: 'BASIC' as 'BASIC' | 'PREMIUM' | 'VIP',
    allowedPlanIds: [] as number[],
    instructor: 'Scalper Akash',
    sessionDate: new Date().toISOString().slice(0, 16),
    isPublished: true,
    resources: [] as ResourceItem[],
  });

  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [videosData, plansData, statsData] = await Promise.all([
        apiGet('/admin/videos'),
        apiGet('/admin/plans').catch(() => []),
        apiGet('/admin/videos/stats').catch(() => null),
      ]);
      setVideos(videosData);
      setPlans(plansData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load video management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'video' | 'thumbnail') => {
    try {
      setFormError(null);
      if (type === 'video') {
        setUploadingVideo(true);
        setUploadProgress(prev => ({ ...prev, video: `Uploading ${file.name}...` }));
      } else {
        setUploadingThumbnail(true);
        setUploadProgress(prev => ({ ...prev, thumbnail: `Uploading ${file.name}...` }));
      }

      const body = new FormData();
      body.append('file', file);

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/admin/videos/upload-media`, {
        method: 'POST',
        headers,
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (type === 'video') {
        setFormData(prev => ({ ...prev, videoUrl: data.url }));
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        setUploadedVideoFile({ name: file.name, size: `${sizeInMb} MB` });
        setUploadProgress(prev => ({ ...prev, video: undefined }));
      } else {
        setFormData(prev => ({ ...prev, thumbnailUrl: data.url }));
        setUploadedThumbnailFile({ name: file.name });
        setUploadProgress(prev => ({ ...prev, thumbnail: undefined }));
      }
    } catch (err: any) {
      setFormError(err.message || `Failed to upload ${type}`);
      if (type === 'video') {
        setUploadProgress(prev => ({ ...prev, video: undefined }));
      } else {
        setUploadProgress(prev => ({ ...prev, thumbnail: undefined }));
      }
    } finally {
      if (type === 'video') setUploadingVideo(false);
      if (type === 'thumbnail') setUploadingThumbnail(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingVideo(null);
    setVideoSourceMode('DEVICE');
    setThumbnailSourceMode('DEVICE');
    setUploadedVideoFile(null);
    setUploadedThumbnailFile(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: '45 mins',
      category: 'Live Trading',
      customCategory: '',
      accessType: 'ALL_MEMBERS',
      requiredTier: 'BASIC',
      allowedPlanIds: plans.map(p => p.id),
      instructor: 'Scalper Akash',
      sessionDate: new Date().toISOString().slice(0, 16),
      isPublished: true,
      resources: [],
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (video: VideoSession) => {
    setEditingVideo(video);
    const existingDate = video.sessionDate 
      ? new Date(video.sessionDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    const isLocalVideo = video.videoUrl.includes('/uploads/videos/');
    const isLocalThumbnail = Boolean(video.thumbnailUrl && video.thumbnailUrl.includes('/uploads/thumbnails/'));
    
    setVideoSourceMode(isLocalVideo ? 'DEVICE' : 'URL');
    setThumbnailSourceMode(isLocalThumbnail ? 'DEVICE' : 'URL');
    setUploadedVideoFile(isLocalVideo ? { name: video.videoUrl.split('/').pop() || 'Uploaded Video', size: '' } : null);
    setUploadedThumbnailFile(isLocalThumbnail ? { name: video.thumbnailUrl?.split('/').pop() || 'Uploaded Thumbnail' } : null);

    const isKnownCategory = [
      'Live Trading', 
      'Options Strategy', 
      'Price Action', 
      'Scalping Masterclass', 
      'Risk Management', 
      'Psychology & Discipline', 
      'Q&A Session'
    ].includes(video.category);

    setFormData({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      duration: video.duration || '45 mins',
      category: isKnownCategory ? video.category : 'OTHER',
      customCategory: isKnownCategory ? '' : video.category,
      accessType: video.accessType,
      requiredTier: video.requiredTier || 'BASIC',
      allowedPlanIds: Array.isArray(video.allowedPlanIds) ? video.allowedPlanIds : [],
      instructor: video.instructor || 'Scalper Akash',
      sessionDate: existingDate,
      isPublished: video.isPublished,
      resources: Array.isArray(video.resourceUrls) ? [...video.resourceUrls] : [],
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleAddResource = () => {

    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { title: newResourceTitle.trim(), url: newResourceUrl.trim() }],
    }));
    setNewResourceTitle('');
    setNewResourceUrl('');
  };

  const handleRemoveResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const togglePlanSelection = (planId: number) => {
    setFormData(prev => {
      const exists = prev.allowedPlanIds.includes(planId);
      if (exists) {
        return { ...prev, allowedPlanIds: prev.allowedPlanIds.filter(id => id !== planId) };
      } else {
        return { ...prev, allowedPlanIds: [...prev.allowedPlanIds, planId] };
      }
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const categoryToSave = formData.category === 'OTHER' 
      ? (formData.customCategory.trim() || 'General') 
      : formData.category;

    if (!formData.title.trim()) {
      setFormError('Session title is required');
      return;
    }

    if (!formData.videoUrl.trim()) {
      setFormError('Video stream / playback URL is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        videoUrl: formData.videoUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || null,
        duration: formData.duration.trim() || '45 mins',
        category: categoryToSave,
        accessType: formData.accessType,
        requiredTier: formData.requiredTier,
        allowedPlanIds: formData.accessType === 'PLAN_MEMBERS' ? formData.allowedPlanIds : null,
        instructor: formData.instructor.trim() || 'Scalper Akash',
        sessionDate: formData.sessionDate,
        isPublished: formData.isPublished,
        resourceUrls: formData.resources,
      };

      if (editingVideo) {
        const updated = await apiPut(`/admin/videos/${editingVideo.id}`, payload);
        setVideos(prev => prev.map(v => v.id === editingVideo.id ? updated : v));
        setSuccessMessage('Video session updated successfully!');
      } else {
        const created = await apiPost('/admin/videos', payload);
        setVideos(prev => [created, ...prev]);
        setSuccessMessage('New video session uploaded & published successfully!');
      }

      setIsFormModalOpen(false);
      // Refresh stats
      const newStats = await apiGet('/admin/videos/stats').catch(() => null);
      if (newStats) setStats(newStats);

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save video session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublished = async (video: VideoSession) => {
    try {
      const updated = await apiPut(`/admin/videos/${video.id}`, {
        isPublished: !video.isPublished,
      });
      setVideos(prev => prev.map(v => v.id === video.id ? updated : v));
      // Refresh stats
      const newStats = await apiGet('/admin/videos/stats').catch(() => null);
      if (newStats) setStats(newStats);
    } catch (err: any) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVideo) return;
    try {
      await apiDelete(`/admin/videos/${deletingVideo.id}`);
      setVideos(prev => prev.filter(v => v.id !== deletingVideo.id));
      setDeletingVideo(null);
      setSuccessMessage('Video session deleted.');
      const newStats = await apiGet('/admin/videos/stats').catch(() => null);
      if (newStats) setStats(newStats);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to delete video:', err);
    }
  };

  // Extract embed URL helper
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return '';
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`;
    }
    return url;
  };

  // Filtered & Sorted list
  const filteredVideos = videos.filter(video => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchDesc = (video.description || '').toLowerCase().includes(q);
      const matchInstructor = (video.instructor || '').toLowerCase().includes(q);
      const matchCat = video.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchInstructor && !matchCat) return false;
    }

    // Access Type filter
    if (selectedAccessType !== 'ALL' && video.accessType !== selectedAccessType) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'ALL' && video.category !== selectedCategory) {
      return false;
    }

    // Status filter
    if (selectedStatus === 'PUBLISHED' && !video.isPublished) return false;
    if (selectedStatus === 'DRAFT' && video.isPublished) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'NEWEST') {
      return new Date(b.sessionDate || b.createdAt).getTime() - new Date(a.sessionDate || a.createdAt).getTime();
    }
    if (sortBy === 'OLDEST') {
      return new Date(a.sessionDate || a.createdAt).getTime() - new Date(b.sessionDate || b.createdAt).getTime();
    }
    if (sortBy === 'VIEWS') {
      return (b.viewsCount || 0) - (a.viewsCount || 0);
    }
    if (sortBy === 'TITLE') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const categoriesList = Array.from(new Set(videos.map(v => v.category))).filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in text-gray-200 pb-16">
      {/* Top Banner Alert */}
      {successMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-white shadow-lg backdrop-blur-md animate-slide-down">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-accent-cyan flex-shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
              <Video className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Video Sessions Manager
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30">
                  ERP Control
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload masterclasses, live trading recordings, configure audience permissions, and track engagement.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInitialData}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-gray-300 hover:text-white text-xs font-semibold transition-all duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent-cyan' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="lime-gradient-btn flex items-center space-x-2 !text-xs !py-2.5 !px-5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Session</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-dark-900 border border-dark-700/80 shadow-md relative overflow-hidden group hover:border-accent-cyan/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sessions</span>
            <div className="h-8 w-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{stats?.totalVideos || videos.length}</span>
            <span className="text-[11px] text-gray-400 font-medium">
              {stats?.publishedVideos ?? videos.filter(v => v.isPublished).length} Active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-cyan"></span>
            Across {categoriesList.length} categories
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-dark-700/80 shadow-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">All Members (Free)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">
              {stats?.allMembersVideos ?? videos.filter(v => v.accessType === 'ALL_MEMBERS').length}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Open Access
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Available to all registered traders
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-dark-700/80 shadow-md relative overflow-hidden group hover:border-accent-gold/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Plan Members Exclusive</span>
            <div className="h-8 w-8 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-accent-gold">
              {stats?.planExclusiveVideos ?? videos.filter(v => v.accessType === 'PLAN_MEMBERS').length}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
              VIP Tier Locked
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Requires active subscription
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-dark-700/80 shadow-md relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Video Views</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {stats?.totalViews ?? videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0)}
            </span>
            <span className="text-[11px] text-blue-400 font-medium">Views Tracked</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Automated stream analytics
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-dark-900 border border-dark-700/90 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session title, topic, instructor..."
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

          {/* Quick Access Filter Tabs */}
          <div className="flex items-center p-1 bg-dark-950 rounded-xl border border-dark-700 overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedAccessType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedAccessType === 'ALL'
                  ? 'bg-accent-cyan text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Access ({videos.length})
            </button>
            <button
              onClick={() => setSelectedAccessType('ALL_MEMBERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedAccessType === 'ALL_MEMBERS'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Members ({videos.filter(v => v.accessType === 'ALL_MEMBERS').length})
            </button>
            <button
              onClick={() => setSelectedAccessType('PLAN_MEMBERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedAccessType === 'PLAN_MEMBERS'
                  ? 'bg-accent-gold text-dark-950 shadow-md font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Plan Members ({videos.filter(v => v.accessType === 'PLAN_MEMBERS').length})
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center space-x-1.5 bg-dark-950 p-1 rounded-xl border border-dark-700">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'GRID' ? 'bg-dark-800 text-accent-cyan shadow' : 'text-gray-500 hover:text-white'
              }`}
              title="Grid Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'TABLE' ? 'bg-dark-800 text-accent-cyan shadow' : 'text-gray-500 hover:text-white'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second row of filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-dark-800/80 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-accent-cyan" /> Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-dark-950 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-dark-950 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Drafts Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-950 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            >
              <option value="NEWEST">Newest First</option>
              <option value="VIEWS">Most Viewed</option>
              <option value="OLDEST">Oldest First</option>
              <option value="TITLE">Title (A-Z)</option>
            </select>
          </div>

          {(searchQuery || selectedAccessType !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAccessType('ALL');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="ml-auto text-xs text-accent-cyan hover:underline flex items-center gap-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Videos List / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-900/50 rounded-2xl border border-dark-800">
          <RefreshCw className="w-8 h-8 text-accent-cyan animate-spin mb-3" />
          <p className="text-sm font-semibold text-gray-300">Loading video sessions catalog...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-dark-900/50 rounded-2xl border border-dark-800 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-dark-800 flex items-center justify-center text-gray-500 mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No video sessions found</h3>
          <p className="text-xs text-gray-400 max-w-md mb-5">
            {searchQuery || selectedCategory !== 'ALL' || selectedAccessType !== 'ALL'
              ? 'Try changing your search keywords or filter criteria.'
              : 'Start by uploading your first trading masterclass or live session recording.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="lime-gradient-btn !text-xs !py-2.5 !px-5"
          >
            + Upload Session
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => {
            const isPlanRestricted = video.accessType === 'PLAN_MEMBERS';
            return (
              <div
                key={video.id}
                className="group flex flex-col justify-between rounded-2xl bg-dark-900 border border-dark-700/80 hover:border-accent-cyan/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,107,0,0.15)] transition-all duration-300 overflow-hidden"
              >
                {/* Thumbnail & Badges */}
                <div className="relative aspect-video w-full bg-dark-950 overflow-hidden">
                  <img
                    src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent"></div>

                  {/* Play Overlay Button */}
                  <button
                    onClick={() => setPreviewVideo(video)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="h-12 w-12 rounded-full bg-[#ccff00] text-black flex items-center justify-center shadow-lg shadow-[#ccff00]/40 transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </button>

                  {/* Access Level Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isPlanRestricted ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-dark-950/80 backdrop-blur-md text-accent-gold border border-accent-gold/40 shadow-sm">
                        <Crown className="w-3 h-3" />
                        {video.requiredTier} Plan Members
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-dark-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 shadow-sm">
                        <Users className="w-3 h-3" />
                        All Members (Free)
                      </span>
                    )}
                  </div>

                  {/* Duration Pill */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/80 text-white backdrop-blur-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent-cyan" />
                    {video.duration || '45m'}
                  </div>

                  {/* Publish State */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                      video.isPublished
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {video.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-dark-800 text-gray-300 font-semibold border border-dark-700">
                        {video.category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {video.sessionDate ? new Date(video.sessionDate).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <h3 
                      onClick={() => setPreviewVideo(video)}
                      className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors line-clamp-2 cursor-pointer"
                    >
                      {video.title}
                    </h3>

                    {video.description && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata & Resources snippet */}
                  <div className="pt-2 border-t border-dark-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        {video.viewsCount || 0} views
                      </span>
                      {Array.isArray(video.resourceUrls) && video.resourceUrls.length > 0 && (
                        <span className="flex items-center gap-1 text-accent-cyan" title={`${video.resourceUrls.length} downloadable resource(s)`}>
                          <Paperclip className="w-3.5 h-3.5" />
                          {video.resourceUrls.length} Files
                        </span>
                      )}
                    </div>

                    <span className="text-gray-400 font-medium">
                      By {video.instructor}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-3 bg-dark-950/60 border-t border-dark-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewVideo(video)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Watch & Test</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(video)}
                    className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
                    title="Edit Session"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleTogglePublished(video)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      video.isPublished 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                    }`}
                    title={video.isPublished ? 'Unpublish to Draft' : 'Publish Live'}
                  >
                    {video.isPublished ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setDeletingVideo(video)}
                    className="p-1.5 rounded-lg bg-dark-800 hover:bg-accent-rose/20 text-gray-400 hover:text-accent-rose transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-dark-900 border border-dark-700/80 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-dark-950 border-b border-dark-700 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Audience Access</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800 font-medium">
                {filteredVideos.map((video) => {
                  const isPlanRestricted = video.accessType === 'PLAN_MEMBERS';
                  return (
                    <tr key={video.id} className="hover:bg-dark-850/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60'}
                            alt={video.title}
                            className="w-12 h-8 rounded object-cover flex-shrink-0 bg-dark-950"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
                            }}
                          />
                          <div>
                            <span 
                              onClick={() => setPreviewVideo(video)}
                              className="font-bold text-white hover:text-accent-cyan cursor-pointer line-clamp-1"
                            >
                              {video.title}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              By {video.instructor}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-dark-800 text-gray-300 text-[11px] font-semibold border border-dark-700">
                          {video.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {isPlanRestricted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-gold/10 text-accent-gold border border-accent-gold/30">
                            <Crown className="w-3 h-3" />
                            {video.requiredTier} Plan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Users className="w-3 h-3" />
                            All Members
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-300 font-semibold">{video.duration || '45m'}</td>
                      <td className="px-4 py-3.5">{video.viewsCount || 0}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          video.isPublished
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {video.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 text-[11px]">
                        {video.sessionDate ? new Date(video.sessionDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-accent-cyan hover:text-white transition-colors"
                          title="Watch Session"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(video)}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
                          title="Edit Session"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingVideo(video)}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-accent-rose/20 text-gray-400 hover:text-accent-rose transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT VIDEO MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-dark-900 border border-dark-700 p-6 text-gray-200 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-dark-800">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingVideo ? 'Edit Video Session' : 'Upload New Video Session'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Configure masterclass details, playback stream, and member access rules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-dark-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="mt-5 space-y-5">
              {/* Section 1: Basic info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> 1. Session Information
                </h3>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Session Title <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. BankNifty Expiry Scalping & Delta Setup Masterclass"
                    className="w-full px-3.5 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    >
                      <option value="Live Trading">Live Trading</option>
                      <option value="Options Strategy">Options Strategy</option>
                      <option value="Price Action">Price Action</option>
                      <option value="Scalping Masterclass">Scalping Masterclass</option>
                      <option value="Risk Management">Risk Management</option>
                      <option value="Psychology & Discipline">Psychology & Discipline</option>
                      <option value="Q&A Session">Q&A Session</option>
                      <option value="OTHER">+ Custom Category</option>
                    </select>
                  </div>

                  {formData.category === 'OTHER' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Custom Category Name
                      </label>
                      <input
                        type="text"
                        value={formData.customCategory}
                        onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                        placeholder="Enter custom category"
                        className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 54 mins / 1h 20m"
                      className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Instructor / Mentor
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Scalper Akash"
                      className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Recorded Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full md:w-64 px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                  />
                </div>
              </div>

              {/* Section 2: Video Stream & Thumbnail (Upload from Device + URL Support) */}
              <div className="space-y-4 pt-3 border-t border-dark-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" /> 2. Video Stream & Thumbnail Upload
                  </h3>
                  <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-xl border border-dark-700">
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode('DEVICE')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        videoSourceMode === 'DEVICE'
                          ? 'bg-accent-cyan text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode('URL')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        videoSourceMode === 'URL'
                          ? 'bg-accent-cyan text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Paste URL / Embed</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video Upload Block */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-300">
                        Video Source <span className="text-accent-rose">*</span>
                      </label>
                      {formData.videoUrl && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Video Attached
                        </span>
                      )}
                    </div>

                    {videoSourceMode === 'DEVICE' ? (
                      <div className="space-y-2">
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/*,.mp4,.webm,.mov,.mkv,.avi"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0], 'video');
                            }
                          }}
                        />

                        <div
                          onClick={() => !uploadingVideo && videoFileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleFileUpload(e.dataTransfer.files[0], 'video');
                            }
                          }}
                          className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            uploadingVideo
                              ? 'border-accent-cyan bg-accent-cyan/10'
                              : formData.videoUrl
                              ? 'border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500'
                              : 'border-dark-700 bg-dark-950 hover:border-accent-cyan/60 hover:bg-dark-900'
                          }`}
                        >
                          {uploadingVideo ? (
                            <div className="py-3 flex flex-col items-center">
                              <RefreshCw className="w-7 h-7 text-accent-cyan animate-spin mb-2" />
                              <span className="text-xs font-bold text-white">
                                {uploadProgress.video || 'Uploading video from device...'}
                              </span>
                              <span className="text-[10px] text-gray-400 mt-1">Please wait while the media file uploads</span>
                            </div>
                          ) : formData.videoUrl ? (
                            <div className="w-full flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                                <FileVideo className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-white max-w-full truncate px-2">
                                {uploadedVideoFile?.name || formData.videoUrl.split('/').pop()}
                              </span>
                              {uploadedVideoFile?.size && (
                                <span className="text-[10px] text-gray-400">{uploadedVideoFile.size}</span>
                              )}
                              <span className="text-[11px] text-accent-cyan hover:underline mt-2 font-semibold">
                                Click or drag to replace video
                              </span>
                            </div>
                          ) : (
                            <div className="py-3 flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-dark-800 text-accent-cyan flex items-center justify-center mb-2">
                                <Upload className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-white">
                                Click to select video from your device
                              </span>
                              <span className="text-[10px] text-gray-400 mt-1">
                                Supports MP4, WebM, MOV, MKV (up to 500MB)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Live Video Preview if uploaded */}
                        {formData.videoUrl && (
                          <div className="rounded-xl overflow-hidden border border-dark-700 bg-black">
                            <video
                              src={formData.videoUrl}
                              controls
                              className="w-full max-h-36 object-contain"
                              onLoadedMetadata={(e: any) => {
                                const sec = Math.round(e.target.duration);
                                if (sec > 0 && !formData.duration) {
                                  const mins = Math.floor(sec / 60);
                                  setFormData(prev => ({ ...prev, duration: `${mins} mins` }));
                                }
                              }}
                            >
                              Your browser does not support HTML5 video preview.
                            </video>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          required
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... or MP4 URL"
                          className="w-full px-3.5 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                        />
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          Paste YouTube, Vimeo, or direct cloud video stream link.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Upload Block */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-300">
                        Cover Thumbnail
                      </label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setThumbnailSourceMode(thumbnailSourceMode === 'DEVICE' ? 'URL' : 'DEVICE')}
                          className="text-accent-cyan hover:underline"
                        >
                          {thumbnailSourceMode === 'DEVICE' ? 'Switch to Image URL' : 'Switch to Device Upload'}
                        </button>
                      </div>
                    </div>

                    {thumbnailSourceMode === 'DEVICE' ? (
                      <div className="space-y-2">
                        <input
                          ref={thumbnailFileInputRef}
                          type="file"
                          accept="image/*,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0], 'thumbnail');
                            }
                          }}
                        />

                        <div
                          onClick={() => !uploadingThumbnail && thumbnailFileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleFileUpload(e.dataTransfer.files[0], 'thumbnail');
                            }
                          }}
                          className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            uploadingThumbnail
                              ? 'border-accent-cyan bg-accent-cyan/10'
                              : formData.thumbnailUrl
                              ? 'border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500'
                              : 'border-dark-700 bg-dark-950 hover:border-accent-cyan/60 hover:bg-dark-900'
                          }`}
                        >
                          {uploadingThumbnail ? (
                            <div className="py-3 flex flex-col items-center">
                              <RefreshCw className="w-7 h-7 text-accent-cyan animate-spin mb-2" />
                              <span className="text-xs font-bold text-white">
                                {uploadProgress.thumbnail || 'Uploading image...'}
                              </span>
                            </div>
                          ) : formData.thumbnailUrl ? (
                            <div className="w-full flex items-center space-x-3">
                              <img
                                src={formData.thumbnailUrl}
                                alt="Thumbnail Preview"
                                className="w-16 h-12 object-cover rounded-lg border border-dark-700 bg-dark-950 flex-shrink-0"
                              />
                              <div className="flex-1 text-left truncate">
                                <span className="text-xs font-bold text-white block truncate">
                                  {uploadedThumbnailFile?.name || 'Cover Thumbnail Ready'}
                                </span>
                                <span className="text-[10px] text-accent-cyan hover:underline font-semibold">
                                  Click to change image
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="py-3 flex flex-col items-center">
                              <div className="h-10 w-10 rounded-full bg-dark-800 text-accent-cyan flex items-center justify-center mb-2">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-white">
                                Upload thumbnail from device
                              </span>
                              <span className="text-[10px] text-gray-400 mt-1">
                                PNG, JPG, WebP (16:9 recommended)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={formData.thumbnailUrl}
                          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                        />
                        {formData.thumbnailUrl && (
                          <div className="mt-2 flex items-center space-x-2">
                            <img
                              src={formData.thumbnailUrl}
                              alt="Thumbnail Preview"
                              className="w-12 h-8 rounded object-cover bg-dark-950 border border-dark-700"
                              onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                            <span className="text-[10px] text-gray-400">Live URL Image Preview</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* Section 3: Audience Access Control */}
              <div className="space-y-3 pt-3 border-t border-dark-800">
                <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> 3. Audience Access Control & Restrictions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Radio 1: All Members */}
                  <label 
                    onClick={() => setFormData({ ...formData, accessType: 'ALL_MEMBERS' })}
                    className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.accessType === 'ALL_MEMBERS'
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md'
                        : 'bg-dark-950 border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accessType"
                      checked={formData.accessType === 'ALL_MEMBERS'}
                      onChange={() => setFormData({ ...formData, accessType: 'ALL_MEMBERS' })}
                      className="mt-0.5 mr-3 accent-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        All Members (Open to All)
                      </span>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Free for any registered platform member. Perfect for foundational lessons & webinars.
                      </p>
                    </div>
                  </label>

                  {/* Radio 2: Plan Members */}
                  <label 
                    onClick={() => setFormData({ ...formData, accessType: 'PLAN_MEMBERS' })}
                    className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.accessType === 'PLAN_MEMBERS'
                        ? 'bg-accent-gold/10 border-accent-gold/50 shadow-md'
                        : 'bg-dark-950 border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accessType"
                      checked={formData.accessType === 'PLAN_MEMBERS'}
                      onChange={() => setFormData({ ...formData, accessType: 'PLAN_MEMBERS' })}
                      className="mt-0.5 mr-3 accent-yellow-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-accent-gold" />
                        Plan Members Only (Exclusive)
                      </span>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Restricted to active paying subscribers. Unsubscribed members see a locked card.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Plan Members Specific Configuration */}
                {formData.accessType === 'PLAN_MEMBERS' && (
                  <div className="p-4 rounded-xl bg-dark-950 border border-accent-gold/30 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-accent-gold mb-1">
                          Minimum Required Access Tier
                        </label>
                        <select
                          value={formData.requiredTier}
                          onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value as any })}
                          className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-gold"
                        >
                          <option value="BASIC">Basic Tier & Above</option>
                          <option value="PREMIUM">Premium Tier & Above</option>
                          <option value="VIP">VIP Tier Only (Elite)</option>
                        </select>
                      </div>
                    </div>

                    {plans.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                          Allowed Plans (Subscribers with these plans can access):
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {plans.map((plan) => {
                            const isSelected = formData.allowedPlanIds.includes(plan.id);
                            return (
                              <button
                                key={plan.id}
                                type="button"
                                onClick={() => togglePlanSelection(plan.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                                  isSelected
                                    ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/50 shadow'
                                    : 'bg-dark-900 text-gray-400 border-dark-700 hover:text-white'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-gray-500" />}
                                <span>{plan.name} ({plan.accessTier})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 4: Description & Attachments */}
              <div className="space-y-3 pt-3 border-t border-dark-800">
                <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" /> 4. Description & Resource Attachments
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Session Description & Strategy Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key concepts covered, trade setups, risk management rules discussed..."
                    className="w-full px-3.5 py-2 bg-dark-950 border border-dark-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan"
                  />
                </div>

                {/* Attachments List */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-300">
                    Downloadable Resource Links (PDF Notes, Cheat Sheets, Indicators)
                  </label>
                  
                  {formData.resources.map((res, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-dark-950 border border-dark-800 text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
                        <span className="font-semibold text-white truncate">{res.title}</span>
                        <span className="text-gray-500 text-[11px] truncate">({res.url})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(idx)}
                        className="text-gray-400 hover:text-accent-rose p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      placeholder="Resource Title (e.g. ORB Cheat Sheet PDF)"
                      className="flex-1 px-3 py-1.5 bg-dark-950 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                    <input
                      type="text"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      placeholder="Resource Download Link (https://...)"
                      className="flex-1 px-3 py-1.5 bg-dark-950 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                    <button
                      type="button"
                      onClick={handleAddResource}
                      className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-accent-cyan hover:text-white font-semibold text-xs border border-dark-700"
                    >
                      + Add Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 5: Publishing Status */}
              <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded bg-dark-950 border-dark-700 text-accent-cyan focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-white">
                    Publish Session Immediately (Visible to authorized members)
                  </span>
                </label>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="lime-gradient-btn !text-xs !py-2 !px-6"
                  >
                    {submitting ? 'Saving Session...' : editingVideo ? 'Save Changes' : 'Upload Session'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* THEATER VIDEO PLAYER MODAL */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl overflow-hidden text-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-dark-950 border-b border-dark-800">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{previewVideo.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                    <span>By {previewVideo.instructor}</span>
                    <span>•</span>
                    <span>{previewVideo.category}</span>
                    <span>•</span>
                    <span>{previewVideo.duration}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-lg bg-dark-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full bg-black">
              {previewVideo.videoUrl.includes('youtube.com') || previewVideo.videoUrl.includes('youtu.be') || previewVideo.videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={getEmbedVideoUrl(previewVideo.videoUrl)}
                  title={previewVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              )}
            </div>

            {/* Details & Resources Footer */}
            <div className="p-4 bg-dark-900 space-y-3 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {previewVideo.accessType === 'PLAN_MEMBERS' ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
                      <Crown className="w-3.5 h-3.5" />
                      {previewVideo.requiredTier} Plan Restricted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Users className="w-3.5 h-3.5" />
                      All Members Free Access
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-500" /> {previewVideo.viewsCount || 0} views
                  </span>
                </div>

                <span className="text-xs text-gray-400">
                  Recorded: {previewVideo.sessionDate ? new Date(previewVideo.sessionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {previewVideo.description && (
                <p className="text-xs text-gray-300 leading-relaxed bg-dark-950 p-3 rounded-xl border border-dark-800">
                  {previewVideo.description}
                </p>
              )}

              {Array.isArray(previewVideo.resourceUrls) && previewVideo.resourceUrls.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Attached Lesson Resources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {previewVideo.resourceUrls.map((res, i) => (
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

      {/* DELETE CONFIRMATION MODAL */}
      {deletingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-dark-900 border border-accent-rose/40 p-6 shadow-2xl text-gray-200">
            <div className="flex items-center space-x-3 text-accent-rose mb-3">
              <div className="h-10 w-10 rounded-full bg-accent-rose/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Video Session</h3>
                <p className="text-xs text-gray-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-4 bg-dark-950 p-3 rounded-xl border border-dark-800">
              Are you sure you want to permanently remove <strong className="text-white">"{deletingVideo.title}"</strong>?
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeletingVideo(null)}
                className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-accent-rose hover:bg-red-600 text-xs font-bold text-white shadow-lg shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
