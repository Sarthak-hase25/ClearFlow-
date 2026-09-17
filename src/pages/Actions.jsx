import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Search, CheckCircle2, Clock,
  ExternalLink, User, Building2
} from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { PriorityBadge, StatusBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { formatDate } from '../utils/formatters';

export default function Actions() {
  const navigate = useNavigate();
  const { actions, projects, updateActionStatus } = useApp();

  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch]             = useState('');

  // Counters
  const pendingCount = actions.filter(a => a.status === 'pending').length;
  const inProgressCount = actions.filter(a => a.status === 'in-progress').length;
  const highPriorityCount = actions.filter(a => a.priority === 'high' && a.status === 'pending').length;
  const completedCount = actions.filter(a => a.status === 'completed').length;

  const filtered = actions.filter(action => {
    if (projectFilter !== 'All' && action.projectId !== projectFilter) return false;
    if (statusFilter !== 'All' && action.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && action.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = action.title.toLowerCase().includes(q);
      const matchDesc = action.description?.toLowerCase().includes(q);
      const matchAssignee = action.assignee?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
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
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
          </div>
          <p className="text-sm text-gray-500">
            Track, assign, and trace every actionable task extracted from communications
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-700">
            {highPriorityCount} Urgent Pending
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
            {pendingCount} Pending
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700">
            {inProgressCount} In Progress
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-100 text-xs font-medium text-green-700">
            {completedCount} Completed
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-5">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions by title, description, or assignee..."
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

          {/* Priority Filter */}
          <div className="lg:col-span-2">
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'All', label: 'All Priorities' },
                { value: 'high', label: 'High Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'low', label: 'Low Priority' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Actions List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="actions"
          title={search || projectFilter !== 'All' || statusFilter !== 'All' || priorityFilter !== 'All' ? 'No matching action items' : undefined}
          description={search || projectFilter !== 'All' || statusFilter !== 'All' || priorityFilter !== 'All' ? 'Try adjusting your filters or search terms.' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(action => {
            const isDone = action.status === 'completed';
            return (
              <div
                key={action.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all duration-150 group hover:shadow-sm ${
                  isDone ? 'border-gray-100 bg-gray-50/40 opacity-75' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => updateActionStatus(action.id, isDone ? 'pending' : 'completed')}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 hover:border-blue-500 bg-white'
                      }`}
                      title={isDone ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={action.priority} />
                        <StatusBadge status={action.status} />
                        <h3 className={`text-sm font-semibold ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {action.title}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
                        {action.description && action.description !== 'null' ? action.description : 'Not specified'}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1 text-gray-600 font-medium">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          {getProjectName(action.projectId)}
                        </span>

                        <span className="flex items-center gap-1 text-gray-600">
                          <User className="w-3 h-3 text-gray-400" />
                          Assignee: <strong className="font-medium text-gray-700">{action.assignee && action.assignee !== 'Not specified' ? action.assignee : 'Not specified'}</strong>
                        </span>

                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-3 h-3 text-gray-400" />
                          Due: <strong className={`font-medium ${action.deadline && action.deadline !== 'Not specified' ? 'text-amber-700' : 'text-gray-700'}`}>
                            {action.deadline && action.deadline !== 'Not specified' ? action.deadline : 'Not specified'}
                          </strong>
                        </span>

                        <span>Created {formatDate(action.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Traceability Button */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:flex-shrink-0 self-start sm:self-center">
                    <Select
                      size="sm"
                      value={action.status}
                      onChange={(val) => updateActionStatus(action.id, val)}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                      ]}
                      className="w-32"
                    />

                    <button
                      onClick={() => navigate(`/insight/action/${action.id}`)}
                      className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                      title="View original message source for this task"
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
