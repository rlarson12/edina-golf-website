import { useState, useMemo, Fragment, useRef, useEffect } from 'react'
import golfData from '../data/golfData.json'
import Scorecard from '../components/Scorecard'
import SEO from '../components/SEO'

// ── Add to Calendar component ──
function AddToCalendar({ event }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const title = encodeURIComponent(event.event)
  const location = encodeURIComponent(event.course || '')

  // Build date strings — handle multi-day vs single-day
  const startDate = event.date ? event.date.replace(/-/g, '') : ''
  const endDate = event.isMultiDay && event.rounds
    ? event.rounds[event.rounds.length - 1].date.replace(/-/g, '')
    : startDate
  // For all-day events Google/Outlook want YYYYMMDD; end date is exclusive so add 1 day
  const nextDay = (dateStr) => {
    const d = new Date(dateStr.substring(0,4) + '-' + dateStr.substring(4,6) + '-' + dateStr.substring(6,8))
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0,10).replace(/-/g,'')
  }

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${nextDay(endDate)}&location=${location}&details=${encodeURIComponent('Edina Boys Golf — ' + (event.event || ''))}`

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${event.date}&enddt=${event.isMultiDay && event.rounds ? event.rounds[event.rounds.length-1].date : event.date}&location=${location}&body=${encodeURIComponent('Edina Boys Golf')}&allday=true`

  const downloadIcs = (e) => {
    e.stopPropagation()
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Edina Boys Golf//EN',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${nextDay(endDate)}`,
      `SUMMARY:${event.event}`,
      `LOCATION:${event.course || ''}`,
      `DESCRIPTION:Edina Boys Golf${event.time ? ' — ' + event.time : ''}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.event.replace(/[^a-z0-9]/gi, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <SEO title="Schedule" description="Edina Boys Golf 2026 schedule — varsity and JV events, dates, courses, and results all season long." path="/schedule" />
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-edina-green border border-gray-200 hover:border-edina-green/40 rounded px-2 py-1 transition-colors"
        title="Add to calendar"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="hidden sm:inline">Add</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <span>📅</span> Google Calendar
          </a>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <span>📆</span> Outlook
          </a>
          <button
            onClick={downloadIcs}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <span>⬇️</span> Download .ics
          </button>
        </div>
      )}
    </div>
  )
}

const getEventType = (event) => {
  if (event.isHome) return { label: 'Home', color: 'bg-edina-green/10 text-edina-green' }
  const name = (event.name || event.event || '').toLowerCase()
  if (/invitational|tournament|classic|preview|championship|section|state/.test(name)) {
    return { label: 'Tournament', color: 'bg-edina-gold/20 text-edina-gold-dark font-semibold' }
  }
  return { label: 'Away', color: 'bg-gray-100 text-gray-600' }
}

function Schedule() {
  const [yearFilter, setYearFilter] = useState('2026')
  const [levelFilter, setLevelFilter] = useState('all')
  const [expandedEvents, setExpandedEvents] = useState(new Set())
  const [expandedScorecards, setExpandedScorecards] = useState(new Set())

  // Build scorecard lookup: "playerName::eventDate" → scorecard data
  const scorecardMap = useMemo(() => {
    const map = {}
    ;(golfData.scorecards2026 || []).forEach(sc => {
      map[`${sc.playerName}::${sc.eventDate}`] = sc
    })
    return map
  }, [])

  const getScorecard = (playerName, eventDate) => {
    return scorecardMap[`${playerName}::${eventDate}`] || null
  }

  const toggleScorecard = (playerName, eventDate) => {
    const key = `${playerName}::${eventDate}`
    setExpandedScorecards(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // 2026 Schedule (Varsity and JV events)
  const schedule2026 = [
    // Varsity Events
    { id: '2026-V1',  date: '2026-04-20', dateFormatted: 'Apr 20',    event: 'Lake Conference Tournament #1',      course: 'Chaska Town Course',        level: 'Varsity', time: '1:30 PM' },
    { id: '2026-V2',  date: '2026-04-22', dateFormatted: 'Apr 22',    event: 'East Ridge Invitational',            course: 'Stoneridge Golf Club',       level: 'Varsity', time: '9:00 AM' },
    { id: '2026-V3',  date: '2026-04-23', dateFormatted: 'Apr 23',    event: 'Lake Conference Meet #2',            course: 'Pioneer Creek Golf Course',  level: 'Varsity', time: '1:57 PM' },
    { id: '2026-V4',  date: '2026-04-24', dateFormatted: 'Apr 24-25', event: 'The Preview',                        course: 'Edinburgh USA Golf Course',  level: 'Varsity', isMultiDay: true, time: '7:00 AM', rounds: [
      { round: 1, date: '2026-04-24', dateFormatted: 'Apr 24', course: 'Edinburgh USA Golf Course', time: '7:00 AM' },
      { round: 2, date: '2026-04-25', dateFormatted: 'Apr 25', course: 'Edinburgh USA Golf Course', time: '11:30 AM' },
    ]},
    { id: '2026-V5',  date: '2026-04-27', dateFormatted: 'Apr 27',    event: 'Lake Conference Meet #3',            course: 'Oak Ridge Country Club',     level: 'Varsity', time: '1:30 PM' },
    { id: '2026-V6',  date: '2026-05-01', dateFormatted: 'May 1-2',   event: 'Lakeville South Invitational',       course: 'Dacotah Ridge Golf Club',    level: 'Varsity', isMultiDay: true, time: '12:00 PM', rounds: [
      { round: 1, date: '2026-05-01', dateFormatted: 'May 1', course: 'Dacotah Ridge Golf Club', time: '12:00 PM' },
      { round: 2, date: '2026-05-02', dateFormatted: 'May 2', course: 'Dacotah Ridge Golf Club', time: '8:30 AM' },
    ]},
    { id: '2026-V9',  date: '2026-05-04', dateFormatted: 'May 4',     event: 'Boys Varsity Invitational',          course: 'Oak Ridge Country Club',     level: 'Varsity', time: '10:00 AM' },
    { id: '2026-V7',  date: '2026-05-04', dateFormatted: 'May 4',     event: 'Spring Lake Park Invitational',      course: 'TPC Twin Cities',            level: 'Varsity', time: '12:00 PM' },
    { id: '2026-V8',  date: '2026-05-04', dateFormatted: 'May 4',     event: 'Lake Conference Meet #4',            course: 'Medina Country Club',        level: 'Varsity', time: '1:00 PM' },
    { id: '2026-V10', date: '2026-05-08', dateFormatted: 'May 8-9',   event: 'Northwest Classic',                  course: 'Detroit Country Club',       level: 'Varsity', isMultiDay: true, time: '12:00 PM', rounds: [
      { round: 1, date: '2026-05-08', dateFormatted: 'May 8', course: 'Detroit Country Club', time: '12:00 PM' },
      { round: 2, date: '2026-05-09', dateFormatted: 'May 9', course: 'Detroit Country Club', time: '9:00 AM' },
    ]},
    { id: '2026-V11', date: '2026-05-11', dateFormatted: 'May 11-12', event: 'Edina Invitational',                 course: 'Oak Ridge Country Club',     level: 'Varsity', isMultiDay: true },
    { id: '2026-V12', date: '2026-05-19', dateFormatted: 'May 19',    event: 'Lake Conference Championship',       course: 'Fox Hollow Golf Club',       level: 'Varsity', time: '8:00 AM' },
    { id: '2026-V13', date: '2026-05-26', dateFormatted: 'May 26-27', event: 'Section 6AAA Championship',          course: 'Meadows at Mystic Lake',     level: 'Varsity', isMultiDay: true },
    { id: '2026-V14', date: '2026-06-09', dateFormatted: 'Jun 9-10',  event: 'MSHSL AAA State Tournament',         course: 'Bunker Hills Golf Course',   level: 'Varsity', isMultiDay: true },
    // JV Events
    { id: '2026-JV-APR16', date: '2026-04-16', dateFormatted: 'Apr 16',  event: 'Match Play @ Heritage Links',         course: 'Heritage Links Golf Club',   level: 'JV', time: '4:12 PM', format: 'matchplay', teamResult: 'Win', teamRecord: '4-0', matches: [
      { pair: ['Mason Catron', 'Randy Dann'], opponent: ['Landon Rowles', 'Walter Anderson'], result: 'Won 3&2' },
      { pair: ['Ari Prickett', 'Mason Schultes'], opponent: ['Evan Ketelsen', 'Olen Pederson'], result: 'Won 4&2' },
      { pair: ['Mason Hughes', 'Crosby Pote'], opponent: ['Grant Lamoreaux', 'Jack Stier'], result: 'Won 5&4' },
      { pair: ['Henry Applebaum', 'Henry Freeman'], opponent: ['Bennett Wevers', 'Grant Ketelsen'], result: 'Won 5&4' },
    ] },
    { id: '2026-JV-APR20', date: '2026-04-20', dateFormatted: 'Apr 20',  event: 'JV Lake Conference @ Bluff Creek',   course: 'Bluff Creek Golf Course',    level: 'JV', time: '12:00 PM' },
    { id: '2026-JV0', date: '2026-04-21', dateFormatted: 'Apr 21',    event: 'JV Invitational',                    course: 'Heritage Links Golf Course', level: 'JV', time: '10:30 AM' },
    { id: '2026-JV2', date: '2026-04-22', dateFormatted: 'Apr 22',    event: 'Boys JV Tournament',                 course: 'Clifton Highlands',          level: 'JV', time: '1:00 PM' },
    { id: '2026-JV3', date: '2026-04-27', dateFormatted: 'Apr 27',    event: 'Eden Prairie JV Invite',             course: 'Bluff Creek Golf Course',    level: 'JV', time: '9:00 AM' },
    { id: '2026-JV0b',date: '2026-04-28', dateFormatted: 'Apr 28',    event: 'JV Invitational',                    course: 'Heritage Links Golf Course', level: 'JV', time: '10:30 AM' },
    { id: '2026-JV4', date: '2026-05-08', dateFormatted: 'May 8-9',   event: 'JV Invitational',                    course: 'Minnewaska Golf Club',       level: 'JV', isMultiDay: true, time: '1:30 PM', rounds: [
      { round: 1, date: '2026-05-08', dateFormatted: 'May 8', course: 'Minnewaska Golf Club', time: '1:30 PM' },
      { round: 2, date: '2026-05-09', dateFormatted: 'May 9', course: 'Minnewaska Golf Club', time: '8:30 AM' },
    ]},
    { id: '2026-JV-MAY11', date: '2026-05-11', dateFormatted: 'May 11', event: 'JV Lake Conference @ Wild Marsh',    course: 'Wild Marsh Golf Club',       level: 'JV', time: '10:00 AM' },
    { id: '2026-JV-MAY13', date: '2026-05-13', dateFormatted: 'May 13', event: 'JV Conference @ Riverwood',          course: 'Riverwood Golf Course',      level: 'JV', time: '10:00 AM' },
    { id: '2026-JV6', date: '2026-05-14', dateFormatted: 'May 14',    event: 'Boys JV Game',                       course: 'Shamrock Golf Course',       level: 'JV', time: '8:30 AM' },
    { id: '2026-JV7', date: '2026-05-20', dateFormatted: 'May 20',    event: 'Boys JV Invitational',               course: 'Dahlgreen Golf Course',      level: 'JV', time: '8:00 AM' },
    { id: '2026-JV-MAY22', date: '2026-05-22', dateFormatted: 'May 22', event: 'JV Conference @ Pioneer Creek',      course: 'Pioneer Creek Golf Course',  level: 'JV', time: '2:30 PM' },
  ]

  // Use schedule data from JSON (2025)
  const varsitySchedule = golfData.schedule || []
  const jvSchedule = golfData.jvSchedule || []

  // Combine and tag events by level (2025)
  const allCombined2025 = useMemo(() => {
    const varsityTagged = varsitySchedule.map(e => ({ ...e, level: 'Varsity' }))
    const jvTagged = jvSchedule.map(e => ({ ...e, level: 'JV' }))
    return [...varsityTagged, ...jvTagged].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [varsitySchedule, jvSchedule])

  // Get schedule based on year
  const yearSchedule = useMemo(() => {
    if (yearFilter === '2026') {
      return schedule2026.sort((a, b) => new Date(a.date) - new Date(b.date))
    }
    return allCombined2025
  }, [yearFilter, allCombined2025])

  // Filter by level
  const levelFiltered = useMemo(() => {
    if (yearFilter === '2026') {
      if (levelFilter === 'all') return yearSchedule
      if (levelFilter === 'varsity') return yearSchedule.filter(e => e.level === 'Varsity')
      if (levelFilter === 'jv') return yearSchedule.filter(e => e.level === 'JV')
      return yearSchedule
    }
    if (levelFilter === 'all') return yearSchedule
    if (levelFilter === 'varsity') return [...varsitySchedule].sort((a, b) => new Date(b.date) - new Date(a.date))
    return [...jvSchedule].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [yearFilter, levelFilter, yearSchedule, varsitySchedule, jvSchedule])

  const schedule = levelFiltered

  const eventsWithSeparators = useMemo(() => {
    const items = []
    let lastMonth = null
    schedule.forEach(event => {
      const d = new Date((event.date || '') + 'T12:00:00')
      const month = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
      if (month !== lastMonth) {
        items.push({ type: 'separator', month })
        lastMonth = month
      }
      items.push({ type: 'event', event })
    })
    return items
  }, [schedule])

  const toggleExpand = (eventId) => {
    setExpandedEvents(prev => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  const formatDateDisplay = (dateStr, dateFormatted) => {
    if (dateFormatted) return dateFormatted
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}`
  }

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return ''
    // Parse date parts to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }

  const isPastEvent = (dateStr) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  // Build player scores lookup by event ID (merge 2025 + 2026 data)
  const playerScoresByEvent = useMemo(() => {
    const map = {}
    ;[...(golfData.playerStats || []), ...(golfData.playerStats2026 || [])].forEach(player => {
      player.scores.forEach(s => {
        if (!map[s.eventId]) map[s.eventId] = []
        map[s.eventId].push({ name: player.name, score: s.score, individualFinish: s.individualFinish || null })
      })
    })
    Object.values(map).forEach(scores => scores.sort((a, b) => a.score - b.score))
    return map
  }, [])

  // Build event info map (par, holes) by event ID
  const eventInfoMap = useMemo(() => {
    const map = {}
    ;[...(golfData.events || []), ...(golfData.jvEvents || [])].forEach(event => {
      map[event.id] = { par: event.par, holes: event.holes }
    })
    return map
  }, [])

  // Get individual player scores for a schedule event
  const getEventScores = (event) => {
    if (event.isMultiDay && event.rounds) {
      const suffix = event.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')
      const roundEventIds = event.rounds.map(r => `${r.date}-${suffix}`)

      const playerMap = {}
      roundEventIds.forEach((eventId, roundIdx) => {
        const scores = playerScoresByEvent[eventId] || []
        const info = eventInfoMap[eventId] || {}
        scores.forEach(s => {
          if (!playerMap[s.name]) {
            playerMap[s.name] = { name: s.name, rounds: new Array(event.rounds.length).fill(null), pars: new Array(event.rounds.length).fill(null), total: 0, totalPar: 0, hasAny: false, individualFinish: null }
          }
          playerMap[s.name].rounds[roundIdx] = s.score
          playerMap[s.name].pars[roundIdx] = info.par
          playerMap[s.name].total += s.score
          playerMap[s.name].totalPar += info.par || 0
          playerMap[s.name].hasAny = true
          if (s.individualFinish) playerMap[s.name].individualFinish = s.individualFinish
        })
      })

      return Object.values(playerMap)
        .filter(p => p.hasAny)
        .sort((a, b) => {
          const aPlayed = a.rounds.filter(r => r !== null).length
          const bPlayed = b.rounds.filter(r => r !== null).length
          if (aPlayed !== bPlayed) return bPlayed - aPlayed
          return a.total - b.total
        })
    }

    const scores = playerScoresByEvent[event.id] || []
    const info = eventInfoMap[event.id] || {}
    return scores.map(s => ({
      name: s.name,
      score: s.score,
      par: info.par,
      toPar: info.par ? s.score - info.par : null,
      individualFinish: s.individualFinish || null
    }))
  }

  // Check if event can be expanded
  const isMatchPlay = (event) => event.format === 'matchplay'

  // Check if event has individual scores
  const hasPlayerScores = (event) => {
    if (event.isMultiDay && event.rounds) {
      const suffix = event.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')
      return event.rounds.some(r => (playerScoresByEvent[`${r.date}-${suffix}`] || []).length > 0)
    }
    return (playerScoresByEvent[event.id] || []).length > 0
  }

  // Summary stats
  const stats = useMemo(() => {
    if (yearFilter === '2026') {
      return {
        total: schedule.length,
        is2026: true,
      }
    }

    const completed = schedule.filter(e => e.teamScore || e.teamFinish)
    const wins = completed.filter(e => e.teamFinish?.startsWith('1st')).length
    const topThree = completed.filter(e =>
      e.teamFinish?.startsWith('1st') ||
      e.teamFinish?.startsWith('2nd') ||
      e.teamFinish?.startsWith('3rd')
    ).length

    return {
      total: schedule.length,
      completed: completed.length,
      wins,
      topThree,
      is2026: false,
    }
  }, [schedule, yearFilter])

  const renderEventRow = (event, isRound = false, roundNum = null) => {
    const isExpanded = expandedEvents.has(event.id)
    const is2026Event = yearFilter === '2026'
    const canExpand = !isRound && (event.isMultiDay || hasPlayerScores(event) || isMatchPlay(event))

    return (
      <div
        key={isRound ? `${event.id}-r${roundNum}` : event.id}
        className={`card ${isRound ? 'ml-6 border-l-4 border-edina-green/30' : ''} ${
          isPastEvent(event.date) && !event.teamScore && !is2026Event ? 'opacity-60' : ''
        } ${is2026Event ? 'bg-gray-50/50 border-l-4 border-edina-green' : ''}`}
      >
        <div
          className={`p-4 md:p-5 ${canExpand ? 'cursor-pointer' : ''}`}
          onClick={canExpand ? () => toggleExpand(event.id) : undefined}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Expand button */}
            {canExpand && (
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full md:order-first pointer-events-none">
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}

            {/* Date */}
            <div className="flex-shrink-0 w-16 md:w-20">
              <div className="text-lg font-bold text-edina-green">
                {isRound ? `R${roundNum}` : formatDateDisplay(event.date, event.dateFormatted)}
              </div>
              <div className="text-sm text-gray-600">
                {isRound ? formatDateDisplay(event.date, event.dateFormatted) : getDayOfWeek(event.date)}
              </div>
            </div>

            {/* Event Info */}
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {isRound ? event.course : event.event}
                </h3>
                {!isRound && event.level && levelFilter === 'all' && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    event.level === 'Varsity' ? 'bg-edina-green/10 text-edina-green' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.level}
                  </span>
                )}

              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                {!isRound && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.course}
                  </span>
                )}
                {event.time && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {event.time}
                  </span>
                )}
              </div>
            </div>

            {/* Calendar + Result */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {!isRound && yearFilter === '2026' && <AddToCalendar event={event} />}
              {/* Match play: show teamResult badge if not TBD */}
              {!isRound && isMatchPlay(event) && event.teamResult && event.teamResult !== 'TBD' && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  event.teamResult.toLowerCase().includes('win') || event.teamResult.toLowerCase().includes('won')
                    ? 'bg-green-100 text-green-800'
                    : event.teamResult.toLowerCase().includes('loss') || event.teamResult.toLowerCase().includes('lost')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {event.teamResult}{event.teamRecord ? ` ${event.teamRecord}` : ''}
                </span>
              )}
              {/* Stroke play score + finish */}
              {!isMatchPlay(event) && event.teamScore && (
                <span className={`font-semibold ${
                  event.teamScore.includes('(-') ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {event.teamScore}
                </span>
              )}
              {!isRound && !isMatchPlay(event) && event.teamFinish ? (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  event.teamFinish.startsWith('1st')
                    ? 'bg-edina-gold/20 text-edina-gold-dark border border-edina-gold'
                    : event.teamFinish.startsWith('2nd')
                    ? 'bg-gray-200 text-gray-700'
                    : event.teamFinish.startsWith('3rd')
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-edina-green/10 text-edina-green'
                }`}>
                  {event.teamFinish}
                </span>
              ) : !isRound && !isMatchPlay(event) && !event.teamScore && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  is2026Event
                    ? 'bg-edina-green/10 text-edina-green border border-edina-green/30'
                    : 'bg-gray-50 text-gray-400'
                }`}>
                  {is2026Event ? 'Upcoming' : (isPastEvent(event.date) ? 'No Result' : 'Upcoming')}
                </span>
              )}
              {/* Match play: show Upcoming when TBD */}
              {!isRound && isMatchPlay(event) && (!event.teamResult || event.teamResult === 'TBD') && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  is2026Event
                    ? 'bg-edina-green/10 text-edina-green border border-edina-green/30'
                    : 'bg-gray-50 text-gray-400'
                }`}>
                  {is2026Event ? 'Upcoming' : 'No Result'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && !isRound && (() => {
          // Match play expanded view
          if (isMatchPlay(event)) {
            return (
              <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-edina-gold/20 text-edina-gold-dark uppercase tracking-wider">Match Play</span>
                  {event.teamRecord && event.teamRecord !== 'TBD' && (
                    <span className="text-sm text-gray-600">Record: <span className="font-medium">{event.teamRecord}</span></span>
                  )}
                </div>
                {event.matches && event.matches.length > 0 ? (
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <div className="text-sm font-semibold text-gray-700 uppercase tracking-wider px-3 py-2 bg-gray-50 border-b border-gray-100">Pair Results</div>
                    <div className="divide-y divide-gray-50">
                      {event.matches.map((match, idx) => {
                        const resultLower = match.result?.toLowerCase() || ''
                        const isWin = resultLower.startsWith('won') || resultLower.includes(' win')
                        const isLoss = resultLower.startsWith('lost') || resultLower.includes(' loss')
                        const pairLabel = Array.isArray(match.pair)
                          ? match.pair.join(' / ')
                          : (match.player || '')
                        const opponentLabel = Array.isArray(match.opponent)
                          ? match.opponent.join(' / ')
                          : null
                        return (
                          <div key={idx} className="flex items-center justify-between px-3 py-2.5 gap-3">
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-gray-900 text-sm">{pairLabel}</span>
                              {opponentLabel && (
                                <span className="text-sm text-gray-600">vs. {opponentLabel}</span>
                              )}
                            </div>
                            <span className={`text-sm font-medium flex-shrink-0 ${
                              isWin ? 'text-green-700' : isLoss ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {match.result}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Match results will appear here after the event.</p>
                )}
              </div>
            )
          }

          const scores = getEventScores(event)
          return (
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
              {/* Directions + Course Metadata */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.course)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-edina-green hover:underline font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Directions to {event.course}
                </a>
                {(eventInfoMap[event.id]?.par || eventInfoMap[event.id]?.holes) && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {eventInfoMap[event.id]?.holes && <span>⛳ {eventInfoMap[event.id].holes} holes</span>}
                    {eventInfoMap[event.id]?.par && <span>Par {eventInfoMap[event.id].par}</span>}
                  </div>
                )}
              </div>
              {/* Round breakdown for multi-day events */}
              {event.isMultiDay && event.rounds && (
                <>
                  <div className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Round Scores</div>
                  {event.rounds.map((round, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-edina-green/10 text-edina-green font-bold rounded-full text-sm">
                          R{round.round}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">{round.course}</div>
                          <div className="text-sm text-gray-600">
                            {round.dateFormatted}{round.time && ` • ${round.time}`}{round.par && ` • Par ${round.par}`}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        round.teamScore?.includes('(-') ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {round.teamScore || '-'}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Individual player scores */}
              {scores.length > 0 && (
                <>
                  <div className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 mt-3">Individual Scores</div>
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Player</th>
                          {event.isMultiDay && event.rounds?.map((r, i) => (
                            <th key={i} className="px-2 py-2 text-center text-sm font-semibold text-gray-700">R{r.round}</th>
                          ))}
                          <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">{event.isMultiDay ? 'Total' : 'Score'}</th>
                          <th className="px-2 py-2 text-center text-sm font-semibold text-gray-700">+/-</th>
                          <th className="px-2 py-2 text-center text-sm font-semibold text-gray-700">Finish</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {scores.map((s, idx) => {
                          if (event.isMultiDay) {
                            const toPar = s.totalPar ? s.total - s.totalPar : null
                            const toParStr = toPar === null ? '' : toPar === 0 ? 'E' : toPar > 0 ? `+${toPar}` : `${toPar}`
                            const isUnderPar = toPar !== null && toPar < 0
                            const colCount = (event.rounds?.length || 0) + 3
                            return (
                              <Fragment key={idx}>
                                <tr>
                                  <td className="px-3 py-1.5 font-medium text-gray-900">{s.name}</td>
                                  {s.rounds.map((r, i) => {
                                    const rPar = s.pars[i]
                                    const rUnder = r !== null && rPar && r < rPar
                                    const roundDate = event.rounds?.[i]?.date || event.dateISO
                                    const sc = roundDate ? getScorecard(s.name, roundDate) : null
                                    return (
                                      <td key={i} className="px-2 py-1.5 text-center">
                                        <span className={`font-medium ${rUnder ? 'text-red-600' : 'text-gray-700'}`}>
                                          {r !== null ? r : '-'}
                                        </span>
                                        {sc && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); toggleScorecard(s.name, roundDate) }}
                                            className={`ml-1 inline-flex items-center justify-center w-5 h-5 rounded transition-colors ${
                                              expandedScorecards.has(`${s.name}::${roundDate}`)
                                                ? 'text-edina-green bg-edina-green/10'
                                                : 'text-gray-400 hover:text-edina-green'
                                            }`}
                                            title="View hole-by-hole scorecard"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                          </button>
                                        )}
                                      </td>
                                    )
                                  })}
                                  <td className="px-3 py-1.5 text-center">
                                    <span className={`font-bold ${isUnderPar ? 'text-red-600' : 'text-gray-900'}`}>
                                      {s.total || '-'}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-center">
                                    <span className={`text-sm ${isUnderPar ? 'text-red-600' : 'text-gray-600'}`}>
                                      {toParStr}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-center">
                                    {s.individualFinish && (
                                      <span className="text-sm text-gray-600 whitespace-nowrap">{s.individualFinish}</span>
                                    )}
                                  </td>
                                </tr>
                                {(event.rounds || [{ date: event.dateISO }]).map((round, i) => {
                                  const roundDate = round.date || event.dateISO
                                  const sc = getScorecard(s.name, roundDate)
                                  if (!sc || !expandedScorecards.has(`${s.name}::${roundDate}`)) return null
                                  return (
                                    <tr key={`sc-${idx}-${i}`}>
                                      <td colSpan={colCount} className="p-0 bg-gray-50">
                                        <Scorecard
                                          par={sc.par}
                                          scores={sc.scores}
                                          courseName={sc.courseName}
                                          playerName={sc.playerName}
                                          round={sc.round}
                                        />
                                      </td>
                                    </tr>
                                  )
                                })}
                              </Fragment>
                            )
                          }

                          const toParStr = s.toPar === null ? '' : s.toPar === 0 ? 'E' : s.toPar > 0 ? `+${s.toPar}` : `${s.toPar}`
                          const isUnderPar = s.toPar !== null && s.toPar < 0
                          return (
                            <tr key={idx}>
                              <td className="px-3 py-1.5 font-medium text-gray-900">{s.name}</td>
                              <td className="px-3 py-1.5 text-center">
                                <span className={`font-bold ${isUnderPar ? 'text-red-600' : 'text-gray-900'}`}>
                                  {s.score}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <span className={`text-sm ${isUnderPar ? 'text-red-600' : 'text-gray-600'}`}>
                                  {toParStr}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                {s.individualFinish && (
                                  <span className="text-sm text-gray-600 whitespace-nowrap">{s.individualFinish}</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )
        })()}
      </div>
    )
  }

  return (
    <div>
      {/* Hero Banner with Action Photo */}
      <div className="relative h-32 md:h-40 overflow-hidden">
        <img
          src="/images/IMG_9149.webp"
          alt="Tournament action"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <span className="text-edina-gold text-xs font-bold tracking-widest uppercase block mb-0.5" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2026 SEASON</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {yearFilter} SCHEDULE
            </h1>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Stats Summary */}
        <div className="relative mb-8">
          {stats.is2026 ? (
            <div className="max-w-xs mx-auto">
              <div className="card p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-edina-green">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-edina-green">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="card p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-edina-green">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="card p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-edina-gold-dark">{stats.wins}</div>
                <div className="text-sm text-gray-600">Wins</div>
              </div>
              <div className="card p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-gray-700">{stats.topThree}</div>
                <div className="text-sm text-gray-600">Top 3 Finishes</div>
              </div>
            </div>
          )}
        </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
        {/* Year Filter */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setYearFilter('2026')}
            className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              yearFilter === '2026'
                ? 'bg-white text-edina-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            2026 Season
          </button>
          <button
            onClick={() => setYearFilter('2025')}
            className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              yearFilter === '2025'
                ? 'bg-white text-edina-green shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            2025 Season
          </button>
        </div>

        {/* Level Filter */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                levelFilter === 'all'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLevelFilter('varsity')}
              className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                levelFilter === 'varsity'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Varsity
            </button>
            <button
              onClick={() => setLevelFilter('jv')}
              className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                levelFilter === 'jv'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              JV
            </button>
          </div>

      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        {schedule.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            No events found.
          </div>
        ) : (
          eventsWithSeparators.map((item, idx) => {
            if (item.type === 'separator') {
              return (
                <div key={`sep-${item.month}-${idx}`} className="sticky top-[48px] z-20 -mx-4 px-4 py-3 bg-edina-forest/95 backdrop-blur-sm">
                  <span className="text-base font-bold tracking-widest text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {item.month}
                  </span>
                </div>
              )
            }
            return renderEventRow(item.event)
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {yearFilter === '2026' ? (
            <>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-edina-green/10 text-edina-green border border-edina-green/30">Upcoming</span>
                <span className="text-gray-500">Scheduled event</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-edina-gold/20 text-edina-gold-dark border border-edina-gold">1st</span>
                <span className="text-gray-500">Win</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-red-600 font-medium">283 (-5)</span>
                <span className="text-gray-500">Under par</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Schedule
