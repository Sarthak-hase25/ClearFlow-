// ============================================================
// ARCHFLOW — MOCK DATA
// Realistic data for the "Modern Villa" demo project.
// This will be replaced by real API calls in later phases.
// ============================================================

// ─── PROJECTS ────────────────────────────────────────────────
export const projects = [
  {
    id: 'proj-001',
    name: 'Modern Villa',
    description: 'Contemporary 4-bedroom residential villa with open-plan living spaces, rooftop terrace, and landscaped garden. Client: Mr & Mrs Kapoor.',
    type: 'Residential',
    status: 'active',
    location: 'Bandra West, Mumbai',
    createdAt: '2026-07-10T09:00:00Z',
    communicationCount: 9,
    pendingActionCount: 4,
    openDecisionCount: 3,
    activeRiskCount: 2,
  },
  {
    id: 'proj-002',
    name: 'Skyline Office Tower',
    description: 'Grade-A commercial office tower, 22 floors. Tenant fit-out for floors 8–14 in progress. Developer: Meridian Properties.',
    type: 'Commercial',
    status: 'active',
    location: 'BKC, Mumbai',
    createdAt: '2026-06-01T10:30:00Z',
    communicationCount: 3,
    pendingActionCount: 1,
    openDecisionCount: 1,
    activeRiskCount: 0,
  },
  {
    id: 'proj-003',
    name: 'Riverside Clubhouse',
    description: 'Community clubhouse with swimming pool, gym, and function hall for a residential township project.',
    type: 'Institutional',
    status: 'on-hold',
    location: 'Thane, Mumbai',
    createdAt: '2026-05-15T08:00:00Z',
    communicationCount: 1,
    pendingActionCount: 0,
    openDecisionCount: 0,
    activeRiskCount: 1,
  },
];

