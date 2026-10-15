const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('flowpilot_token') || 'demo-token';
  const workspaceId = localStorage.getItem('flowpilot_workspace_id') || 'w0000000-0000-0000-0000-000000000001';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-workspace-id': workspaceId,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth & Workspace
  getMe: () => fetchApi('/me'),
  getWorkspaces: () => fetchApi('/workspaces'),
  createWorkspace: (name: string) => fetchApi('/workspaces', { method: 'POST', body: JSON.stringify({ name }) }),

  // Dashboard
  getDashboardSummary: () => fetchApi('/dashboard/summary'),
  getDashboardActivity: (limit = 10) => fetchApi(`/dashboard/activity?limit=${limit}`),
  getDashboardAlerts: () => fetchApi('/dashboard/alerts'),

  // Workflows
  getWorkflows: (params?: { status?: string; category?: string; priority?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchApi(`/workflows${q ? `?${q}` : ''}`);
  },
  getWorkflowById: (id: string) => fetchApi(`/workflows/${id}`),
  createWorkflow: (data: any) => fetchApi('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (id: string, data: any) => fetchApi(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWorkflow: (id: string) => fetchApi(`/workflows/${id}`, { method: 'DELETE' }),
  planWorkflow: (id: string) => fetchApi(`/workflows/${id}/plan`, { method: 'POST' }),
  startWorkflow: (id: string) => fetchApi(`/workflows/${id}/start`, { method: 'POST' }),
  pauseWorkflow: (id: string) => fetchApi(`/workflows/${id}/pause`, { method: 'POST' }),
  resumeWorkflow: (id: string) => fetchApi(`/workflows/${id}/resume`, { method: 'POST' }),
  cancelWorkflow: (id: string) => fetchApi(`/workflows/${id}/cancel`, { method: 'POST' }),
  getWorkflowReport: (id: string) => fetchApi(`/workflows/${id}/report`),

  // Tasks
  getTasks: (params?: { workflowId?: string; status?: string; priority?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchApi(`/tasks${q ? `?${q}` : ''}`);
  },
  getTaskById: (id: string) => fetchApi(`/tasks/${id}`),
  retryTask: (id: string) => fetchApi(`/tasks/${id}/retry`, { method: 'POST' }),
  cancelTask: (id: string) => fetchApi(`/tasks/${id}/cancel`, { method: 'POST' }),

  // Agents
  getAgents: () => fetchApi('/agents'),
  getAgentById: (id: string) => fetchApi(`/agents/${id}`),
  getAgentExecutions: (agentId: string) => fetchApi(`/agents/${agentId}/executions`),

  // Approvals
  getApprovals: (status?: string) => fetchApi(`/approvals${status ? `?status=${status}` : ''}`),
  getApprovalById: (id: string) => fetchApi(`/approvals/${id}`),
  approveRequest: (id: string, comment?: string) => fetchApi(`/approvals/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ reviewComment: comment })
  }),
  rejectRequest: (id: string, comment?: string) => fetchApi(`/approvals/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reviewComment: comment })
  }),

  // Business Data
  getOrders: () => fetchApi('/orders'),
  createOrder: (data: any) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id: string, data: any) => fetchApi(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getInventory: () => fetchApi('/inventory'),
  createInventoryItem: (data: any) => fetchApi('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventoryItem: (id: string, data: any) => fetchApi(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getCustomers: () => fetchApi('/customers'),
  createCustomer: (data: any) => fetchApi('/customers', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => fetchApi('/suppliers'),
  createSupplier: (data: any) => fetchApi('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  getInternalTasks: () => fetchApi('/internal-tasks'),
  createInternalTask: (data: any) => fetchApi('/internal-tasks', { method: 'POST', body: JSON.stringify(data) }),

  // Templates
  getTemplates: () => fetchApi('/templates'),
  createTemplate: (data: any) => fetchApi('/templates', { method: 'POST', body: JSON.stringify(data) }),
  runTemplate: (id: string) => fetchApi(`/templates/${id}/run`, { method: 'POST' }),

  // Analytics & Logs
  getAnalyticsOverview: () => fetchApi('/analytics/overview'),
  getWorkflowTrends: () => fetchApi('/analytics/workflows'),
  getAgentStats: () => fetchApi('/analytics/agents'),
  getActivityLogs: (limit = 50) => fetchApi(`/activity?limit=${limit}`),
  getNotifications: () => fetchApi('/notifications'),
  markNotificationRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'POST' }),

  // Demo & Settings
  runDemo: () => fetchApi('/demo/run', { method: 'POST' }),
  resetDemo: () => fetchApi('/demo/reset', { method: 'POST' }),
  getAiStatus: () => fetchApi('/settings/ai-status'),
  getSupabaseStatus: () => fetchApi('/settings/supabase-status'),
  syncSupabase: () => fetchApi('/settings/supabase-sync', { method: 'POST' })
};
