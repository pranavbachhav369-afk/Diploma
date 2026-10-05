import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Sparkles,
  BookOpen,
  FileQuestion,
  CheckCircle2,
  Package,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Users,
  Award,
  Lock,
  ChevronDown,
  Layers,
  HelpCircle,
  Laptop,
  HardHat,
  Cog,
  Radio,
  FolderTree
} from 'lucide-react';
import { CourseItem, Branch } from '../types';
import { CourseCard } from './CourseCard';
import { api } from '../services/api';

interface HomePageProps {
  onNavigateTab: (tab: 'home' | 'browse' | 'dashboard' | 'admin', extraParams?: any) => void;
  onViewCourseDetails: (course: CourseItem) => void;
  onEnrollCourse: (course: CourseItem) => void;
  onOpenSecureReader: (pdfId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateTab,
  onViewCourseDetails,
  onEnrollCourse,
  onOpenSecureReader
}) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getCourses(),
      api.getBranches()
    ]).then(([crsList, brList]) => {
      if (isMounted) {
        setCourses(crsList || []);
        setBranches(brList || []);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigateTab('browse', { initialSearch: heroSearch.trim() });
    } else {
      onNavigateTab('browse');
    }
  };

  const branchIcons: Record<string, any> = {
    CO: Laptop,
    CE: HardHat,
    ME: Cog,
    EE: Zap,
    EJ: Radio
  };

  const faqs = [
    {
      q: 'How does the Classplus-style Course & Folder system work?',
      a: 'When you enroll in an MSBTE course, you get complete access to all included subjects (subcourses), topic folders, handwritten notes, previous 5-year question papers, and official model answers with zero extra cost!'
    },
    {
      q: 'Can I preview sample PDFs for free?',
      a: 'Yes! Click "Curriculum" on any course to open the folder hierarchy. Documents with the "Free Preview" badge can be opened and read immediately without needing to purchase.'
    },
    {
      q: 'How do I read my unlocked study materials on mobile?',
      a: 'All PDFs open inside our in-app secure reader with pinch zoom, night/sepia reading modes, and student anti-piracy watermarks containing your name and order ID.'
    },
    {
      q: 'Are these materials strictly aligned with MSBTE I-Scheme curriculum?',
      a: 'Yes, 100%. Every single note, question paper solution, and model answer is drafted and reviewed by MSBTE faculty and state board toppers according to the official curriculum and course codes (e.g. 22517, 22516, 22515).'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-18 lg:pb-24 border-b border-slate-800">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-indigo-600/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-amber-300 text-xs font-semibold shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Classplus Powered MSBTE Diploma Platform</span>
          </div>

          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              MSBTE Diploma Study Material
            </h1>
            <p className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Study Smart. Score Better.
            </p>
            <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Explore diploma batches, subcourses, topic folders, and verified topper PDFs.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-700/90 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                placeholder="Search course or subject (e.g. 5th Sem, Software Engineering, 22517)..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-102"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>15,000+ Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% I-Scheme Aligned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Instant Watermarked PDFs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BROWSE BY BRANCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Engineering Disciplines</span>
            <h3 className="text-xl sm:text-2xl font-black text-white">Browse MSBTE Branches</h3>
          </div>
          <button
            onClick={() => onNavigateTab('browse')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {branches.map(branch => {
            const IconComponent = branchIcons[branch.code] || BookOpen;
            return (
              <div
                key={branch.id}
                onClick={() => onNavigateTab('browse', { initialBranch: branch.name })}
                className="group p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-400/50 hover:bg-slate-800/80 cursor-pointer transition-all duration-200 text-center space-y-2.5 shadow-md hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-800 group-hover:bg-amber-400/20 text-slate-300 group-hover:text-amber-400 flex items-center justify-center mx-auto transition-colors border border-slate-700">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {branch.code}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                    {branch.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED COURSES & BATCHES (Classplus Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Classplus Batches
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              MSBTE Diploma Master Batches &amp; Packs
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('browse')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>Browse All Batches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">No courses published yet. Use Admin Panel to create courses or seed template.</p>
            <button
              onClick={() => onNavigateTab('admin')}
              className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Open Admin Portal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(crs => (
              <CourseCard
                key={crs.id}
                course={crs}
                onViewDetails={onViewCourseDetails}
                onEnroll={onEnrollCourse}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 border-t border-b border-slate-800">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Simple &amp; Instant</span>
          <h3 className="text-xl sm:text-2xl font-black text-white">How It Works</h3>
          <p className="text-xs text-slate-400">
            Get your study materials in under 60 seconds with our seamless 4-step process.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-base mx-auto border border-blue-500/20">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Select Your Course</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find your MSBTE branch and semester diploma batch.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-black text-base mx-auto border border-amber-400/20">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Browse Folders &amp; Sample</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore subject folders and open Free Preview sample notes.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-base mx-auto border border-emerald-500/20">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Enroll with Razorpay</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay via UPI, Cards, or NetBanking with instant verification.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-base mx-auto border border-purple-500/20">
              4
            </div>
            <h4 className="text-sm font-bold text-white">Read in Secure Reader</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access full watermarked PDFs on mobile or desktop anytime.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Frequently Asked Questions</span>
          <h3 className="text-xl sm:text-2xl font-black text-white">Everything You Need to Know</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-amber-300"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaqIndex === idx ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
