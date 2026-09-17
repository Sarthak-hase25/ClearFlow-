import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Zap, CheckCircle, AlertTriangle,
  ArrowRight, Clock, Sparkles, Building2
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { SourceBadge } from '../components/ui/Badges';
import { formatRelativeTime, getPriorityColor, getSeverityColor } from '../utils/formatters';

function StatCard({ icon: Icon, label, value, color = 'blue', subtext, isActionable = false, onClick }) {
  const styles = {
    red: {
      card: isActionable
        ? 'bg-gradient-to-br from-red-50/70 to-white border-red-200/80 shadow-sm hover:border-red-300 ring-1 ring-red-100'
        : 'bg-white border-gray-100 hover:border-gray-200',
      iconBg: 'bg-red-100 text-red-600',
      badge: 'bg-red-50 text-red-700 border-red-200',
      val: 'text-red-700',
    },
    amber: {
      card: 'bg-white border-gray-100 hover:border-violet-200 shadow-sm',
      iconBg: 'bg-violet-100 text-violet-600',
      badge: 'bg-violet-50 text-violet-700 border-violet-200',
      val: 'text-gray-900',
    },
    orange: {
      card: 'bg-white border-gray-100 hover:border-amber-200 shadow-sm',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      val: 'text-gray-900',
    },
    blue: {
      card: 'bg-white border-gray-100 hover:border-gray-200 shadow-sm opacity-90',
      iconBg: 'bg-slate-100 text-slate-600',
      badge: 'bg-slate-50 text-slate-600 border-slate-200',
      val: 'text-gray-900',
    },
  };

  const activeTheme = styles[color] || styles.blue;

  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-2xl border p-4 sm:p-5 transition-all duration-200 group cursor-pointer ${activeTheme.card}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${activeTheme.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
          <Icon className="w-4 h-4" />
        </div>
        {isActionable && (
          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-red-100 text-red-700 border border-red-200 animate-pulse whitespace-nowrap">
            Action Required
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <p className={`text-2xl sm:text-3xl font-extrabold leading-none tracking-tight ${activeTheme.val}`}>{value}</p>
      </div>

      <p className="text-xs font-semibold text-gray-800 mt-2 flex items-center justify-between">
        <span className="truncate pr-1">{label}</span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </p>

      {subtext && (
        <p className="text-[11px] text-gray-400 mt-0.5 font-normal truncate">{subtext}</p>
      )}
    </button>
  );
}

function AttentionItem({ item, commMap }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.kind === 'action')   navigate(`/insight/action/${item.id}`);
    if (item.kind === 'risk')     navigate(`/insight/risk/${item.id}`);
    if (item.kind === 'decision') navigate(`/insight/decision/${item.id}`);
  };

  // Derive contextual reason from linked communication or item properties
  const comm = item.communicationId ? commMap[item.communicationId] : null;

  let contextTag = '';
  if (comm) {
    if (comm.source === 'Client') contextTag = 'Client request';
    else if (comm.source === 'Contractor') contextTag = 'Contractor waiting';
    else if (comm.source === 'Supplier') contextTag = 'Supplier update';
    else if (comm.source === 'Site Update') contextTag = 'Site team waiting';
    else if (comm.source === 'Email') contextTag = 'Consultant notice';
    else contextTag = `${comm.source} update`;
  } else if (item.potentialImpact) {
    contextTag = 'Material procurement';
  }

  if (item.kind === 'action') {
    const c = getPriorityColor(item.priority);
    return (
      <button
        onClick={handleClick}
        className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/20 bg-white shadow-sm transition-all duration-150 group cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.badge}`}>
                {item.priority} Priority
              </span>
              {contextTag && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {contextTag}
                </span>
              )}
              <span className="text-[10px] text-amber-700 font-medium px-2 py-0.5 rounded bg-amber-50 border border-amber-200/60">
                {item.status === 'in-progress' ? 'In Progress' : 'Pending'}
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
              {item.title}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
              <span>Assignee: <strong className="text-gray-600 font-medium">{item.assignee && item.assignee !== 'Not specified' ? item.assignee : 'Not assigned'}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                Due: <strong className="text-gray-600 font-medium">{item.deadline && item.deadline !== 'Not specified' ? item.deadline : 'Not specified'}</strong>
              </span>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 flex-shrink-0 mt-1 transition-all" />
        </div>
      </button>
    );
  }

  if (item.kind === 'risk') {
    const c = getSeverityColor(item.severity);
    return (
      <button
        onClick={handleClick}
        className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/20 bg-white shadow-sm transition-all duration-150 group cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.badge}`}>
                {item.severity} Risk
              </span>
              {contextTag && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {contextTag}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-800 transition-colors leading-snug">
              {item.title}
            </p>

            {item.potentialImpact && (
              <p className="text-xs text-amber-800/80 mt-1.5 line-clamp-1">
                Impact: {item.potentialImpact}
              </p>
            )}
          </div>

          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 flex-shrink-0 mt-1 transition-all" />
        </div>
      </button>
    );
  }

  if (item.kind === 'decision') {
    return (
      <button
        onClick={handleClick}
        className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/20 bg-white shadow-sm transition-all duration-150 group cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                Decision Required
              </span>
              {contextTag && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {contextTag}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-800 transition-colors leading-snug">
              {item.title}
            </p>

            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {item.description}
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 group-hover:translate-x-1 flex-shrink-0 mt-1 transition-all" />
        </div>
      </button>
    );
  }

  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    getDashboardStats,
    getProjectStats,
    getNeedsAttention,
    getRecentCommunications,
    communications,
    projects,
  } = useApp();

  const stats       = getDashboardStats();
  const attention   = getNeedsAttention();
  const recent      = getRecentCommunications(5);
  const mainProject = projects.find(p => p.name === 'Modern Villa' || p.id === 'proj-001') || projects[0];
  const mainStats   = mainProject ? getProjectStats(mainProject.id) : null;

  // Map communications for fast lookup of context tags
  const commMap = communications.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in space-y-8">

      {/* Header — Personalized Intelligence Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Modern Villa · Project Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Good morning, Sarthak
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            What needs your attention across project communication today
          </p>
        </div>

        <button
          onClick={() => navigate(mainProject ? `/projects/${mainProject.id}/add-communication` : '/projects')}
          className="btn-primary text-xs self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Add & Analyze Communication
        </button>
      </div>

      {/* Primary Project Intelligence Banner */}
      {mainProject && mainStats && (
        <div
          onClick={() => navigate(`/projects/${mainProject.id}`)}
          className="w-full text-left bg-slate-900 rounded-2xl p-6 text-white group hover:bg-slate-800 transition-all duration-200 cursor-pointer shadow-md border border-slate-800 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Primary Active Workspace
                </span>
                <span className="text-xs text-slate-400">{mainProject.location}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">
                {mainProject.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-1">
                {mainProject.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 group-hover:text-white transition-colors self-start sm:self-auto">
              <span>Open Project Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 pt-4 border-t border-slate-800/80 text-xs relative z-10">
            <span className="text-slate-300 font-medium">
              <strong className="text-white">{mainStats.communicationCount}</strong> Communications
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-red-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <strong className="text-white">{mainStats.pendingActionCount}</strong> Pending Actions
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-violet-300 font-medium">
              <strong className="text-white">{mainStats.openDecisionCount}</strong> Open Decisions
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-amber-300 font-medium">
              <strong className="text-white">{mainStats.activeRiskCount}</strong> Active Risks
            </span>
          </div>
        </div>
      )}

      {/* Priority-Aware Overview Stats */}
      {/* Pending Actions is prioritized as the primary actionable stat */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Pending Actions"
          value={stats.pendingActions}
          color="red"
          subtext="Urgent tasks to complete"
          isActionable={stats.pendingActions > 0}
          onClick={() => navigate('/actions')}
        />
        <StatCard
          icon={CheckCircle}
          label="Open Decisions"
          value={stats.openDecisions}
          color="amber"
          subtext="Approvals & choices needed"
          onClick={() => navigate('/decisions')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Risks"
          value={stats.activeRisks}
          color="orange"
          subtext="Potential conflicts & delays"
          onClick={() => navigate('/risks')}
        />
        <StatCard
          icon={MessageSquare}
          label="Communications"
          value={stats.totalCommunications}
          color="blue"
          subtext="Captured project threads"
          onClick={() => navigate('/communications')}
        />
      </div>

      {/* Main Two-Column Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Column 1: NEEDS ATTENTION (Visual focus of the dashboard) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-base font-bold text-gray-900">Needs Attention</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
              {attention.length} items requiring focus
            </span>
          </div>

          {attention.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
              <p className="text-sm font-bold text-emerald-800">You're all caught up!</p>
              <p className="text-xs text-emerald-600 mt-1">No urgent actions or unresolved risks right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attention.map(item => (
                <AttentionItem
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  commMap={commMap}
                />
              ))}
            </div>
          )}
        </div>

        {/* Column 2: RECENT COMMUNICATION (Compact, scannable format) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Communication</h2>
            <button
              onClick={() => navigate('/communications')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all ({communications.length})
            </button>
          </div>

          <div className="space-y-3">
            {recent.map(comm => {
              const project = projects.find(p => p.id === comm.projectId);
              return (
                <div
                  key={comm.id}
                  onClick={() => comm.hasInsight && comm.insightId ? navigate(`/analysis-result/${comm.insightId}`) : navigate(`/projects/${comm.projectId}`)}
                  className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50/50 bg-white shadow-sm transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <SourceBadge source={comm.source} />
                      <span className="text-xs font-semibold text-gray-800">{comm.sender}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(comm.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    "{comm.message}"
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 text-[11px]">
                    <span className="text-gray-400 font-medium">
                      {project?.name}
                    </span>
                    {comm.hasInsight && (
                      <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>View Analysis</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