// ─── COMMUNICATIONS ───────────────────────────────────────────
export const communications = [
  {
    id: 'comm-001',
    projectId: 'proj-001',
    source: 'Client',
    sender: 'Rahul Kapoor',
    message: 'Everything looks great overall — really happy with the living room concept. However, I want to revisit the master bathroom. The current tile option feels too stark. Please go back to the previous option we discussed, the textured limestone finish. Also, can we look at warmer lighting in the bathroom? The current spec feels very clinical.',
    timestamp: '2026-09-14T10:15:00Z',
    hasInsight: true,
    insightId: 'ins-001',
  },
  {
    id: 'comm-002',
    projectId: 'proj-001',
    source: 'Contractor',
    sender: 'Amit Rathod (BuildRight)',
    message: 'We need immediate clarification on the bathroom ceiling height. The current drawing shows 2.8m but the structural beam drops to 2.6m in that zone. If we proceed with 2.8m, we will need to reposition the beam which adds 3–4 days and additional cost. Please advise before we proceed with ceiling work.',
    timestamp: '2026-09-14T09:45:00Z',
    hasInsight: true,
    insightId: 'ins-002',
  },
  {
    id: 'comm-003',
    projectId: 'proj-001',
    source: 'Supplier',
    sender: 'ABC Materials',
    message: 'Please note that the limestone tile in Shade 312 (Ivory Travertine) is currently out of stock. Expected restocking is 6–8 weeks. We can offer Shade 318 (Warm Travertine) as an alternative which has a very similar finish. Please confirm if this is acceptable or if you would like to wait for the original.',
    timestamp: '2026-09-14T08:30:00Z',
    hasInsight: true,
    insightId: 'ins-003',
  },
  {
    id: 'comm-004',
    projectId: 'proj-001',
    source: 'Email',
    sender: 'Structural Consultant (Mehta Engineers)',
    message: 'Please note that all electrical point layouts must refer to Revision 04 of the electrical drawing set. Previous revisions should be discarded. The main change is the relocation of the distribution board from the utility room to the corridor as discussed in the last site meeting. Confirm receipt.',
    timestamp: '2026-09-13T16:20:00Z',
    hasInsight: true,
    insightId: 'ins-004',
  },
  {
    id: 'comm-005',
    projectId: 'proj-001',
    source: 'Site Update',
    sender: 'Site Supervisor — Ravi Kumar',
    message: 'Electrical team is on site and waiting for the updated drawing. They have the old set (Rev 03) and are refusing to proceed without confirmation of the correct revision. Work is currently paused in the electrical zone. Please send the latest Rev 04 drawing immediately.',
    timestamp: '2026-09-13T14:00:00Z',
    hasInsight: true,
    insightId: 'ins-005',
  },
  {
    id: 'comm-006',
    projectId: 'proj-001',
    source: 'Architect',
    sender: 'Interior Team — Priya Nair',
    message: 'Uploading Revision 05 of the interior finish schedule. Main changes: master bathroom tile updated to limestone option (pending final client confirmation), kitchen marble changed from Carrara to Calacatta Gold per client request in meeting on 12 Sep, and the study room flooring changed from engineered wood to polished concrete.',
    timestamp: '2026-09-13T11:30:00Z',
    hasInsight: true,
    insightId: 'ins-006',
  },
  {
    id: 'comm-007',
    projectId: 'proj-001',
    source: 'Consultant',
    sender: 'MEP Consultant — Vijay Shah',
    message: 'Following the DB relocation, the conduit routing for the master bathroom has also changed. Please ensure the contractor uses the updated MEP drawing (Rev 04) and not the previous version. The changes affect conduit runs in the bathroom and bedroom zone.',
    timestamp: '2026-09-12T17:15:00Z',
    hasInsight: true,
    insightId: 'ins-007',
  },
  {
    id: 'comm-008',
    projectId: 'proj-001',
    source: 'Client',
    sender: 'Anjali Kapoor',
    message: 'One more thing — can we add a small study nook in the master bedroom? Something compact, maybe 1.5m × 1m with built-in shelving. I know this may affect the layout slightly but would love to explore this. Can you send me a quick sketch or option?',
    timestamp: '2026-09-12T12:00:00Z',
    hasInsight: false,
    insightId: null,
  },
  {
    id: 'comm-009',
    projectId: 'proj-001',
    source: 'Contractor',
    sender: 'Amit Rathod (BuildRight)',
    message: 'Waterproofing work in the master bathroom and guest bathroom is complete. We have done the water retention test and it has passed (48-hour test, no leakage). Ready to proceed with tile laying as soon as we have the confirmed tile specification and drawing.',
    timestamp: '2026-09-11T15:45:00Z',
    hasInsight: false,
    insightId: null,
  },

  // ─── Proj 002 communications ─────────────────────────────
  {
    id: 'comm-010',
    projectId: 'proj-002',
    source: 'Client',
    sender: 'Meridian Properties',
    message: 'Please confirm that the floor plan for Level 10 is finalized. The tenant has requested to move ahead with their own fit-out contractor and needs the approved drawing set by end of this week.',
    timestamp: '2026-09-14T11:00:00Z',
    hasInsight: true,
    insightId: 'ins-008',
  },
  {
    id: 'comm-011',
    projectId: 'proj-002',
    source: 'Contractor',
    sender: 'Cornerstone Construction',
    message: 'Core and shell work on floors 8 to 12 is substantially complete. Punch list items remaining: 3 on floor 9 (finishing), 5 on floor 10 (MEP clearance). We need the snagging sign-off before tenant handover.',
    timestamp: '2026-09-13T10:00:00Z',
    hasInsight: true,
    insightId: 'ins-009',
  },
  {
    id: 'comm-012',
    projectId: 'proj-002',
    source: 'Consultant',
    sender: 'Fire Safety Consultant',
    message: 'Fire suppression system test has been scheduled for 18 September. The contractor must ensure all sprinkler heads are installed and accessible before that date. Any areas with incomplete ceiling work must be flagged to us before the test.',
    timestamp: '2026-09-12T14:30:00Z',
    hasInsight: false,
    insightId: null,
  },

  // ─── Proj 003 communications ─────────────────────────────
  {
    id: 'comm-013',
    projectId: 'proj-003',
    source: 'Client',
    sender: 'Township Developer',
    message: 'Project is currently on hold due to regulatory clearance pending from the local authority. We expect a decision within 4–6 weeks. Please put all procurement activities on pause until further notice.',
    timestamp: '2026-09-10T09:00:00Z',
    hasInsight: false,
    insightId: null,
  },
];

