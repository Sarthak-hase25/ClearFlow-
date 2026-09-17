import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ─── Context ──────────────────────────────────────────────────

const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [communications, setComms] = useState([]);
  const [actions, setActions] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [insights, setInsights] = useState([]);

  // Loading and error states
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingComms, setLoadingComms] = useState(false);
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const [apiError, setApiError] = useState(null);

  // ─── Load Projects, Communications, and Intelligence on Mount ──
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingProjects(true);
      setApiError(null);

      const fetchedProjects = await api.getProjects();
      setProjects(fetchedProjects);
      setLoadingProjects(false);

      // Fetch communications and intelligence for all loaded projects
      if (fetchedProjects.length > 0) {
        setLoadingComms(true);
        setLoadingIntelligence(true);

        const projectDataPromises = fetchedProjects.map(async (p) => {
          const [comms, intelligence] = await Promise.all([
            api.getCommunications(p.id).catch(err => {
              console.error(`[ArchFlow] Failed to load comms for project ${p.id}:`, err);
              return [];
            }),
            api.getProjectIntelligence(p.id).catch(err => {
              console.error(`[ArchFlow] Failed to load intelligence for project ${p.id}:`, err);
              return { insights: [], actions: [], decisions: [], risks: [] };
            }),
          ]);
          return { comms, intelligence };
        });

        const results = await Promise.all(projectDataPromises);
        const allComms = results.flatMap(r => r.comms);
        const allInsights = results.flatMap(r => r.intelligence.insights || []);
        const allActions = results.flatMap(r => r.intelligence.actions || []);
        const allDecisions = results.flatMap(r => r.intelligence.decisions || []);
        const allRisks = results.flatMap(r => r.intelligence.risks || []);

        // Cross-reference insights with communications to ensure hasInsight and insightId are 100% synchronized
        const insightMap = new Map(allInsights.map(i => [i.communicationId, i.id]));
        const syncedComms = allComms.map(c => ({
          ...c,
          hasInsight: Boolean(c.hasInsight || insightMap.has(c.id) || insightMap.has(c._id)),
          insightId: c.insightId || insightMap.get(c.id) || insightMap.get(c._id) || null,
        }));

        setComms(syncedComms);
        setInsights(allInsights);
        setActions(allActions);
        setDecisions(allDecisions);
        setRisks(allRisks);

        setLoadingComms(false);
        setLoadingIntelligence(false);
      }
    } catch (err) {
      console.error('[ArchFlow] Failed to load projects from API:', err);
      setApiError(err.message || 'Failed to connect to ArchFlow backend');
      setLoadingProjects(false);
      setLoadingComms(false);
      setLoadingIntelligence(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ─── Fetch communications for a specific project ────────────
  const fetchProjectCommunications = useCallback(async (projectId) => {
    if (!projectId) return [];
    try {
      setLoadingComms(true);
      const fetched = await api.getCommunications(projectId);
      setComms(prev => {
        const existingIds = new Set(fetched.map(c => c.id));
        const kept = prev.filter(c => !existingIds.has(c.id));
        return [...kept, ...fetched];
      });
      setLoadingComms(false);
      return fetched;
    } catch (err) {
      console.error(`[ArchFlow] Error fetching communications for ${projectId}:`, err);
      setLoadingComms(false);
      throw err;
    }
  }, []);

  // ─── Fetch intelligence for a specific project ───────────────
  const fetchProjectIntelligence = useCallback(async (projectId) => {
    if (!projectId) return { insights: [], actions: [], decisions: [], risks: [] };
    try {
      setLoadingIntelligence(true);
      const intel = await api.getProjectIntelligence(projectId);

      setInsights(prev => {
        const newIds = new Set(intel.insights.map(i => i.id));
        return [...intel.insights, ...prev.filter(i => !newIds.has(i.id))];
      });
      setActions(prev => {
        const newIds = new Set(intel.actions.map(a => a.id));
        return [...intel.actions, ...prev.filter(a => !newIds.has(a.id))];
      });
      setDecisions(prev => {
        const newIds = new Set(intel.decisions.map(d => d.id));
        return [...intel.decisions, ...prev.filter(d => !newIds.has(d.id))];
      });
      setRisks(prev => {
        const newIds = new Set(intel.risks.map(r => r.id));
        return [...intel.risks, ...prev.filter(r => !newIds.has(r.id))];
      });

      setLoadingIntelligence(false);
      return intel;
    } catch (err) {
      console.error(`[ArchFlow] Error fetching intelligence for ${projectId}:`, err);
      setLoadingIntelligence(false);
      throw err;
    }
  }, []);

  // ─── Fetch single communication by ID (for traceability) ────
  const fetchCommunicationById = useCallback(async (commId) => {
    if (!commId) return null;
    const existing = communications.find(c => c.id === commId || c._id === commId);
    if (existing) return existing;

    try {
      const fetched = await api.getCommunication(commId);
      if (fetched) {
        setComms(prev => {
          if (prev.some(c => c.id === fetched.id)) return prev;
          return [fetched, ...prev];
        });
      }
      return fetched;
    } catch (err) {
      console.error(`[ArchFlow] Error fetching communication ${commId}:`, err);
      return null;
    }
  }, [communications]);

  // ─── Fetch single insight by ID or communicationId ──────────
  const fetchInsightById = useCallback(async (insightId) => {
    if (!insightId) return null;
    const existing = insights.find(i => i.id === insightId || i._id === insightId || i.communicationId === insightId);
    if (existing) return existing;

    try {
      const fetched = await api.getInsight(insightId);
      if (fetched) {
        setInsights(prev => {
          if (prev.some(i => i.id === fetched.id)) return prev;
          return [fetched, ...prev];
        });
      }
      return fetched;
    } catch (err) {
      console.error(`[ArchFlow] Error fetching insight ${insightId}:`, err);
      return null;
    }
  }, [insights]);

  // ─── Actions Status Management (Local/Temporary as per Phase 3E scope)
  const updateActionStatus = (actionId, newStatus) => {
    setActions(prev =>
      prev.map(a => (a.id === actionId || a._id === actionId) ? { ...a, status: newStatus } : a)
    );
  };

  const updateDecisionStatus = (decisionId, newStatus) => {
    setDecisions(prev =>
      prev.map(d => (d.id === decisionId || d._id === decisionId) ? { ...d, status: newStatus } : d)
    );
  };

  // ─── Add new communication + insight from analysis ───────────
  const addCommunicationWithInsight = (comm, insight, newActions, newDecisions, newRisks) => {
    setComms(prev => {
      const filtered = prev.filter(c => c.id !== comm.id && c._id !== comm.id);
      return [comm, ...filtered];
    });
    if (insight) {
      setInsights(prev => {
        const filtered = prev.filter(i => i.id !== insight.id && i._id !== insight.id);
        return [insight, ...filtered];
      });
    }
    if (newActions?.length) {
      setActions(prev => {
        const newIds = new Set(newActions.map(a => a.id));
        const filtered = prev.filter(a => !newIds.has(a.id));
        return [...newActions, ...filtered];
      });
    }
    if (newDecisions?.length) {
      setDecisions(prev => {
        const newIds = new Set(newDecisions.map(d => d.id));
        const filtered = prev.filter(d => !newIds.has(d.id));
        return [...newDecisions, ...filtered];
      });
    }
    if (newRisks?.length) {
      setRisks(prev => {
        const newIds = new Set(newRisks.map(r => r.id));
        const filtered = prev.filter(r => !newIds.has(r.id));
        return [...newRisks, ...filtered];
      });
    }
  };

  // ─── Real Gemini Analysis Trigger ───────────────────────────
  const analyzeExistingCommunication = useCallback(async (commId) => {
    const result = await api.analyzeCommunication(commId);

    // Update state with the returned real data
    const updatedComm = {
      ...result.communication,
      hasInsight: true,
      insightId: result.insight.id,
    };

    addCommunicationWithInsight(
      updatedComm,
      result.insight,
      result.actions,
      result.decisions,
      result.risks
    );

    return result;
  }, []);

  // ─── Add new project via API ────────────────────────────────
  const addProject = async (projectData) => {
    try {
      const created = await api.createProject(projectData);
      setProjects(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('[ArchFlow] Error creating project:', err);
      throw err;
    }
  };

  // ─── Add new communication via API ──────────────────────────
  const createCommunication = async (projectId, commData) => {
    try {
      const created = await api.createCommunication(projectId, commData);
      setComms(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('[ArchFlow] Error creating communication:', err);
      throw err;
    }
  };

  // ─── Selectors ──────────────────────────────────────────────
  const getProjectById = (id) => projects.find(p => p.id === id || p._id === id);

  const getCommunicationsByProject = (projectId) =>
    communications
      .filter(c => c.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getActionsByProject = (projectId) =>
    actions.filter(a => a.projectId === projectId);

  const getDecisionsByProject = (projectId) =>
    decisions.filter(d => d.projectId === projectId);

  const getRisksByProject = (projectId) =>
    risks.filter(r => r.projectId === projectId);

  const getCommunicationById = (id) =>
    communications.find(c => c.id === id || c._id === id);

  const getActionById = (id) =>
    actions.find(a => a.id === id || a._id === id);

  const getDecisionById = (id) =>
    decisions.find(d => d.id === id || d._id === id);

  const getRiskById = (id) =>
    risks.find(r => r.id === id || r._id === id);

  const getInsightById = (id) =>
    insights.find(i => i.id === id || i._id === id || i.communicationId === id);

  const getDashboardStats = () => ({
    totalCommunications: communications.length,
    pendingActions: actions.filter(a => a.status === 'pending').length,
    inProgressActions: actions.filter(a => a.status === 'in-progress').length,
    completedActions: actions.filter(a => a.status === 'completed').length,
    openDecisions: decisions.filter(d => d.status === 'pending' || d.status === 'open').length,
    activeRisks: risks.length,
  });

  const getProjectStats = (projectId) => {
    const projComms = communications.filter(c => c.projectId === projectId);
    const projActions = actions.filter(a => a.projectId === projectId);
    const projDecisions = decisions.filter(d => d.projectId === projectId);
    const projRisks = risks.filter(r => r.projectId === projectId);
    return {
      communicationCount: projComms.length,
      pendingActionCount: projActions.filter(a => a.status === 'pending').length,
      inProgressActionCount: projActions.filter(a => a.status === 'in-progress').length,
      completedActionCount: projActions.filter(a => a.status === 'completed').length,
      openDecisionCount: projDecisions.filter(d => d.status === 'pending' || d.status === 'open').length,
      activeRiskCount: projRisks.length,
    };
  };

  const getNeedsAttention = () => {
    const highActions = actions
      .filter(a => (a.priority === 'high' || a.priority === 'High') && a.status === 'pending')
      .map(a => ({ ...a, kind: 'action' }));
    const highRisks = risks
      .filter(r => r.severity === 'high' || r.severity === 'High')
      .map(r => ({ ...r, kind: 'risk' }));
    const medRisks = risks
      .filter(r => r.severity === 'medium' || r.severity === 'Medium')
      .map(r => ({ ...r, kind: 'risk' }));
    const pendingDecisions = decisions
      .filter(d => d.status === 'pending' || d.status === 'open')
      .slice(0, 2)
      .map(d => ({ ...d, kind: 'decision' }));
    return [...highActions, ...highRisks, ...medRisks, ...pendingDecisions];
  };

  const getRecentCommunications = (limit = 5) =>
    [...communications]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

  return (
    <AppContext.Provider value={{
      projects,
      communications,
      actions,
      decisions,
      risks,
      insights,
      loadingProjects,
      loadingComms,
      loadingIntelligence,
      apiError,
      refreshData: loadInitialData,
      fetchProjectCommunications,
      fetchProjectIntelligence,
      fetchCommunicationById,
      fetchInsightById,
      updateActionStatus,
      updateDecisionStatus,
      addCommunicationWithInsight,
      analyzeExistingCommunication,
      addProject,
      createCommunication,
      getProjectById,
      getProjectStats,
      getCommunicationsByProject,
      getActionsByProject,
      getDecisionsByProject,
      getRisksByProject,
      getCommunicationById,
      getActionById,
      getDecisionById,
      getRiskById,
      getInsightById,
      getDashboardStats,
      getNeedsAttention,
      getRecentCommunications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────

// eslint-disable-next-line react/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
