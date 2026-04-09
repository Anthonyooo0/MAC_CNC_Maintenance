import React, { useState, useEffect, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { Login } from './components/Login';
import { Toast } from './components/Toast';
import { CommandPalette } from './components/CommandPalette';
import { Dashboard } from './components/Dashboard';
import { Checklists } from './components/Checklists';
import { Schedule } from './components/Schedule';
import { Machines } from './components/Machines';
import { Reports } from './components/Reports';
import { Changelog } from './components/Changelog';
import { useKeyboard } from './hooks/useKeyboard';
import { Icons } from './constants';
import { ViewPage, ToastMessage } from './types';
import { IS_DEV_MODE, DEV_USER } from './devMode';

// Stub hooks for dev mode (when no MsalProvider wraps the App)
const useDevMsal = () => ({ instance: null as any, accounts: [] as any[] });
const useDevIsAuth = () => false;

const NAV_ITEMS: { page: ViewPage; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; group: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard, group: 'Overview' },
  { page: 'checklists', label: 'Checklists', icon: Icons.Checklist, group: 'Operations' },
  { page: 'schedule', label: 'Schedule', icon: Icons.Calendar, group: 'Operations' },
  { page: 'machines', label: 'Machines', icon: Icons.Machine, group: 'Operations' },
  { page: 'reports', label: 'Reports', icon: Icons.Report, group: 'Analytics' },
  { page: 'changelog', label: 'Audit Log', icon: Icons.Changelog, group: 'Analytics' },
];

const PAGE_TITLES: Record<ViewPage, string> = {
  dashboard: 'Dashboard',
  checklists: 'Maintenance Checklists',
  schedule: 'Maintenance Schedule',
  machines: 'Machine Overview',
  reports: 'Reports',
  changelog: 'Audit Log',
};

export const App: React.FC = () => {
  // In dev mode, use stub hooks instead of MSAL (no MsalProvider)
  const { instance, accounts } = (IS_DEV_MODE ? useDevMsal : useMsal)();
  const isAuthenticated = (IS_DEV_MODE ? useDevIsAuth : useIsAuthenticated)();

  const [currentUser, setCurrentUser] = useState<string | null>(IS_DEV_MODE ? DEV_USER : null);
  const [currentPage, setCurrentPage] = useState<ViewPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(!IS_DEV_MODE);

  // Auth state
  useEffect(() => {
    if (IS_DEV_MODE) return;
    if (isAuthenticated && accounts.length > 0) {
      setCurrentUser(accounts[0].username?.toLowerCase() || null);
    }
    // Give MSAL a moment to initialize
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, accounts]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    if (IS_DEV_MODE) {
      setCurrentUser(null);
      return;
    }
    await instance.logoutPopup();
    setCurrentUser(null);
  };

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Keyboard shortcuts
  useKeyboard({
    'cmd+k': () => setCommandPaletteOpen(true),
    'slash': () => setCommandPaletteOpen(true),
    'escape': () => setCommandPaletteOpen(false),
  });

  // Command palette machine selection → navigate to checklists
  function handleSelectMachine(machineId: string) {
    setCurrentPage('checklists');
  }

  // Loading screen
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-mac-light">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/mac_logo.png" alt="MAC Logo" className="w-full h-full object-contain animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth check
  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Group nav items
  const groups = NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="flex h-screen overflow-hidden bg-mac-light">
      {/* Sidebar */}
      <aside
        className={`sidebar flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0 text-white`}
      >
        {/* Logo / Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src="/mac_logo.png" alt="MAC Logo" className="w-full h-full object-contain" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-sm truncate uppercase">CNC Maintenance</h1>
                <p className="text-blue-200 text-[10px] truncate uppercase font-bold tracking-tighter">
                  {currentUser}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              {!sidebarCollapsed && (
                <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-blue-300/50">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => setCurrentPage(item.page)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                      isActive
                        ? 'nav-active text-white bg-white/10'
                        : 'text-blue-200 hover:text-white hover:bg-white/5'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-200 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <Icons.Logout className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center py-2 text-blue-300/50 hover:text-white transition-all rounded-lg hover:bg-white/5"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <Icons.Expand className="w-4 h-4" />
            ) : (
              <Icons.Collapse className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{PAGE_TITLES[currentPage]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            >
              <Icons.Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                Ctrl+K
              </kbd>
            </button>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              V1.0.0
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
          {currentPage === 'checklists' && <Checklists currentUser={currentUser} addToast={addToast} />}
          {currentPage === 'schedule' && <Schedule currentUser={currentUser} addToast={addToast} />}
          {currentPage === 'machines' && <Machines />}
          {currentPage === 'reports' && <Reports />}
          {currentPage === 'changelog' && <Changelog />}
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setCurrentPage}
        onSelectMachine={handleSelectMachine}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
