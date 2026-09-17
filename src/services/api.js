// ============================================================
// ARCHFLOW — CENTRALIZED API CLIENT
// Connects frontend to the Express/MongoDB/Gemini backend.
// ============================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Source Type Mappings ─────────────────────────────────────

export const SOURCE_TYPE_TO_DISPLAY = {
  client: 'Client',
  architect: 'Architect',
  contractor: 'Contractor',
  supplier: 'Supplier',
  consultant: 'Consultant',
  site_update: 'Site Update',
  drawing_update: 'Drawing Update',
  email: 'Email',
  other: 'Other',
};

export const DISPLAY_TO_SOURCE_TYPE = {
  'Client': 'client',
  'Architect': 'architect',
  'Contractor': 'contractor',
  'Supplier': 'supplier',
  'Consultant': 'consultant',
  'Site Update': 'site_update',
  'Drawing Update': 'drawing_update',
  'Email': 'email',
  'Other': 'other',
};

// ─── Normalizers ──────────────────────────────────────────────

export function normalizeProject(p) {
  if (!p) return null;
  const id = p._id || p.id;
  let type = p.type;
  if (!type || type === 'Residential') {
    const nameLower = (p.name || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    if (nameLower.includes('commercial') || descLower.includes('commercial') || descLower.includes('office')) {
      type = 'Commercial';
    } else if (nameLower.includes('resort') || nameLower.includes('hotel') || descLower.includes('hospitality')) {
      type = 'Hospitality';
    } else {
      type = p.type || 'Residential';
    }
  }

  return {
    id,
    _id: id,
    name: p.name || 'Untitled Project',
    description: p.description || '',
    type,
    status: p.status || 'active',
    location: p.location || '',
    clientName: p.clientName || '',
    createdAt: p.createdAt || new Date().toISOString(),
    communicationCount: p.communicationCount ?? 0,
    pendingActionCount: p.pendingActionCount ?? 0,
    openDecisionCount: p.openDecisionCount ?? 0,
    activeRiskCount: p.activeRiskCount ?? 0,
  };
}

export function normalizeCommunication(c) {
  if (!c) return null;
  const id = c._id || c.id;
  const rawSource = c.sourceType || c.source || 'other';
  const displaySource = SOURCE_TYPE_TO_DISPLAY[rawSource] || c.source || (typeof rawSource === 'string' ? rawSource.charAt(0).toUpperCase() + rawSource.slice(1) : 'Other');
  const sender = c.senderName || c.sender || c.senderRole || displaySource;
  const message = c.content || c.message || '';
  const timestamp = c.communicationDate || c.createdAt || new Date().toISOString();

  return {
    id,
    _id: id,
    projectId: c.projectId,
    source: displaySource,
    sourceType: c.sourceType || DISPLAY_TO_SOURCE_TYPE[displaySource] || 'other',
    sender,
    senderName: c.senderName || sender,
    senderRole: c.senderRole || null,
    subject: c.subject || '',
    message,
    content: message,
    timestamp,
    createdAt: c.createdAt || timestamp,
    hasInsight: Boolean(c.hasInsight || c.insightId),
    insightId: c.insightId || null,
  };
}

export function normalizeInsight(ins) {
  if (!ins) return null;
  const id = ins._id || ins.id;
  return {
    id,
    _id: id,
    projectId: ins.projectId,
    communicationId: ins.communicationId,
    summary: ins.summary || 'Not specified',
    model: ins.model || 'gemini-3.6-flash',
    analyzedAt: ins.analyzedAt || ins.createdAt || new Date().toISOString(),
  };
}

export function normalizeAction(a) {
  if (!a) return null;
  const id = a._id || a.id;
  return {
    id,
    _id: id,
    projectId: a.projectId,
    communicationId: a.communicationId,
    insightId: a.insightId,
    title: a.title || 'Untitled Action',
    description: a.description && a.description !== 'null' ? a.description : 'Not specified',
    assignee: a.assignee && a.assignee !== 'null' ? a.assignee : 'Not specified',
    priority: a.priority && a.priority !== 'null' ? a.priority : 'medium',
    deadline: a.deadline && a.deadline !== 'null' ? a.deadline : 'Not specified',
    status: a.status || 'pending',
    createdAt: a.createdAt || new Date().toISOString(),
  };
}

export function normalizeDecision(d) {
  if (!d) return null;
  const id = d._id || d.id;
  const owner = (d.decidedBy && d.decidedBy !== 'null') ? d.decidedBy : ((d.decisionOwner && d.decisionOwner !== 'null') ? d.decisionOwner : 'Not specified');
  return {
    id,
    _id: id,
    projectId: d.projectId,
    communicationId: d.communicationId,
    insightId: d.insightId,
    title: d.title || 'Untitled Decision',
    description: d.description && d.description !== 'null' ? d.description : 'Not specified',
    decidedBy: owner,
    decisionOwner: owner,
    decisionDate: d.decisionDate || null,
    status: d.status || 'pending',
    createdAt: d.createdAt || new Date().toISOString(),
  };
}

export function normalizeRisk(r) {
  if (!r) return null;
  const id = r._id || r.id;
  const impactVal = (r.impact && r.impact !== 'null') ? r.impact : ((r.potentialImpact && r.potentialImpact !== 'null') ? r.potentialImpact : 'Not specified');
  return {
    id,
    _id: id,
    projectId: r.projectId,
    communicationId: r.communicationId,
    insightId: r.insightId,
    title: r.title || 'Untitled Risk',
    description: r.description && r.description !== 'null' ? r.description : 'Not specified',
    severity: r.severity && r.severity !== 'null' ? r.severity : 'medium',
    impact: impactVal,
    potentialImpact: impactVal,
    status: r.status || 'active',
    createdAt: r.createdAt || new Date().toISOString(),
  };
}

// ─── Fetch Wrapper ────────────────────────────────────────────

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    console.error(`[API] Network error requesting ${url}:`, netErr);
    throw new Error('Unable to connect to the ArchFlow server. Please check your network connection or ensure the backend is running.');
  }

  let json;
  try {
    json = await response.json();
  } catch (parseErr) {
    console.error(`[API] Failed to parse JSON from ${url}:`, parseErr);
    throw new Error(`Server returned status ${response.status} with unexpected format.`);
  }

  if (!response.ok || !json.success) {
    const errorMsg = json?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = json;
    throw err;
  }

  return json.data;
}

