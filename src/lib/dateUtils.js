/**
 * Date utilities (QA fixes)
 * - Stores/compares date-only values reliably in local time.
 */

/** Parse an input value into a *local* Date at 00:00.
 * Accepts full ISO strings or plain "YYYY-MM-DD" date-only strings.
 */
export function parseInputDate(value) {
    if (!value) return null
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number)
      return new Date(y, m - 1, d) // local midnight
    }
    const d = new Date(value)
    if (isNaN(d)) return null
    return d
  }
  
  export function startOfToday() {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
  }
  
  export function isSameDay(a, b) {
    return (
      a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    )
  }
  
  export function isOverdue(value) {
    const d = parseInputDate(value)
    if (!d) return false
    return d < startOfToday()
  }
  
  export function isWithinThisWeek(value) {
    const d = parseInputDate(value)
    if (!d) return false
    const today = startOfToday()
    const dayOfWeek = today.getDay() // 0 Sun - 6 Sat
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek) // Sunday
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // Saturday
    return d >= weekStart && d <= weekEnd
  }
  
  /**
   * getNextDueDate — smart recurrence forwarder with day selection
   * @param {string} base - date-only string or ISO
   * @param {{freq: 'DAILY'|'WEEKLY'|'MONTHLY', interval?: number, weeklyDays?: number[], monthlyDays?: number[]}} recurrence
   * @returns {string} next date as "YYYY-MM-DD"
   */
  export function getNextDueDate(base, recurrence) {
    const d = parseInputDate(base)
    if (!d || !recurrence || !recurrence.freq) return base
    const interval = recurrence.interval ?? 1
    
    switch (recurrence.freq) {
      case 'DAILY':
        const nextDaily = new Date(d)
        nextDaily.setDate(nextDaily.getDate() + interval)
        return toDateOnlyString(nextDaily)
        
      case 'WEEKLY':
        if (recurrence.weeklyDays && recurrence.weeklyDays.length > 0) {
          // Find next occurrence on selected days of the week
          let currentDate = new Date(d)
          currentDate.setDate(currentDate.getDate() + 1) // Start from next day
          
          // Look ahead up to 8 weeks to find next occurrence
          for (let week = 0; week < 8; week++) {
            for (let day = 0; day < 7; day++) {
              const testDate = new Date(currentDate)
              testDate.setDate(currentDate.getDate() + day)
              const dayOfWeek = testDate.getDay() // 0 = Sunday, 1 = Monday, etc.
              
              if (recurrence.weeklyDays.includes(dayOfWeek)) {
                return toDateOnlyString(testDate)
              }
            }
            currentDate.setDate(currentDate.getDate() + 7)
          }
          // Fallback to simple weekly if no match found
          const nextWeekly = new Date(d)
          nextWeekly.setDate(nextWeekly.getDate() + 7 * interval)
          return toDateOnlyString(nextWeekly)
        } else {
          // Simple weekly without day selection
          const nextWeekly = new Date(d)
          nextWeekly.setDate(nextWeekly.getDate() + 7 * interval)
          return toDateOnlyString(nextWeekly)
        }
        
      case 'MONTHLY':
        if (recurrence.monthlyDays && recurrence.monthlyDays.length > 0) {
          // Find next occurrence on selected days of the month
          let currentDate = new Date(d)
          currentDate.setDate(currentDate.getDate() + 1) // Start from next day
          
          // Look ahead up to 12 months to find next occurrence
          for (let month = 0; month < 12; month++) {
            const year = currentDate.getFullYear()
            const monthNum = currentDate.getMonth()
            
            for (const dayOfMonth of recurrence.monthlyDays) {
              if (dayOfMonth >= 1 && dayOfMonth <= 31) {
                const testDate = new Date(year, monthNum, dayOfMonth)
                // Check if the date is valid (handles months with fewer days)
                if (testDate.getMonth() === monthNum && testDate > d) {
                  return toDateOnlyString(testDate)
                }
              }
            }
            currentDate.setMonth(currentDate.getMonth() + 1)
          }
          // Fallback to simple monthly if no match found
          const nextMonthly = new Date(d)
          nextMonthly.setMonth(nextMonthly.getMonth() + interval)
          return toDateOnlyString(nextMonthly)
        } else {
          // Simple monthly without day selection
          const nextMonthly = new Date(d)
          nextMonthly.setMonth(nextMonthly.getMonth() + interval)
          return toDateOnlyString(nextMonthly)
        }
        
      default:
        return base
    }
  }
  
  export function toDateOnlyString(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  