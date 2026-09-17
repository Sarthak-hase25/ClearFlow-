import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ShieldAlert,
  ExternalLink, Building2, Calendar, TrendingDown
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { SeverityBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { formatDate } from '../utils/formatters';

export default function Risks() {
  const navigate = useNavigate();
  const { risks, projects } = useApp();

  const [projectFilter, setProjectFilter]   = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch]                 = useState('');

  const highCount = risks.filter(r => r.severity?.toLowerCase() === 'high' || r.severity?.toLowerCase() === 'critical').length;
  const mediumCount = risks.filter(r => r.severity?.toLowerCase() === 'medium').length;

  const filtered = risks.filter(risk => {
    if (projectFilter !== 'All' && risk.projectId !== projectFilter) return false;
    if (severityFilter !== 'All') {
      const s = risk.severity?.toLowerCase();
      if (severityFilter === 'high' && s !== 'high' && s !== 'critical') return false;
      if (severityFilter === 'critical' && s !== 'critical') return false;
      if (severityFilter === 'medium' && s !== 'medium') return false;
      if (severityFilter === 'low' && s !== 'low') return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = risk.title.toLowerCase().includes(q);
      const matchDesc = risk.description?.toLowerCase().includes(q);
      const matchImpact = risk.potentialImpact?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchImpact) return false;
    }
    return true;
  });

  const getProjectName = (projectId) => {
    const p = projects.find(proj => proj.id === projectId || proj._id === projectId);
    return p ? p.name : 'Unknown Project';
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Risks & Discrepancies</h1>
          </div>
          <p className="text-sm text-gray-500">
            Early warning detection of conflicts, delays, and cost risks extracted from project threads
          </p>
        </div>

        {/* Counter chips */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {highCount} High Severity
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-xs font-medium text-orange-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            {mediumCount} Medium Severity
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search risks by keyword, delay, or impact description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-xs sm:text-sm"
            />
          </div>

          {/* Project Filter */}
          <div className="lg:col-span-3">
            <Select
              value={projectFilter}
              onChange={setProjectFilter}
              options={[{ value: 'All', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.name }))]}
            />
          </div>

          {/* Severity Filter */}
          <div className="lg:col-span-3">
            <Select
              value={severityFilter}
              onChange={setSeverityFilter}
              options={[
                { value: 'All', label: 'All Severities' },
                { value: 'critical', label: 'Critical Severity' },
                { value: 'high', label: 'High Severity' },
                { value: 'medium', label: 'Medium Severity' },
                { value: 'low', label: 'Low Severity' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Risks List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="risks"
          title={search || projectFilter !== 'All' || severityFilter !== 'All' ? 'No matching risks found' : undefined}
          description={search || projectFilter !== 'All' || severityFilter !== 'All' ? 'Try broadening your filter criteria or search query.' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(risk => {
            const isHigh = risk.severity === 'high';
            return (
              <div
                key={risk.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all duration-150 shadow-sm ${
                  isHigh ? 'border-red-100 bg-red-50/10' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SeverityBadge severity={risk.severity} />
                      <h3 className="text-sm font-semibold text-gray-900">{risk.title}</h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                      {risk.description && risk.description !== 'null' ? risk.description : 'Not specified'}
                    </p>

                    {(risk.impact || risk.potentialImpact) && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-100/80 text-amber-900 max-w-2xl">
                        <TrendingDown className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-semibold text-amber-800">Potential Impact: </span>
                          <span className="text-amber-700">{(risk.impact && risk.impact !== 'null' && risk.impact !== 'Not specified') ? risk.impact : ((risk.potentialImpact && risk.potentialImpact !== 'null') ? risk.potentialImpact : 'Not specified')}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {getProjectName(risk.projectId)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        Identified {formatDate(risk.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Trace Source Button */}
                  <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:flex-shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => navigate(`/insight/risk/${risk.id}`)}
                      className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                      title="View original message source"
                    >
                      <span>Trace Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
