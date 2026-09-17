import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Search, ExternalLink,
  UserCheck, Building2, Calendar
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { formatDate } from '../utils/formatters';

export default function Decisions() {
  const navigate = useNavigate();
  const { decisions, projects, updateDecisionStatus } = useApp();

  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [search, setSearch]             = useState('');

  const pendingCount = decisions.filter(d => d.status === 'pending').length;
  const confirmedCount = decisions.filter(d => d.status === 'confirmed').length;

  const filtered = decisions.filter(dec => {
    if (projectFilter !== 'All' && dec.projectId !== projectFilter) return false;
    if (statusFilter !== 'All' && dec.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = dec.title.toLowerCase().includes(q);
      const matchDesc = dec.description?.toLowerCase().includes(q);
      const matchOwner = dec.decisionOwner?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchOwner) return false;
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
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Decisions Log</h1>
          </div>
          <p className="text-sm text-gray-500">
            Recorded project approvals, design changes, and material selections
          </p>
        </div>

        {/* Counter chips */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-800">
            {pendingCount} Pending Resolution
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 text-xs font-medium text-violet-700">
            {confirmedCount} Confirmed
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
              placeholder="Search decisions by keyword or stakeholder..."
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

          {/* Status Filter */}
          <div className="lg:col-span-3">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Decisions List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="decisions"
          title={search || projectFilter !== 'All' || statusFilter !== 'All' ? 'No matching decisions' : undefined}
          description={search || projectFilter !== 'All' || statusFilter !== 'All' ? 'Try adjusting your search criteria or project filter.' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(dec => {
            const isConfirmed = dec.status === 'confirmed';
            return (
              <div
                key={dec.id}
                className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 transition-all duration-150 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${
                        isConfirmed ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {isConfirmed ? 'Confirmed' : 'Pending Decision'}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900">{dec.title}</h3>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                      {dec.description && dec.description !== 'null' ? dec.description : 'Not specified'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 text-gray-600 font-medium">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {getProjectName(dec.projectId)}
                      </span>

                      <span className="flex items-center gap-1 text-gray-600">
                        <UserCheck className="w-3 h-3 text-violet-500" />
                        Owner: <strong className="text-gray-700 font-medium">{(dec.decidedBy && dec.decidedBy !== 'null' && dec.decidedBy !== 'Not specified') ? dec.decidedBy : ((dec.decisionOwner && dec.decisionOwner !== 'null' && dec.decisionOwner !== 'Not specified') ? dec.decisionOwner : 'Not specified')}</strong>
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(dec.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:flex-shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => updateDecisionStatus(dec.id, isConfirmed ? 'pending' : 'confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isConfirmed
                          ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {isConfirmed ? '✓ Confirmed' : 'Confirm'}
                    </button>

                    <button
                      onClick={() => navigate(`/insight/decision/${dec.id}`)}
                      className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                      title="View original communication source"
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
