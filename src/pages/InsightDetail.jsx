import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Zap, CheckCircle, AlertTriangle,
  Building2, Clock, Sparkles, ArrowRight
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { SourceBadge, PriorityBadge, SeverityBadge, StatusBadge } from '../components/ui/Badges';
import { Select } from '../components/ui/Select';
import { formatDate, formatDateTime, formatRelativeTime } from '../utils/formatters';
import { PageLoader } from '../components/ui/LoadingSpinner';

export default function InsightDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const {
    getActionById,
    getDecisionById,
    getRiskById,
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

  const [fetchedComm, setFetchedComm] = useState(null);

  let item = null;
  let itemTypeLabel = '';
  let whyLabel = '';
  let ItemIcon = Zap;
  let iconBg = 'bg-blue-50 text-blue-600';

  if (type === 'action') {
    item = getActionById(id);
    itemTypeLabel = 'Action Item';
    whyLabel = 'WHY THIS ACTION?';
    ItemIcon = Zap;
    iconBg = 'bg-red-50 text-red-600';
  } else if (type === 'decision') {
    item = getDecisionById(id);
    itemTypeLabel = 'Key Decision';
    whyLabel = 'WHY THIS DECISION?';
    ItemIcon = CheckCircle;
    iconBg = 'bg-violet-50 text-violet-600';
  } else if (type === 'risk') {
    item = getRiskById(id);
    itemTypeLabel = 'Identified Risk';
    whyLabel = 'WHY THIS RISK?';
    ItemIcon = AlertTriangle;
    iconBg = 'bg-amber-50 text-amber-600';
  }

  const communicationInStore = item?.communicationId ? getCommunicationById(item.communicationId) : null;
  const communication = communicationInStore || fetchedComm;

  useEffect(() => {
    if (item?.communicationId && !communicationInStore) {
      fetchCommunicationById(item.communicationId).then(comm => {
        if (comm) setFetchedComm(comm);
      });
    }
  }, [item?.communicationId, communicationInStore, fetchCommunicationById]);

  if ((loadingProjects || loadingIntelligence) && !item) {
    return (
      <div className="animate-fade-in py-24">
        <PageLoader />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="animate-fade-in text-center py-24">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Item Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The requested intelligence record could not be found.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const project = getProjectById(item.projectId);

  // Sibling items from the same communication
  const siblingActions = allActions.filter(a => a.communicationId === item.communicationId && a.id !== item.id);
  const siblingDecisions = allDecisions.filter(d => d.communicationId === item.communicationId && d.id !== item.id);
  const siblingRisks = allRisks.filter(r => r.communicationId === item.communicationId && r.id !== item.id);
  const hasSiblings = siblingActions.length > 0 || siblingDecisions.length > 0 || siblingRisks.length > 0;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-7">

      {/* Top Breadcrumb */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {type === 'action' ? 'Actions' : type === 'decision' ? 'Decisions' : 'Risks'}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <ItemIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {itemTypeLabel} Traceability
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{item.title}</h1>
            </div>
          </div>

          {/* Inline Status Toggle */}
          {type === 'action' && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <Select
                size="sm"
                value={item.status}
                onChange={(val) => updateActionStatus(item.id, val)}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ]}
                className="w-36"
              />
            </div>
          )}

          {type === 'decision' && (
            <button
              onClick={() => updateDecisionStatus(item.id, (item.status === 'confirmed' || item.status === 'decided') ? 'open' : 'confirmed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer self-start sm:self-auto shadow-sm ${
                item.status === 'confirmed' || item.status === 'decided'
                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {item.status === 'confirmed' || item.status === 'decided' ? '✓ Decision Confirmed' : 'Mark as Confirmed'}
            </button>
          )}
        </div>
      </div>

      {/* Main Extracted Item Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-gray-100">
          {type === 'action' && <PriorityBadge priority={item.priority} />}
          {type === 'risk' && <SeverityBadge severity={item.severity} />}
          {item.status && <StatusBadge status={item.status} />}
          {project && (
            <button
              onClick={() => navigate(`/projects/${project.id}`)}
              className="text-xs text-gray-600 font-medium flex items-center gap-1.5 ml-auto hover:text-blue-600 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              <span>{project.name}</span>
            </button>
          )}
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            Extracted Description
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed font-normal">
            {item.description && item.description !== 'null' ? item.description : 'Not specified'}
          </p>
        </div>

        {(item.impact || item.potentialImpact) && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
            <span className="font-bold text-amber-800">Potential Impact: </span>
            <span>{(item.impact && item.impact !== 'null' && item.impact !== 'Not specified') ? item.impact : ((item.potentialImpact && item.potentialImpact !== 'null') ? item.potentialImpact : 'Not specified')}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-gray-50 text-xs">
          <div>
            <p className="text-gray-400 text-[11px]">Assignee</p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {item.assignee && item.assignee !== 'null' && item.assignee !== 'Not specified' ? item.assignee : 'Not specified'}
            </p>
          </div>
          {type === 'decision' && (
            <div>
              <p className="text-gray-400 text-[11px]">Decision Owner</p>
              <p className="font-semibold text-gray-800 mt-0.5">
                {(item.decidedBy && item.decidedBy !== 'null' && item.decidedBy !== 'Not specified') ? item.decidedBy : ((item.decisionOwner && item.decisionOwner !== 'null' && item.decisionOwner !== 'Not specified') ? item.decisionOwner : 'Not specified')}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-[11px]">Deadline</p>
            <p className={`font-semibold mt-0.5 ${item.deadline && item.deadline !== 'null' && item.deadline !== 'Not specified' ? 'text-amber-700' : 'text-gray-800'}`}>
              {item.deadline && item.deadline !== 'null' && item.deadline !== 'Not specified' ? item.deadline : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px]">Extracted Date</p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* WHY THIS ACTION? / WHY THIS DECISION? / WHY THIS RISK? (Source Traceability) */}
      <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                {whyLabel}
              </h2>
              <p className="text-xs text-gray-500">
                Direct source traceability linking this item to the original project message
              </p>
            </div>
          </div>

          {communication?.hasInsight && communication.insightId && (
            <button
              onClick={() => navigate(`/analysis-result/${communication.insightId}`)}
              className="btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>View Full AI Analysis</span>
            </button>
          )}
        </div>

        {communication ? (
          <div className="space-y-4">
            {/* Communication Sender & Channel metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2.5">
                <SourceBadge source={communication.source} />
                <span className="font-bold text-gray-900">{communication.sender}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{formatDateTime(communication.timestamp)}</span>
                <span>({formatRelativeTime(communication.timestamp)})</span>
              </div>
            </div>

            {/* Original Verbatim Message */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Original Message Content</span>
                <span>ID: {communication.id}</span>
              </div>
              <blockquote className="text-sm font-sans leading-relaxed text-slate-100 whitespace-pre-wrap break-words">
                "{communication.message}"
              </blockquote>
            </div>

            {/* Traceability Context Note */}
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <strong className="font-semibold text-blue-950">Source Traceability: </strong>
              This {itemTypeLabel.toLowerCase()} was derived directly from {communication.sender}'s {communication.source} message.
              ArchFlow permanently preserves this link so team members, contractors, and clients have full accountability for project requirements without disputes.
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Source communication details are being loaded or are unavailable.</p>
        )}
      </div>

      {/* Sibling Items Extracted From the Same Message */}
      {hasSiblings && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Other Items Extracted From This Same Communication
          </h3>

          <div className="space-y-2 pt-1">
            {siblingActions.map(act => (
              <div
                key={act.id}
                onClick={() => navigate(`/insight/action/${act.id}`)}
                className="w-full text-left p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50/60 flex items-center justify-between gap-3 group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-800 truncate">{act.title}</span>
                  <PriorityBadge priority={act.priority} />
                </div>
                <span className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}

            {siblingDecisions.map(dec => (
              <div
                key={dec.id}
                onClick={() => navigate(`/insight/decision/${dec.id}`)}
                className="w-full text-left p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50/60 flex items-center justify-between gap-3 group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-800 truncate">{dec.title}</span>
                </div>
                <span className="text-xs text-violet-600 font-semibold opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}

            {siblingRisks.map(risk => (
              <div
                key={risk.id}
                onClick={() => navigate(`/insight/risk/${risk.id}`)}
                className="w-full text-left p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-slate-50/60 flex items-center justify-between gap-3 group transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-800 truncate">{risk.title}</span>
                  <SeverityBadge severity={risk.severity} />
                </div>
                <span className="text-xs text-amber-600 font-semibold opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
