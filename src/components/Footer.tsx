import React from 'react';
import { GraduationCap, ShieldCheck, Lock, Heart, Award, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectBranch: (code: string) => void;
  onNavigateTab: (tab: 'home' | 'browse' | 'dashboard' | 'admin', extraParams?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectBranch, onNavigateTab }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Diploma Rankers
                </span>
                <p className="text-xs text-amber-400 font-medium">MSBTE Diploma Study Material</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering Maharashtra MSBTE diploma students to score top ranks with verified handwritten topper notes, solved previous 5-year question papers, model answers, and complete subject bundles.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Content</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Instant PDF Access</span>
              </div>
            </div>
          </div>

          {/* Branches */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Diploma Branches</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onSelectBranch('CO')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Computer Engineering (CO)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectBranch('CE')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Civil Engineering (CE)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectBranch('ME')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Mechanical Engineering (ME)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectBranch('EE')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Electrical Engineering (EE)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectBranch('EJ')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Electronics &amp; Telecom (EJ)
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Study Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigateTab('browse', { categorySlug: 'notes' })}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Handwritten Notes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('browse', { categorySlug: 'question-papers' })}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  5-Year Question Papers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('browse', { categorySlug: 'model-answers' })}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  MSBTE Model Answers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('browse', { categorySlug: 'important-questions' })}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  V.I.P Predicted Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('browse', { categorySlug: 'bundles' })}
                  className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Semester Bundles (₹49)
                </button>
              </li>
            </ul>
          </div>

          {/* Admin & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Student &amp; Admin</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigateTab('dashboard')}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Student Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('dashboard', { tab: 'purchases' })}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  My Purchased PDFs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('admin')}
                  className="text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1"
                >
                  Admin Management
                </button>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <p className="text-slate-300 font-semibold">Demo Credentials:</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Admin: admin@diplomarankers.com / admin123</p>
              <p className="text-slate-400 text-[11px]">Student: student@diplomarankers.com / student123</p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Diploma Rankers. All rights reserved. Study Smart. Score Better.</p>
          <p className="text-center md:text-right max-w-xl text-[11px]">
            Disclaimer: Diploma Rankers is an independent student academic resource platform aligned with the Maharashtra State Board of Technical Education (MSBTE) I-Scheme syllabus.
          </p>
        </div>
      </div>
    </footer>
  );
};
