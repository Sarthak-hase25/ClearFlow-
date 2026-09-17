import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wand2, FileText, AlertTriangle } from 'lucide-react';
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
  const [analyzing, setAnalyzing]       = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [savedCommId, setSavedCommId]   = useState(null);
  const [error, setError]               = useState('');

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
    setSavedCommId(null);
  };

  // Manual save without calling Gemini (Zero Quota Used)
  const handleManualSave = async (e) => {
    e?.preventDefault?.();
    setError('');

    const targetProjectId = form.projectId || activeProjectId;

    if (!form.message.trim()) {
      setError('Please paste or type a project communication to save.');
      return;
    }
    if (!targetProjectId) {
      setError('Please select a target project.');
      return;
    }

    if (savingManual || analyzing) return;
    setSavingManual(true);

    try {
      await createCommunication(targetProjectId, {
        message: form.message.trim(),
        source: form.source,
        sender: form.sender.trim() || form.source,
        senderRole: form.source,
      });
      setSavingManual(false);
      navigate(`/projects/${targetProjectId}`);
    } catch (err) {
      setSavingManual(false);
      setError(err.message || 'Failed to save communication.');
    }
  };

  // Automated AI extraction flow
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setSavedCommId(null);

    const targetProjectId = form.projectId || activeProjectId;

    if (!form.message.trim()) {
      setError('Please paste or type a project communication to analyze.');
      return;
    }
    if (!targetProjectId) {
      setError('Please select a target project.');
      return;
    }

    if (analyzing || savingManual) return; // Prevent duplicate clicks

    setAnalyzing(true);

    let createdComm = null;
    try {
      // 1. Submit communication to MongoDB via POST /api/projects/:projectId/communications
      createdComm = await createCommunication(targetProjectId, {
        message: form.message.trim(),
        source: form.source,
        sender: form.sender.trim() || form.source,
        senderRole: form.source,
      });
      setSavedCommId(createdComm.id);
    } catch (saveErr) {
      setAnalyzing(false);
      setError(saveErr.message || 'Failed to save communication to project.');
      return;
    }

    try {
      // 2. Call backend Gemini analysis via POST /api/communications/:id/analyze
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

      let displayMsg = 'Communication saved! Gemini API analysis could not be completed right now. You can view your saved communication in the workspace and analyze it at any time.';
      const rawMsg = err.message || '';
      if (rawMsg.includes('quota') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
        displayMsg = 'Communication saved to database! Gemini API free-tier quota is currently exhausted. Your message is safely stored in the project workspace and can be re-analyzed whenever quota refreshes.';
      } else if (rawMsg.includes('Unable to connect') || rawMsg.includes('Failed to fetch') || rawMsg.includes('network')) {
        displayMsg = 'Communication saved, but unable to connect to the ArchFlow backend for AI analysis. Please verify your connection.';
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
            <div className={`p-4 rounded-xl text-xs space-y-3 animate-fade-in ${
              savedCommId
                ? 'bg-amber-50/90 border border-amber-200 text-amber-900'
                : 'bg-red-50 border border-red-200 text-red-700 font-semibold'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${savedCommId ? 'text-amber-600' : 'text-red-600'}`} />
                <p className="leading-relaxed">{error}</p>
              </div>

              {savedCommId && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${form.projectId || activeProjectId}`)}
                    className="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-semibold text-xs hover:bg-amber-900 transition-colors shadow-sm cursor-pointer"
                  >
                    View in Project Workspace →
                  </button>

                  <button
                    type="button"
                    disabled={analyzing}
                    onClick={async () => {
                      setAnalyzing(true);
                      setError('');
                      try {
                        const result = await analyzeExistingCommunication(savedCommId);
                        setAnalyzing(false);
                        navigate(`/analysis-result/${result.insight.id}`, { state: result });
                      } catch (retryErr) {
                        setAnalyzing(false);
                        const raw = retryErr.message || '';
                        if (raw.includes('quota') || raw.includes('429')) {
                          setError('Gemini API free tier quota limit still active. Your communication remains safely stored in the project workspace and can be analyzed later.');
                        } else {
                          setError(raw || 'Failed to analyze communication.');
                        }
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Retry AI Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              disabled={analyzing || savingManual}
              onClick={() => navigate(-1)}
              className="btn-secondary text-xs sm:text-sm order-3 sm:order-1 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={analyzing || savingManual}
              onClick={handleManualSave}
              className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 order-2 sm:order-2 cursor-pointer disabled:opacity-50"
              title="Save communication directly to the project without running Gemini AI analysis"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span>{savingManual ? 'Saving…' : 'Save without AI'}</span>
            </button>

            <button
              type="submit"
              disabled={analyzing || savingManual}
              className="btn-primary flex-1 text-xs sm:text-sm py-2.5 shadow-sm order-1 sm:order-3 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing Communication…' : 'Save & Analyze with AI'}</span>
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
