import { useState, useEffect, useRef } from 'react'

interface Props {
  isRunning: boolean
  totalSeconds: number
  startTime?: string | null
  onStart: () => void
  onStop: () => void
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = Math.floor(totalSec % 60)
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  }
  if (m > 0) {
    return `${m}m ${s.toString().padStart(2, '0')}s`
  }
  return `${s}s`
}

export default function Timer({ isRunning, totalSeconds, startTime, onStart, onStop }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning && startTime) {
      const start = new Date(startTime).getTime()
      const tick = () => {
        const now = Date.now()
        setElapsed(Math.floor((now - start) / 1000))
      }
      tick()
      intervalRef.current = setInterval(tick, 1000)
    } else {
      setElapsed(0)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, startTime])

  const displayTime = totalSeconds + (isRunning ? elapsed : 0)

  return (
    <div className="flex items-center gap-3">
      <span className={`font-mono text-sm font-medium ${isRunning ? 'text-green-600' : 'text-gray-600'}`}>
        {formatDuration(displayTime)}
      </span>
      {isRunning ? (
        <button
          onClick={onStop}
          className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={onStart}
          className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
        >
          Start
        </button>
      )}
    </div>
  )
}