// ─── INSIGHTS (AI Analysis results) ──────────────────────────
export const insights = [
  {
    id: 'ins-001',
    projectId: 'proj-001',
    communicationId: 'comm-001',
    summary: 'Client has approved the overall living room concept but requested a change to the master bathroom tile, reverting to the previously discussed textured limestone finish. The client also raised a concern about the bathroom lighting specification being too clinical and has requested a warmer alternative.',
    analyzedAt: '2026-09-14T10:17:00Z',
  },
  {
    id: 'ins-002',
    projectId: 'proj-001',
    communicationId: 'comm-002',
    summary: 'Contractor has flagged a discrepancy between the architectural drawing ceiling height (2.8m) and the actual structural beam clearance (2.6m) in the bathroom zone. Work is pending a design decision. Proceeding without resolution will either require beam repositioning (3–4 day delay and added cost) or a ceiling height adjustment.',
    analyzedAt: '2026-09-14T09:47:00Z',
  },
  {
    id: 'ins-003',
    projectId: 'proj-001',
    communicationId: 'comm-003',
    summary: 'The specified limestone tile (Shade 312 — Ivory Travertine) is out of stock with an estimated 6–8 week lead time. The supplier has offered Shade 318 (Warm Travertine) as an alternative. A material procurement decision is required urgently to avoid delays to tile laying.',
    analyzedAt: '2026-09-14T08:32:00Z',
  },
  {
    id: 'ins-004',
    projectId: 'proj-001',
    communicationId: 'comm-004',
    summary: 'Structural consultant has issued an instruction to use Revision 04 of the electrical drawings. The key change is the distribution board relocation from the utility room to the corridor. All team members working with electrical drawings must be updated immediately.',
    analyzedAt: '2026-09-13T16:22:00Z',
  },
  {
    id: 'ins-005',
    projectId: 'proj-001',
    communicationId: 'comm-005',
    summary: 'Electrical work on site is currently halted because the team has an outdated drawing set (Rev 03). The updated Rev 04 drawing set must be sent to site immediately to unblock this work.',
    analyzedAt: '2026-09-13T14:02:00Z',
  },
  {
    id: 'ins-006',
    projectId: 'proj-001',
    communicationId: 'comm-006',
    summary: 'Interior team has uploaded Revision 05 of the finish schedule. Key material changes include the master bathroom tile (pending client confirmation), the kitchen marble (Calacatta Gold, client-approved), and the study flooring (polished concrete). These changes should be cross-checked against the procurement schedule.',
    analyzedAt: '2026-09-13T11:32:00Z',
  },
  {
    id: 'ins-007',
    projectId: 'proj-001',
    communicationId: 'comm-007',
    summary: 'MEP consultant has flagged that the conduit routing for the master bathroom and bedroom zone has changed following the distribution board relocation. The contractor must use Rev 04 of the MEP drawing to avoid incorrect installation.',
    analyzedAt: '2026-09-12T17:17:00Z',
  },
  {
    id: 'ins-008',
    projectId: 'proj-002',
    communicationId: 'comm-010',
    summary: 'Client (Meridian Properties) has requested the approved drawing set for Level 10 by end of week so the tenant can proceed with their own fit-out contractor. The Level 10 floor plan must be confirmed and issued urgently.',
    analyzedAt: '2026-09-14T11:02:00Z',
  },
  {
    id: 'ins-009',
    projectId: 'proj-002',
    communicationId: 'comm-011',
    summary: 'Contractor has reported that core and shell work is substantially complete on floors 8–12. There are outstanding punch list items on floors 9 and 10 that must be cleared before tenant handover. Snagging sign-off is also required.',
    analyzedAt: '2026-09-13T10:02:00Z',
  },
];

