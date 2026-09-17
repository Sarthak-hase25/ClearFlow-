// ─── Date / time formatting ───────────────────────────────────

export const getTimeGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatRelativeTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDate = (isoString) => {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (isoString) => {
  if (!isoString) return null;
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Text helpers ─────────────────────────────────────────────

export const truncate = (text, maxLength = 120) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
};

// ─── Priority helpers ─────────────────────────────────────────

export const priorityLabel = (priority) => {
  const map = { high: 'High', medium: 'Medium', low: 'Low' };
  return map[priority] || 'Unknown';
};

export const severityLabel = (severity) => {
  const map = { high: 'High', medium: 'Medium', low: 'Low' };
  return map[severity] || 'Unknown';
};

export const statusLabel = (status) => {
  const map = {
    pending:     'Pending',
    'in-progress': 'In Progress',
    completed:   'Completed',
    resolved:    'Resolved',
  };
  return map[status] || status;
};

// ─── Source color map ─────────────────────────────────────────

export const sourceColors = {
  'Client':      { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  'Architect':   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  'Contractor':  { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Supplier':    { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
  'Consultant':  { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Site Update': { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  'Drawing Update': { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  'Email':       { bg: 'bg-gray-50',   text: 'text-gray-700',   dot: 'bg-gray-500'   },
  'Other':       { bg: 'bg-gray-50',   text: 'text-gray-700',   dot: 'bg-gray-400'   },
};

export const getSourceColor = (source) =>
  sourceColors[source] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };

// ─── Priority color map ───────────────────────────────────────

export const getPriorityColor = (priority) => {
  const norm = priority?.toLowerCase();
  const map = {
    high:   { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    border: 'border-red-200'   },
    medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-200' },
    low:    { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-200' },
  };
  return map[norm] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' };
};

export const getSeverityColor = (severity) => {
  const norm = severity?.toLowerCase();
  const map = {
    critical:{ bg: 'bg-red-100',   text: 'text-red-800',    dot: 'bg-red-600'    },
    high:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'    },
    medium:  { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    low:     { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  };
  return map[norm] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
};

export const getStatusColor = (status) => {
  const map = {
    pending:      { bg: 'bg-gray-100',   text: 'text-gray-600'   },
    open:         { bg: 'bg-violet-50',  text: 'text-violet-700' },
    'in-progress':{ bg: 'bg-blue-50',    text: 'text-blue-700'   },
    completed:    { bg: 'bg-green-50',   text: 'text-green-700'  },
    resolved:     { bg: 'bg-green-50',   text: 'text-green-700'  },
    decided:      { bg: 'bg-violet-50',  text: 'text-violet-700' },
    confirmed:    { bg: 'bg-violet-50',  text: 'text-violet-700' },
  };
  return map[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

// ─── Project status ───────────────────────────────────────────
export const getProjectStatusColor = (status) => {
  const map = {
    'active':   { bg: 'bg-green-50',  text: 'text-green-700'  },
    'on-hold':  { bg: 'bg-amber-50',  text: 'text-amber-700'  },
    'completed':{ bg: 'bg-gray-100',  text: 'text-gray-600'   },
    'archived': { bg: 'bg-gray-100',  text: 'text-gray-500'   },
  };
  return map[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
};

export const getProjectStatusLabel = (status) => {
  const map = { active: 'Active', 'on-hold': 'On Hold', completed: 'Completed', archived: 'Archived' };
  return map[status] || status;
};
