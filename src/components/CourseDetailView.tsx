import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  FileText,
  Lock,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Folder,
  Layers,
  ChevronDown,
  ChevronRight,
  Zap,
  BookOpen,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { CourseItem, SubcourseItem, FolderItem, PDFItem } from '../types';
import { api } from '../services/api';

interface CourseDetailViewProps {
  courseId: string;
  onClose: () => void;
  onEnrollCourse: (course: CourseItem) => void;
  onOpenSecureReader: (pdfId: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  onClose,
  onEnrollCourse,
  onOpenSecureReader
}) => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubcourses, setExpandedSubcourses] = useState<Record<string, boolean>>({});
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'content' | 'overview'>('content');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getCourseById(courseId)
      .then(data => {
        if (isMounted) {
          setCourse(data);
          // Auto-expand first subcourse and its folders
          if (data?.subcourses?.length) {
            const firstSub = data.subcourses[0];
            setExpandedSubcourses({ [firstSub.id]: true });
            const fldMap: Record<string, boolean> = {};
            firstSub.folders?.forEach((f: any) => {
              fldMap[f.id] = true;
            });
            setExpandedFolders(fldMap);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const toggleSubcourse = (id: string) => {
    setExpandedSubcourses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading || !course) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-300">Loading course curriculum &amp; folder structure...</p>
        </div>
      </div>
    );
  }

  const isEnrolled = course.is_enrolled;
  const currentPrice = course.discount_price !== undefined ? course.discount_price : course.price;
  const originalPrice = course.price;
  const hasDiscount = originalPrice > currentPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {course.branch}
              </span>
              <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                Sem {course.semester} • {course.year}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {course.validity}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
              {course.title}
            </h2>
            <p className="text-xs text-slate-400 truncate">{course.subtitle}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing / Enrollment Sticky Bar */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">₹{currentPrice}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-slate-500 line-through">₹{originalPrice}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Save ₹{originalPrice - currentPrice}
                </span>
              </>
            )}
            <span className="text-[11px] text-slate-400 ml-2">All subjects, folders &amp; PDFs unlocked</span>
          </div>

          <div>
            {isEnrolled ? (
              <span className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Enrolled (All Documents Unlocked)</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onEnrollCourse(course);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-102"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Enroll Now &amp; Unlock Full Course (₹{currentPrice})</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-6 gap-4 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'content' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
            }`}
          >
            🗂️ Course Content &amp; Folders ({course.subcourses?.length || 0} Subjects)
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400'
            }`}
          >
            📋 Course Overview &amp; Highlights
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'content' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Explore subjects, unit folders, and verified MSBTE PDFs. Click <strong>"Free Preview"</strong> to sample notes without purchasing!
              </p>

              {(!course.subcourses || course.subcourses.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Course curriculum is being uploaded by admin.
                </div>
              ) : (
                <div className="space-y-3">
                  {course.subcourses.map((sub: any) => {
                    const isExpanded = expandedSubcourses[sub.id];
                    return (
                      <div
                        key={sub.id}
                        className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden"
                      >
                        {/* Subcourse Header Accordion */}
                        <div
                          onClick={() => toggleSubcourse(sub.id)}
                          className="p-3.5 bg-slate-950 hover:bg-slate-900/90 cursor-pointer flex items-center justify-between select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-amber-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                              {sub.subject_code}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-white">{sub.title}</span>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            {sub.folders?.length || 0} Folders
                          </span>
                        </div>

                        {/* Folders in Subcourse */}
                        {isExpanded && (
                          <div className="p-3 sm:p-4 space-y-3 bg-slate-900/40 border-t border-slate-800/80">
                            {(!sub.folders || sub.folders.length === 0) ? (
                              <p className="text-xs text-slate-500 pl-4">No folders yet</p>
                            ) : (
                              sub.folders.map((fld: any) => {
                                const isFldOpen = expandedFolders[fld.id];
                                return (
                                  <div
                                    key={fld.id}
                                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
                                  >
                                    <div
                                      onClick={() => toggleFolder(fld.id)}
                                      className="p-3 bg-slate-950/60 hover:bg-slate-950 cursor-pointer flex items-center justify-between text-xs transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Folder className="w-4 h-4 text-amber-400" />
                                        <span className="font-bold text-slate-200">{fld.name}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {fld.pdfs?.length || 0} PDFs
                                      </span>
                                    </div>

                                    {/* PDFs in Folder */}
                                    {isFldOpen && (
                                      <div className="p-2.5 space-y-2 bg-slate-950/30">
                                        {(!fld.pdfs || fld.pdfs.length === 0) ? (
                                          <p className="text-[11px] text-slate-500 pl-4">Empty folder</p>
                                        ) : (
                                          fld.pdfs.map((pdf: any) => {
                                            const unlocked = isEnrolled || pdf.can_access || pdf.is_free_preview;
                                            return (
                                              <div
                                                key={pdf.id}
                                                className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                                              >
                                                <div className="flex items-center gap-2.5 min-w-0">
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

                                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                                  {pdf.is_free_preview && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                      Free Preview
                                                    </span>
                                                  )}

                                                  {unlocked ? (
                                                    <button
                                                      onClick={() => onOpenSecureReader(pdf.id)}
                                                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow"
                                                    >
                                                      <Eye className="w-3.5 h-3.5" />
                                                      <span>Read PDF</span>
                                                    </button>
                                                  ) : (
                                                    <button
                                                      onClick={() => {
                                                        onClose();
                                                        onEnrollCourse(course);
                                                      }}
                                                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                                                    >
                                                      <Lock className="w-3 h-3 text-amber-400" />
                                                      <span>Unlock</span>
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Course Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800 whitespace-pre-line">
                  {course.description}
                </p>
              </div>

              {course.features && course.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    What's Included in this Course
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {course.features.map((feat: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
