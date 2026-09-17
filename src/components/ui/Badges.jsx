// Badge component — source, priority, severity, status, project type
import { getPriorityColor, getSeverityColor, getStatusColor, getSourceColor, getProjectStatusColor } from '../../utils/formatters';

export function SourceBadge({ source }) {
  const c = getSourceColor(source);
  return (
    <span className={`source-badge ${c.bg} ${c.text}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot} mr-1.5`} />
      {source}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const c = getPriorityColor(priority);
  const labels = { high: 'High', medium: 'Medium', low: 'Low' };
  return (
    <span className={`source-badge ${c.bg} ${c.text}`}>
      {labels[priority] || 'Unknown'}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const c = getSeverityColor(severity);
  const labels = { high: 'High', medium: 'Medium', low: 'Low' };
  return (
    <span className={`source-badge ${c.bg} ${c.text}`}>
      Risk: {labels[severity] || 'Unknown'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const c = getStatusColor(status);
  const labels = {
    pending:      'Pending',
    'in-progress':'In Progress',
    completed:    'Completed',
    resolved:     'Resolved',
  };
  return (
    <span className={`source-badge ${c.bg} ${c.text}`}>
      {labels[status] || status}
    </span>
  );
}

export function ProjectStatusBadge({ status }) {
  const c = getProjectStatusColor(status);
  const labels = { active: 'Active', 'on-hold': 'On Hold', completed: 'Completed', archived: 'Archived' };
  return (
    <span className={`source-badge ${c.bg} ${c.text}`}>
      {labels[status] || status}
    </span>
  );
}

// Priority dot indicator (colored circle only)
export function PriorityDot({ priority, size = 'md' }) {
  const c = getPriorityColor(priority);
  const sz = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  return <span className={`inline-block rounded-full flex-shrink-0 ${sz} ${c.dot}`} />;
}
