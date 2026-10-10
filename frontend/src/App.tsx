import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { AdminSidebar } from './components/AdminSidebar.js';
import { ErpTopBar } from './components/ErpTopBar.js';
import { ClientSidebar } from './components/ClientSidebar.js';
import { ClientTopBar } from './components/ClientTopBar.js';

// Core Pages
import { LandingPage } from './pages/LandingPage.js';
import { PricingPage } from './pages/PricingPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { UserDashboard } from './pages/UserDashboard.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { UserManagement } from './pages/UserManagement.js';
import { PlanManagement } from './pages/PlanManagement.js';
import { TradeManagement } from './pages/TradeManagement.js';
import { AuditLogs } from './pages/AuditLogs.js';
import { VideoManagement } from './pages/VideoManagement.js';
import { UserVideosPage } from './pages/UserVideosPage.js';

// Advanced Module Pages
import { AiAssistantPage } from './pages/AiAssistantPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { TradingJournalPage } from './pages/TradingJournalPage.js';
import { ReferralDashboardPage } from './pages/ReferralDashboardPage.js';
import { CoursesMarketplacePage } from './pages/CoursesMarketplacePage.js';
import { CourseDetailPage } from './pages/CourseDetailPage.js';
import { MyCoursesPage } from './pages/MyCoursesPage.js';
import { CertificateVerificationPage } from './pages/CertificateVerificationPage.js';
import { WebinarsPage } from './pages/WebinarsPage.js';

// Admin Advanced Module Pages
import { AdminAiManagement } from './pages/AdminAiManagement.js';
import { AdminCourseManagement } from './pages/AdminCourseManagement.js';
import { AdminWebinarManagement } from './pages/AdminWebinarManagement.js';
import { AdminReferralManagement } from './pages/AdminReferralManagement.js';
import { AdminPayoutManagement } from './pages/AdminPayoutManagement.js';
import { AdminCouponsManagement } from './pages/AdminCouponsManagement.js';

// Scalper Akash V2 Ecosystem Pages
import { TradingToolsPage } from './pages/TradingToolsPage';
import { PlaybooksPage } from './pages/PlaybooksPage';
import { CommunityPage } from './pages/CommunityPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { StrategyLabPage } from './pages/StrategyLabPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CertificatesPage } from './pages/CertificatesPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';

import { WebinarLiveRoomPage } from './pages/WebinarLiveRoomPage.js';

// Admin V2 ERP Pages
import { AdminCrmManagement } from './pages/AdminCrmManagement';
import { AdminPlaybooksManagement } from './pages/AdminPlaybooksManagement';
import { AdminMentorshipManagement } from './pages/AdminMentorshipManagement';
import { AdminCommunityManagement } from './pages/AdminCommunityManagement';
import { AdminMarketplaceManagement } from './pages/AdminMarketplaceManagement';
import { AdminCmsManagement } from './pages/AdminCmsManagement';
import { AdminBroadcastManagement } from './pages/AdminBroadcastManagement';
import { AdminTelegramPostManagement } from './pages/AdminTelegramPostManagement';

// Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-950 text-gray-400">
        <span>Loading session context...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const hasRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user, token, isLoading } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const hasAdminRole = user?.roles?.some(r => ['ADMIN', 'SUPER_ADMIN', 'TRADER'].includes(r));
  const showErpLayout = isAdminRoute && (hasAdminRole || (isLoading && !!token));

  const isClientDashboardRoute = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/course/') ||
    ['/history', '/profile', '/notifications', '/sessions'].includes(location.pathname);

  const showClientConsoleLayout = isClientDashboardRoute && (user || (isLoading && !!token)) && !isAdminRoute;

  if (showErpLayout) {
    return (
      <div className="flex h-screen w-screen bg-dark-950 text-gray-100 overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
          <ErpTopBar />
          <main className="flex-1 overflow-y-auto bg-dark-950 p-6 md:p-8 scrollbar-thin">
            <Routes>
              {/* Executive Revenue & CRM ERP */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/crm" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminCrmManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/trades" 
                element={
                  <ProtectedRoute allowedRoles={['TRADER', 'ADMIN', 'SUPER_ADMIN']}>
                    <TradeManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/telegram" 
                element={
                  <ProtectedRoute allowedRoles={['TRADER', 'ADMIN', 'SUPER_ADMIN']}>
                    <AdminTelegramPostManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/videos" 
                element={
                  <ProtectedRoute allowedRoles={['TRADER', 'ADMIN', 'SUPER_ADMIN']}>
                    <VideoManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/playbooks" 
                element={
                  <ProtectedRoute allowedRoles={['TRADER', 'ADMIN', 'SUPER_ADMIN']}>
                    <AdminPlaybooksManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Education, Mentorship & Community */}
              <Route 
                path="/admin/courses" 
                element={
                  <ProtectedRoute allowedRoles={['TRADER', 'ADMIN', 'SUPER_ADMIN']}>
                    <AdminCourseManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/webinars" 
                element={
                  <ProtectedRoute allowedRoles={['TRADER', 'ADMIN', 'SUPER_ADMIN']}>
                    <AdminWebinarManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/mentorship" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminMentorshipManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/community" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminCommunityManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Commerce, Marketplace & Affiliates */}
              <Route 
                path="/admin/marketplace" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminMarketplaceManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/plans" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <PlanManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/coupons" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminCouponsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/referrals" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminReferralManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/referrals/payouts" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminPayoutManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Governance, CMS & Audit */}
              <Route 
                path="/admin/ai-assistant" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminAiManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/cms" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminCmsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/broadcasts" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AdminBroadcastManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/audit-logs" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                    <AuditLogs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'TRADER']}>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/notifications" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'TRADER']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  if (showClientConsoleLayout) {
    return (
      <div className="flex h-screen w-screen bg-dark-950 text-gray-100 overflow-hidden">
        <ClientSidebar />
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
          <ClientTopBar />
          <main className="flex-1 overflow-y-auto bg-dark-950 p-6 md:p-8 scrollbar-thin">
            <Routes>
              {/* Authenticated Client Views */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/tools" 
                element={
                  <ProtectedRoute>
                    <TradingToolsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/playbooks" 
                element={
                  <ProtectedRoute>
                    <PlaybooksPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/community" 
                element={
                  <ProtectedRoute>
                    <CommunityPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/mentorship" 
                element={
                  <ProtectedRoute>
                    <MentorshipPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/strategy-lab" 
                element={
                  <ProtectedRoute>
                    <StrategyLabPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/marketplace" 
                element={
                  <ProtectedRoute>
                    <MarketplacePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/certificates" 
                element={
                  <ProtectedRoute>
                    <CertificatesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/analytics" 
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/journal" 
                element={
                  <ProtectedRoute>
                    <TradingJournalPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/ai-assistant" 
                element={
                  <ProtectedRoute>
                    <AiAssistantPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/catalog" 
                element={
                  <ProtectedRoute>
                    <CoursesMarketplacePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/courses" 
                element={
                  <ProtectedRoute>
                    <MyCoursesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/course/:slug" 
                element={
                  <ProtectedRoute>
                    <CourseDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/course/:slug" 
                element={
                  <ProtectedRoute>
                    <CourseDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/webinars" 
                element={
                  <ProtectedRoute>
                    <WebinarsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/webinars/:id/room" 
                element={
                  <ProtectedRoute>
                    <WebinarLiveRoomPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/plans" 
                element={
                  <ProtectedRoute>
                    <PricingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/referrals" 
                element={
                  <ProtectedRoute>
                    <ReferralDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/checkout" 
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sessions" 
                element={
                  <ProtectedRoute>
                    <UserVideosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-950 text-gray-100">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/tools" element={<TradingToolsPage />} />
          <Route path="/playbooks" element={<PlaybooksPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/mentorship" element={<MentorshipPage />} />
          <Route path="/strategy-lab" element={<StrategyLabPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/courses" element={<CoursesMarketplacePage />} />
          <Route path="/course/:slug" element={<CourseDetailPage />} />
          <Route path="/webinars" element={<WebinarsPage />} />
          <Route path="/webinars/:id/room" element={<WebinarLiveRoomPage />} />
          <Route path="/verify-certificate/:certificateId" element={<CertificateVerificationPage />} />
          <Route path="/verify/certificate/:certificateId" element={<CertificateVerificationPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Fallback Checkout Route */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
