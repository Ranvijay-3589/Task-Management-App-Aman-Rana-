const API_BASE = '/aman/api'

function getToken(): string | null {
  return localStorage.getItem('token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 204) {
    return null as T
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(body.detail || 'Request failed')
  }

  return res.json()
}

export const api = {
  // Auth
  register: (data: { username: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { username: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request('/auth/me'),

  // Tasks
  getTasks: (params?: { status?: string; priority?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.priority) query.set('priority', params.priority)
    const qs = query.toString()
    return request(`/tasks${qs ? `?${qs}` : ''}`)
  },

  getTask: (id: number) => request(`/tasks/${id}`),

  createTask: (data: {
    title: string
    description?: string
    priority?: string
    status?: string
    due_date?: string | null
  }) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),

  updateTask: (
    id: number,
    data: {
      title?: string
      description?: string
      priority?: string
      status?: string
      due_date?: string | null
    }
  ) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteTask: (id: number) =>
    request(`/tasks/${id}`, { method: 'DELETE' }),

  // Timer
  startTimer: (taskId: number) =>
    request(`/tasks/${taskId}/start`, { method: 'POST' }),

  stopTimer: (taskId: number) =>
    request(`/tasks/${taskId}/stop`, { method: 'POST' }),

  getTimeEntries: (taskId: number) => request(`/tasks/${taskId}/time-entries`),

  // Summary
  getTimeSummary: (params: {
    period: string
    start_date?: string
    end_date?: string
  }) => {
    const query = new URLSearchParams({ period: params.period })
    if (params.start_date) query.set('start_date', params.start_date)
    if (params.end_date) query.set('end_date', params.end_date)
    return request(`/time-summary?${query.toString()}`)
  },
}
