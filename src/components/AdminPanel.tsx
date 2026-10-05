import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BarChart3,
  BookOpen,
  FolderTree,
  FolderPlus,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  XCircle,
  Eye,
  LogOut,
  Upload,
  ArrowLeft,
  Search,
  DollarSign,
  TrendingUp,
  FileText,
  Lock,
  ChevronRight,
  ChevronDown,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Folder,
  Layers,
  Check,
  Smartphone,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CourseItem, SubcourseItem, FolderItem, PDFItem, Branch } from '../types';

interface AdminPanelProps {
  onBackToStudentView: () => void;
  onOpenSecureReader: (pdfId: string) => void;
  onOpenMobileQR?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToStudentView,
  onOpenSecureReader,
  onOpenMobileQR
}) => {
  const { admin, loginAdmin, logoutAdmin } = useAuth();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'courses' | 'content_manager' | 'students' | 'analytics'>('courses');

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Selected Course for deep Classplus Content Manager
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>(null);

  // Confirmation modal for Wiping all courses & PDFs
  const [showWipeModal, setShowWipeModal] = useState(false);

  // Edit Course Modal
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);

  // Grant Access Modal
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantTargetUser, setGrantTargetUser] = useState<any>(null);
  const [grantTargetCourseId, setGrantTargetCourseId] = useState<string>('');

  // Create Course Form
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubtitle, setNewCourseSubtitle] = useState('');
  const [newCourseBranch, setNewCourseBranch] = useState('Computer Engineering');
  const [newCourseSemester, setNewCourseSemester] = useState(5);
  const [newCourseYear, setNewCourseYear] = useState('3rd Year');
  const [newCoursePrice, setNewCoursePrice] = useState<number>(120);
  const [newCourseDiscountPrice, setNewCourseDiscountPrice] = useState<number>(49);
  const [newCourseIsFree, setNewCourseIsFree] = useState(false);
  const [newCourseValidity, setNewCourseValidity] = useState('MSBTE Winter/Summer Exam (Lifetime)');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);

  // Create Subcourse Form
  const [showCreateSubcourseModal, setShowCreateSubcourseModal] = useState(false);
  const [newSubcourseTitle, setNewSubcourseTitle] = useState('');
  const [newSubcourseCode, setNewSubcourseCode] = useState('');
  const [newSubcoursePrice, setNewSubcoursePrice] = useState<number | ''>(25);

  // Create Folder Form
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [targetSubcourseId, setTargetSubcourseId] = useState('');
  const [targetParentFolderId, setTargetParentFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // Upload PDF Form
  const [showUploadPDFModal, setShowUploadPDFModal] = useState(false);
  const [targetUploadFolderId, setTargetUploadFolderId] = useState('');
  const [targetUploadSubcourseId, setTargetUploadSubcourseId] = useState('');
  const [newPDFTitle, setNewPDFTitle] = useState('');
  const [newPDFDesc, setNewPDFDesc] = useState('');
  const [newPDFPages, setNewPDFPages] = useState<number>(45);
  const [newPDFIsFreePreview, setNewPDFIsFreePreview] = useState(false);
  const [newPDFPrice, setNewPDFPrice] = useState<number | ''>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const loadData = async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const [crsRes, brRes, anRes, stdRes] = await Promise.all([
        api.getCourses({ all: true }),
        api.getBranches(),
        api.adminGetAnalytics(),
        api.adminGetStudents().catch(() => [])
      ]);
      setCourses(crsRes || []);
      setBranches(brRes || []);
      setAnalytics(anRes);
      setStudents(stdRes || []);

      if (crsRes?.length && !selectedCourseId) {
        setSelectedCourseId(crsRes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadData();
    }
  }, [admin]);

  // Load detailed subcourses & folders when selectedCourseId changes
  useEffect(() => {
    if (selectedCourseId) {
      api.getCourseById(selectedCourseId).then(data => {
        setSelectedCourseDetails(data);
      }).catch(console.error);
    } else {
      setSelectedCourseDetails(null);
    }
  }, [selectedCourseId]);

  const showNotification = (text: string, isError = false) => {
    setActionMsg({ text, isError });
    setTimeout(() => setActionMsg(null), 4000);
  };

  // 1. Delete All Courses & PDFs
  const handleWipeAll = async () => {
    if (!confirm('⚠️ WARNING: Are you sure you want to DELETE ALL courses, subcourses, folders, and PDFs? This cannot be undone.')) {
      return;
    }
    try {
      await api.adminWipeAllCoursesAndPDFs();
      setSelectedCourseId('');
      setSelectedCourseDetails(null);
      await loadData();
      showNotification('All courses, folders and PDFs wiped clean.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to wipe courses', true);
    }
  };

  // 2. Seed Default Template
  const handleSeedDefault = async () => {
    try {
      await api.adminSeedDefaultTemplate();
      await loadData();
      showNotification('Seeded Classplus Master Batch template with subcourses and PDFs!');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to seed template', true);
    }
  };

  // 3. Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.adminCreateCourse({
        title: newCourseTitle,
        subtitle: newCourseSubtitle,
        branch: newCourseBranch,
        semester: Number(newCourseSemester),
        year: newCourseYear,
        description: newCourseDesc,
        price: Number(newCoursePrice),
        discount_price: Number(newCourseDiscountPrice),
        validity: newCourseValidity
      });
      setShowCreateCourseModal(false);
      setNewCourseTitle('');
      setNewCourseSubtitle('');
      setNewCourseDesc('');
      await loadData();
      setSelectedCourseId(created.id);
      showNotification(`Course "${created.title}" published!`);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to create course', true);
    }
  };

  // 4. Quick Price Update
  const handleUpdatePrice = async (courseId: string, price: number, discountPrice: number) => {
    try {
      await api.adminUpdateCourse(courseId, { price, discount_price: discountPrice });
      await loadData();
      showNotification('Price updated successfully! Live on student side.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update price', true);
    }
  };

  // 5. Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Delete this entire course and all its folders & PDFs?')) return;
    try {
      await api.adminDeleteCourse(courseId);
      if (selectedCourseId === courseId) {
        setSelectedCourseId('');
      }
      await loadData();
      showNotification('Course deleted.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete course', true);
    }
  };

  // Full Course Update (Title, Description, Validity, Prices, Published status)
  const handleUpdateCourseFull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await api.adminUpdateCourse(editingCourse.id, {
        title: editingCourse.title,
        subtitle: editingCourse.subtitle,
        branch: editingCourse.branch,
        semester: Number(editingCourse.semester),
        year: editingCourse.year,
        description: editingCourse.description,
        price: Number(editingCourse.price),
        discount_price: editingCourse.discount_price !== undefined ? Number(editingCourse.discount_price) : Number(editingCourse.price),
        validity: editingCourse.validity,
        is_published: editingCourse.is_published
      });
      setEditingCourse(null);
      await loadData();
      showNotification('Course details and pricing updated!');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update course', true);
    }
  };

  // Grant Access to Student (Direct free enrollment)
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantTargetUser || !grantTargetCourseId) return;
    try {
      await api.adminGrantAccess({
        user_id: grantTargetUser.id,
        item_type: 'course',
        item_id: grantTargetCourseId
      });
      setShowGrantModal(false);
      setGrantTargetUser(null);
      setGrantTargetCourseId('');
      await loadData();
      showNotification(`Enrolled student into course successfully!`);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to grant access', true);
    }
  };

  // Revoke Access
  const handleRevokeAccess = async (userId: string, courseId: string) => {
    if (!confirm('Revoke access for this student to this course?')) return;
    try {
      await api.adminRevokeAccess({ user_id: userId, item_id: courseId });
      await loadData();
      showNotification('Student access revoked.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to revoke access', true);
    }
  };

  // 6. Create Subcourse
  const handleCreateSubcourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !newSubcourseTitle) return;
    try {
      await api.adminCreateSubcourse({
        course_id: selectedCourseId,
        title: newSubcourseTitle,
        subject_code: newSubcourseCode,
        price: newSubcoursePrice ? Number(newSubcoursePrice) : undefined
      });
      setShowCreateSubcourseModal(false);
      setNewSubcourseTitle('');
      setNewSubcourseCode('');
      // Reload details
      const updatedDetails = await api.getCourseById(selectedCourseId);
      setSelectedCourseDetails(updatedDetails);
      showNotification('Subcourse / Subject added!');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to add subcourse', true);
    }
  };

  // 7. Delete Subcourse
  const handleDeleteSubcourse = async (subcourseId: string) => {
    if (!confirm('Delete this subcourse and all folders inside it?')) return;
    try {
      await api.adminDeleteSubcourse(subcourseId);
      const updatedDetails = await api.getCourseById(selectedCourseId);
      setSelectedCourseDetails(updatedDetails);
      showNotification('Subcourse deleted.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete subcourse', true);
    }
  };

  // 8. Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName || !targetSubcourseId) return;
    try {
      await api.adminCreateFolder({
        course_id: selectedCourseId,
        subcourse_id: targetSubcourseId,
        parent_folder_id: targetParentFolderId,
        name: newFolderName
      });
      setShowCreateFolderModal(false);
      setNewFolderName('');
      const updatedDetails = await api.getCourseById(selectedCourseId);
      setSelectedCourseDetails(updatedDetails);
      showNotification('Folder created successfully!');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to create folder', true);
    }
  };

  // 9. Delete Folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all documents inside?')) return;
    try {
      await api.adminDeleteFolder(folderId);
      const updatedDetails = await api.getCourseById(selectedCourseId);
      setSelectedCourseDetails(updatedDetails);
      showNotification('Folder deleted.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete folder', true);
    }
  };

  // 10. Upload PDF into Folder
  const handleUploadPDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPDFTitle || !targetUploadFolderId) return;
    try {
      await api.adminCreatePDF({
        course_id: selectedCourseId,
        subcourse_id: targetUploadSubcourseId,
        folder_id: targetUploadFolderId,
        title: newPDFTitle,
        description: newPDFDesc,
        total_pages: Number(newPDFPages),
        is_free_preview: newPDFIsFreePreview,
        price: newPDFPrice ? Number(newPDFPrice) : undefined
      });
      setShowUploadPDFModal(false);
      setNewPDFTitle('');
      setNewPDFDesc('');
      const updatedDetails = await api.getCourseById(selectedCourseId);
      setSelectedCourseDetails(updatedDetails);
      showNotification('PDF Document published in folder! Immediately available to students.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to upload PDF', true);
    }
  };

  // 11. Delete PDF
  const handleDeletePDF = async (pdfId: string) => {
    if (!confirm('Delete this PDF file?')) return;
    try {
      await api.adminDeletePDF(pdfId);
      const updatedDetails = await api.getCourseById(selectedCourseId);
      setSelectedCourseDetails(updatedDetails);
      showNotification('PDF Document removed.');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete PDF', true);
    }
  };

  // 12. Toggle Free Preview on PDF
  const handleToggleFreePreview = async (pdf: PDFItem) => {
    try {
      await api.adminUpdatePDF(pdf.id, { is_free_preview: !pdf.is_free_preview });
      const updatedDetails = await api.getCourseById(selectedCourseId);
      setSelectedCourseDetails(updatedDetails);
      showNotification(`Free preview ${!pdf.is_free_preview ? 'enabled' : 'disabled'} for ${pdf.title}`);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update PDF', true);
    }
  };

  // Admin login flow
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await loginAdmin({ email: adminEmail.trim(), password: adminPassword });
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid admin credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mx-auto shadow-lg shadow-amber-400/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Administrator Portal</h2>
            <p className="text-xs text-slate-400">Classplus Course &amp; Folder Management</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@diplomarankers.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setAdminEmail('admin@diplomarankers.com');
                setAdminPassword('admin123');
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-slate-700"
            >
              Fill Demo Admin (admin@diplomarankers.com)
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onBackToStudentView}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">Classplus Course &amp; Folder Architect</span>
              <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{admin.email}</p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile QR Button */}
          {onOpenMobileQR && (
            <button
              onClick={onOpenMobileQR}
              className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold border border-amber-400/40 flex items-center gap-1.5"
              title="Open Admin on Mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">📱 Mobile QR</span>
            </button>
          )}

          {/* RESET / DELETE ALL BUTTON (Requested by user) */}
          <button
            onClick={() => setShowWipeModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5"
            title="Delete all courses and PDFs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Delete All Courses &amp; PDFs</span>
          </button>

          <button
            onClick={handleSeedDefault}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5"
            title="Seed template batch"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Seed Template</span>
          </button>

          <button
            onClick={onBackToStudentView}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student View</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 text-xs"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Toast Notification Alert */}
      {actionMsg && (
        <div
          className={`sticky top-16 z-40 p-3 text-center text-xs font-bold ${
            actionMsg.isError ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-slate-950'
          } shadow-lg`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Main Admin Section Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2.5 flex items-center gap-3 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'courses' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          📚 Manage Courses ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('content_manager')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'content_manager' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🗂️ Classplus Folder &amp; PDF Hierarchy
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'students' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 Students &amp; Access ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'analytics' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          📊 Revenue &amp; Enrolled Analytics
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: MANAGE COURSES (Classplus Batch View & Price Set) */}
        {/* ========================================================= */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">Main Diploma Courses &amp; Batches</h3>
                <p className="text-xs text-slate-400">
                  Create, configure pricing, and publish complete diploma preparation batches.
                </p>
              </div>

              <button
                onClick={() => setShowCreateCourseModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Course</span>
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">No courses created yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click "Create New Course" above to create your first MSBTE diploma course, or click "Seed Template" to load standard 5th semester content.
                </p>
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                >
                  Create First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => (
                  <div
                    key={course.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {course.branch}
                        </span>
                        <span className="text-slate-400 font-semibold">
                          Sem {course.semester} • {course.year}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white line-clamp-2">{course.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>

                      <div className="text-[11px] text-amber-300 font-medium">
                        ⏳ Validity: {course.validity}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl text-center text-[11px] text-slate-400 border border-slate-800">
                        <div>
                          <p className="font-bold text-white">{course.total_subcourses ?? 0}</p>
                          <p className="text-[10px]">Subjects</p>
                        </div>
                        <div>
                          <p className="font-bold text-white">{course.total_pdfs ?? 0}</p>
                          <p className="text-[10px]">PDFs</p>
                        </div>
                        <div>
                          <p className="font-bold text-amber-300">{course.enrolled_count ?? 0}</p>
                          <p className="text-[10px]">Enrolled</p>
                        </div>
                      </div>

                      {/* Inline Pricing Decider (User requested: "must be able to decoide price update price") */}
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Set Course Price (₹)
                        </span>
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Original Price:</span>
                            <input
                              type="number"
                              defaultValue={course.price}
                              onBlur={e =>
                                handleUpdatePrice(
                                  course.id,
                                  Number(e.target.value),
                                  course.discount_price ?? Number(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-400 font-semibold block">Discount / Selling:</span>
                            <input
                              type="number"
                              defaultValue={course.discount_price ?? course.price}
                              onBlur={e =>
                                handleUpdatePrice(
                                  course.id,
                                  course.price,
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 bg-slate-900 border border-emerald-500/50 rounded text-xs text-emerald-300 font-bold"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 ml-auto self-end">auto-saves</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setActiveTab('content_manager');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>Manage Folders &amp; PDFs</span>
                      </button>

                      <button
                        onClick={() => setEditingCourse(course)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                        title="Edit Course Details & Pricing"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CLASSPLUS FOLDER & PDF HIERARCHY MANAGER */}
        {/* ========================================================= */}
        {activeTab === 'content_manager' && (
          <div className="space-y-6">
            {/* Course Selector Dropdown */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Select Course to Manage:</span>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} (Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourseId && (
                <button
                  onClick={() => setShowCreateSubcourseModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subcourse / Subject</span>
                </button>
              )}
            </div>

            {/* Hierarchical Explorer */}
            {selectedCourseDetails ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-amber-400" />
                    <span>Curriculum Hierarchy: {selectedCourseDetails.title}</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    {selectedCourseDetails.subcourses?.length || 0} Subcourses
                  </span>
                </div>

                {(!selectedCourseDetails.subcourses || selectedCourseDetails.subcourses.length === 0) ? (
                  <div className="p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
                    <Layers className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-300">No subcourses or subjects in this course yet.</p>
                    <button
                      onClick={() => setShowCreateSubcourseModal(true)}
                      className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      + Add Subject / Subcourse
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCourseDetails.subcourses.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
                      >
                        {/* Subcourse Header */}
                        <div className="p-4 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                              {sub.subject_code || 'CODE'}
                            </span>
                            <div>
                              <h5 className="text-sm font-bold text-white">{sub.title}</h5>
                              <p className="text-[11px] text-slate-400">{sub.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              onClick={() => {
                                setTargetSubcourseId(sub.id);
                                setTargetParentFolderId(null);
                                setShowCreateFolderModal(true);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700"
                            >
                              <FolderPlus className="w-3.5 h-3.5" />
                              <span>Create Folder</span>
                            </button>

                            <button
                              onClick={() => handleDeleteSubcourse(sub.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                              title="Delete Subcourse"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Folders & Documents under this Subcourse */}
                        <div className="p-4 space-y-4 bg-slate-900/40">
                          {(!sub.folders || sub.folders.length === 0) ? (
                            <p className="text-xs text-slate-500 italic pl-3">
                              No folders yet. Click "+ Create Folder" to organize notes, question papers and model answers.
                            </p>
                          ) : (
                            sub.folders.map((fld: any) => (
                              <div
                                key={fld.id}
                                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
                                  <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-bold text-white">{fld.name}</span>
                                    <span className="text-[10px] text-slate-400">
                                      ({fld.pdfs?.length || 0} PDFs)
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setTargetUploadSubcourseId(sub.id);
                                        setTargetUploadFolderId(fld.id);
                                        setShowUploadPDFModal(true);
                                      }}
                                      className="px-2.5 py-1 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1 border border-amber-400/30"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Upload PDF</span>
                                    </button>

                                    <button
                                      onClick={() => handleDeleteFolder(fld.id)}
                                      className="p-1 text-slate-400 hover:text-rose-400"
                                      title="Delete Folder"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* PDFs in this Folder */}
                                {(!fld.pdfs || fld.pdfs.length === 0) ? (
                                  <p className="text-[11px] text-slate-500 pl-4 py-1">
                                    No PDFs uploaded in this folder yet.
                                  </p>
                                ) : (
                                  <div className="pl-2 space-y-2">
                                    {fld.pdfs.map((pdf: any) => (
                                      <div
                                        key={pdf.id}
                                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-xs font-semibold text-white truncate">
                                              {pdf.title}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                              {pdf.total_pages} Pages • {pdf.file_size}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs">
                                          {/* Free Preview Toggle (Classplus Feature) */}
                                          <button
                                            onClick={() => handleToggleFreePreview(pdf)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                              pdf.is_free_preview
                                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}
                                            title="Allow students to preview this PDF before purchasing"
                                          >
                                            {pdf.is_free_preview ? '✓ Free Preview' : '🔒 Locked'}
                                          </button>

                                          <button
                                            onClick={() => onOpenSecureReader(pdf.id)}
                                            className="p-1 text-slate-300 hover:text-white"
                                            title="View in Secure Reader"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>

                                          <button
                                            onClick={() => handleDeletePDF(pdf.id)}
                                            className="p-1 text-slate-400 hover:text-rose-400"
                                            title="Delete PDF"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a course to view and edit its folder hierarchy.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: STUDENTS & ACCESS MANAGEMENT (Classplus Access) */}
        {/* ========================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">Registered Students &amp; Direct Access</h3>
                <p className="text-xs text-slate-400">
                  Manage student profiles, grant free course enrollments (for offline/cash payments), or revoke access.
                </p>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No students registered yet. Students will appear here once they sign up.</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Branch &amp; Semester</th>
                        <th className="p-4">Mobile</th>
                        <th className="p-4">Enrolled Content</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {students.map((std: any) => (
                        <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-white text-xs">{std.name}</p>
                            <p className="text-[11px] text-slate-400">{std.email}</p>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-blue-300">{std.branch}</span>
                            <p className="text-[10px] text-slate-400">{std.year} • {std.semester}</p>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-300">
                            {std.mobile || '—'}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                {std.enrolled_count || 0} Enrolled
                              </span>
                              {std.enrolled_courses && std.enrolled_courses.length > 0 && (
                                <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">
                                  {std.enrolled_courses.join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setGrantTargetUser(std);
                                setGrantTargetCourseId(courses[0]?.id || '');
                                setShowGrantModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-xs border border-amber-400/40 transition-colors"
                            >
                              + Grant Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: REVENUE & ENROLLMENT ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white">Revenue &amp; Student Enrollments</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-400">Total Revenue</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">₹{analytics.total_revenue}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-400">Paid Orders</p>
                <p className="text-2xl font-black text-white mt-1">{analytics.successful_payments}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-400">Active Courses</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{analytics.total_courses}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-400">Total PDF Documents</p>
                <p className="text-2xl font-black text-blue-400 mt-1">{analytics.total_pdfs}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. Modal: Create Course */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 my-auto shadow-2xl">
            <h4 className="text-base font-bold text-white">Create New Diploma Course / Batch</h4>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Computer Engineering 5th Sem Master Course"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={newCourseSubtitle}
                  onChange={e => setNewCourseSubtitle(e.target.value)}
                  placeholder="e.g. All Notes, PYQs and Model Answers"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Branch</label>
                  <select
                    value={newCourseBranch}
                    onChange={e => setNewCourseBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option>Computer Engineering</option>
                    <option>Civil Engineering</option>
                    <option>Mechanical Engineering</option>
                    <option>Electrical Engineering</option>
                    <option>Electronics &amp; Telecommunication</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Semester</label>
                  <select
                    value={newCourseSemester}
                    onChange={e => setNewCourseSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(s => (
                      <option key={s} value={s}>{s}th Semester</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCoursePrice}
                    onChange={e => setNewCoursePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={newCourseDiscountPrice}
                    onChange={e => setNewCourseDiscountPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCourseDesc}
                  onChange={e => setNewCourseDesc(e.target.value)}
                  placeholder="Overview of syllabus, subjects included, exam tips..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Create &amp; Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Create Subcourse / Subject */}
      {showCreateSubcourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white">Add Subcourse / Subject</h4>
            <form onSubmit={handleCreateSubcourse} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={newSubcourseTitle}
                  onChange={e => setNewSubcourseTitle(e.target.value)}
                  placeholder="e.g. Software Engineering"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">MSBTE Subject Code</label>
                <input
                  type="text"
                  value={newSubcourseCode}
                  onChange={e => setNewSubcourseCode(e.target.value)}
                  placeholder="e.g. 22517"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSubcourseModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Create Folder */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white">Create New Folder</h4>
            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="e.g. Unit 1 Handwritten Notes or Model Answers"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Upload PDF Document */}
      {showUploadPDFModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 my-auto shadow-2xl">
            <h4 className="text-base font-bold text-white">Upload PDF into Folder</h4>
            <form onSubmit={handleUploadPDF} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newPDFTitle}
                  onChange={e => setNewPDFTitle(e.target.value)}
                  placeholder="e.g. Unit 1 Process Models Complete Notes.pdf"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Short Description</label>
                <input
                  type="text"
                  value={newPDFDesc}
                  onChange={e => setNewPDFDesc(e.target.value)}
                  placeholder="e.g. Handwritten topper notes with UML diagrams"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Total Pages</label>
                  <input
                    type="number"
                    min={1}
                    value={newPDFPages}
                    onChange={e => setNewPDFPages(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Standalone Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Included in course"
                    value={newPDFPrice}
                    onChange={e => setNewPDFPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Free Preview Mode</span>
                  <span className="text-[10px] text-slate-400">Allow students to read sample pages for free</span>
                </div>
                <input
                  type="checkbox"
                  checked={newPDFIsFreePreview}
                  onChange={e => setNewPDFIsFreePreview(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400"
                />
              </div>

              {/* Optional Local File Selection */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Select File from Computer / Mobile (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFileName(file.name);
                        if (!newPDFTitle) {
                          setNewPDFTitle(file.name);
                        }
                      }
                    }}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-300 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
                {selectedFileName && (
                  <p className="text-[10px] text-emerald-400 mt-1">✓ Selected: {selectedFileName}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadPDFModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Publish PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Confirm Wipe All Courses & PDFs (User Requested) */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white">Permanently Delete All Courses &amp; PDFs?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will completely wipe all courses, subcourses, folders, and uploaded PDF documents. You will get a 100% clean blank slate so you can build your own courses and folder hierarchy from scratch.
            </p>
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 text-left">
              ⚠️ <strong>Warning:</strong> Existing student enrollments to these courses will be cleared. This action cannot be undone.
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Cancel (Keep Content)
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowWipeModal(false);
                  await handleWipeAll();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Edit Course Details & Pricing (Classplus Price Decider) */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 my-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Edit Course &amp; Update Pricing</h4>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourseFull} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editingCourse.subtitle || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingCourse.price}
                    onChange={e => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 font-semibold block mb-1">Discount / Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editingCourse.discount_price ?? editingCourse.price}
                    onChange={e => setEditingCourse({ ...editingCourse, discount_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Validity Period</label>
                <input
                  type="text"
                  value={editingCourse.validity || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, validity: e.target.value })}
                  placeholder="e.g. MSBTE Winter/Summer Exam (Lifetime)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={editingCourse.description || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Course Publishing Status</span>
                  <span className="text-[10px] text-slate-400">
                    {editingCourse.is_published ? 'Visible to students in store' : 'Draft mode (hidden from students)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCourse({ ...editingCourse, is_published: !editingCourse.is_published })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    editingCourse.is_published
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {editingCourse.is_published ? '✓ Published' : 'Draft (Hidden)'}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Grant Course Access to Student */}
      {showGrantModal && grantTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white">Grant Free Course Access</h4>
            <p className="text-xs text-slate-400">
              Directly enroll <strong>{grantTargetUser.name}</strong> ({grantTargetUser.email}) into an MSBTE course without charging payment.
            </p>

            <form onSubmit={handleGrantAccess} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Select Course to Unlock *</label>
                <select
                  value={grantTargetCourseId}
                  onChange={e => setGrantTargetCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.branch} - Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowGrantModal(false);
                    setGrantTargetUser(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Grant Full Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
