import React from 'react';
import {
  GraduationCap,
  BookOpen,
  FolderTree,
  FileText,
  Star,
  Users,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CourseItem } from '../types';

interface CourseCardProps {
  course: CourseItem;
  onViewDetails: (course: CourseItem) => void;
  onEnroll: (course: CourseItem) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onEnroll
}) => {
  const currentPrice = course.discount_price !== undefined ? course.discount_price : course.price;
  const originalPrice = course.price;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return (
    <div className="group relative bg-slate-900 border border-slate-800 hover:border-amber-400/50 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl shadow-lg">
      {/* Thumbnail Banner with Classplus Badge */}
      <div className="relative p-5 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {course.branch}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              Sem {course.semester}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30">
              {course.year}
            </span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{course.rating.toFixed(1)}</span>
            <span className="text-slate-500 text-[11px]">({course.reviews_count || 12})</span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(course)}
          className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
        >
          {course.title}
        </h3>

        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {course.description || course.subtitle}
        </p>

        {/* Content Hierarchy Badges (Classplus App style) */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">
              <strong>{course.total_subcourses ?? 3}</strong> Subjects
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800/80">
            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>{course.total_pdfs ?? 12}</strong> PDF Notes &amp; PYQs
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer: Pricing & Action Buttons */}
      <div className="mt-auto p-5 pt-3 bg-slate-950/70 border-t border-slate-800/90 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">₹{currentPrice}</span>
            {hasDiscount && (
              <>
                <span className="text-xs text-slate-500 line-through">₹{originalPrice}</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          <span className="text-[11px] text-amber-300/80 font-medium">
            {course.validity}
          </span>
        </div>

        {course.is_enrolled ? (
          <button
            onClick={() => onViewDetails(course)}
            className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enrolled • View Folders &amp; PDFs</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(course)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Curriculum</span>
            </button>
            <button
              onClick={() => onEnroll(course)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1 transition-all hover:scale-102"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Enroll (₹{currentPrice})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
