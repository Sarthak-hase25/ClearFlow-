import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, Filter, Clock, ChevronDown, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { SourceBadge } from '../components/ui/Badges';
import { Select } from '../components/ui/Select';
import { formatRelativeTime } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';

const SOURCES = ['All', 'Client', 'Architect', 'Contractor', 'Supplier', 'Consultant', 'Site Update', 'Drawing Update', 'Email', 'Other'];

function CommunicationCard({ comm, project, onClick, onAnalyze, isAnalyzing }) {
  return (
    <div
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-150 group cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2.5 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={comm.source} />
          <span className="text-sm font-bold text-gray-900">{comm.sender}</span>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatRelativeTime(comm.timestamp)}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans line-clamp-3">
        "{comm.message}"
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-4 pt-3 border-t border-gray-50 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {project && (
            <span className="text-gray-500 font-medium">{project.name}</span>
          )}
          <span className="text-gray-300">·</span>
          <span className="text-gray-400 font-mono text-[11px]">{comm.id}</span>
        </div>

        {comm.hasInsight ? (
          <span className="text-blue-600 font-semibold flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Intelligence Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAnalyze) onAnalyze(comm);
            }}
            disabled={isAnalyzing}
            className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 text-blue-600 font-semibold self-start sm:self-auto hover:bg-blue-50 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing…' : 'Analyze Communication'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function Communications() {
  const navigate   = useNavigate();
  const { id: projectId } = useParams(); // optional: scoped to project

  const { communications, projects, getProjectById, loadingComms, analyzeExistingCommunication } = useApp();
  const [search,        setSearch]        = useState('');
  const [projectFilter, setProjectFilter] = useState(projectId || 'All');
  const [sourceFilter,  setSource]        = useState('All');
  const [showFilter,    setShowFilter]    = useState(false);
  const [analyzingId,   setAnalyzingId]   = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  const project = projectId ? getProjectById(projectId) : null;

  const commsToShow = projectId
    ? communications.filter(c => c.projectId === projectId)
    : projectFilter !== 'All'
    ? communications.filter(c => c.projectId === projectFilter)
    : communications;

  const filtered = commsToShow
    .filter(c => sourceFilter === 'All' || c.source === sourceFilter)
    .filter(c =>
      !search ||
      c.message.toLowerCase().includes(search.toLowerCase()) ||
      c.sender.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleAnalyze = async (comm) => {
    if (analyzingId) return;
    setAnalyzingId(comm.id);
    setAnalysisError('');
    try {
      const result = await analyzeExistingCommunication(comm.id);
      setAnalyzingId(null);
      navigate(`/analysis-result/${result.insight.id}`, {
        state: {
          communication: result.communication,
          insight: result.insight,
          actions: result.actions,
          decisions: result.decisions,
          risks: result.risks,
        }
      });
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
  };

  const handleCommunicationClick = (comm) => {
    if (comm.hasInsight && comm.insightId) {
      navigate(`/analysis-result/${comm.insightId}`);
    } else {
      handleAnalyze(comm);
    }
  };

  const addCommPath = project
    ? `/projects/${project.id}/add-communication`
    : '/add-communication';

  return (
    <div className="animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {project && (
            <button
              onClick={() => navigate(`/projects/${project.id}`)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {project.name}
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {project ? `${project.name} — Communications` : 'Project Communications'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            The single source of truth: raw communication channels captured and analyzed by ArchFlow
          </p>
        </div>

        <button
          onClick={() => navigate(addCommPath)}
          className="btn-primary flex-shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Communication
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-10 text-xs sm:text-sm"
            placeholder="Search communications by keywords or sender…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Global project selector if not scoped */}
        {!projectId && (
          <div className="w-full sm:w-56">
            <Select
              value={projectFilter}
              onChange={setProjectFilter}
              options={[{ value: 'All', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.name }))]}
            />
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowFilter(v => !v)}
            className={`btn-secondary justify-between sm:justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto h-[38px] ${sourceFilter !== 'All' ? 'border-blue-300 text-blue-700 bg-blue-50/50' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>{sourceFilter === 'All' ? 'Source: All' : sourceFilter}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1.5">
              {SOURCES.map(s => (
                <button
                  key={s}
                  onClick={() => { setSource(s); setShowFilter(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-gray-50 transition-colors font-medium
                    ${sourceFilter === s ? 'text-blue-700 font-semibold bg-blue-50/60' : 'text-gray-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Error Banner */}
      {analysisError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center justify-between animate-fade-in">
          <span>{analysisError}</span>
          <button onClick={() => setAnalysisError('')} className="text-red-500 hover:text-red-700 text-xs font-bold ml-3 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Communication List */}
      {loadingComms && communications.length === 0 ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="communications"
          title={search || sourceFilter !== 'All' ? 'No matching communications' : undefined}
          description={search || sourceFilter !== 'All' ? 'Try adjusting your search query or channel filter.' : undefined}
          action={
            (!search && sourceFilter === 'All') ? (
              <button onClick={() => navigate(addCommPath)} className="btn-primary text-xs">
                <Plus className="w-4 h-4" /> Add First Communication
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(comm => (
            <CommunicationCard
              key={comm.id}
              comm={comm}
              project={projects.find(p => p.id === comm.projectId)}
              onClick={() => handleCommunicationClick(comm)}
              onAnalyze={() => handleAnalyze(comm)}
              isAnalyzing={analyzingId === comm.id}
            />
          ))}
        </div>
      )}

    </div>
  );
}
