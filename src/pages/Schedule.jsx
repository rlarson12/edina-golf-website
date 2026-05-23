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
    { id: '2026-V1',  date: '2026-04-20', dateFormatted: 'Apr 20',    event: 'Lake Conference Tournament #1',      course: 'Chaska Town Course',        level: 'Varsity', time: '1:30 PM', par: 72, holes: 18, teamScore: '300', teamFinish: '1st of 8' },
    { id: '2026-V2',  date: '2026-04-22', dateFormatted: 'Apr 22',    event: 'East Ridge Invitational',            course: 'Stoneridge Golf Club',       level: 'Varsity', time: '9:00 AM', par: 72, holes: 18, teamScore: '300', teamFinish: '5th of 20' },
    { id: '2026-V3',  date: '2026-05-06', dateFormatted: 'May 6',     event: 'Lake Conference Meet #2',            course: 'Pioneer Creek Golf Course',  level: 'Varsity', time: '1:30 PM', par: 72, holes: 18, teamScore: '325 (+37)', teamFinish: '5th of 8', iWanaMakerId: 204214, rescheduledFrom: '2026-04-23', statusNote: 'Rescheduled from April 23 (weather)' },
    { id: '2026-V4',  date: '2026-04-24', dateFormatted: 'Apr 24-25', event: 'The Preview',                        course: 'Edinburgh USA Golf Course',  level: 'Varsity', isMultiDay: true, time: '7:00 AM', iWanaMakerId: 184513, par: 72, holes: 18, teamScore: '572 (-4)', teamFinish: '1st of 15', rounds: [
      { round: 1, id: '2026-2026-04-24-VAR-4', date: '2026-04-24', dateFormatted: 'Apr 24', course: 'Edinburgh USA Golf Course', time: '7:00 AM', par: 72, teamScore: '287 (-1)' },
      { round: 2, id: '2026-2026-04-25-VAR-5', date: '2026-04-25', dateFormatted: 'Apr 25', course: 'Edinburgh USA Golf Course', time: '11:30 AM', par: 72, teamScore: '285 (-3)' },
    ]},
    { id: '2026-V5',  date: '2026-04-27', dateFormatted: 'Apr 27',    event: 'Lake Conference Meet #3',            course: 'Oak Ridge Country Club',     level: 'Varsity', time: '1:30 PM', status: 'rained_out', statusNote: 'Rained out — no makeup scheduled' },
    { id: '2026-V6',  date: '2026-05-01', dateFormatted: 'May 1-2',   event: 'Lakeville South Invitational',       course: 'Dacotah Ridge Golf Club',    level: 'Varsity', isMultiDay: true, time: '12:00 PM', iWanaMakerId: 209320, par: 72, holes: 18, teamScore: '584 (+8)', teamFinish: '2nd of 18', rounds: [
      { round: 1, id: '2026-2026-05-01-VAR-8', date: '2026-05-01', dateFormatted: 'May 1', course: 'Dacotah Ridge Golf Club', time: '12:00 PM', par: 72, teamScore: '289 (+1)' },
      { round: 2, id: '2026-2026-05-02-VAR-9', date: '2026-05-02', dateFormatted: 'May 2', course: 'Dacotah Ridge Golf Club', time: '8:30 AM', par: 72, teamScore: '295 (+7)' },
    ]},
    { id: '2026-V9',  date: '2026-05-04', dateFormatted: 'May 4',     event: 'Boys Varsity Invitational',          course: 'Oak Ridge Country Club',     level: 'Varsity', time: '10:00 AM', teamScore: '307 (+27)', teamFinish: '2nd of 9' },
    { id: '2026-V7',  date: '2026-05-04', dateFormatted: 'May 4',     event: 'Spring Lake Park Invitational',      course: 'TPC Twin Cities',            level: 'Varsity', time: '12:00 PM', teamScore: '304 (+16)', teamFinish: '2nd of 8' },
    { id: '2026-V8',  date: '2026-05-04', dateFormatted: 'May 4',     event: 'Lake Conference Meet #4',            course: 'Medina Country Club',        level: 'Varsity', time: '1:00 PM', teamScore: '309 (+21)', teamFinish: '1st of 8' },
    { id: '2026-V10', date: '2026-05-08', dateFormatted: 'May 8-9',   event: 'Northwest Classic',                  course: 'Detroit Country Club',       level: 'Varsity', isMultiDay: true, time: '9:00 AM', iWanaMakerId: 208202, par: 71, holes: 18, teamScore: '596 (+28)', teamFinish: '2nd of 16', rounds: [
      { round: 1, id: '2026-2026-05-08-VAR-11', date: '2026-05-08', dateFormatted: 'May 8', course: 'Detroit Country Club', time: '9:00 AM', par: 71, teamScore: '297 (+13)' },
      { round: 2, id: '2026-2026-05-09-VAR-12', date: '2026-05-09', dateFormatted: 'May 9', course: 'Detroit Country Club', time: '9:00 AM', par: 71, teamScore: '299 (+15)' },
    ]},
    { id: '2026-V11', date: '2026-05-11', dateFormatted: 'May 11-12', event: 'Edina Invitational',                 course: 'Oak Ridge Country Club',     level: 'Varsity', isMultiDay: true, iWanaMakerId: 212514, par: 70, holes: 18, teamScore: '581 (+21)', teamFinish: '1st of 4', rounds: [
      { round: 1, id: '2026-2026-05-11-VAR-13', date: '2026-05-11', dateFormatted: 'May 11', course: 'Oak Ridge Country Club', time: '1:30 PM', par: 70, teamScore: '289 (+9)' },
      { round: 2, id: '2026-2026-05-12-VAR-14', date: '2026-05-12', dateFormatted: 'May 12', course: 'Oak Ridge Country Club', time: '1:30 PM', par: 70, teamScore: '292 (+12)' },
    ] },
    { id: '2026-V15', date: '2026-05-18', dateFormatted: 'May 18',    event: 'Lake Conference Tournament #3',      course: 'Oak Ridge Country Club',     level: 'Varsity', time: '1:00 PM', par: 70, holes: 18, iWanaMakerId: 186072, teamScore: '285', teamFinish: '1st of 8' },
    { id: '2026-V12', date: '2026-05-19', dateFormatted: 'May 19',    event: 'Lake Conference Championship',       course: 'Fox Hollow Golf Club',       level: 'Varsity', time: '8:00 AM', teamScore: '295 (+7)', teamFinish: '1st of 8' },
    { id: '2026-V13', date: '2026-05-27', dateFormatted: 'May 27-28', event: 'Section 6AAA Championship',          course: 'Meadows at Mystic Lake',     level: 'Varsity', isMultiDay: true },
    { id: '2026-V14', date: '2026-06-09', dateFormatted: 'Jun 9-10',  event: 'MSHSL AAA State Tournament',         course: 'Bunker Hills Golf Course',   level: 'Varsity', isMultiDay: true },
    // JV Events
    { id: '2026-JV-APR16', date: '2026-04-16', dateFormatted: 'Apr 16',  event: 'Match Play @ Heritage Links',         course: 'Heritage Links Golf Club',   level: 'JV', time: '4:12 PM', format: 'matchplay', teamResult: 'Win', teamRecord: '4-0', matches: [
      { pair: ['Mason Catron', 'Randy Dann'], opponent: ['Landon Rowles', 'Walter Anderson'], result: 'Won 3&2' },
      { pair: ['Ari Prickett', 'Mason Schultes'], opponent: ['Evan Ketelsen', 'Olen Pederson'], result: 'Won 4&2' },
      { pair: ['Mason Hughes', 'Crosby Pote'], opponent: ['Grant Lamoreaux', 'Jack Stier'], result: 'Won 5&4' },
      { pair: ['Henry Applebaum', 'Henry Freeman'], opponent: ['Bennett Wevers', 'Grant Ketelsen'], result: 'Won 5&4' },
    ] },
    { id: '2026-JV-APR20', date: '2026-04-20', dateFormatted: 'Apr 20',  event: 'JV Lake Conference @ Bluff Creek',   course: 'Bluff Creek Golf Course',    level: 'JV', time: '12:00 PM', par: 72, holes: 18, teamScore: '304', teamFinish: '1st of 6' },
    { id: '2026-JV0', date: '2026-04-21', dateFormatted: 'Apr 21',    event: 'JV Invitational',                    course: 'Heritage Links Golf Course', level: 'JV', time: '10:30 AM', par: 72, holes: 18, teamScore: '318', teamFinish: '2nd of 6' },
    { id: '2026-JV2', date: '2026-04-22', dateFormatted: 'Apr 22',    event: 'Boys JV Tournament',                 course: 'Clifton Highlands',          level: 'JV', time: '1:00 PM', par: 72, holes: 18, teamScore: '312', teamFinish: '1st of 24' },
    { id: '2026-JV3', date: '2026-04-27', dateFormatted: 'Apr 27',    event: 'Eden Prairie JV Invite',             course: 'Bluff Creek Golf Course',    level: 'JV', time: '9:00 AM', teamScore: '304', teamFinish: '1st of 13' },
    { id: '2026-JV0b',date: '2026-04-28', dateFormatted: 'Apr 28',    event: 'JV Invitational',                    course: 'Heritage Links Golf Course', level: 'JV', time: '10:30 AM', par: 72, holes: 18, teamScore: '317', teamFinish: '3rd of 8' },
    { id: '2026-JV4-D1', date: '2026-05-08', dateFormatted: 'May 8-9', event: 'Northwest Classic JV Invite',         course: 'Wildflower at Fair Hills',   level: 'JV', isMultiDay: true, time: '9:00 AM', iWanaMakerId: 208213, par: 72, holes: 18, teamScore: '616 (+40)', teamFinish: '1st of 8', rounds: [
      { round: 1, id: '2026-2026-05-08-JV-6', date: '2026-05-08', dateFormatted: 'May 8', course: 'Wildflower at Fair Hills', time: '9:00 AM', par: 72, teamScore: '310 (+22)' },
      { round: 2, id: '2026-2026-05-09-JV-7', date: '2026-05-09', dateFormatted: 'May 9', course: 'Wildflower at Fair Hills', time: '9:00 AM', par: 72, teamScore: '306 (+18)' },
    ]},
    { id: '2026-JV4', date: '2026-05-08', dateFormatted: 'May 8-9',   event: 'Minnewaska JV Invite',               course: 'Minnewaska Golf Club',       level: 'JV', isMultiDay: true, time: '1:30 PM', iWanaMakerId: 209337, format: 'bestball', formatLabel: '2-Man Best Ball', par: 72, holes: 18, teamScore: '145 / 151 / 160', teamFinish: '1st, 2nd, 6th of 10', rounds: [
      { round: 1, id: '2026-2026-05-08-JV-MINN', date: '2026-05-08', dateFormatted: 'May 8', course: 'Minnewaska Golf Club', time: '1:30 PM', par: 72, teamScore: '74 / 78 / 79', pairs: [
        { teamName: 'Edina 2', players: ['Billy Smith', 'Henry Applebaum'], pairScore: 74, pairToPar: '+2', individualScores: [79, 86], finish: '2nd of 10' },
        { teamName: 'Edina',   players: ['Carter Ringle', 'Henry Freeman'], pairScore: 78, pairToPar: '+6', individualScores: [84, 92], finish: 'T3rd of 10' },
        { teamName: 'Edina 3', players: ['Mason Schultes', 'Mason Hughes'],  pairScore: 79, pairToPar: '+7', individualScores: [84, 88], finish: 'T5th of 10' },
      ]},
      { round: 2, id: '2026-2026-05-09-JV-MINN', date: '2026-05-09', dateFormatted: 'May 9', course: 'Minnewaska Golf Club', time: '8:30 AM', par: 72, teamScore: '71 / 73 / 81', pairs: [
        { teamName: 'Edina 2', players: ['Billy Smith', 'Henry Applebaum'], pairScore: 71, pairToPar: '-1', individualScores: [74, 84], finish: '1st of 10' },
        { teamName: 'Edina',   players: ['Carter Ringle', 'Henry Freeman'], pairScore: 73, pairToPar: '+1', individualScores: [82, 85], finish: '2nd of 10' },
        { teamName: 'Edina 3', players: ['Mason Schultes', 'Mason Hughes'],  pairScore: 81, pairToPar: '+9', individualScores: [88, 84], finish: '6th of 10' },
      ]},
    ]},
    { id: '2026-JV-MAY11', date: '2026-05-11', dateFormatted: 'May 11', event: 'JV Invitational @ Wild Marsh',    course: 'Wild Marsh Golf Club',       level: 'JV', time: '10:00 AM', par: 71, holes: 18, iWanaMakerId: 212390, teamScore: '303 (+19)', teamFinish: '2nd of 8' },
    { id: '2026-JV-MAY11-PREP', date: '2026-05-11', dateFormatted: 'May 11-12', event: 'Edina JV Prep Invite',           course: 'Oak Ridge Country Club',     level: 'JV', isMultiDay: true, iWanaMakerId: 212515, par: 70, holes: 18, teamScore: '605 (+45) / 606 (+46)', teamFinish: '1st & 2nd of 3', rounds: [
      { round: 1, id: '2026-JV-MAY11-PREP', date: '2026-05-11', dateFormatted: 'May 11', course: 'Oak Ridge Country Club', time: '1:30 PM', par: 70, teamScore: '297 (+17) / 300 (+20)' },
      { round: 2, id: '2026-JV-MAY12-PREP', date: '2026-05-12', dateFormatted: 'May 12', course: 'Oak Ridge Country Club', time: '1:30 PM', par: 70, teamScore: '308 (+28) / 306 (+26)' },
    ] },
    { id: '2026-JV-MAY13', date: '2026-05-13', dateFormatted: 'May 13', event: 'JV Conference @ Riverwood',          course: 'Riverwood Golf Course',      level: 'JV', time: '10:00 AM', teamScore: '311', teamFinish: '1st of 8' },
    { id: '2026-JV6', date: '2026-05-14', dateFormatted: 'May 14',    event: 'Lake Conference JV Match #4',        course: 'Shamrock Golf Club',         level: 'JV', time: '8:30 AM', par: 72, holes: 18, iWanaMakerId: 211956, teamScore: '306 (+18)', teamFinish: '4th of 8' },
    { id: '2026-JV7', date: '2026-05-20', dateFormatted: 'May 20',    event: 'Boys JV Invitational',               course: 'Dahlgreen Golf Course',      level: 'JV', time: '8:00 AM' },
    { id: '2026-JV-MAY22', date: '2026-05-22', dateFormatted: 'May 22', event: 'JV Conference @ Pioneer Creek',      course: 'Pioneer Creek Golf Course',  level: 'JV', time: '2:30 PM', par: 72, holes: 18, iWanaMakerId: 214024, teamScore: '306 (+18)', teamFinish: '1st of 8' },
  ]

  // Use schedule data from JSON (2025)
  const varsitySchedule = golfData.schedule || []
  const jvSchedule = golfData.jvSchedule || []

  // Build result overlay map from golfData.json schedule arrays.
  // write-scores.py now writes teamScore + teamFinish to schedule2026/jvSchedule2026
  // so score-pull crons automatically update the site without touching this file.
  // The inline schedule2026 array below remains the structural source (event metadata,
  // multi-day rounds, match-play data) while golfData overrides score fields when present.
  const scheduleResultMap = useMemo(() => {
    const map = {}
    const addEntry = e => {
      if (e.teamScore != null || e.teamFinish != null) {
        const result = { teamScore: e.teamScore, teamFinish: e.teamFinish, teamResult: e.teamResult }
        // Index by primary id
        map[e.id] = result
        // Also index by scheduleJsxId if present (varsity: golfData id differs from Schedule.jsx id)
        if (e.scheduleJsxId) map[e.scheduleJsxId] = result
      }
    }
    ;(golfData.schedule2026 || []).forEach(addEntry)
    ;(golfData.jvSchedule2026 || []).forEach(addEntry)
    return map
  }, [])

  // Combine and tag events by level (2025)
  const allCombined2025 = useMemo(() => {
    const varsityTagged = varsitySchedule.map(e => ({ ...e, level: 'Varsity' }))
    const jvTagged = jvSchedule.map(e => ({ ...e, level: 'JV' }))
    return [...varsityTagged, ...jvTagged].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [varsitySchedule, jvSchedule])

  // Get schedule based on year — overlay golfData result fields when present
  const yearSchedule = useMemo(() => {
    if (yearFilter === '2026') {
      return schedule2026
        .map(e => scheduleResultMap[e.id] ? { ...e, ...scheduleResultMap[e.id] } : e)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    }
    return allCombined2025
  }, [yearFilter, allCombined2025, scheduleResultMap])

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
    ;[
      ...(golfData.events || []),
      ...(golfData.jvEvents || []),
      ...(golfData.events2026 || []),
      ...(golfData.jvEvents2026 || []),
    ].forEach(event => {
      map[event.id] = { par: event.par, holes: event.holes }
    })
    // Also index schedule2026 entries directly by their id
    schedule2026.forEach(e => {
      if (e.par) map[e.id] = { par: e.par, holes: e.holes }
    })
    return map
  }, [])

  // Get individual player scores for a schedule event
  const getEventScores = (event) => {
    if (event.isMultiDay && event.rounds) {
      const suffix = event.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')
      const roundEventIds = event.rounds.map(r => r.id || `${r.date}-${suffix}`)

      const playerMap = {}
      roundEventIds.forEach((eventId, roundIdx) => {
        const scores = playerScoresByEvent[eventId] || []
        const info = eventInfoMap[eventId] || { par: event.rounds[roundIdx].par }
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
  const isBestBall  = (event) => event.format === 'bestball'

  // Check if event has individual scores
  const hasPlayerScores = (event) => {
    if (event.isMultiDay && event.rounds) {
      const suffix = event.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')
      return event.rounds.some(r => (playerScoresByEvent[r.id || `${r.date}-${suffix}`] || []).length > 0)
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
    const isRainedOut = event.status === 'rained_out'
    const isCancelled = event.status === 'cancelled'
    const isPostponed = event.status === 'postponed'
    const isInactive = isRainedOut || isCancelled
    const isInProgressMultiDay = !isRound && event.isMultiDay && Array.isArray(event.rounds) && event.rounds.length > 0 && !event.teamScore && !isInactive && !isPostponed && (() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const roundDates = event.rounds.map(r => new Date(`${r.date}T00:00:00`))
      const firstRound = new Date(Math.min(...roundDates.map(d => d.getTime())))
      const lastRound = new Date(Math.max(...roundDates.map(d => d.getTime())))
      return today >= firstRound && today <= lastRound
    })()
    const canExpand = !isRound && !isInactive && (event.isMultiDay || hasPlayerScores(event) || isMatchPlay(event) || isBestBall(event))

    return (
      <div
        key={isRound ? `${event.id}-r${roundNum}` : event.id}
        className={`card ${isRound ? 'ml-6 border-l-4 border-edina-green/30' : ''} ${
          isPastEvent(event.date) && !event.teamScore && !is2026Event ? 'opacity-60' : ''
        } ${is2026Event ? 'bg-gray-50/50 border-l-4 border-edina-green' : ''} ${isInactive ? 'opacity-70' : ''}`}
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
              {!isRound && yearFilter === '2026' && !isInactive && <AddToCalendar event={event} />}
              {/* Rained out / Cancelled — short-circuit other pills */}
              {!isRound && isInactive && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  isRainedOut
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-gray-200 text-gray-600 border border-gray-300'
                }`}>
                  {isRainedOut ? 'Rained Out' : 'Cancelled'}
                </span>
              )}
              {/* Postponed with makeup date */}
              {!isRound && isPostponed && event.rescheduledTo && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Postponed → {formatDateDisplay(event.rescheduledTo)}
                </span>
              )}
              {/* Match play: show teamResult badge if not TBD */}
              {!isRound && !isInactive && isMatchPlay(event) && event.teamResult && event.teamResult !== 'TBD' && (
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
              {/* Best Ball: small badge so the format is obvious at a glance */}
              {!isRound && !isInactive && isBestBall(event) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-edina-gold/20 text-edina-gold-dark uppercase tracking-wider">
                  {event.formatLabel || 'Best Ball'}
                </span>
              )}
              {/* Stroke play score + finish (also used for best-ball when teamScore is set) */}
              {!isInactive && !isMatchPlay(event) && event.teamScore && (
                <span className={`font-semibold ${
                  String(event.teamScore).includes('(-') ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {event.teamScore}
                </span>
              )}
              {!isRound && !isInactive && !isMatchPlay(event) && event.teamFinish ? (
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
              ) : !isRound && !isInactive && !isMatchPlay(event) && !event.teamScore && !isPostponed && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  isInProgressMultiDay
                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                    : is2026Event
                    ? 'bg-edina-green/10 text-edina-green border border-edina-green/30'
                    : 'bg-gray-50 text-gray-400'
                }`}>
                  {isInProgressMultiDay ? 'In Progress' : (is2026Event ? 'Upcoming' : (isPastEvent(event.date) ? 'No Result' : 'Upcoming'))}
                </span>
              )}
              {/* Match play: show Upcoming / In Progress when TBD */}
              {!isRound && !isInactive && isMatchPlay(event) && (!event.teamResult || event.teamResult === 'TBD') && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  isInProgressMultiDay
                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                    : is2026Event
                    ? 'bg-edina-green/10 text-edina-green border border-edina-green/30'
                    : 'bg-gray-50 text-gray-400'
                }`}>
                  {isInProgressMultiDay ? 'In Progress' : (is2026Event ? 'Upcoming' : 'No Result')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && !isRound && (() => {
          // Best Ball expanded view (2-Man Best Ball — pairs[] per round)
          if (isBestBall(event)) {
            const rounds = event.isMultiDay && event.rounds
              ? event.rounds
              : [{
                  round: 1,
                  date: event.date,
                  dateFormatted: event.dateFormatted,
                  course: event.course,
                  par: event.par,
                  teamScore: event.teamScore,
                  pairs: event.pairs || []
                }]
            return (
              <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-edina-gold/20 text-edina-gold-dark uppercase tracking-wider">
                    {event.formatLabel || '2-Man Best Ball'}
                  </span>
                  {event.teamFinish && (
                    <span className="text-sm text-gray-600">Team Finish: <span className="font-medium">{event.teamFinish}</span></span>
                  )}
                </div>
                {rounds.map((round, rIdx) => (
                  <div key={rIdx} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        {event.isMultiDay ? `Round ${round.round} \u2014 ${round.dateFormatted || round.date}` : 'Pair Results'}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        Team: {round.teamScore || '\u2014'}
                      </div>
                    </div>
                    {Array.isArray(round.pairs) && round.pairs.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {round.pairs.map((pair, idx) => {
                          const players = Array.isArray(pair.players) ? pair.players.join(' / ') : ''
                          const ind = Array.isArray(pair.individualScores) ? pair.individualScores.join(' / ') : null
                          return (
                            <div key={idx} className="flex items-center justify-between px-3 py-2.5 gap-3">
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  {pair.teamName && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-edina-green/10 text-edina-green uppercase tracking-wider">
                                      {pair.teamName}
                                    </span>
                                  )}
                                  <span className="font-medium text-gray-900 text-sm">{players}</span>
                                </div>
                                {ind && (
                                  <span className="text-xs text-gray-500">Individual: {ind}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm font-semibold text-gray-900">{pair.pairScore ?? '\u2014'}</span>
                                {pair.pairToPar && (
                                  <span className={`text-xs ${
                                    pair.pairToPar.startsWith('-') ? 'text-red-600' :
                                    pair.pairToPar === 'E' ? 'text-gray-500' : 'text-gray-600'
                                  }`}>({pair.pairToPar})</span>
                                )}
                                {pair.finish && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    pair.finish.startsWith('1st')
                                      ? 'bg-edina-gold/20 text-edina-gold-dark border border-edina-gold'
                                      : pair.finish.startsWith('2nd')
                                      ? 'bg-gray-200 text-gray-700'
                                      : pair.finish.startsWith('3rd') || pair.finish.startsWith('T3')
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-edina-green/10 text-edina-green'
                                  }`}>{pair.finish}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic px-3 py-3">Pair results will appear here after the event.</p>
                    )}
                  </div>
                ))}
              </div>
            )
          }
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
                        String(round.teamScore ?? '').includes('(-') ? 'text-red-600' : 'text-gray-700'
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
                                <tr
                                  onClick={() => {
                                    // For multi-day, clicking the row toggles R1 scorecard if available
                                    const firstRoundDate = event.rounds?.[0]?.date
                                    const firstSc = firstRoundDate ? getScorecard(s.name, firstRoundDate) : null
                                    if (firstSc) toggleScorecard(s.name, firstRoundDate)
                                  }}
                                  className="cursor-pointer hover:bg-edina-green/5 transition-colors"
                                >
                                  <td className="px-3 py-1.5 font-medium text-gray-900">
                                    <span className="flex items-center gap-1.5">
                                      {s.name}
                                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </span>
                                  </td>
                                  {s.rounds.map((r, i) => {
                                    const rPar = s.pars[i]
                                    const rUnder = r !== null && rPar && r < rPar
                                    const roundDate = event.rounds?.[i]?.date || event.dateISO || (event.date ? event.date.substring(0, 10) : null)
                                    return (
                                      <td key={i} className="px-2 py-1.5 text-center">
                                        <span className={`font-medium ${rUnder ? 'text-red-600' : 'text-gray-700'}`}>
                                          {r !== null ? r : '-'}
                                        </span>
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
                                {(event.rounds || [{ date: event.dateISO || (event.date ? event.date.substring(0, 10) : null) }]).map((round, i) => {
                                  const roundDate = round.date || event.dateISO || (event.date ? event.date.substring(0, 10) : null)
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
                          const singleDayDate = event.date ? event.date.substring(0, 10) : null
                          const singleDaySc = singleDayDate ? getScorecard(s.name, singleDayDate) : null
                          const isExpanded = singleDaySc && expandedScorecards.has(`${s.name}::${singleDayDate}`)
                          return (
                            <Fragment key={idx}>
                              <tr
                                onClick={() => singleDaySc && toggleScorecard(s.name, singleDayDate)}
                                className={`transition-colors ${singleDaySc ? 'cursor-pointer hover:bg-edina-green/5' : ''} ${isExpanded ? 'bg-edina-green/5' : ''}`}
                              >
                                <td className="px-3 py-1.5 font-medium text-gray-900">
                                  <span className="flex items-center gap-1.5">
                                    {s.name}
                                    {singleDaySc && (
                                      <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180 text-edina-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    )}
                                  </span>
                                </td>
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
                              {singleDaySc && expandedScorecards.has(`${s.name}::${singleDayDate}`) && (
                                <tr key={`sc-single-${idx}`}>
                                  <td colSpan={4} className="p-0 bg-gray-50">
                                    <Scorecard
                                      par={singleDaySc.par}
                                      scores={singleDaySc.scores}
                                      courseName={singleDaySc.courseName}
                                      playerName={singleDaySc.playerName}
                                      round={singleDaySc.round}
                                    />
                                  </td>
                                </tr>
                              )}
                            </Fragment>
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
