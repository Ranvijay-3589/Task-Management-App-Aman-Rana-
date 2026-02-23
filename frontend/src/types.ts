export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Task {
  id: number
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'done'
  due_date: string | null
  user_id: number
  created_at: string
  updated_at: string | null
  total_time_seconds: number
  is_timing: boolean
  active_entry_id: number | null
}

export interface TimeEntry {
  id: number
  task_id: number
  start_time: string
  end_time: string | null
  duration_seconds: number | null
  created_at: string
}

export interface TaskTimeSummary {
  task_id: number
  task_title: string
  total_seconds: number
  entry_count: number
}

export interface PeriodSummary {
  period: string
  start_date: string
  end_date: string
  total_seconds: number
  task_summaries: TaskTimeSummary[]
}
