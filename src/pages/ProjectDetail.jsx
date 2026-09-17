import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus, MapPin, MessageSquare, Zap, CheckCircle, AlertTriangle,
  ArrowLeft, ArrowRight, Clock, Sparkles, Trash2
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { SourceBadge, ProjectStatusBadge, PriorityBadge, SeverityBadge, StatusBadge } from '../components/ui/Badges';
import { Select } from '../components/ui/Select';
import { formatRelativeTime, getSeverityColor } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getProjectById,
    getCommunicationsByProject,
    getActionsByProject,
    getDecisionsByProject,
    getRisksByProject,
    updateActionStatus,
    updateDecisionStatus,
    loadingProjects,
    analyzeExistingCommunication,
    deleteProject,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // overview | communications | actions | decisions | risks
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const project        = getProjectById(id);
  const communications = getCommunicationsByProject(id);
  const actions        = getActionsByProject(id);
  const decisions      = getDecisionsByProject(id);
  const risks          = getRisksByProject(id);

  if (loadingProjects && !project) {
    return (
      <div className="animate-fade-in space-y-7">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </button>
        <PageLoader />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="animate-fade-in text-center py-24">
        <p className="text-gray-500 mb-4">Project not found.</p>
        <button onClick={() => navigate('/projects')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
      </div>
    );
  }

  const pendingActions  = actions.filter(a => a.status === 'pending');
  const highActions     = actions.filter(a => a.priority?.toLowerCase() === 'high' && a.status === 'pending');
  const openDecisions   = decisions.filter(d => d.status === 'open' || d.status === 'pending');
  const displayedActions = highActions.length > 0 ? highActions : pendingActions;
  const recentComms     = communications.slice(0, 4);

  const handleDeleteProject = () => {
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteProject(project.id);
      setIsDeleting(false);
      setShowDeleteModal(false);
      navigate('/projects');
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="animate-fade-in space-y-7">
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
            setDeleteError('');
          }
        }}
        onConfirm={confirmDelete}
        projectName={project.name}
        isDeleting={isDeleting}
        error={deleteError}
      />

      {/* Breadcrumb + Project Header */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <ProjectStatusBadge status={project.status} />
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {project.type} Project
                </span>
                {project.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{project.location}</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {project.name}
              </h1>

              {project.description && (
                <p className="text-sm text-gray-600 mt-2 max-w-3xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={handleDeleteProject}
                className="btn-secondary text-xs text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => navigate(`/projects/${id}/add-communication`)}
                className="btn-primary text-xs shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Communication
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            {[
              { id: 'overview',       label: 'Overview',       count: null },
              { id: 'communications', label: 'Communications', count: communications.length },
              { id: 'actions',        label: 'Actions',        count: pendingActions.length, badgeColor: 'bg-red-100 text-red-700' },
              { id: 'decisions',      label: 'Decisions',      count: openDecisions.length,  badgeColor: 'bg-violet-100 text-violet-700' },
              { id: 'risks',          label: 'Risks',          count: risks.length,          badgeColor: 'bg-amber-100 text-amber-700' },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : (tab.badgeColor || 'bg-gray-100 text-gray-600')
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('communications')}
              className="stat-card text-left hover:border-gray-300 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{communications.length}</p>
              <p className="text-xs text-gray-500 font-medium flex items-center justify-between mt-1">
                <span>Communications</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </p>
            </button>

            <button
              onClick={() => setActiveTab('actions')}
              className="stat-card text-left hover:border-red-200 bg-red-50/20 border-red-100 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-red-700">{pendingActions.length}</p>
              <p className="text-xs text-red-900/70 font-medium flex items-center justify-between mt-1">
                <span>Pending Actions</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-300 group-hover:text-red-700 transition-colors" />
              </p>
            </button>

            <button
              onClick={() => setActiveTab('decisions')}
              className="stat-card text-left hover:border-violet-200 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{openDecisions.length}</p>
              <p className="text-xs text-gray-500 font-medium flex items-center justify-between mt-1">
                <span>Open Decisions</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </p>
            </button>

            <button
              onClick={() => setActiveTab('risks')}
              className="stat-card text-left hover:border-amber-200 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
              <p className="text-xs text-gray-500 font-medium flex items-center justify-between mt-1">
                <span>Active Risks</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </p>
            </button>
          </div>

          {/* Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Recent Communications */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Recent Communications</h2>
                <button
                  onClick={() => setActiveTab('communications')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  View all ({communications.length}) <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {recentComms.length === 0 ? (
                <EmptyState
                  icon="communications"
                  action={
                    <button
                      onClick={() => navigate(`/projects/${id}/add-communication`)}
                      className="btn-primary text-xs"
                    >
                      <Plus className="w-4 h-4" /> Add First Communication
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {recentComms.map(comm => (
                    <div
                      key={comm.id}
                      onClick={() => comm.hasInsight && comm.insightId ? navigate(`/analysis-result/${comm.insightId}`) : setActiveTab('communications')}
                      className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-150 group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <SourceBadge source={comm.source} />
                          <span className="text-xs font-semibold text-gray-800">{comm.sender}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(comm.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        "{comm.message}"
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 text-[11px]">
                        {comm.hasInsight ? (
                          <span className="text-blue-600 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Insight Available
                          </span>
                        ) : <span />}
                        <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          View details →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* High Priority Attention Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* High Priority / Pending Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900">
                    {highActions.length > 0 ? 'Urgent Pending Actions' : 'Pending Actions'}
                  </h2>
                  <button
                    onClick={() => setActiveTab('actions')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    All ({actions.length})
                  </button>
                </div>

                {displayedActions.length === 0 ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <p className="text-xs font-semibold text-emerald-800">No pending actions</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedActions.slice(0, 3).map(action => (
                      <button
                        key={action.id}
                        onClick={() => navigate(`/insight/action/${action.id}`)}
                        className="attention-item w-full text-left group"
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                          action.priority?.toLowerCase() === 'high' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 leading-snug line-clamp-2">
                            {action.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                            <span>Assignee: {action.assignee && action.assignee !== 'Not specified' ? action.assignee : 'Not assigned'}</span>
                            <span>·</span>
                            <span>Due: {action.deadline && action.deadline !== 'Not specified' ? action.deadline : 'Immediate'}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Decisions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-gray-900">Pending Decisions</h2>
                  <button
                    onClick={() => setActiveTab('decisions')}
                    className="text-xs text-violet-600 hover:text-violet-700 font-semibold"
                  >
                    All ({decisions.length})
                  </button>
                </div>

                {openDecisions.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400">No pending decisions</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {openDecisions.slice(0, 3).map(dec => (
                      <button
                        key={dec.id}
                        onClick={() => navigate(`/insight/decision/${dec.id}`)}
                        className="attention-item w-full text-left group"
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1 bg-violet-500" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-violet-700 leading-snug line-clamp-2">
                            {dec.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Owner: {(dec.decidedBy && dec.decidedBy !== 'null' && dec.decidedBy !== 'Not specified') ? dec.decidedBy : ((dec.decisionOwner && dec.decisionOwner !== 'null' && dec.decisionOwner !== 'Not specified') ? dec.decisionOwner : 'Not specified')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Risks */}
              {risks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900">Active Risks</h2>
                    <button
                      onClick={() => setActiveTab('risks')}
                      className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                    >
                      All ({risks.length})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {risks.map(risk => {
                      const c = getSeverityColor(risk.severity);
                      return (
                        <button
                          key={risk.id}
                          onClick={() => navigate(`/insight/risk/${risk.id}`)}
                          className="attention-item w-full text-left group"
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${c.dot}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 group-hover:text-amber-700 leading-snug line-clamp-2">
                              {risk.title}
                            </p>
                            <p className={`text-[10px] font-semibold mt-0.5 ${c.text}`}>
                              {risk.severity.toUpperCase()} Severity
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: COMMUNICATIONS */}
      {activeTab === 'communications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Communications</h2>
              <p className="text-xs text-gray-500">Every message, site note, and client update recorded for {project.name}</p>
            </div>
            <button
              onClick={() => navigate(`/projects/${id}/add-communication`)}
              className="btn-primary text-xs"
            >
              <Plus className="w-4 h-4" /> Add Communication
            </button>
          </div>

          {analysisError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center justify-between animate-fade-in">
              <span>{analysisError}</span>
              <button onClick={() => setAnalysisError('')} className="text-red-500 hover:text-red-700 text-xs font-bold ml-3 cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {communications.length === 0 ? (
            <EmptyState
              icon="communications"
              action={
                <button
                  onClick={() => navigate(`/projects/${id}/add-communication`)}
                  className="btn-primary text-xs"
                >
                  <Plus className="w-4 h-4" /> Add Communication
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {communications.map(comm => (
                <div
                  key={comm.id}
                  onClick={() => comm.hasInsight && comm.insightId ? navigate(`/analysis-result/${comm.insightId}`) : null}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <SourceBadge source={comm.source} />
                      <span className="text-sm font-bold text-gray-800">{comm.sender}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(comm.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                    "{comm.message}"
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs">
                    <span className="text-[11px] font-mono text-gray-400">ID: {comm.id}</span>
                    {comm.hasInsight && comm.insightId ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/analysis-result/${comm.insightId}`);
                        }}
                        className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 text-blue-600 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View AI Extraction</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (analyzingId) return;
                          setAnalyzingId(comm.id);
                          setAnalysisError('');
                          try {
                            const result = await analyzeExistingCommunication(comm.id);
                            setAnalyzingId(null);
                            navigate(`/analysis-result/${result.insight.id}`, { state: result });
                          } catch (err) {
                            setAnalyzingId(null);
                            let displayMsg = 'Unable to analyze this communication right now. Please try again.';
                            const rawMsg = err.message || '';
                            if (rawMsg.includes('quota') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
                              displayMsg = 'Gemini API free tier quota limit reached. Please wait a moment and try again.';
                            } else if (rawMsg.includes('Unable to connect') || rawMsg.includes('Failed to fetch') || rawMsg.includes('network')) {
                              displayMsg = 'Unable to connect to the ArchFlow backend server. Please verify that the backend is running.';
                            } else if (rawMsg && !rawMsg.includes('{') && !rawMsg.includes('at ') && rawMsg.length < 150) {
                              displayMsg = rawMsg;
                            }
                            setAnalysisError(displayMsg);
                          }
                        }}
                        disabled={analyzingId === comm.id}
                        className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 text-blue-600 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{analyzingId === comm.id ? 'Analyzing…' : 'Analyze with AI'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: ACTIONS */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Action Items</h2>
              <p className="text-xs text-gray-500">Tasks extracted from communications for {project.name}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {pendingActions.length} Pending
            </span>
          </div>

          {actions.length === 0 ? (
            <EmptyState icon="actions" />
          ) : (
            <div className="space-y-3">
              {actions.map(act => (
                <div
                  key={act.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge priority={act.priority} />
                      <StatusBadge status={act.status} />
                      <h3 className={`text-sm font-bold ${act.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {act.title}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{act.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-400">
                      <span>Assignee: <strong className="text-gray-700 font-medium">{act.assignee && act.assignee !== 'Not specified' ? act.assignee : 'Not specified'}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: <strong className="text-gray-700 font-medium">{act.deadline && act.deadline !== 'Not specified' ? act.deadline : 'Not specified'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:flex-shrink-0">
                    <Select
                      size="sm"
                      value={act.status}
                      onChange={(val) => updateActionStatus(act.id, val)}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                      ]}
                      className="w-32"
                    />

                    <button
                      onClick={() => navigate(`/insight/action/${act.id}`)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Source Traceability →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: DECISIONS */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Decisions</h2>
              <p className="text-xs text-gray-500">Approvals and choices documented for {project.name}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
              {openDecisions.length} Open
            </span>
          </div>

          {decisions.length === 0 ? (
            <EmptyState icon="decisions" />
          ) : (
            <div className="space-y-3">
              {decisions.map(dec => (
                <div
                  key={dec.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
                      <h3 className="text-sm font-bold text-gray-900">{dec.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{dec.description}</p>
                    <p className="text-xs text-gray-400">
                      Owner: <strong className="text-gray-700 font-medium">{(dec.decidedBy && dec.decidedBy !== 'null' && dec.decidedBy !== 'Not specified') ? dec.decidedBy : ((dec.decisionOwner && dec.decisionOwner !== 'null' && dec.decisionOwner !== 'Not specified') ? dec.decisionOwner : 'Not specified')}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:flex-shrink-0">
                    <button
                      onClick={() => updateDecisionStatus(dec.id, (dec.status === 'confirmed' || dec.status === 'decided') ? 'open' : 'confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        dec.status === 'confirmed' || dec.status === 'decided'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {dec.status === 'confirmed' || dec.status === 'decided' ? '✓ Confirmed' : 'Mark Confirmed'}
                    </button>

                    <button
                      onClick={() => navigate(`/insight/decision/${dec.id}`)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Source Traceability →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: RISKS */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Risks</h2>
              <p className="text-xs text-gray-500">Flagged conflicts, lead time issues, and site blockers for {project.name}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              {risks.length} Active
            </span>
          </div>

          {risks.length === 0 ? (
            <EmptyState icon="risks" />
          ) : (
            <div className="space-y-3">
              {risks.map(risk => {
                return (
                  <div
                    key={risk.id}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <SeverityBadge severity={risk.severity} />
                        <h3 className="text-sm font-bold text-gray-900">{risk.title}</h3>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{risk.description}</p>
                      {risk.potentialImpact && (
                        <p className="text-xs text-amber-900 bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-100/80 inline-block">
                          <strong>Impact:</strong> {risk.potentialImpact}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/insight/risk/${risk.id}`)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Source Traceability →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
