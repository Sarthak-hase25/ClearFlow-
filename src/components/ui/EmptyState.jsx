import { MessageSquare, Zap, CheckCircle, AlertTriangle, FolderOpen } from 'lucide-react';

const iconMap = {
  communications: MessageSquare,
  actions:        Zap,
  decisions:      CheckCircle,
  risks:          AlertTriangle,
  projects:       FolderOpen,
};

const defaults = {
  communications: {
    title: 'No communications yet',
    description: 'Add your first project communication to start extracting project intelligence.',
  },
  actions: {
    title: "You're all caught up",
    description: 'New actions extracted from project communication will appear here.',
  },
  decisions: {
    title: 'No pending decisions',
    description: 'No pending decisions right now.',
  },
  risks: {
    title: 'No active risks',
    description: 'No active risks detected.',
  },
  projects: {
    title: 'No projects found',
    description: 'Create or select a project to get started.',
  },
};

export function EmptyState({ icon = 'communications', title, description, action }) {
  const Icon = iconMap[icon] || MessageSquare;
  const def = defaults[icon] || defaults.communications;

  const displayTitle = title ?? def.title;
  const displayDescription = description ?? def.description;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{displayTitle}</h3>
      {displayDescription && <p className="text-sm text-gray-400 max-w-sm mb-4">{displayDescription}</p>}
      {action}
    </div>
  );
}

