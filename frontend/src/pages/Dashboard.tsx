import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { Task, PeriodSummary } from '../types'
import TaskForm from '../components/TaskForm'
import TaskCard from '../components/TaskCard'
import TimeFilter from '../components/TimeFilter'
import TimeSummary from '../components/TimeSummary'

type StatusFilter = '' | 'pending' | 'in_progress' | 'done'

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [summary, setSummary] = useState<PeriodSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (priorityFilter) params.priority = priorityFilter
      const data = (await api.getTasks(params)) as Task[]
      setTasks(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [priorityFilter])

  const fetchSummary = async (params: { period: string; start_date?: string; end_date?: string }) => {
    setSummaryLoading(true)
    try {
      const data = (await api.getTimeSummary(params)) as PeriodSummary
      setSummary(data)
    } catch {
      // silently fail
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    fetchSummary({ period: 'today' })
  }, [])

  const handleCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev])
  }

  const handleUpdate = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  const handleDelete = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const filteredTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  const cardBaseClass =
    'rounded-xl shadow-sm border p-4 text-center transition focus:outline-none focus:ring-2 focus:ring-offset-1'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`${cardBaseClass} ${
            statusFilter === ''
              ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Tasks</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`${cardBaseClass} ${
            statusFilter === 'pending'
              ? 'bg-yellow-50 border-yellow-300 ring-1 ring-yellow-200'
              : 'bg-white border-yellow-200 hover:bg-yellow-50/50'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('in_progress')}
          className={`${cardBaseClass} ${
            statusFilter === 'in_progress'
              ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
              : 'bg-white border-blue-200 hover:bg-blue-50/50'
          }`}
        >
          <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('done')}
          className={`${cardBaseClass} ${
            statusFilter === 'done'
              ? 'bg-green-50 border-green-300 ring-1 ring-green-200'
              : 'bg-white border-green-200 hover:bg-green-50/50'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{stats.done}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <TaskForm onCreated={handleCreated} />

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={fetchTasks}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition font-medium"
            >
              Refresh
            </button>
          </div>

          {/* Task List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {tasks.length === 0 ? 'No tasks yet' : 'No tasks match this status'}
              </p>
              <p className="text-gray-400 text-sm">
                {tasks.length === 0
                  ? 'Create your first task to get started!'
                  : 'Try another status filter or set it to All Statuses.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Time Summary */}
        <div className="space-y-6">
          <TimeFilter onFilter={fetchSummary} />
          <TimeSummary summary={summary} loading={summaryLoading} />
        </div>
      </div>
    </div>
  )
}
