"use client"
import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Target, Zap, Pencil, Save, X, Trash2, Plus } from "lucide-react"
import CalendarWidget from "@/components/CalendarWidget"
import { FiltersBar } from "@/components/FiltersBar"
import { isOverdue, isWithinThisWeek, parseInputDate, startOfToday, getNextDueDate } from "@/lib/dateUtils"

export default function InitialInputForm() {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [dueDate, setDueDate] = useState("") // store as YYYY-MM-DD
  const [recurrence, setRecurrence] = useState("")

  const [tasks, setTasks] = useState([])
  const [completed, setCompleted] = useState(new Set())

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editDueDate, setEditDueDate] = useState("") // YYYY-MM-DD
  const [editRecurrence, setEditRecurrence] = useState("")

  const [dateFilter, setDateFilter] = useState(null) // Date | null
  const [viewFilter, setViewFilter] = useState('ALL')

  const [isPending, startTransition] = useTransition()

  // ---- Persistence ----
  useEffect(() => {
    try {
      const savedTasks = JSON.parse(localStorage.getItem("tasks") || "null")
      const savedCompleted = JSON.parse(localStorage.getItem("completed") || "null")
      if (Array.isArray(savedTasks)) setTasks(savedTasks)
      if (Array.isArray(savedCompleted)) setCompleted(new Set(savedCompleted))
    } catch (_) {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks))
      localStorage.setItem("completed", JSON.stringify([...completed]))
    } catch (_) {}
  }, [tasks, completed])

  // If user selects "All", clear any date filter to show *everything*
  useEffect(() => {
    if (viewFilter === 'ALL' && dateFilter) setDateFilter(null)
  }, [viewFilter])

  const resetForm = () => { setTitle(""); setDesc(""); setDueDate(""); setRecurrence("") }

  const submitHandler = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(() => {
      setTasks(prev => [
        ...prev,
        {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now(),
          title: title.trim(),
          desc: desc.trim() || "No description provided",
          createdAt: new Date().toLocaleString(),
          // For recurring tasks, dueDate is the end date, start date is today
          dueDate: recurrence ? dueDate || null : dueDate || null,
          startDate: recurrence ? new Date().toISOString().split('T')[0] : null,
          endDate: recurrence ? dueDate || null : null,
          recurrence: recurrence ? { freq: recurrence, interval: 1 } : null,
        }
      ])
      resetForm()
    })
  }

  const toggleCheckbox = (id) => {
    startTransition(() => {
      const task = tasks.find(t => t.id === id)
      if (!task) return
      
      if (completed.has(id)) {
        // Unchecking - just remove from completed
        setCompleted(prev => { const next = new Set(prev); next.delete(id); return next })
      } else {
        // Checking - handle recurring tasks
        if (task.recurrence && task.endDate) {
          // For recurring tasks, check if we've reached the end date
          const today = new Date().toISOString().split('T')[0]
          const endDate = task.endDate
          
          if (today >= endDate) {
            // Reached end date - mark as completed
            setCompleted(prev => { const next = new Set(prev); next.add(id); return next })
          } else {
            // Roll forward to next occurrence
            const currentDueDate = task.dueDate || task.startDate || today
            const nextDueDate = getNextDueDate(currentDueDate, task.recurrence)
            
            // Only roll forward if next date is before or equal to end date
            if (nextDueDate <= endDate) {
              setTasks(prev => prev.map(t => 
                t.id === id 
                  ? { ...t, dueDate: nextDueDate }
                  : t
              ))
            } else {
              // Next occurrence would be after end date - mark as completed
              setCompleted(prev => { const next = new Set(prev); next.add(id); return next })
            }
          }
        } else if (task.recurrence && !task.endDate) {
          // Recurring task without end date - roll forward indefinitely
          const currentDueDate = task.dueDate || task.startDate || new Date().toISOString().split('T')[0]
          const nextDueDate = getNextDueDate(currentDueDate, task.recurrence)
          setTasks(prev => prev.map(t => 
            t.id === id 
              ? { ...t, dueDate: nextDueDate }
              : t
          ))
        } else {
          // Non-recurring task - mark as completed
          setCompleted(prev => { const next = new Set(prev); next.add(id); return next })
        }
      }
    })
  }

  const deleteHandler = (id) => {
    startTransition(() => {
      setTasks(prev => prev.filter(t => t.id !== id))
      setCompleted(prev => { const next = new Set(prev); next.delete(id); return next })
      if (editingId === id) cancelEdit()
    })
  }

  const clearCompleted = () => {
    startTransition(() => {
      setTasks(prev => prev.filter(t => !completed.has(t.id)))
      setCompleted(new Set())
      if (editingId && completed.has(editingId)) cancelEdit()
    })
  }

  const startEditing = (task) => { 
    setEditingId(task.id); 
    setEditTitle(task.title); 
    setEditDesc(task.desc); 
    setEditDueDate(task.dueDate || ""); 
    setEditRecurrence(task.recurrence?.freq || "")
  }
  const cancelEdit = () => { setEditingId(null); setEditTitle(""); setEditDesc(""); setEditDueDate(""); setEditRecurrence("") }
  const saveEdit = () => {
    if (!editTitle.trim()) return
    startTransition(() => {
      setTasks(prev => prev.map(t => t.id === editingId ? {
        ...t,
        title: editTitle.trim(),
        desc: editDesc.trim() || "No description provided",
        // For recurring tasks, dueDate is the end date, start date is today
        dueDate: editRecurrence ? editDueDate || null : editDueDate || null,
        startDate: editRecurrence ? new Date().toISOString().split('T')[0] : null,
        endDate: editRecurrence ? editDueDate || null : null,
        recurrence: editRecurrence ? { freq: editRecurrence, interval: 1 } : null,
      } : t))
      cancelEdit()
    })
  }

  // ---- Filtering ----
  const today = new Date()
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const matchesDateFilter = (task) => {
    if (!dateFilter) return true
    if (!task.dueDate) return false
    
    // For recurring tasks, check if the selected date falls within the task's date range
    if (task.recurrence && task.recurrence.freq) {
      const startDate = task.startDate || task.dueDate
      const endDate = task.endDate || task.dueDate
      
      if (startDate && endDate) {
        const selectedDateStr = dateFilter.toISOString().split('T')[0]
        const start = new Date(startDate + 'T00:00:00')
        const end = new Date(endDate + 'T00:00:00')
        const selected = new Date(selectedDateStr + 'T00:00:00')
        
        // Check if selected date is within the range
        if (selected >= start && selected <= end) {
          // For recurring tasks, check if this date is an actual occurrence
          let currentDate = startDate
          while (currentDate <= endDate) {
            if (currentDate === selectedDateStr) {
              return true
            }
            currentDate = getNextDueDate(currentDate, task.recurrence)
            // Safety check
            if (currentDate === startDate) break
          }
        }
      }
      return false
    } else {
      // Non-recurring task - check exact date match
      const d = parseInputDate(task.dueDate)
      return sameDay(d, dateFilter)
    }
  }

  const matchesViewFilter = (task) => {
    if (viewFilter === 'ALL') return true
    
    // For recurring tasks, check if any occurrence matches the filter
    if (task.recurrence && task.recurrence.freq) {
      const startDate = task.startDate || task.dueDate
      const endDate = task.endDate || task.dueDate
      
      if (startDate && endDate) {
        let currentDate = startDate
        const today = new Date().toISOString().split('T')[0]
        
        while (currentDate <= endDate) {
          if (viewFilter === 'TODAY' && currentDate === today) return true
          if (viewFilter === 'THIS_WEEK' && isWithinThisWeek(currentDate)) return true
          if (viewFilter === 'OVERDUE' && isOverdue(currentDate)) return true
          
          currentDate = getNextDueDate(currentDate, task.recurrence)
          // Safety check
          if (currentDate === startDate) break
        }
      }
      return false
    } else {
      // Non-recurring task - original logic
      const val = task.dueDate
      if (!val) return false
      const d = parseInputDate(val)
      if (!d) return false
      if (viewFilter === 'TODAY') return sameDay(d, today)
      if (viewFilter === 'THIS_WEEK') return isWithinThisWeek(val)
      if (viewFilter === 'OVERDUE') return isOverdue(val)
      return true
    }
  }

  const filteredTasks = tasks
    .filter(t => matchesDateFilter(t) && matchesViewFilter(t))
    .sort((a, b) => {
      // Sort by priority: overdue first, then by due date, then by creation date
      const aDue = a.dueDate ? parseInputDate(a.dueDate) : null
      const bDue = b.dueDate ? parseInputDate(b.dueDate) : null
      const today = startOfToday()
      
      // Check if tasks are overdue
      const aOverdue = aDue && aDue < today
      const bOverdue = bDue && bDue < today
      
      // Overdue tasks come first
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      
      // If both overdue or both not overdue, sort by due date
      if (aDue && bDue) {
        return aDue.getTime() - bDue.getTime()
      }
      
      // Tasks with due dates come before those without
      if (aDue && !bDue) return -1
      if (!aDue && bDue) return 1
      
      // Finally, sort by creation date (newer first)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  // ---- UI helpers ----
  const completedCount = completed.size
  const totalCount = tasks.length
  const showingCount = filteredTasks.length

  const getDeadlineClass = (task) => {
    if (!task.dueDate) return ""
    const due = parseInputDate(task.dueDate)
    if (!due) return ""
    const start = startOfToday()
    if (due < start) return "border-red-300 bg-red-50"
    const now = new Date()
    if (due.getTime() - now.getTime() <= 2 * 24 * 60 * 60 * 1000) return "border-yellow-300 bg-yellow-50"
    return ""
  }

  const formatDate = (val) => {
    const d = parseInputDate(val)
    return d ? d.toLocaleDateString() : ""
  }

  const getRecurrenceText = (recurrence) => {
    if (!recurrence || !recurrence.freq) return null
    const freqMap = {
      'DAILY': 'Repeats daily',
      'WEEKLY': 'Repeats weekly', 
      'MONTHLY': 'Repeats monthly'
    }
    return freqMap[recurrence.freq] || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8 pt-8">
        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><Sparkles className="h-6 w-6 text-white" /></div>
                Create New Task
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">Transform your ideas into actionable tasks</CardDescription>
            </CardHeader>
          </div>
          <CardContent className="p-8">
            <form onSubmit={submitHandler} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
              <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title <span className="text-red-500">*</span></label>
                <Input placeholder="What needs to be done?" maxLength={40} value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <Input placeholder="Add more details..." maxLength={80} value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recurrence</label>
                <select 
                  value={recurrence} 
                  onChange={e => setRecurrence(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                >
                  <option value="">None</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {recurrence ? "End Date" : "Due Date"}
                </label>
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)}
                  min={recurrence ? new Date().toISOString().split('T')[0] : undefined}
                />
              </div>
              <div className="sm:col-span-1 flex items-end">
                <Button type="submit" disabled={isPending || !title.trim()} className="w-full h-10">{isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}Create Task</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Calendar */}
        <div className="mb-4">
          <CalendarWidget tasks={tasks} selectedDate={dateFilter} onSelectDate={setDateFilter} />
        </div>

        {/* Tasks List Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3"><div className="p-2 bg-white/20 rounded-xl"><Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" /></div>Your Tasks</CardTitle>
                  <CardDescription className="text-blue-100 text-sm sm:text-base">{totalCount === 0 ? "No tasks yet." : `${completedCount} of ${totalCount} tasks completed`}</CardDescription>
                </div>
                {completedCount > 0 && <Button variant="outline" size="sm" onClick={clearCompleted}>Clear Completed</Button>}
              </div>
            </CardHeader>
          </div>
          
          {/* Quick Filters Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Quick Filters:</span>
                <FiltersBar view={viewFilter} onChange={setViewFilter} />
              </div>
              <div className="text-xs text-gray-500">
                Showing {showingCount} task(s){(dateFilter || viewFilter !== 'ALL') ? ' (filtered)' : ''}
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 sm:p-8">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 sm:py-16"><div className="p-4 sm:p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"><Plus className="h-8 w-8 text-gray-400" /></div><h3 className="text-lg font-semibold text-gray-700 mb-2">No Tasks Available</h3></div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredTasks.map(task => {
                  const isChecked = completed.has(task.id)
                  const deadlineClass = getDeadlineClass(task)
                  return (
                    <div key={task.id} className={`group flex items-center gap-3 p-4 rounded-xl border-2 ${isChecked ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' : `bg-white border-gray-200 ${deadlineClass}`}`}>
                      <Checkbox checked={isChecked} onCheckedChange={() => toggleCheckbox(task.id)} />
                      <div className="flex-1 min-w-0">
                        {editingId === task.id ? (
                          <>
                            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                            <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                            <select 
                              value={editRecurrence} 
                              onChange={e => setEditRecurrence(e.target.value)}
                              className="w-full h-10 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                            >
                              <option value="">None</option>
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                              <option value="MONTHLY">Monthly</option>
                            </select>
                            <Input 
                              type="date" 
                              value={editDueDate} 
                              onChange={e => setEditDueDate(e.target.value)}
                              min={editRecurrence ? new Date().toISOString().split('T')[0] : undefined}
                            />
                          </>
                        ) : (
                          <>
                            <h5 className={`${isChecked ? 'line-through text-gray-500' : ''}`}>{task.title}</h5>
                            <p className={`${isChecked ? 'line-through text-gray-400' : ''}`}>{task.desc}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {task.recurrence ? (
                                <>
                                  {task.endDate && <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Ends {formatDate(task.endDate)}</span>}
                                  {task.dueDate && <span className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">Next: {formatDate(task.dueDate)}</span>}
                                </>
                              ) : (
                                task.dueDate && <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Due {formatDate(task.dueDate)}</span>
                              )}
                              {getRecurrenceText(task.recurrence) && <span className="text-xs font-medium px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">{getRecurrenceText(task.recurrence)}</span>}
                            </div>
                          </>
                        )}
                      </div>
                      {editingId === task.id ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={saveEdit}><Save className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => startEditing(task)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteHandler(task.id)}><Trash2 className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
