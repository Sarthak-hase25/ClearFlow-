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
  const norm = priority?.toLowerCase();
  const c = getPriorityColor(norm);
  const labels = { high: 'High', medium: 'Medium', low: 'Low' };
  return (
    <span className={`source-badge ${c.bg} ${c.text}`}>
      {labels[norm] || priority || 'Normal'}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const norm = severity?.toLowerCase();
  const c = getSeverityColor(norm);
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  return (
    <span className={`source-badge ${c.bg} ${c.text}`}>
      Risk: {labels[norm] || severity || 'Identified'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const c = getStatusColor(status);
  const labels = {
    pending:      'Pending',
    open:         'Open',
    'in-progress':'In Progress',
    completed:    'Completed',
    resolved:     'Resolved',
    decided:      'Decided',
    confirmed:    'Confirmed',
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
