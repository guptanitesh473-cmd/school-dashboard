import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, LayoutGrid, ClipboardList, TrendingUp,
  School, PlusCircle, ChevronRight, Menu, X, GraduationCap, Package, LogOut, BookMarked,
  UserCheck, Users, MessageSquare, Smartphone, CalendarDays, ShieldCheck,
} from 'lucide-react';
import Home from './components/Home';
import MatrixView from './components/MatrixView';
import StatsView from './components/StatsView';
import SchoolsList from './components/SchoolsList';
import AddSchoolForm from './components/AddSchoolForm';
import SchoolDetail from './components/SchoolDetail';
import RetentionReport from './components/RetentionReport';
import ProjectProgress from './components/ProjectProgress';
import Inventory from './components/Inventory';
import BLA from './components/BLA';
import OnboardingProgress from './components/OnboardingProgress';
import StaffOnboarding from './components/StaffOnboarding';
import SurveyFeedback from './components/SurveyFeedback';
import MAU from './components/MAU';
import MonthlyMeeting from './components/MonthlyMeeting';
import AuditReport from './components/AuditReport';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import { authApi } from './services/api';
import { UserContext } from './contexts/UserContext';

const NAV = [
  {
    to: '/',
    label: 'Home',
    icon: HomeIcon,
    end: true,
  },
  {
    to: '/onboarding',
    label: 'Onboarding Progress Status',
    icon: UserCheck,
  },
  {
    to: '/academic',
    label: 'Academic Offering and Infra',
    icon: LayoutGrid,
  },
  {
    to: '/staff-onboarding',
    label: 'Staff 1on1 and Onboarding',
    icon: Users,
  },
  {
    to: '/retention',
    label: 'Retention Detail',
    icon: ClipboardList,
  },
  {
    to: '/survey',
    label: 'Survey Form: Parents Feedback',
    icon: MessageSquare,
  },
  {
    to: '/progress',
    label: 'Project Progress',
    icon: TrendingUp,
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: Package,
  },
  {
    to: '/bla',
    label: 'BLA Dashboard',
    icon: BookMarked,
  },
  {
    to: '/mau',
    label: 'MAU Data',
    icon: Smartphone,
  },
  {
    to: '/monthly-meeting',
    label: 'Monthly Meeting',
    icon: CalendarDays,
  },
  {
    to: '/audit',
    label: 'Audit Report',
    icon: ShieldCheck,
  },
];

const SCHOOL_NAV = [
  { to: '/schools', label: 'All Schools', icon: School },
  { to: '/schools/new', label: 'Add School', icon: PlusCircle },
];

export default function App() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setAuthChecked(true); return; }
    authApi.me()
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogin = (u) => setUser(u);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  if (!authChecked) return null; // brief flicker prevention
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <UserContext.Provider value={user}>
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 shadow-sm
        transition-all duration-200
        ${collapsed ? 'w-[64px]' : 'w-[280px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 leading-tight">OIS Dashboard</div>
              <div className="text-[10px] text-gray-400">Academic Offerings</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {/* Label */}
          {!collapsed && (
            <div className="px-4 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
          )}

          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="leading-tight text-left">{label}</span>}
              {!collapsed && <ChevronRight size={14} className="ml-auto opacity-30 shrink-0" />}
            </NavLink>
          ))}

          {/* Divider */}
          <div className={`mx-4 my-3 border-t border-gray-100 ${collapsed ? 'mx-2' : ''}`} />

          {!collapsed && (
            <div className="px-4 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Schools</div>
          )}

          {SCHOOL_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="leading-tight text-left">{label}</span>}
            </NavLink>
          ))}

          {/* Admin-only section */}
          {user?.role === 'admin' && (
            <>
              <div className={`mx-4 my-3 border-t border-gray-100 ${collapsed ? 'mx-2' : ''}`} />
              {!collapsed && (
                <div className="px-4 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admin</div>
              )}
              <NavLink
                to="/users"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
                title={collapsed ? 'User Management' : undefined}
              >
                <ShieldCheck size={18} className="shrink-0" />
                {!collapsed && <span className="leading-tight text-left">User Management</span>}
              </NavLink>
            </>
          )}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-gray-50 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-indigo-600">
                  {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-gray-800 truncate">{user?.name || user?.username}</div>
                <div className="text-[10px] text-gray-400 truncate">{user?.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title="Sign out"
          >
            <LogOut size={14} />
            {!collapsed && <span>Sign out</span>}
          </button>
          <div className="hidden lg:block">
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              {collapsed ? <ChevronRight size={16} /> : <><X size={14} /><span>Collapse</span></>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} className="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <PageTitle />
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<OnboardingProgress />} />
            <Route path="/academic" element={<AcademicPage />} />
            <Route path="/staff-onboarding" element={<StaffOnboarding />} />
            <Route path="/retention" element={<RetentionReport />} />
            <Route path="/survey" element={<SurveyFeedback />} />
            <Route path="/progress" element={<ProjectProgress />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/schools" element={<SchoolsList />} />
            <Route path="/schools/new" element={<AddSchoolForm />} />
            <Route path="/schools/:id" element={<SchoolDetail />} />
            <Route path="/schools/:id/edit" element={<AddSchoolForm />} />
            <Route path="/bla" element={<BLA />} />
            <Route path="/mau" element={<MAU />} />
            <Route path="/monthly-meeting" element={<MonthlyMeeting />} />
            <Route path="/audit" element={<AuditReport />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </div>
    </UserContext.Provider>
  );
}

function AcademicPage() {
  const [tab, setTab] = useState('matrix');
  return (
    <div>
      <div className="flex gap-2 mb-5 border-b border-gray-200">
        {[['matrix', 'Matrix View'], ['stats', 'Stats & Summary']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'matrix' ? <MatrixView /> : <StatsView />}
    </div>
  );
}

function PageTitle() {
  const titles = {
    '/': 'Home',
    '/onboarding': 'Onboarding Progress Status',
    '/academic': 'Academic Offering and Infra',
    '/staff-onboarding': 'Staff 1on1 and Onboarding',
    '/retention': 'Retention Detail',
    '/survey': 'Survey Form: Parents Feedback Analysis',
    '/progress': 'Project Progress',
    '/inventory': 'Inventory',
    '/bla': 'BLA Dashboard',
    '/mau': 'MAU Data',
    '/monthly-meeting': 'Monthly Meeting',
    '/audit': 'Audit Report',
    '/users': 'User Management',
    '/schools': 'Schools',
    '/schools/new': 'Add School',
  };
  const path = window.location.pathname;
  const title = Object.entries(titles).findLast(([k]) => path.startsWith(k))?.[1] || 'Dashboard';
  return (
    <div>
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
    </div>
  );
}
