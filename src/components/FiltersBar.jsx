"use client"
import React from "react"

/**
 * FiltersBar
 * - Props:
 *   - view: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'OVERDUE'
 *   - onChange: (view) => void
 */
export function FiltersBar({ view = 'ALL', onChange }) {
  const Chip = ({ id, label }) => (
    <button
      onClick={() => onChange(id)}
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        view === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-100 border-gray-300'
      }`}
      aria-pressed={view === id}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip id="ALL" label="All" />
      <Chip id="TODAY" label="Today" />
      <Chip id="THIS_WEEK" label="This Week" />
      <Chip id="OVERDUE" label="Overdue" />
    </div>
  )
}
