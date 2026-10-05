import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Search,
  ShoppingCart,
  Bell,
  User as UserIcon,
  ShieldAlert,
  ChevronDown,
  BookOpen,
  LogOut,
  FileText,
  Package,
  Layers,
  Sparkles,
  Menu,
  X,
  Smartphone,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { NotificationItem, MaterialItem } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onNavigateTab: (tab: 'home' | 'browse' | 'dashboard' | 'admin', extraParams?: any) => void;
  currentTab: string;
  onOpenMobileQR?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onNavigateTab,
  currentTab,
  onOpenMobileQR
}) => {
  const { student, admin, logoutStudent, logoutAdmin } = useAuth();
  const { items, setIsCartOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MaterialItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    api.getNotifications().then(data => {
      if (Array.isArray(data)) setNotifications(data);
    }).catch(() => {});
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.getMaterials({ search: searchQuery.trim() });
        setSearchResults(results.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (materialId: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    onNavigateTab('browse', { selectedMaterialId: materialId });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top MSBTE Announcement Strip */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-600 px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 mx-auto">
          <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide uppercase">
            MSBTE 2025
          </span>
          <span>⚡ Winter/Summer Diploma Study Notes, Solved Question Papers &amp; Model Answers Live!</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] text-white/90">
          {onOpenMobileQR && (
            <button
              onClick={onOpenMobileQR}
              className="bg-black/30 hover:bg-black/50 text-amber-200 px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors"
              title="Scan QR Code to open on mobile"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Open on Phone (QR)</span>
            </button>
          )}
          <span>Official MSBTE I-Scheme Aligned</span>
          <span className="opacity-40">|</span>
          <button
            onClick={() => onNavigateTab('admin')}
            className="hover:text-amber-200 underline font-medium flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            {admin ? 'Admin Panel (Active)' : 'Admin Login'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
                Diploma Rankers
              </span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                MSBTE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">Study Smart. Score Better.</p>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search 22517, Software Engineering, Model Answers..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2 border-b border-slate-700/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Matching MSBTE Materials</span>
                <span>{searchResults.length} results</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                {searchResults.length > 0 ? (
                  searchResults.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSearchResult(item.id)}
                      className="p-3 hover:bg-slate-700/70 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                            {item.subject_code}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subject_name} • {item.semester}th Sem
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-amber-300">
                          ₹{item.discount_price ?? item.price}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No matching study materials found for "{searchQuery}".
                  </div>
                )}
              </div>
              <div
                onClick={() => {
                  setShowSearchDropdown(false);
                  onNavigateTab('browse', { searchQuery });
                }}
                className="p-2.5 bg-slate-900/80 text-center text-xs text-amber-300 font-medium hover:bg-slate-900 cursor-pointer border-t border-slate-700/50"
              >
                View all search results →
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigateTab('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentTab === 'home' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigateTab('browse')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentTab === 'browse' ? 'text-white bg-slate-800 font-semibold' : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            All Materials
          </button>
          <button
            onClick={() => onNavigateTab('browse', { categorySlug: 'question-papers' })}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            Question Papers
          </button>
          <button
            onClick={() => onNavigateTab('browse', { categorySlug: 'model-answers' })}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            Model Answers
          </button>
          <button
            onClick={() => onNavigateTab('browse', { categorySlug: 'bundles' })}
            className="px-3 py-1.5 rounded-lg hover:text-amber-300 hover:bg-slate-800/50 transition-colors flex items-center gap-1.5 text-amber-300 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Bundles
          </button>
        </nav>

        {/* Right Action Icons: Cart, Notification, Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">MSBTE Diploma Alerts</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">{notifications.length} updates</span>
                </div>
                <div className="max-h-72 overflow-y-auto mt-2 space-y-2.5 divide-y divide-slate-700/40">
                  {notifications.map(n => (
                    <div key={n.id} className="pt-2.5 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 shrink-0 font-medium">
                          {n.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 transition-all relative border border-slate-700"
          >
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            {items.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-xs font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {items.length}
              </span>
            )}
          </button>

          {/* Student Auth / Dashboard Dropdown */}
          <div ref={userRef} className="relative">
            {student ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                    {student.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-semibold text-white leading-none truncate max-w-[100px]">{student.name}</p>
                    <p className="text-[10px] text-slate-400 leading-none mt-1">{student.branch.split(' ')[0]}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-700 mb-1">
                      <p className="text-xs font-bold text-white truncate">{student.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{student.email}</p>
                      <p className="text-[10px] text-amber-300 mt-1 font-medium">{student.year} • {student.semester}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateTab('dashboard', { tab: 'purchases' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 rounded-lg text-left transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>My Purchased PDFs</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateTab('dashboard', { tab: 'orders' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 rounded-lg text-left transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Order History</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateTab('dashboard', { tab: 'profile' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 rounded-lg text-left transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-amber-400" />
                      <span>Student Dashboard</span>
                    </button>

                    <div className="border-t border-slate-700 my-1"></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logoutStudent();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-102"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search subjects or materials..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateTab('home');
              }}
              className="p-2.5 rounded-lg bg-slate-800/80 text-left text-slate-200"
            >
              🏠 Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateTab('browse');
              }}
              className="p-2.5 rounded-lg bg-slate-800/80 text-left text-slate-200"
            >
              📚 All Materials
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateTab('browse', { categorySlug: 'question-papers' });
              }}
              className="p-2.5 rounded-lg bg-slate-800/80 text-left text-slate-200"
            >
              📝 Question Papers
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateTab('browse', { categorySlug: 'model-answers' });
              }}
              className="p-2.5 rounded-lg bg-slate-800/80 text-left text-slate-200"
            >
              ✅ Model Answers
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateTab('browse', { categorySlug: 'bundles' });
              }}
              className="p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold text-left col-span-2"
            >
              ✨ 5th Sem Complete Bundle (₹49 Only)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateTab('admin');
              }}
              className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-semibold text-left col-span-2"
            >
              🛡️ Admin Management Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
