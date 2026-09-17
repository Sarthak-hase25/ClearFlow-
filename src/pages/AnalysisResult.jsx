import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, Clock, ArrowLeft,
  MessageSquare, ShieldAlert, CheckCircle, ExternalLink,
  Info, ChevronRight
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { SourceBadge, PriorityBadge, SeverityBadge, StatusBadge } from '../components/ui/Badges';
import { Select } from '../components/ui/Select';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';
import { PageLoader } from '../components/ui/LoadingSpinner';

export default function AnalysisResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getInsightById,
    fetchInsightById,
    getCommunicationById,
    fetchCommunicationById,
    getProjectById,
    actions: allActions,
    decisions: allDecisions,
    risks: allRisks,
    updateActionStatus,
    updateDecisionStatus,
    loadingProjects,
    loadingIntelligence,
  } = useApp();

  // Retrieve state passed from AddCommunication
  const stateData = location.state;
  const [fetchedInsight, setFetchedInsight] = useState(null);
  const [fetchedComm, setFetchedComm] = useState(null);

  // Fallback lookup via store
  const insight = stateData?.insight || getInsightById(id) || fetchedInsight;
  const communicationInStore = stateData?.communication || (insight ? getCommunicationById(insight.communicationId) : getCommunicationById(id));
  const communication = communicationInStore || fetchedComm;
  const project = communication ? getProjectById(communication.projectId) : null;

  useEffect(() => {
    if (!insight && id) {
      fetchInsightById(id).then(ins => {
        if (ins) setFetchedInsight(ins);
      });
    }
  }, [insight, id, fetchInsightById]);

  useEffect(() => {
    if (!communication) {
      const targetId = insight?.communicationId || id;
      if (targetId) {
        fetchCommunicationById(targetId).then(comm => {
          if (comm) setFetchedComm(comm);
        });
      }
    }
  }, [communication, insight, id, fetchCommunicationById]);

  const actions   = stateData?.actions   || (insight ? allActions.filter(a => a.insightId === insight.id || a.communicationId === insight.communicationId) : []);
  const decisions = stateData?.decisions || (insight ? allDecisions.filter(d => d.insightId === insight.id || d.communicationId === insight.communicationId) : []);
  const risks     = stateData?.risks     || (insight ? allRisks.filter(r => r.insightId === insight.id || r.communicationId === insight.communicationId) : []);

  if ((loadingProjects || loadingIntelligence) && !insight && !communication) {
    return (
      <div className="animate-fade-in py-24">
        <PageLoader />
      </div>
    );
  }

  if (!insight && !communication) {
    return (
      <div className="animate-fade-in text-center py-24">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Info className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Result Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">Could not locate the requested AI extraction record.</p>
        <button onClick={() => navigate('/projects')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">

      {/* Top Header & Breadcrumb */}
      <div>
        <button
          onClick={() => project ? navigate(`/projects/${project.id}`) : navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {project ? project.name : 'Projects'}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  What Did ArchFlow Understand?
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  AI Intelligence
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                <span>Analyzed on {formatDateTime(insight?.analyzedAt || new Date().toISOString())}</span>
                {project && (
                  <>
                    <span>·</span>
                    <span className="text-gray-700 font-semibold">{project.name}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate(project ? `/projects/${project.id}/add-communication` : '/add-communication')}
              className="btn-secondary text-xs"
            >
              Analyze Another
            </button>
            {project && (
              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="btn-primary text-xs shadow-sm"
              >
                <span>View Project Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Transparency & Trust Banner */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-700">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-semibold text-slate-900">AI-generated insight: </span>
          <span>
            These actions, decisions, and risks were extracted based on the communication below. You can review, update statuses, or trace any item back to the exact source message.
          </span>
        </div>
      </div>

      {/* 1. SUMMARY (Concise, readable executive summary) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span>Summary</span>
        </div>
        <p className="text-base text-gray-900 font-medium leading-relaxed bg-blue-50/40 p-4 rounded-xl border border-blue-100/60">
          "{insight?.summary || 'No summary available.'}"
        </p>
      </div>

      {/* 2. ACTION ITEMS (Strongest actionable element) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Action Items</h2>
              <p className="text-xs text-gray-400">What needs to be done based on this message</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            {actions.length} {actions.length === 1 ? 'Action' : 'Actions'}
          </span>
        </div>

        {actions.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-4 text-center">No explicit action items extracted from this message.</p>
        ) : (
          <div className="space-y-3">
            {actions.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={act.priority} />
                    <StatusBadge status={act.status} />
                    <h3 className={`text-base font-bold leading-snug ${act.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {act.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{act.description && act.description !== 'null' ? act.description : 'Not specified'}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-400">
                    <span>Assignee: <strong className="text-gray-700 font-medium">{act.assignee && act.assignee !== 'null' && act.assignee !== 'Not specified' ? act.assignee : 'Not specified'}</strong></span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Deadline: <strong className="text-gray-700 font-medium">{act.deadline && act.deadline !== 'null' && act.deadline !== 'Not specified' ? act.deadline : 'Not specified'}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:flex-shrink-0 self-start sm:self-center">
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
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                    title="View source traceability"
                  >
                    <span>Trace</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. KEY DECISIONS (Visually distinct: choose/approve vs do) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Decisions</h2>
              <p className="text-xs text-gray-400">What needs to be approved or chosen</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
            {decisions.length} {decisions.length === 1 ? 'Decision' : 'Decisions'}
          </span>
        </div>

        {decisions.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-4 text-center">No explicit decisions recorded from this communication.</p>
        ) : (
          <div className="space-y-3">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-4 rounded-xl border border-violet-100/80 bg-violet-50/20 hover:bg-violet-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
                    <h3 className="text-sm font-bold text-gray-900">{dec.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{dec.description && dec.description !== 'null' ? dec.description : 'Not specified'}</p>
                  <p className="text-xs text-gray-400">
                    Decision Owner: <strong className="text-gray-700 font-medium">{(dec.decidedBy && dec.decidedBy !== 'null' && dec.decidedBy !== 'Not specified') ? dec.decidedBy : ((dec.decisionOwner && dec.decisionOwner !== 'null' && dec.decisionOwner !== 'Not specified') ? dec.decisionOwner : 'Not specified')}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-violet-100 sm:flex-shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => updateDecisionStatus(dec.id, dec.status === 'confirmed' ? 'pending' : 'confirmed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      dec.status === 'confirmed'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {dec.status === 'confirmed' ? '✓ Confirmed' : 'Mark Confirmed'}
                  </button>
                  <button
                    onClick={() => navigate(`/insight/decision/${dec.id}`)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                    title="View source traceability"
                  >
                    <span>Trace</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. IDENTIFIED RISKS (Restrained warning style) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Identified Risks</h2>
              <p className="text-xs text-gray-400">What could cause a problem or schedule delay</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {risks.length} {risks.length === 1 ? 'Risk' : 'Risks'}
          </span>
        </div>

        {risks.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-4 text-center">No active risks detected in this communication.</p>
        ) : (
          <div className="space-y-3">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="p-4 rounded-xl border border-amber-100/80 bg-amber-50/20 hover:bg-amber-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={risk.severity} />
                    <h3 className="text-sm font-bold text-gray-900">{risk.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{risk.description && risk.description !== 'null' ? risk.description : 'Not specified'}</p>
                  {(risk.impact || risk.potentialImpact) && (
                    <p className="text-xs text-amber-900 bg-amber-100/60 rounded-md px-2.5 py-1 mt-1 inline-block border border-amber-200/50">
                      <strong>Potential Impact:</strong> {(risk.impact && risk.impact !== 'null' && risk.impact !== 'Not specified') ? risk.impact : ((risk.potentialImpact && risk.potentialImpact !== 'null') ? risk.potentialImpact : 'Not specified')}
                    </p>
                  )}
                </div>

                <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-100 sm:flex-shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => navigate(`/insight/risk/${risk.id}`)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                    title="View source traceability"
                  >
                    <span>Trace</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. SOURCE TRACEABILITY (The foundation of AS-02) */}
      {communication && (
        <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Source Communication</h2>
                <p className="text-xs text-gray-500">The verbatim message that generated these insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SourceBadge source={communication.source} />
              <span className="text-xs text-gray-400">
                {formatRelativeTime(communication.timestamp)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-slate-400 pb-2.5 mb-2.5 border-b border-slate-800 text-xs">
              <span>From: <strong className="text-white font-medium">{communication.sender}</strong> ({communication.source})</span>
              <span className="font-mono text-[11px]">ID: {communication.id}</span>
            </div>
            <p className="font-sans text-sm text-slate-100 whitespace-pre-wrap leading-relaxed break-words">
              "{communication.message}"
            </p>
          </div>

          <p className="text-xs text-blue-900 bg-blue-50/70 p-3 rounded-lg border border-blue-100 font-medium leading-relaxed">
            Based on this communication, ArchFlow extracted {actions.length} action{actions.length !== 1 ? 's' : ''}, {decisions.length} decision{decisions.length !== 1 ? 's' : ''}, and {risks.length} risk{risks.length !== 1 ? 's' : ''}. Every item retains an unalterable link to this source message.
          </p>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/communications')}
          className="btn-secondary text-xs"
        >
          View All Communications
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/actions')}
            className="btn-secondary text-xs"
          >
            All Action Items
          </button>
          {project && (
            <button
              onClick={() => navigate(`/projects/${project.id}`)}
              className="btn-primary text-xs shadow-sm"
            >
              Return to Project Overview
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
