import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, MessageSquare, Zap,
  CheckCircle, AlertTriangle, User, ChevronLeft,
  ChevronRight, Building2,
} from 'lucide-react';

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/projects',      icon: FolderOpen,      label: 'Projects'       },
  { to: '/communications',icon: MessageSquare,   label: 'Communications' },
  { to: '/actions',       icon: Zap,             label: 'Actions'        },
  { to: '/decisions',     icon: CheckCircle,     label: 'Decisions'      },
  { to: '/risks',         icon: AlertTriangle,   label: 'Risks'          },
];

export function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-30
        bg-slate-900 flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">ArchFlow</p>
            <p className="text-slate-400 text-[10px] leading-tight truncate">Project Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={`
              nav-link
              ${isActive(to) ? 'active' : ''}
              ${collapsed ? 'justify-center px-0' : ''}
            `}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/10 space-y-1.5 flex-shrink-0">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-blue-300" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">Demo User</p>
              <p className="text-[10px] text-slate-400 truncate">ArchFlow Team</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={`nav-link w-full ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!collapsed && <span className="text-xs">Collapse</span>}
          {collapsed
            ? <ChevronRight className="w-4 h-4 flex-shrink-0" />
            : <ChevronLeft  className="w-4 h-4 flex-shrink-0" />
          }
        </button>
      </div>
    </aside>
  );
}
