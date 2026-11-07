import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Layers,
  Sliders,
  Users,
  Bell,
  Database,
  ShieldAlert,
  LogOut,
  Search,
  Menu,
  X,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  Sparkles,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const {
    remoteConfig,
    toggleMaintenanceMode,
    orders,
    toast,
    isBackendConnected,
    refetchAll,
  } = useApp();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    {
      name: 'Orders',
      path: '/orders',
      icon: ShoppingBag,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
    },
    { name: 'Sellers & Vendors', path: '/sellers', icon: Store },
    { name: 'Products & Catalog', path: '/catalog', icon: Layers },
    { name: 'Coupons & Promo Codes', path: '/coupons', icon: Tag },
    { name: 'App Banners', path: '/banners', icon: ImageIcon },
    { name: 'Hero Showcase', path: '/hero-config', icon: Sparkles },
    { name: 'Settings & Config', path: '/remote-config', icon: Sliders },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Push Notifications', path: '/notifications', icon: Bell },
    { name: 'Master Data', path: '/master-data', icon: Database },
    { name: 'Audit Logs', path: '/audit-logs', icon: History },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 bg-slate-900 border-slate-700 text-slate-100">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'warning'
                ? 'bg-amber-400'
                : toast.type === 'error'
                ? 'bg-rose-500'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 flex flex-col border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl relative z-30`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <span className="font-extrabold text-white text-lg tracking-tight">V</span>
            </div>
            {sidebarOpen && (
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-wide">Vendra</h1>
                  <span className="text-[10px] uppercase font-semibold tracking-wider bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Ecommerce Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon
                  size={19}
                  className="shrink-0 transition-transform group-hover:scale-110"
                />
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Backend Status Box */}
        {sidebarOpen && (
          <div className="p-3 mx-3 mb-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Backend API
              </span>
              <span className={`text-[11px] font-mono ${isBackendConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBackendConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        )}

        {/* User bar */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700 shrink-0">
              {user?.name ? user.name[0] : 'A'}
            </div>
            {sidebarOpen && (
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.role || 'SUPER_ADMIN'}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search orders, products, users..."
                className="w-80 bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition"
              />
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3">
            {/* Live Database Sync Status */}
            <button
              onClick={() => refetchAll()}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                isBackendConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              }`}
              title={isBackendConnected ? 'Click to re-sync with live MongoDB' : 'Backend offline. Run npm run dev in /backend'}
            >
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline font-mono text-[11px]">
                {isBackendConnected ? 'Backend Live' : 'Backend Disconnected'}
              </span>
            </button>

            {/* Maintenance Mode Alert */}
            {remoteConfig.isMaintenanceMode && (
              <button
                onClick={toggleMaintenanceMode}
                className="px-3 py-1.5 rounded-xl border border-rose-500/60 bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 animate-pulse"
                title="Store locked. Click to disable maintenance."
              >
                <ShieldAlert size={16} />
                <span>MAINTENANCE MODE ACTIVE</span>
              </button>
            )}

            {/* Storefront Link */}
            <a
              href={import.meta.env.VITE_CONSUMER_APP_URL || 'http://localhost:5173'}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition font-medium"
            >
              <span>Storefront</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
