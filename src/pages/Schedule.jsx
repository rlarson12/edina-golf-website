import { useState, useMemo } from 'react'
import golfData from '../data/golfData.json'

function Schedule() {
  const [yearFilter, setYearFilter] = useState('2026')
  const [levelFilter, setLevelFilter] = useState('all')
  const [seasonFilter, setSeasonFilter] = useState('all')
  const [expandedEvents, setExpandedEvents] = useState(new Set())

  // 2026 Schedule (Varsity and JV events)
  const schedule2026 = [
    // Varsity Events
    { id: '2026-V1', date: '2026-04-20', dateFormatted: 'Apr 20', event: 'Lake Conference Tournament #1', course: 'Chaska Town Course', level: 'Varsity', time: '1:30 PM' },
    { id: '2026-V2', date: '2026-04-22', dateFormatted: 'Apr 22', event: 'East Ridge Invitational', course: 'Stoneridge Golf Club', level: 'Varsity' },
    { id: '2026-V3', date: '2026-04-23', dateFormatted: 'Apr 23', event: 'Lake Conference Meet', course: 'Pioneer Creek Golf Course', level: 'Varsity' },
    { id: '2026-V4', date: '2026-04-24', dateFormatted: 'Apr 24-25', event: 'The Preview', course: 'Edinburgh Golf Course', level: 'Varsity', isMultiDay: true },
    { id: '2026-V5', date: '2026-04-27', dateFormatted: 'Apr 27', event: 'Lake Conference Meet', course: 'Oak Ridge Country Club', level: 'Varsity' },
    { id: '2026-V6', date: '2026-05-01', dateFormatted: 'May 1-2', event: 'Lakeville South Invitational', course: 'Dacotah Ridge Golf Club', level: 'Varsity', isMultiDay: true },
    { id: '2026-V7', date: '2026-05-04', dateFormatted: 'May 4', event: 'Spring Lake Park Invitational', course: 'TPC Twin Cities', level: 'Varsity' },
    { id: '2026-V8', date: '2026-05-08', dateFormatted: 'May 8-9', event: 'Northwest Classic', course: 'Detroit Lakes Country Club', level: 'Varsity', isMultiDay: true },
    { id: '2026-V9', date: '2026-05-11', dateFormatted: 'May 11-12', event: 'Edina Invitational', course: 'Oak Ridge Country Club', level: 'Varsity', isMultiDay: true },
    { id: '2026-V10', date: '2026-05-19', dateFormatted: 'May 19', event: 'Lake Conference Championship', course: 'Fox Hollow Golf Club', level: 'Varsity' },
    { id: '2026-V11', date: '2026-05-26', dateFormatted: 'May 26-27', event: 'MSHSL Boys 6AAA Section Tournament', course: 'Meadows at Mystic Lake', level: 'Varsity', isMultiDay: true },
    { id: '2026-V12', date: '2026-06-09', dateFormatted: 'Jun 9-10', event: 'MSHSL Boys AAA State Tournament', course: 'Bunker Hills Golf Course', level: 'Varsity', isMultiDay: true },
    // JV Events
    { id: '2026-JV1', date: '2026-04-20', dateFormatted: 'Apr 20', event: 'JV Lake Conference Match #1', course: 'Bluff Creek Golf Course', level: 'JV', time: '12:00 PM' },
    { id: '2026-JV2', date: '2026-04-27', dateFormatted: 'Apr 27', event: 'Eden Prairie JV Invite', course: 'Bluff Creek Golf Course', level: 'JV', time: '9:00 AM' },
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
    if (levelFilter === 'varsity') return varsitySchedule
    return jvSchedule
  }, [yearFilter, levelFilter, yearSchedule, varsitySchedule, jvSchedule])

  // Filter by regular/post season
  const schedule = useMemo(() => {
    if (seasonFilter === 'all') return levelFiltered
    if (seasonFilter === 'postseason') {
      return levelFiltered.filter(e =>
        e.event.toLowerCase().includes('section') ||
        e.event.toLowerCase().includes('state') ||
        e.event.toLowerCase().includes('conference champ') ||
        e.type === 'tournament'
      )
    }
    // Regular season - exclude postseason events
    return levelFiltered.filter(e =>
      !e.event.toLowerCase().includes('section') &&
      !e.event.toLowerCase().includes('state') &&
      e.type !== 'tournament'
    )
  }, [levelFiltered, seasonFilter])

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

  // Summary stats
  const stats = useMemo(() => {
    if (yearFilter === '2026') {
      const multiDay = schedule.filter(e => e.isMultiDay).length
      return {
        total: schedule.length,
        multiDay,
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

    return (
      <div
        key={isRound ? `${event.id}-r${roundNum}` : event.id}
        className={`card ${isRound ? 'ml-6 border-l-4 border-edina-green/30' : ''} ${
          isPastEvent(event.date) && !event.teamScore && !is2026Event ? 'opacity-60' : ''
        } ${is2026Event ? 'bg-gray-50/50 border-l-4 border-edina-green' : ''}`}
      >
        <div className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Expand button for multi-day events */}
            {event.isMultiDay && !isRound && (
              <button
                onClick={() => toggleExpand(event.id)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors md:order-first"
              >
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Date */}
            <div className="flex-shrink-0 w-20 md:w-24">
              <div className="text-lg font-bold text-edina-green">
                {isRound ? `R${roundNum}` : formatDateDisplay(event.date, event.dateFormatted)}
              </div>
              <div className="text-sm text-gray-500">
                {isRound ? formatDateDisplay(event.date, event.dateFormatted) : getDayOfWeek(event.date)}
              </div>
            </div>

            {/* Event Info */}
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {isRound ? event.course : event.event}
                </h3>
                {!isRound && event.level && levelFilter === 'all' && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    event.level === 'Varsity' ? 'bg-edina-green/10 text-edina-green' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.level}
                  </span>
                )}
                {!isRound && event.isMultiDay && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    2-Day
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
                {event.par && (
                  <span className="text-gray-400">Par {event.par}</span>
                )}
              </div>
            </div>

            {/* Result */}
            <div className="flex-shrink-0 flex items-center gap-3">
              {event.teamScore && (
                <span className={`font-semibold ${
                  event.teamScore.includes('(-') ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {event.teamScore}
                </span>
              )}
              {!isRound && event.teamFinish ? (
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
              ) : !isRound && !event.teamScore && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                  is2026Event
                    ? 'bg-edina-green/10 text-edina-green border border-edina-green/30'
                    : 'bg-gray-50 text-gray-400'
                }`}>
                  {is2026Event ? 'Upcoming' : (isPastEvent(event.date) ? 'No Result' : 'Upcoming')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expanded rounds */}
        {event.isMultiDay && isExpanded && !isRound && (
          <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Round Scores</div>
            {event.rounds?.map((round, idx) => (
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
                    <div className="text-sm text-gray-500">
                      {round.dateFormatted} {round.par && `• Par ${round.par}`}
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
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Hero Banner with Action Photo */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="/images/IMG_9149.jpeg"
          alt="Tournament action"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
              {yearFilter} SCHEDULE
            </h1>
            <p className="text-green-200 text-lg">{yearFilter === '2026' ? 'Upcoming Season' : 'Season Results'}</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Stats Summary as floating cards */}
        <div className="relative -mt-12 mb-8">
          {stats.is2026 ? (
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="card p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-edina-green">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="card p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-edina-green">{stats.multiDay}</div>
                <div className="text-sm text-gray-600">2-Day Events</div>
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

        {/* Season Filter - only show for 2025 */}
        {yearFilter === '2025' && (
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSeasonFilter('regular')}
              className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                seasonFilter === 'regular'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="md:hidden">Regular</span>
              <span className="hidden md:inline">Regular Season</span>
            </button>
            <button
              onClick={() => setSeasonFilter('postseason')}
              className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                seasonFilter === 'postseason'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="md:hidden">Post</span>
              <span className="hidden md:inline">Post Season</span>
            </button>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        {schedule.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            No events found.
          </div>
        ) : (
          schedule.map((event) => renderEventRow(event))
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
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">2-Day</span>
                <span className="text-gray-500">Multi-day tournament</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-edina-gold/20 text-edina-gold-dark border border-edina-gold">1st</span>
                <span className="text-gray-500">Win</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">2-Day</span>
                <span className="text-gray-500">Click to expand rounds</span>
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
