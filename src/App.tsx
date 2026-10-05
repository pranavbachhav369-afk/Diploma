import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { MaterialCatalog } from './components/MaterialCatalog';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminPanel } from './components/AdminPanel';
import { PDFViewerModal } from './components/PDFViewerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CourseDetailView } from './components/CourseDetailView';
import { StudentAuthModal } from './components/StudentAuthModal';
import { MobileQRModal } from './components/MobileQRModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CourseItem } from './types';
import { Smartphone, Monitor } from 'lucide-react';

function MainApp() {
  const { student } = useAuth();

  // Navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'browse' | 'dashboard' | 'admin'>('home');
  const [navParams, setNavParams] = useState<any>({});

  // Mobile Device Simulator
  const [isMobileSimulatorActive, setIsMobileSimulatorActive] = useState(false);

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [mobileQROpen, setMobileQROpen] = useState(false);

  // Course Details modal
  const [courseDetailModalOpen, setCourseDetailModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [enrollingCourse, setEnrollingCourse] = useState<CourseItem | undefined>(undefined);

  // PDF Viewer modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfDocumentId, setPdfDocumentId] = useState<string | null>(null);

  const handleNavigateTab = (tab: 'home' | 'browse' | 'dashboard' | 'admin', extraParams: any = {}) => {
    setCurrentTab(tab);
    setNavParams(extraParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleViewCourseDetails = (course: CourseItem) => {
    setSelectedCourseId(course.id);
    setCourseDetailModalOpen(true);
  };

  const handleEnrollCourse = (course: CourseItem) => {
    if (!student) {
      handleOpenAuth('login');
      return;
    }
    setEnrollingCourse(course);
    setCheckoutModalOpen(true);
  };

  const handleOpenSecureReader = (pdfId: string) => {
    setPdfDocumentId(pdfId);
    setPdfModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Navigate to student dashboard
    handleNavigateTab('dashboard', { tab: 'purchases' });
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 ${isMobileSimulatorActive ? 'py-6 px-2 bg-slate-900/90' : ''}`}>
      {/* Mobile Simulator Control Bar for Desktop Testers */}
      <div className="hidden lg:flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Diploma Rankers Live Platform</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Classplus Curriculum &amp; Folder Architecture</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileQROpen(true)}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 Test on Phone (Scan QR)</span>
          </button>
          <button
            onClick={() => setIsMobileSimulatorActive(!isMobileSimulatorActive)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isMobileSimulatorActive
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isMobileSimulatorActive ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Exit Phone Frame</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulate Phone View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container (Simulator Container if active) */}
      <div
        className={
          isMobileSimulatorActive
            ? 'w-full max-w-[420px] mx-auto min-h-[850px] bg-slate-950 border-[10px] border-slate-800 rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative my-auto'
            : 'flex-1 flex flex-col'
        }
      >
        {/* Mobile Frame Speaker / Camera Notch if Simulator Active */}
        {isMobileSimulatorActive && (
          <div className="w-full bg-slate-950 pt-2 pb-1 flex justify-center items-center z-50">
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-950" />
              <div className="w-8 h-1 rounded-full bg-slate-800" />
            </div>
          </div>
        )}

        {/* Top Navbar */}
        {currentTab !== 'admin' && (
          <Navbar
            onOpenAuth={handleOpenAuth}
            onNavigateTab={handleNavigateTab}
            currentTab={currentTab}
            onOpenMobileQR={() => setMobileQROpen(true)}
          />
        )}

        {/* Main Pages */}
        <main className="flex-1 pb-16 md:pb-0">
          {currentTab === 'home' && (
            <HomePage
              onNavigateTab={handleNavigateTab}
              onViewCourseDetails={handleViewCourseDetails}
              onEnrollCourse={handleEnrollCourse}
              onOpenSecureReader={handleOpenSecureReader}
            />
          )}

          {currentTab === 'browse' && (
            <MaterialCatalog
              initialBranch={navParams.initialBranch}
              initialSemester={navParams.initialSemester}
              initialSearch={navParams.searchQuery || navParams.initialSearch}
              onViewCourseDetails={handleViewCourseDetails}
              onEnrollCourse={handleEnrollCourse}
            />
          )}

          {currentTab === 'dashboard' && (
            student ? (
              <StudentDashboard
                initialTab={navParams.tab || 'purchases'}
                onOpenSecureReader={handleOpenSecureReader}
                onExploreMaterials={() => handleNavigateTab('browse')}
              />
            ) : (
              <div className="max-w-md mx-auto my-24 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl mx-4">
                <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold">🔒</span>
                </div>
                <h3 className="text-lg font-bold text-white">Student Login Required</h3>
                <p className="text-xs text-slate-400">
                  Please log in or create an account to view your enrolled MSBTE diploma courses and PDFs.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow"
                  >
                    Log In / Register
                  </button>
                </div>
              </div>
            )
          )}

          {currentTab === 'admin' && (
            <AdminPanel
              onBackToStudentView={() => handleNavigateTab('home')}
              onOpenSecureReader={handleOpenSecureReader}
              onOpenMobileQR={() => setMobileQROpen(true)}
            />
          )}
        </main>

        {/* Footer */}
        {currentTab !== 'admin' && (
          <Footer
            onSelectBranch={(code) => handleNavigateTab('browse', { initialBranch: code })}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {/* Classplus Native Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          currentTab={currentTab}
          onNavigateTab={handleNavigateTab}
          onOpenMobileQR={() => setMobileQROpen(true)}
        />
      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE MODALS */}
      {/* ========================================================= */}

      {/* Classplus Course Curriculum & Folder View */}
      {courseDetailModalOpen && selectedCourseId && (
        <CourseDetailView
          courseId={selectedCourseId}
          onClose={() => {
            setCourseDetailModalOpen(false);
            setSelectedCourseId(null);
          }}
          onEnrollCourse={handleEnrollCourse}
          onOpenSecureReader={handleOpenSecureReader}
        />
      )}

      {/* Student Auth Modal */}
      {authModalOpen && (
        <StudentAuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setAuthModalOpen(false)}
        />
      )}

      {/* Checkout & Enrollment Modal */}
      {checkoutModalOpen && (
        <CheckoutModal
          courseToEnroll={enrollingCourse}
          onClose={() => {
            setCheckoutModalOpen(false);
            setEnrollingCourse(undefined);
          }}
          onSuccess={handlePaymentSuccess}
          onOpenAuth={() => handleOpenAuth('login')}
        />
      )}

      {/* Secure Watermarked PDF Viewer */}
      {pdfModalOpen && pdfDocumentId && (
        <PDFViewerModal
          materialId={pdfDocumentId}
          onClose={() => {
            setPdfModalOpen(false);
            setPdfDocumentId(null);
          }}
          onBuyNow={() => {
            setPdfModalOpen(false);
            handleNavigateTab('browse');
          }}
        />
      )}

      {/* Mobile QR Scanner Modal */}
      {mobileQROpen && (
        <MobileQRModal
          onClose={() => setMobileQROpen(false)}
          onToggleMobileSimulator={() => setIsMobileSimulatorActive(!isMobileSimulatorActive)}
          isSimulatorActive={isMobileSimulatorActive}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