// ─── ACTIONS ─────────────────────────────────────────────────
export const actions = [
  {
    id: 'act-001',
    projectId: 'proj-001',
    communicationId: 'comm-001',
    insightId: 'ins-001',
    title: 'Revert master bathroom tile to textured limestone finish',
    description: 'Update the finish schedule and procurement order to reflect the client\'s request to change back to the previously approved limestone tile option.',
    assignee: 'Not specified',
    priority: 'high',
    deadline: 'Not specified',
    status: 'pending',
    createdAt: '2026-09-14T10:17:00Z',
  },
  {
    id: 'act-002',
    projectId: 'proj-001',
    communicationId: 'comm-001',
    insightId: 'ins-001',
    title: 'Review and update bathroom lighting specification',
    description: 'The client has requested warmer lighting in the master bathroom. Review the current specification and propose an alternative that better suits the desired ambiance.',
    assignee: 'Not specified',
    priority: 'medium',
    deadline: 'Not specified',
    status: 'pending',
    createdAt: '2026-09-14T10:17:00Z',
  },
  {
    id: 'act-003',
    projectId: 'proj-001',
    communicationId: 'comm-002',
    insightId: 'ins-002',
    title: 'Resolve bathroom ceiling height discrepancy',
    description: 'The structural beam creates a 2.6m clearance in the bathroom zone, conflicting with the 2.8m shown on the drawing. A design decision must be made before ceiling work can proceed.',
    assignee: 'Not specified',
    priority: 'high',
    deadline: 'Immediate',
    status: 'pending',
    createdAt: '2026-09-14T09:47:00Z',
  },
  {
    id: 'act-004',
    projectId: 'proj-001',
    communicationId: 'comm-005',
    insightId: 'ins-005',
    title: 'Send Revision 04 electrical drawing to site team',
    description: 'The on-site electrical team currently has the outdated Rev 03 drawing set. Work is paused. Rev 04 must be sent immediately.',
    assignee: 'Not specified',
    priority: 'high',
    deadline: 'Immediate',
    status: 'completed',
    createdAt: '2026-09-13T14:02:00Z',
  },
  {
    id: 'act-005',
    projectId: 'proj-001',
    communicationId: 'comm-006',
    insightId: 'ins-006',
    title: 'Update procurement schedule to reflect finish schedule changes',
    description: 'Rev 05 of the finish schedule includes multiple material changes. The procurement and lead time schedule must be updated accordingly.',
    assignee: 'Not specified',
    priority: 'medium',
    deadline: 'Not specified',
    status: 'in-progress',
    createdAt: '2026-09-13T11:32:00Z',
  },
  {
    id: 'act-006',
    projectId: 'proj-001',
    communicationId: 'comm-007',
    insightId: 'ins-007',
    title: 'Distribute Rev 04 MEP drawing to contractor',
    description: 'Following the DB relocation, the MEP conduit routing has changed. The contractor must receive Rev 04 of the MEP drawing before proceeding with conduit installation in the bathroom and bedroom zone.',
    assignee: 'Contractor',
    priority: 'high',
    deadline: 'Before conduit installation',
    status: 'pending',
    createdAt: '2026-09-12T17:17:00Z',
  },
  // Proj 002 actions
  {
    id: 'act-007',
    projectId: 'proj-002',
    communicationId: 'comm-010',
    insightId: 'ins-008',
    title: 'Confirm and issue Level 10 approved drawing set',
    description: 'Tenant requires the approved Level 10 floor plan by end of week to proceed with their fit-out contractor. Drawings must be confirmed and issued immediately.',
    assignee: 'Not specified',
    priority: 'high',
    deadline: 'End of this week',
    status: 'pending',
    createdAt: '2026-09-14T11:02:00Z',
  },
  {
    id: 'act-008',
    projectId: 'proj-002',
    communicationId: 'comm-011',
    insightId: 'ins-009',
    title: 'Clear punch list items on Floors 9 and 10',
    description: 'Three items remain on Floor 9 and five on Floor 10. These must be resolved before snagging sign-off and tenant handover.',
    assignee: 'Contractor',
    priority: 'medium',
    deadline: 'Before tenant handover',
    status: 'in-progress',
    createdAt: '2026-09-13T10:02:00Z',
  },
];

// ─── DECISIONS ────────────────────────────────────────────────
export const decisions = [
  {
    id: 'dec-001',
    projectId: 'proj-001',
    communicationId: 'comm-003',
    insightId: 'ins-003',
    title: 'Confirm tile selection: accept Shade 318 alternative or wait for Shade 312',
    description: 'Shade 312 (Ivory Travertine) is out of stock for 6–8 weeks. The supplier has offered Shade 318 (Warm Travertine) as a close alternative. A decision is required to avoid procurement delays that will hold up tile laying.',
    decisionOwner: 'Not specified',
    status: 'pending',
    createdAt: '2026-09-14T08:32:00Z',
  },
  {
    id: 'dec-002',
    projectId: 'proj-001',
    communicationId: 'comm-002',
    insightId: 'ins-002',
    title: 'Approve revised bathroom ceiling height or approve beam repositioning',
    description: 'The structural beam drops to 2.6m in the bathroom zone. The team must decide whether to accept the reduced ceiling height (2.6m) or approve beam repositioning at additional cost and 3–4 day delay.',
    decisionOwner: 'Not specified',
    status: 'pending',
    createdAt: '2026-09-14T09:47:00Z',
  },
  {
    id: 'dec-003',
    projectId: 'proj-001',
    communicationId: 'comm-008',
    insightId: null,
    title: 'Evaluate feasibility of master bedroom study nook',
    description: 'The client has requested a 1.5m × 1m study nook with built-in shelving in the master bedroom. The design team must assess the spatial impact and present an option to the client.',
    decisionOwner: 'Not specified',
    status: 'pending',
    createdAt: '2026-09-12T12:00:00Z',
  },
  // Proj 002
  {
    id: 'dec-004',
    projectId: 'proj-002',
    communicationId: 'comm-010',
    insightId: 'ins-008',
    title: 'Confirm Level 10 floor plan before tenant fit-out begins',
    description: 'Tenant is ready to proceed with their fit-out contractor but requires the approved Level 10 drawing set first. The project team must confirm if the floor plan is finalized and can be issued.',
    decisionOwner: 'Not specified',
    status: 'pending',
    createdAt: '2026-09-14T11:02:00Z',
  },
];

