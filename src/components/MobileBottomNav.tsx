import React from 'react';
import { Home, BookOpen, Download, Smartphone, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: 'home' | 'browse' | 'dashboard' | 'admin';
  onNavigateTab: (tab: 'home' | 'browse' | 'dashboard' | 'admin', extraParams?: any) => void;
  onOpenMobileQR: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigateTab,
  onOpenMobileQR
}) => {
  const { student, admin } = useAuth();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb"
      aria-label="Mobile Navigation"
    >
      <button
        onClick={() => onNavigateTab('home')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
          currentTab === 'home'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      <button
        onClick={() => onNavigateTab('browse')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
          currentTab === 'browse'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Courses</span>
      </button>

      <button
        onClick={() => onNavigateTab('dashboard', { tab: 'purchases' })}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all relative ${
          currentTab === 'dashboard'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Download className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">My Content</span>
        {student && (
          <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
        )}
      </button>

      <button
        onClick={onOpenMobileQR}
        className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-amber-300 transition-all"
        title="Open on Mobile"
      >
        <Smartphone className="w-5 h-5 mb-0.5 text-blue-400" />
        <span className="text-[10px] tracking-tight text-blue-300 font-medium">Scan QR</span>
      </button>

      <button
        onClick={() => onNavigateTab('admin')}
        className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
          currentTab === 'admin'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShieldAlert className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Admin</span>
      </button>
    </nav>
  );
};
