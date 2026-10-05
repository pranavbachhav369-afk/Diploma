import React, { useState, useEffect } from 'react';
import { Search, Filter, X, BookOpen, Check } from 'lucide-react';
import { CourseItem, Branch } from '../types';
import { CourseCard } from './CourseCard';
import { api } from '../services/api';

interface MaterialCatalogProps {
  initialBranch?: string;
  initialSemester?: number;
  initialSearch?: string;
  onViewCourseDetails: (course: CourseItem) => void;
  onEnrollCourse: (course: CourseItem) => void;
}

export const MaterialCatalog: React.FC<MaterialCatalogProps> = ({
  initialBranch,
  initialSemester,
  initialSearch,
  onViewCourseDetails,
  onEnrollCourse
}) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch || '');
  const [selectedSemester, setSelectedSemester] = useState<number | ''>(initialSemester || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortOption, setSortOption] = useState<string>('popular');

  useEffect(() => {
    api.getBranches().then(data => {
      if (Array.isArray(data)) setBranches(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialBranch !== undefined) setSelectedBranch(initialBranch);
    if (initialSemester !== undefined) setSelectedSemester(initialSemester);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialBranch, initialSemester, initialSearch]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getCourses({
      branch: selectedBranch || undefined,
      semester: selectedSemester ? Number(selectedSemester) : undefined,
      search: searchQuery.trim() || undefined,
      sort: sortOption
    })
      .then(data => {
        if (isMounted) {
          setCourses(data || []);
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
  }, [selectedBranch, selectedSemester, searchQuery, sortOption]);

  const clearFilters = () => {
    setSelectedBranch('');
    setSelectedSemester('');
    setSearchQuery('');
    setSortOption('popular');
  };

  const hasActiveFilters = Boolean(selectedBranch || selectedSemester || searchQuery);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Title & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
              MSBTE Batches
            </span>
            <span className="text-xs text-slate-400">Classplus Diploma Course Storefront</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Browse All Diploma Courses &amp; Batches
          </h2>
        </div>

        {/* Global Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search course or subject code..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-medium focus:outline-none"
          >
            <option value="popular">Most Enrolled</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">Branch:</span>
          <button
            onClick={() => setSelectedBranch('')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedBranch === '' ? 'bg-amber-400 text-slate-950 font-bold shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Branches
          </button>
          {branches.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.name)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedBranch === b.name ? 'bg-amber-400 text-slate-950 font-bold shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">Semester:</span>
          {[1, 2, 3, 4, 5, 6].map(s => (
            <button
              key={s}
              onClick={() => setSelectedSemester(selectedSemester === s ? '' : s)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                selectedSemester === s ? 'bg-amber-400 text-slate-950 shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-400 hover:underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-lg font-bold text-white">No courses matched your filters</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your branch or semester filters to view all available courses.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onViewDetails={onViewCourseDetails}
              onEnroll={onEnrollCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};