// ─── API Client Methods ───────────────────────────────────────

export const api = {
  // ── Projects
  async getProjects() {
    const data = await request('/projects');
    return Array.isArray(data) ? data.map(normalizeProject) : [];
  },

  async getProject(id) {
    const data = await request(`/projects/${id}`);
    return normalizeProject(data);
  },

  async createProject(projectData) {
    const payload = {
      name: projectData.name,
      description: projectData.description || null,
      status: projectData.status || 'active',
      location: projectData.location || null,
      clientName: projectData.clientName || null,
    };
    const data = await request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeProject({
      ...data,
      type: projectData.type || 'Residential',
    });
  },

  async deleteProject(id) {
    return request(`/projects/${id}`, { method: 'DELETE' });
  },

  // ── Communications
  async getCommunications(projectId) {
    const data = await request(`/projects/${projectId}/communications`);
    return Array.isArray(data) ? data.map(normalizeCommunication) : [];
  },

  async getCommunication(id) {
    const data = await request(`/communications/${id}`);
    return normalizeCommunication(data);
  },

  async createCommunication(projectId, commData) {
    const rawSource = commData.source || commData.sourceType || 'other';
    const sourceType = DISPLAY_TO_SOURCE_TYPE[rawSource] || (typeof rawSource === 'string' ? rawSource.toLowerCase().replace(/\s+/g, '_') : 'other');

    const payload = {
      content: commData.message || commData.content,
      sourceType,
      senderName: commData.sender || commData.senderName || null,
      senderRole: commData.senderRole || commData.source || null,
      subject: commData.subject || (commData.message ? commData.message.slice(0, 60) + (commData.message.length > 60 ? '…' : '') : null),
      communicationDate: commData.timestamp || commData.communicationDate || new Date().toISOString(),
    };

    const data = await request(`/projects/${projectId}/communications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeCommunication(data);
  },

  // ── Analyze Communication
  async analyzeCommunication(id) {
    const data = await request(`/communications/${id}/analyze`, {
      method: 'POST',
    });

    const communication = normalizeCommunication(data.communication);
    const insight = normalizeInsight(data.insight);
    const actions = Array.isArray(data.actions) ? data.actions.map(normalizeAction) : [];
    const decisions = Array.isArray(data.decisions) ? data.decisions.map(normalizeDecision) : [];
    const risks = Array.isArray(data.risks) ? data.risks.map(normalizeRisk) : [];

    return {
      communication,
      insight,
      actions,
      decisions,
      risks,
    };
  },

  // ── Project Intelligence (Phase 3F)
  async getProjectIntelligence(projectId) {
    const data = await request(`/projects/${projectId}/intelligence`);
    return {
      insights: Array.isArray(data?.insights) ? data.insights.map(normalizeInsight) : [],
      actions: Array.isArray(data?.actions) ? data.actions.map(normalizeAction) : [],
      decisions: Array.isArray(data?.decisions) ? data.decisions.map(normalizeDecision) : [],
      risks: Array.isArray(data?.risks) ? data.risks.map(normalizeRisk) : [],
    };
  },

  async getInsights(projectId) {
    const data = await request(`/projects/${projectId}/insights`);
    return Array.isArray(data) ? data.map(normalizeInsight) : [];
  },

  async getActions(projectId) {
    const data = await request(`/projects/${projectId}/actions`);
    return Array.isArray(data) ? data.map(normalizeAction) : [];
  },

  async getDecisions(projectId) {
    const data = await request(`/projects/${projectId}/decisions`);
    return Array.isArray(data) ? data.map(normalizeDecision) : [];
  },

  async getRisks(projectId) {
    const data = await request(`/projects/${projectId}/risks`);
    return Array.isArray(data) ? data.map(normalizeRisk) : [];
  },

  async getInsight(id) {
    const data = await request(`/insights/${id}`);
    return normalizeInsight(data);
  },

  async updateActionStatus(id, status) {
    const data = await request(`/actions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return normalizeAction(data);
  },

  async updateDecisionStatus(id, status) {
    const data = await request(`/decisions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return normalizeDecision(data);
  },
};

export default api;
