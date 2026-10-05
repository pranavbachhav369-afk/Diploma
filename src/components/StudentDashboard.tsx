import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ShoppingBag,
  Bell,
  User,
  Heart,
  FileText,
  Calendar,
  Eye,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PurchasedItem, OrderRecord, NotificationItem } from '../types';

interface StudentDashboardProps {
  initialTab?: 'purchases' | 'orders' | 'profile' | 'notifications';
  onOpenSecureReader: (materialId: string) => void;
  onExploreMaterials: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  initialTab = 'purchases',
  onOpenSecureReader,
  onExploreMaterials
}) => {
  const { student, refreshStudentProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'purchases' | 'orders' | 'profile' | 'notifications'>(initialTab);
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit states
  const [name, setName] = useState(student?.name || '');
  const [mobile, setMobile] = useState(student?.mobile || '');
  const [branch, setBranch] = useState(student?.branch || '');
  const [year, setYear] = useState(student?.year || '');
  const [semester, setSemester] = useState(student?.semester || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setMobile(student.mobile);
      setBranch(student.branch);
      setYear(student.year);
      setSemester(student.semester);
    }
  }, [student]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getMyPurchases(),
      api.getMyOrders(),
      api.getNotifications()
    ])
      .then(([purData, ordData, notifData]) => {
        if (isMounted) {
          setPurchases(purData || []);
          setOrders(ordData || []);
          setNotifications(notifData || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setProfileMsg('');
    try {
      await api.updateStudentProfile({ name, mobile, branch, year, semester });
      await refreshStudentProfile();
      setProfileMsg('Academic profile updated successfully!');
    } catch (err: any) {
      setProfileMsg(err?.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-2xl text-slate-950 shadow-lg shadow-amber-400/20 shrink-0">
            {student?.name?.charAt(0) || 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{student?.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              {student?.branch} • {student?.year} ({student?.semester})
            </p>
            <p className="text-xs text-amber-300/90 font-mono">{student?.email}</p>
          </div>
        </div>

        {/* Quick Stats Counter */}
        <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-3 sm:p-4 rounded-2xl">
          <div className="text-center px-3 border-r border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Unlocked PDFs</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{purchases.length}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-xs text-slate-400 font-medium">Orders Placed</p>
            <p className="text-xl font-black text-white mt-0.5">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'purchases'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>My Purchased PDFs ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-blue-400" />
          <span>Order History ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'notifications'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" />
          <span>Notifications &amp; Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4 text-purple-400" />
          <span>Academic Profile</span>
        </button>
      </div>

      {/* TAB CONTENT: MY PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Licensed MSBTE Diploma PDFs</span>
            </h3>
            <span className="text-xs text-slate-400">
              Personalized watermarked reader enabled
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading purchased materials...</div>
          ) : purchases.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">No materials purchased yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore handwritten notes, 5-year solved question papers, and model answers aligned with your MSBTE syllabus.
              </p>
              <button
                onClick={onExploreMaterials}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow"
              >
                Browse Study Material
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchases.map(item => (
                <div
                  key={item.purchase_id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {item.subject_code}
                      </span>
                      <span className="font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Licensed &amp; Paid
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                      <p className="flex justify-between">
                        <span>Subject:</span>
                        <span className="text-slate-300 font-medium">{item.subject_name}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Order ID:</span>
                        <span className="font-mono text-amber-300">{item.order_id}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Unlocked On:</span>
                        <span>{new Date(item.purchase_date || item.purchased_at || Date.now()).toLocaleDateString('en-IN')}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenSecureReader(item.material_id || item.item_id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View &amp; Read PDF</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Your Orders</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-400">
              No orders found.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
              {orders.map(order => (
                <div key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-amber-300">
                        {order.order_number}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                          order.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : order.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleString('en-IN')} • Gateway: {order.payment_gateway}
                    </p>
                    <div className="text-xs text-slate-300 pt-1">
                      {order.items.map((it, idx) => (
                        <span key={it.id}>
                          {it.item_title} (₹{it.price}){idx < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right sm:text-right shrink-0">
                    <span className="text-lg font-black text-white">₹{order.final_amount}</span>
                    {order.discount_amount > 0 && (
                      <p className="text-[11px] text-emerald-400">Saved ₹{order.discount_amount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>MSBTE Examination &amp; Syllabus Announcements</span>
          </h3>

          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-white text-sm">{notif.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {notif.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {notif.message}
                </p>
                <p className="text-[10px] text-slate-500">
                  {new Date(notif.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACADEMIC PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Academic Student Profile</h3>
            <p className="text-xs text-slate-400">
              Keep your MSBTE branch and semester up to date so we recommend the exact question papers and model answers.
            </p>
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Email (Registered)</label>
                <input
                  type="email"
                  disabled
                  value={student?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Branch</label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option>Computer Engineering</option>
                <option>Civil Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Electrical Engineering</option>
                <option>Electronics &amp; Telecommunication</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Year</label>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option>1st Semester</option>
                  <option>2nd Semester</option>
                  <option>3rd Semester</option>
                  <option>4th Semester</option>
                  <option>5th Semester</option>
                  <option>6th Semester</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdating ? 'Saving...' : 'Update Academic Profile'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
