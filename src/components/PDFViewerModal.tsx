import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PDFPage } from '../types';

interface PDFViewerModalProps {
  materialId: string;
  isSamplePreview?: boolean;
  onClose: () => void;
  onBuyNow?: (materialId: string) => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  materialId,
  isSamplePreview = false,
  onClose,
  onBuyNow
}) => {
  const { student, admin } = useAuth();
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState<any>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [watermark, setWatermark] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingMode, setReadingMode] = useState<'standard' | 'sepia' | 'dark'>('standard');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorData(null);

    async function loadDocument() {
      try {
        const res = await api.viewPDF(materialId);
        if (isMounted) {
          setMaterialTitle(res.title);
          setSubjectCode('MSBTE');
          setPages(res.pages || []);
          setWatermark(res.security || {
            watermark_text: 'DIPLOMA RANKERS SECURE MSBTE PORTAL',
            student_name: student?.name || 'Student'
          });
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('PDF secure access blocked:', err);
          setErrorData(err.data || { error: err.message });
          setLoading(false);
        }
      }
    }

    loadDocument();
    return () => {
      isMounted = false;
    };
  }, [materialId, isSamplePreview, student]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentPage = pages[currentPageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header / Toolbar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-400/20 shrink-0">
              PDF
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                  {subjectCode || 'MSBTE'}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                  {materialTitle || 'Diploma Study Material'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {isSamplePreview ? (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Sample Preview Mode ({pages.length} Pages)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Licensed &amp; Verified PDF Viewer
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-2">
            {!loading && !errorData && pages.length > 0 && (
              <>
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                    className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-slate-300 px-2 font-mono font-medium">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(160, prev + 15))}
                    className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Theme mode */}
                <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-[11px]">
                  <button
                    onClick={() => setReadingMode('standard')}
                    className={`px-2 py-0.5 rounded ${readingMode === 'standard' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'}`}
                  >
                    Paper
                  </button>
                  <button
                    onClick={() => setReadingMode('sepia')}
                    className={`px-2 py-0.5 rounded ${readingMode === 'sepia' ? 'bg-amber-900/60 text-amber-200 font-semibold' : 'text-slate-400'}`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setReadingMode('dark')}
                    className={`px-2 py-0.5 rounded ${readingMode === 'dark' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-400'}`}
                  >
                    Night
                  </button>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white border border-slate-700 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-start">
          {loading ? (
            <div className="my-auto text-center space-y-4">
              <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-300 font-medium">Verifying license and loading secure MSBTE document...</p>
              <p className="text-xs text-slate-500">Decrypting authenticated stream</p>
            </div>
          ) : errorData ? (
            /* ACCESS DENIED / UNPURCHASED SHIELD */
            <div className="my-auto max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-extrabold text-white">Full Document Access Locked</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {errorData.message || errorData.error || 'You must purchase this study material to view and read the complete PDF.'}
                </p>
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 text-left space-y-1 mt-3">
                  <p className="font-semibold text-slate-200">Why are complete notes locked?</p>
                  <p>• Only students who have purchased this material are licensed to read full notes.</p>
                  <p>• URL manipulation and unauthorized access are strictly blocked at backend.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {onBuyNow && (
                  <button
                    onClick={() => {
                      onClose();
                      onBuyNow(materialId);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Unlock Full PDF Now
                  </button>
                )}
                <button
                  onClick={() => {
                    // Switch to preview mode
                    setLoading(true);
                    setErrorData(null);
                    api.viewPDF(materialId).then((res: any) => {
                      setMaterialTitle(res.title);
                      setSubjectCode(res.subject_code || 'MSBTE');
                      setPages(res.pages || []);
                      setWatermark(res.security || {
                        watermark_text: 'PREVIEW COPY • DIPLOMA RANKERS MSBTE SAMPLE',
                        is_preview: true
                      });
                      setLoading(false);
                    }).catch((err: any) => {
                      setErrorData({ error: 'Could not load preview pages.' });
                      setLoading(false);
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
                >
                  View Sample Preview Pages
                </button>
              </div>
            </div>
          ) : currentPage ? (
            /* SECURE RENDERED PAGE */
            <div
              style={{ width: `${zoomLevel}%`, maxWidth: '900px' }}
              className={`relative transition-all duration-150 rounded-xl shadow-2xl p-6 sm:p-10 border ${
                readingMode === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : readingMode === 'sepia'
                  ? 'bg-[#fbf0d9] border-[#e4d4b3] text-[#4a3b2c]'
                  : 'bg-white border-slate-200 text-slate-900'
              } min-h-[700px] select-text flex flex-col justify-between overflow-hidden`}
            >
              {/* DIAGONAL SECURITY WATERMARK (Crucial Anti-Piracy Feature) */}
              <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-10 overflow-hidden opacity-[0.08] transform -rotate-30">
                <div className="text-center font-black uppercase tracking-widest text-base sm:text-lg leading-loose space-y-4">
                  <p>{watermark?.watermark_text || 'DIPLOMA RANKERS SECURE COPY'}</p>
                  <p>MSBTE VERIFIED SYLLABUS • LICENSED STUDENT READER</p>
                  <p>{watermark?.watermark_text || 'DO NOT DISTRIBUTE'}</p>
                </div>
              </div>

              {/* Watermark Header Banner */}
              <div className="border-b pb-3 mb-6 flex items-center justify-between text-xs opacity-75 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wider uppercase">Diploma Rankers</span>
                  <span>•</span>
                  <span>MSBTE Course Code: {subjectCode}</span>
                </div>
                <div className="font-mono text-[10px]">
                  Page {currentPage.page_number} of {pages.length}
                </div>
              </div>

              {/* Page Content Body */}
              <div className="space-y-6 flex-1 z-20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {currentPage.title}
                  </h2>
                  {currentPage.subtitle && (
                    <p className="text-xs sm:text-sm font-semibold opacity-75 mt-1">
                      {currentPage.subtitle}
                    </p>
                  )}
                </div>

                {/* Formatted Text Content */}
                <div className="space-y-4 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
                  {currentPage.content}
                </div>

                {/* Exam Highlights Section */}
                {currentPage.highlights && currentPage.highlights.length > 0 && (
                  <div
                    className={`p-4 rounded-xl border mt-6 ${
                      readingMode === 'dark'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : readingMode === 'sepia'
                        ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                        : 'bg-amber-50/90 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>MSBTE Board Exam Pro Tip &amp; Scoring Note</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                      {currentPage.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Formulas Section */}
                {currentPage.formulas && currentPage.formulas.length > 0 && (
                  <div
                    className={`p-3.5 rounded-xl font-mono text-xs border ${
                      readingMode === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-emerald-400'
                        : 'bg-slate-50 border-slate-200 text-emerald-800'
                    }`}
                  >
                    <p className="font-bold text-[10px] uppercase tracking-wider mb-1 text-slate-400">
                      Standard Formula:
                    </p>
                    {currentPage.formulas.map((f, i) => (
                      <div key={i} className="font-bold">{f}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Watermark Footer Banner */}
              <div className="border-t pt-3 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] opacity-70 gap-2 shrink-0">
                <span className="font-mono">
                  {watermark?.watermark_text || 'Diploma Rankers Verified Academic Material'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Student Copy
                </span>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center text-slate-400 text-sm">
              No pages available for this document.
            </div>
          )}
        </div>

        {/* Bottom Pagination Toolbar */}
        {!loading && !errorData && pages.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span>Page</span>
              <span className="bg-slate-800 px-2.5 py-1 rounded-md font-mono font-bold text-amber-300 border border-slate-700">
                {currentPageIndex + 1}
              </span>
              <span>of {pages.length}</span>
            </div>

            <button
              onClick={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
