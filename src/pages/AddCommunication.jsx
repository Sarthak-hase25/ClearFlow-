import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { useApp } from '../hooks/useAppState';
import { AnalyzingLoader } from '../components/ui/LoadingSpinner';
import { Select } from '../components/ui/Select';

const SOURCES = ['Client', 'Architect', 'Contractor', 'Supplier', 'Consultant', 'Site Update', 'Email', 'Other'];

// Standard demo communication
const DEMO_SAMPLE = {
  source: 'Client',
  sender: 'Rahul Kapoor',
  message: 'The client approved the living room design, but wants to change the bathroom tiles. Also, the contractor needs the updated electrical drawing before Friday.',
};

export default function AddCommunication() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { projects, createCommunication, analyzeExistingCommunication } = useApp();

  const [form, setForm] = useState({
    projectId: projectId || '',
    source:    'Client',
    sender:    '',
    message:   '',
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [error,     setError]     = useState('');

  const activeProjectId = form.projectId || projectId || (projects[0]?.id || '');
  const selectedProject = projects.find(p => p.id === activeProjectId || p._id === activeProjectId);

  const handleLoadDemo = () => {
    const targetProject = form.projectId || (projects[0]?.id || '');
    setForm(prev => ({
      ...prev,
      projectId: targetProject,
      source: DEMO_SAMPLE.source,
      sender: DEMO_SAMPLE.sender,
      message: DEMO_SAMPLE.message,
    }));
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    const targetProjectId = form.projectId || activeProjectId;

    if (!form.message.trim()) {
      setError('Please paste or type a project communication to analyze.');
      return;
    }
    if (!targetProjectId) {
      setError('Please select a target project.');
      return;
    }

    if (analyzing) return; // Prevent duplicate clicks (T15)

    setAnalyzing(true);

    try {
      // 1. Submit communication to MongoDB via POST /api/projects/:projectId/communications
      const createdComm = await createCommunication(targetProjectId, {
        message: form.message.trim(),
        source: form.source,
        sender: form.sender.trim() || form.source,
        senderRole: form.source,
      });

      // 2. Call real backend Gemini analysis via POST /api/communications/:id/analyze
      const result = await analyzeExistingCommunication(createdComm.id);

      setAnalyzing(false);

      // 3. Navigate smoothly to the AI Analysis Result screen
      navigate(`/analysis-result/${result.insight.id}`, {
        state: {
          communication: result.communication,
          insight:       result.insight,
          actions:       result.actions,
          decisions:     result.decisions,
          risks:         result.risks,
        }
      });
    } catch (err) {
      setAnalyzing(false);
      console.error('[AddCommunication] Analysis error:', err);

      // Clean, human-readable error presentation without exposing credentials or stack traces
      let displayMsg = 'Unable to analyze this communication right now. Please try again.';
      const rawMsg = err.message || '';
      if (rawMsg.includes('quota') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
        displayMsg = 'Gemini API free tier quota limit reached. Please wait a moment and try again. Your communication has been saved to the project workspace and can be re-analyzed anytime.';
      } else if (rawMsg.includes('Unable to connect') || rawMsg.includes('Failed to fetch') || rawMsg.includes('network')) {
        displayMsg = 'Unable to connect to the ArchFlow backend server. Please verify that the backend is running.';
      } else if (rawMsg && !rawMsg.includes('{') && !rawMsg.includes('at ') && rawMsg.length < 150) {
        displayMsg = rawMsg;
      }
      setError(displayMsg);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {selectedProject ? selectedProject.name : 'Projects'}
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Add Project Communication
        </h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Paste a client message, contractor update, site note, or email and let ArchFlow identify the important actions, decisions, and risks.
        </p>
      </div>

      {analyzing ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <AnalyzingLoader />
        </div>
      ) : (
        <form onSubmit={handleAnalyze} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8 space-y-6">

          {/* Quick Demo Shortcut Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span><strong>Hackathon Demo:</strong> Load the standard multi-party test communication.</span>
            </div>
            <button
              type="button"
              onClick={handleLoadDemo}
              disabled={analyzing}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 self-stretch sm:self-auto cursor-pointer disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Load Demo Message</span>
            </button>
          </div>

          {/* Project Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Project
            </label>
            <Select
              value={form.projectId || activeProjectId}
              onChange={(val) => setForm(f => ({ ...f, projectId: val }))}
              placeholder="Select a project…"
              options={projects.map(p => ({ value: p.id, label: `${p.name} (${p.type || 'Residential'})` }))}
            />
          </div>

          {/* Source Channel Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Communication Source
            </label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map(s => {
                const isSelected = form.source === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={analyzing}
                    onClick={() => setForm(f => ({ ...f, source: s }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sender */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Sender Name / Role (Optional)
            </label>
            <input
              className="input text-xs sm:text-sm"
              placeholder="e.g., Rahul Kapoor (Client), BuildRight Contractor, ABC Materials"
              value={form.sender}
              disabled={analyzing}
              onChange={e => setForm(f => ({ ...f, sender: e.target.value }))}
            />
          </div>

          {/* Message Textarea (The Visual Focus) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Project Communication Message <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-400 font-mono">
                {form.message.length} characters
              </span>
            </div>

            <textarea
              className="textarea text-xs sm:text-sm font-sans leading-relaxed focus:ring-2 focus:ring-blue-500/20"
              rows={7}
              placeholder="Paste the raw client WhatsApp message, contractor email, site meeting note, or consultant instruction here…"
              value={form.message}
              disabled={analyzing}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              required
            />
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 animate-fade-in">
              {error}
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              disabled={analyzing}
              onClick={() => navigate(-1)}
              className="btn-secondary text-xs sm:text-sm order-2 sm:order-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={analyzing}
              className="btn-primary flex-1 text-sm py-2.5 shadow-sm order-1 sm:order-2 disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {analyzing ? 'Analyzing Communication…' : 'Analyze Communication'}
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center font-normal">
            AI-generated insights will be extracted and presented with source traceability.
          </p>
        </form>
      )}
    </div>
  );
}