// ─── RISKS ────────────────────────────────────────────────────
export const risks = [
  {
    id: 'risk-001',
    projectId: 'proj-001',
    communicationId: 'comm-003',
    insightId: 'ins-003',
    title: 'Tile procurement delay — Shade 312 out of stock (6–8 weeks)',
    description: 'The specified tile (Ivory Travertine, Shade 312) is unavailable. If the team waits for the original tile, tile laying cannot begin for 6–8 weeks, which may delay the bathroom completion and overall project handover.',
    severity: 'high',
    potentialImpact: 'Bathroom completion timeline and project handover date',
    createdAt: '2026-09-14T08:32:00Z',
  },
  {
    id: 'risk-002',
    projectId: 'proj-001',
    communicationId: 'comm-002',
    insightId: 'ins-002',
    title: 'Ceiling height conflict may require structural beam repositioning',
    description: 'The 200mm discrepancy between the drawing ceiling height and actual beam clearance may require structural intervention if the 2.8m height is to be maintained. This adds cost and 3–4 days to the program.',
    severity: 'medium',
    potentialImpact: 'Construction cost and ceiling work schedule',
    createdAt: '2026-09-14T09:47:00Z',
  },
  // Proj 003
  {
    id: 'risk-003',
    projectId: 'proj-003',
    communicationId: 'comm-013',
    insightId: null,
    title: 'Regulatory clearance delay — project on hold',
    description: 'Project is waiting for local authority clearance. If clearance is delayed beyond 6 weeks, contractual obligations and procurement commitments may need to be reviewed.',
    severity: 'medium',
    potentialImpact: 'Project timeline, procurement commitments, contractor holding costs',
    createdAt: '2026-09-10T09:00:00Z',
  },
];

// ─── HELPER: Get data for a specific project ─────────────────
export const getProjectById = (id) => projects.find(p => p.id === id);
export const getCommunicationsByProject = (projectId) =>
  communications.filter(c => c.projectId === projectId);
export const getActionsByProject = (projectId) =>
  actions.filter(a => a.projectId === projectId);
export const getDecisionsByProject = (projectId) =>
  decisions.filter(d => d.projectId === projectId);
export const getRisksByProject = (projectId) =>
  risks.filter(r => r.projectId === projectId);
export const getInsightById = (id) => insights.find(i => i.id === id);
export const getCommunicationById = (id) => communications.find(c => c.id === id);
export const getActionById = (id) => actions.find(a => a.id === id);
export const getDecisionById = (id) => decisions.find(d => d.id === id);
export const getRiskById = (id) => risks.find(r => r.id === id);

// ─── Dashboard aggregation (all projects) ────────────────────
export const getDashboardStats = () => ({
  totalCommunications: communications.length,
  pendingActions: actions.filter(a => a.status === 'pending').length,
  openDecisions: decisions.filter(d => d.status === 'pending').length,
  activeRisks: risks.filter(r => r.severity === 'high' || r.severity === 'medium').length,
});

// Needs-attention items: high priority actions + high/medium risks (pending)
export const getNeedsAttention = () => {
  const highActions = actions
    .filter(a => a.priority === 'high' && a.status === 'pending')
    .map(a => ({ ...a, kind: 'action' }));
  const highRisks = risks
    .filter(r => r.severity === 'high' || r.severity === 'medium')
    .map(r => ({ ...r, kind: 'risk' }));
  const pendingDecisions = decisions
    .filter(d => d.status === 'pending')
    .slice(0, 2)
    .map(d => ({ ...d, kind: 'decision' }));
  return [...highActions, ...highRisks, ...pendingDecisions];
};

// Recent communications (all projects, most recent first)
export const getRecentCommunications = (limit = 5) =>
  [...communications]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
