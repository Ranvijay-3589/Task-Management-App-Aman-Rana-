import { useState } from 'react'

interface Props {
  onFilter: (params: { period: string; start_date?: string; end_date?: string }) => void
}

export default function TimeFilter({ onFilter }: Props) {
  const [period, setPeriod] = useState('today')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    if (newPeriod !== 'custom') {
      onFilter({ period: newPeriod })
    }
  }

  const handleCustom = () => {
    if (startDate && endDate) {
      onFilter({ period: 'custom', start_date: startDate, end_date: endDate })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Time Summary Filter</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {['today', 'this_week', 'this_month'].map((p) => (
          <button
            key={p}
            onClick={() => handleChange(p)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              period === p
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p === 'today' ? 'Today' : p === 'this_week' ? 'This Week' : 'This Month'}
          </button>
        ))}
        <button
          onClick={() => setPeriod('custom')}
          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
            period === 'custom'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Custom
        </button>
      </div>
      {period === 'custom' && (
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleCustom}
            disabled={!startDate || !endDate}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
