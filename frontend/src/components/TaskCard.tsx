import { useState } from 'react'
import { api } from '../api'
import { Task, TimeEntry } from '../types'
import Timer from './Timer'

interface Props {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (id: number) => void
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
}

export default function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<string>(task.priority)
  const [status, setStatus] = useState<string>(task.status)
  const [dueDate, setDueDate] = useState(task.due_date || '')
  const [loading, setLoading] = useState(false)
  const [showEntries, setShowEntries] = useState(false)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeStartTime, setActiveStartTime] = useState<string | null>(null)

  const handleStart = async () => {
    try {
      const res = (await api.startTimer(task.id)) as any
      setActiveStartTime(res.time_entry.start_time)
      onUpdate({ ...task, is_timing: true, active_entry_id: res.time_entry.id })
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleStop = async () => {
    try {
      const res = (await api.stopTimer(task.id)) as any
      setActiveStartTime(null)
      onUpdate({
        ...task,
        is_timing: false,
        active_entry_id: null,
        total_time_seconds: task.total_time_seconds + res.duration_seconds,
      })
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updated = (await api.updateTask(task.id, {
        title,
        description: description || undefined,
        priority,
        status,
        due_date: dueDate || null,
      })) as Task
      onUpdate(updated)
      setEditing(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await api.deleteTask(task.id)
      onDelete(task.id)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const toggleEntries = async () => {
    if (!showEntries) {
      const data = (await api.getTimeEntries(task.id)) as TimeEntry[]
      setEntries(data)
    }
    setShowEntries(!showEntries)
  }

  const formatDate = (d: string) => new Date(d).toLocaleString()

  const formatDur = (s: number | null) => {
    if (!s) return '-'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    return h > 0 ? `${h}h ${m}m ${sec}s` : m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  if (editing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-5">
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Description..."
          />
          <div className="grid grid-cols-3 gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 ${task.is_timing ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={`font-semibold text-gray-900 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              {statusLabels[task.status]}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {task.due_date && <span>Due: {task.due_date}</span>}
            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Timer
            isRunning={task.is_timing}
            totalSeconds={task.total_time_seconds}
            startTime={activeStartTime}
            onStart={handleStart}
            onStop={handleStop}
            disabled={task.status === 'done'}
          />
          <div className="flex gap-1">
            <button
              onClick={toggleEntries}
              className="px-2 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
              title="View time entries"
            >
              History
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showEntries && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Time Entries</h4>
          {entries.length === 0 ? (
            <p className="text-xs text-gray-400">No time entries yet</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {entries.map((entry) => (
                <div key={entry.id} className="flex justify-between text-xs text-gray-500 py-1 px-2 bg-gray-50 rounded">
                  <span>{formatDate(entry.start_time)}</span>
                  <span>{entry.end_time ? formatDate(entry.end_time) : 'Running...'}</span>
                  <span className="font-medium">{formatDur(entry.duration_seconds)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
