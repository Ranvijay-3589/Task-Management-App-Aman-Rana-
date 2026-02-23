import { PeriodSummary } from '../types'
import { formatDuration } from './Timer'

interface Props {
  summary: PeriodSummary | null
  loading: boolean
}

export default function TimeSummary({ summary, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Time Summary</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">
            {formatDuration(summary.total_seconds)}
          </p>
          <p className="text-xs text-gray-400">Total time tracked</p>
        </div>
      </div>

      {summary.task_summaries.length === 0 ? (
        <p className="text-sm text-gray-400">No time entries in this period</p>
      ) : (
        <div className="space-y-3">
          {summary.task_summaries.map((ts) => {
            const pct = summary.total_seconds > 0
              ? (ts.total_seconds / summary.total_seconds) * 100
              : 0
            return (
              <div key={ts.task_id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate">{ts.task_title}</span>
                  <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                    {formatDuration(ts.total_seconds)} ({ts.entry_count} entries)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-indigo-500 rounded-full h-2 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
