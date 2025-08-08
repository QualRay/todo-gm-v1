"use client"
import React from "react"
import { getNextDueDate } from "@/lib/dateUtils"

/**
 * CalendarWidget (mini month view)
 * - Props:
 *   - tasks: Array<{ id, title, dueDate?: string | null }>
 *   - selectedDate: Date | null
 *   - onSelectDate: (date: Date | null) => void
 * - Behavior:
 *   - Renders a compact month grid for the current month
 *   - Highlights today, selected day, and marks days that have tasks due
 *   - Left/Right arrows navigate months
 */
export default function CalendarWidget({ tasks = [], selectedDate, onSelectDate }) {
  const [viewYear, setViewYear] = React.useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = React.useState(() => new Date().getMonth()) // 0-11

  const startOfMonth = new Date(viewYear, viewMonth, 1)
  const endOfMonth = new Date(viewYear, viewMonth + 1, 0)
  const startWeekday = startOfMonth.getDay() // 0=Sun
  const daysInMonth = endOfMonth.getDate()

  // Build a Set of yyyy-mm-dd strings that have at least one task due
  const dueMap = React.useMemo(() => {
    const set = new Set()
    tasks.forEach(t => {
      if (!t.dueDate) return
      
      if (t.recurrence && t.recurrence.freq) {
        // For recurring tasks, calculate all dates from start to end
        const startDate = t.startDate || t.dueDate
        const endDate = t.endDate || t.dueDate
        
        if (startDate && endDate) {
          let currentDate = startDate
          const end = new Date(endDate + 'T00:00:00')
          
          while (currentDate <= endDate) {
            const d = new Date(currentDate + 'T00:00:00')
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, "0")
            const dd = String(d.getDate()).padStart(2, "0")
            set.add(`${yyyy}-${mm}-${dd}`)
            
            // Calculate next occurrence
            currentDate = getNextDueDate(currentDate, t.recurrence)
            
            // Safety check to prevent infinite loops
            if (currentDate === startDate) break
          }
        }
      } else {
        // Non-recurring task - just add the due date
        const d = new Date(t.dueDate + 'T00:00:00')
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const dd = String(d.getDate()).padStart(2, "0")
        set.add(`${yyyy}-${mm}-${dd}`)
      }
    })
    return set
  }, [tasks])

  const todayStr = (() => {
    const d = new Date()
    // Use local timezone to avoid UTC conversion issues
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  })()

  const selectedStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : null

  const days = []
  for (let i = 0; i < startWeekday; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewYear, viewMonth, d))
  }

  const goPrevMonth = () => {
    const m = viewMonth - 1
    if (m < 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(m)
    }
  }

  const goNextMonth = () => {
    const m = viewMonth + 1
    if (m > 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(m)
    }
  }

  const formatKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

  return (
    <div className="rounded-2xl border bg-white/90 backdrop-blur p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <button aria-label="Previous month" className="px-2 py-1 rounded hover:bg-gray-100" onClick={goPrevMonth}>‹</button>
        <div className="font-semibold">{startOfMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button aria-label="Next month" className="px-2 py-1 rounded hover:bg-gray-100" onClick={goNextMonth}>›</button>
      </div>

      <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="h-8" />
          const key = formatKey(date)
          const isToday = key === todayStr
          const isSelected = selectedStr === key
          const hasTasks = dueMap.has(key)
          return (
            <button
              key={key}
              onClick={() => onSelectDate(isSelected ? null : date)}
              className={[
                "relative h-8 rounded-md text-sm flex items-center justify-center transition",
                isSelected ? "bg-indigo-600 text-white" : isToday ? "border border-indigo-400" : "hover:bg-gray-100",
              ].join(' ')}
              aria-pressed={isSelected}
              aria-label={`Select ${date.toDateString()}`}
            >
              {date.getDate()}
              {hasTasks && (
                <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
              )}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <button
          className="mt-3 w-full text-xs text-indigo-700 hover:underline"
          onClick={() => onSelectDate(null)}
        >
          Clear date filter
        </button>
      )}
    </div>
  )
}
