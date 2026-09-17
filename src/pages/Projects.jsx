import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, MessageSquare, Zap, CheckCircle, AlertTriangle, X, ArrowRight, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { ProjectStatusBadge } from '../components/ui/Badges';
import { Select } from '../components/ui/Select';
import { formatDate } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';

import { PageLoader } from '../components/ui/LoadingSpinner';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';

function NewProjectModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', type: 'Residential', location: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Project Name *</label>
            <input
              className="input text-xs sm:text-sm"
              placeholder="e.g. Modern Villa"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
            <Select
              value={form.type}
              onChange={(val) => setForm(f => ({ ...f, type: val }))}
              options={['Residential', 'Commercial', 'Institutional', 'Mixed Use', 'Industrial', 'Other']}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
            <input
              className="input text-xs sm:text-sm"
              placeholder="e.g. Bandra West, Mumbai"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              className="textarea text-xs sm:text-sm"
              rows={3}
              placeholder="Brief project description…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary flex-1 text-xs sm:text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-xs sm:text-sm cursor-pointer disabled:opacity-60">
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectCard({ project, stats, onDelete }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer relative"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <ProjectStatusBadge status={project.status} />
            <span className="text-xs text-gray-400 font-medium">{project.type}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
            {project.name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            title="Delete project"
            className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {project.location && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>
      )}

      {project.description && (
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-gray-50 text-xs">
        <div className="flex items-center gap-1.5 text-gray-500" title="Communications">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>{stats?.communicationCount ?? project.communicationCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500" title="Pending Actions">
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span className={(stats?.pendingActionCount ?? project.pendingActionCount) > 0 ? 'text-red-600 font-semibold' : ''}>
            {stats?.pendingActionCount ?? project.pendingActionCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500" title="Open Decisions">
          <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
          <span>{stats?.openDecisionCount ?? project.openDecisionCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500" title="Active Risks">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          <span>{stats?.activeRiskCount ?? project.activeRiskCount}</span>
        </div>
        <span className="sm:ml-auto text-[11px] text-gray-400 font-normal">{formatDate(project.createdAt)}</span>
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, addProject, deleteProject, getProjectStats, loadingProjects, apiError, refreshData } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = (project) => {
    setProjectToDelete(project);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!projectToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteProject(projectToDelete.id);
      setIsDeleting(false);
      setProjectToDelete(null);
    } catch (err) {
      setIsDeleting(false);
      setDeleteError(err.message || 'Failed to delete project.');
    }
  };

  const active   = projects.filter(p => p.status === 'active');
  const others   = projects.filter(p => p.status !== 'active');

  return (
    <div className="animate-fade-in space-y-8">
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onSave={addProject}
        />
      )}

      <DeleteConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => {
          if (!isDeleting) {
            setProjectToDelete(null);
            setDeleteError('');
          }
        }}
        onConfirm={confirmDelete}
        projectName={projectToDelete?.name}
        isDeleting={isDeleting}
        error={deleteError}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loadingProjects ? 'Loading projects…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {loadingProjects ? (
        <PageLoader />
      ) : apiError && projects.length === 0 ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <p className="text-sm font-semibold text-red-800">{apiError}</p>
          <button onClick={refreshData} className="btn-secondary text-xs">
            Try Again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon="projects"
          title="No projects yet"
          description="Create your first project to start capturing and analyzing project communications."
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="section-heading">Active</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map(p => <ProjectCard key={p.id} project={p} stats={getProjectStats(p.id)} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <p className="section-heading">Other</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {others.map(p => <ProjectCard key={p.id} project={p} stats={getProjectStats(p.id)} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
