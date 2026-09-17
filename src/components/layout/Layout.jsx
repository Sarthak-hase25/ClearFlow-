import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Building2, LayoutDashboard, FolderOpen, MessageSquare, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const mobileNavItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/projects',      icon: FolderOpen,      label: 'Projects'       },
  { to: '/communications',icon: MessageSquare,   label: 'Messages'       },
  { to: '/actions',       icon: Zap,             label: 'Actions'        },
  { to: '/decisions',     icon: CheckCircle,     label: 'Decisions'      },
  { to: '/risks',         icon: AlertTriangle,   label: 'Risks'          },
];

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
        />
      </div>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900 flex items-center justify-between px-4 border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">ArchFlow</span>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-medium ml-1.5">Project Intelligence</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="p-2 -mr-1.5 text-slate-400 hover:text-white transition-colors rounded-lg flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile nav overlay & drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <nav
            className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-slate-900 flex flex-col p-4 shadow-2xl border-r border-white/10 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm">ArchFlow</span>
                  <p className="text-[10px] text-slate-400">Project Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-1 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px] cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="space-y-1 flex-1">
              {mobileNavItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `nav-link py-2.5 px-3 rounded-xl flex items-center gap-3 text-sm font-medium ${
                      isActive ? 'active text-white bg-blue-600/30 border border-blue-500/40' : 'text-slate-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 mt-auto border-t border-white/10 text-xs text-slate-400">
              <p className="font-medium text-slate-300">ArchFlow v1.0</p>
              <p className="text-[11px] text-slate-500 mt-0.5">ArchScale Hackathon 2026</p>
            </div>
          </nav>
        </div>
      )}

      {/* Responsive Main Content Container (Unified single Outlet) */}
      <main
        className={`
          transition-all duration-300 ease-in-out min-h-screen pt-14 lg:pt-0
          ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
        `}
      >
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
