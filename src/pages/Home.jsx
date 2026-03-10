import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import golfData from '../data/golfData.json'

// 2026 Varsity Schedule (for Up Next feature - varsity events only)
const schedule2026 = [
  { id: '2026-1', date: '2026-04-20', dateFormatted: 'Apr 20', event: 'Lake Conference Tournament #1', course: 'Chaska Town Course' },
  { id: '2026-2', date: '2026-04-22', dateFormatted: 'Apr 22', event: 'East Ridge Invitational', course: 'Stoneridge' },
  { id: '2026-3', date: '2026-04-23', dateFormatted: 'Apr 23', event: 'Lake Conference Meet', course: 'Pioneer Creek' },
  { id: '2026-4', date: '2026-04-24', dateFormatted: 'Apr 24-25', event: 'The Preview', course: 'Edinburgh Golf Course', isMultiDay: true },
  { id: '2026-5', date: '2026-04-27', dateFormatted: 'Apr 27', event: 'Lake Conference Meet', course: 'Oak Ridge CC' },
  { id: '2026-6', date: '2026-05-01', dateFormatted: 'May 1-2', event: 'Lakeville South Invitational', course: 'Dacotah Ridge', isMultiDay: true },
  { id: '2026-7', date: '2026-05-04', dateFormatted: 'May 4', event: 'Spring Lake Park Invitational', course: 'TPC Twin Cities' },
  { id: '2026-8', date: '2026-05-08', dateFormatted: 'May 8-9', event: 'Northwest Classic', course: 'Detroit Lakes', isMultiDay: true },
  { id: '2026-9', date: '2026-05-11', dateFormatted: 'May 11-12', event: 'Edina Invitational', course: 'Oak Ridge', isMultiDay: true },
  { id: '2026-10', date: '2026-05-19', dateFormatted: 'May 19', event: 'Lake Conference Championship', course: 'Fox Hollow' },
  { id: '2026-11', date: '2026-05-26', dateFormatted: 'May 26-27', event: 'MSHSL Boys 6AAA Section Tournament', course: 'Meadows at Mystic Lake', isMultiDay: true },
  { id: '2026-12', date: '2026-06-09', dateFormatted: 'Jun 9-10', event: 'MSHSL Boys AAA State Tournament', course: 'Bunker Hills', isMultiDay: true },
]

function Home() {
  // Find next upcoming event from 2026 schedule
  const nextEvent = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const event of schedule2026) {
      // Parse date parts to avoid timezone issues
      const [year, month, day] = event.date.split('-').map(Number)
      const eventDate = new Date(year, month - 1, day)
      if (eventDate >= today) {
        const diffTime = eventDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return { ...event, daysUntil: diffDays }
      }
    }
    return null
  }, [])

  // Calculate quick stats from real data
  const quickStats = useMemo(() => {
    const wins = golfData.seasonResults?.filter(r =>
      r.finish?.startsWith('1st')
    ).length || 0

    const totalEvents = golfData.seasonResults?.length || 0

    // Calculate low avg dynamically from playerStats (normalize 9-hole scores)
    const allAverages = (golfData.playerStats || [])
      .filter(p => p.scores?.length > 0)
      .map(p => {
        const total = p.scores.reduce((sum, s) => sum + (s.score < 50 ? s.score * 2 : s.score), 0)
        return total / p.scores.length
      })
    const lowAvg = allAverages.length > 0 ? Math.min(...allAverages) : null

    return [
      { label: 'Tournament Wins', value: wins.toString() },
      { label: 'Events Played', value: totalEvents.toString() },
      { label: 'Team Members', value: golfData.players?.length?.toString() || '0' },
      { label: 'Low Avg', value: lowAvg ? lowAvg.toFixed(1) : '-' },
    ]
  }, [])

  // Get recent varsity results (most recent first)
  const recentVarsityResults = useMemo(() => {
    return (golfData.schedule || [])
      .filter(r => r.teamScore)
      .slice(-3)
      .reverse()
  }, [])

  // Get recent JV results (most recent first)
  const recentJVResults = useMemo(() => {
    return (golfData.jvSchedule || [])
      .filter(r => r.teamScore)
      .slice(-3)
      .reverse()
  }, [])

  // Dynamically calculate leaderboard from playerStats scores
  const rankingsOrder = (golfData.rankings || []).map(r => r.name)
  const calculateLeaderboard = (stats, team) => {
    return stats
      .filter(p => p.team === team && p.scores?.length > 0)
      .map(p => {
        // Normalize 9-hole scores (< 50) by doubling to 18-hole equivalent
        const totalStrokes = p.scores.reduce((sum, s) => sum + (s.score < 50 ? s.score * 2 : s.score), 0)
        const rounds = p.scores.length
        return { name: p.name, average: totalStrokes / rounds }
      })
      .sort((a, b) => {
        const roundA = Math.round(a.average * 10)
        const roundB = Math.round(b.average * 10)
        if (roundA !== roundB) return roundA - roundB
        // Tiebreaker 1: rankings order
        const idxA = rankingsOrder.indexOf(a.name)
        const idxB = rankingsOrder.indexOf(b.name)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        if (idxA !== -1) return -1
        if (idxB !== -1) return 1
        // Tiebreaker 2: alphabetical by last name
        const lastA = a.name.split(' ').slice(-1)[0]
        const lastB = b.name.split(' ').slice(-1)[0]
        return lastA.localeCompare(lastB)
      })
      .slice(0, 5)
  }

  // Get varsity players for leaderboard
  const varsityPlayers = useMemo(() => {
    return calculateLeaderboard(golfData.playerStats || [], 'varsity')
  }, [])

  // Get JV players for leaderboard
  const jvPlayers = useMemo(() => {
    return calculateLeaderboard(golfData.playerStats || [], 'jv')
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-edina-green">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: "url('/images/Web 1.jpg')", backgroundPosition: 'center 30%' }}
        ></div>
        {/* Green Overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 166, 81, 0.6)' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Edina Boys Golf
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
              2026 Season • Tradition. Excellence. Championship Golf.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/stats" className="btn-primary">
                View Stats
              </Link>
              <Link to="/schedule" className="btn-primary">
                Season Schedule
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {quickStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-edina-green mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Up Next - 2026 Season */}
      {nextEvent && (
        <section className="bg-gray-50 py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg border-l-4 border-edina-green overflow-hidden">
              <div className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Up Next Badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-edina-green text-white">
                      UP NEXT
                    </span>
                  </div>

                  {/* Event Info */}
                  <div className="flex-grow">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900" style={{ fontFamily: "'Oswald', sans-serif" }}>
                      {nextEvent.event}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {nextEvent.dateFormatted}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {nextEvent.course}
                      </span>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-3xl md:text-4xl font-bold text-edina-green">
                      {nextEvent.daysUntil}
                    </div>
                    <div className="text-sm text-gray-500">
                      {nextEvent.daysUntil === 1 ? 'day away' : 'days away'}
                    </div>
                  </div>

                  {/* View Schedule Link */}
                  <div className="flex-shrink-0">
                    <Link
                      to="/schedule"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-edina-green/10 text-edina-green font-medium rounded-lg hover:bg-edina-green/20 transition-colors"
                    >
                      Full Schedule
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results & Leaderboards - 2x2 Grid */}
      <section className="page-container">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Top Left - Recent Varsity Results */}
          <div className="card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Oswald', sans-serif" }}>2025 Varsity Results</h2>
              <Link to="/schedule" className="text-edina-green font-medium text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentVarsityResults.length > 0 ? (
                recentVarsityResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="text-xs md:text-sm font-bold text-edina-green">{result.dateFormatted}</div>
                    </div>
                    <div className="ml-3 flex-grow min-w-0">
                      <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{result.event}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className={`font-semibold text-sm md:text-base ${
                        result.teamScore?.includes('(-') ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {result.teamScore}
                      </div>
                      {result.teamFinish && (
                        <div className={`text-xs font-medium ${
                          result.teamFinish?.startsWith('1st') ? 'text-edina-gold-dark' : 'text-gray-500'
                        }`}>
                          {result.teamFinish}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  No results yet.
                </div>
              )}
            </div>
          </div>

          {/* Top Right - Recent JV Results */}
          <div className="card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Oswald', sans-serif" }}>2025 JV Results</h2>
              <Link to="/schedule" className="text-edina-green font-medium text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentJVResults.length > 0 ? (
                recentJVResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="text-xs md:text-sm font-bold text-edina-green">{result.dateFormatted}</div>
                    </div>
                    <div className="ml-3 flex-grow min-w-0">
                      <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{result.event}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className={`font-semibold text-sm md:text-base ${
                        result.teamScore?.includes('(-') ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {result.teamScore}
                      </div>
                      {result.teamFinish && (
                        <div className={`text-xs font-medium ${
                          result.teamFinish?.startsWith('1st') ? 'text-edina-gold-dark' : 'text-gray-500'
                        }`}>
                          {result.teamFinish}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  No results yet.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Left - Varsity Leaderboard */}
          <div className="card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Oswald', sans-serif" }}>2025 Varsity Leaderboard</h2>
              <Link to="/stats" className="text-edina-green font-medium text-sm hover:underline">
                Full Stats
              </Link>
            </div>
            <div className="space-y-2">
              {varsityPlayers.length > 0 ? (
                varsityPlayers.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 md:p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-grow">
                      <div className="font-semibold text-gray-900 text-sm md:text-base">{player.name}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-edina-green text-base md:text-lg">
                        {player.average?.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">avg</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  No data yet.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Right - JV Leaderboard */}
          <div className="card p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Oswald', sans-serif" }}>2025 JV Leaderboard</h2>
              <Link to="/stats" className="text-edina-green font-medium text-sm hover:underline">
                Full Stats
              </Link>
            </div>
            <div className="space-y-2">
              {jvPlayers.length > 0 ? (
                jvPlayers.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 md:p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-grow">
                      <div className="font-semibold text-gray-900 text-sm md:text-base">{player.name}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-edina-green text-base md:text-lg">
                        {player.average?.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">avg</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  No data yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="bg-edina-green/5 border-y border-edina-green/20 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>Upcoming Events</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Optional Spring Break Practice */}
            <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border-l-4 border-blue-400">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">Optional Practice</h3>
                    <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Mar 16–19</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Optional spring break sessions at OfficeGolf for registered players. Mon–Thu, 4:00–7:00 PM. Sign-up form sent by Coach Vernon.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    OfficeGolf, 5600 W 83rd St, Bloomington
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Start */}
            <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border-l-4 border-edina-green">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-edina-green/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-edina-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">Practice Begins</h3>
                    <span className="text-xs font-semibold text-edina-green bg-edina-green/10 px-2 py-0.5 rounded">Mon, Mar 23</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    The 2026 season officially kicks off at Office Golf (indoor facility).
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    5600 W 83rd St, Bloomington, MN 55437
                  </div>
                </div>
              </div>
            </div>

            {/* Tryouts */}
            <div className="bg-white rounded-xl p-5 md:p-6 shadow-sm border-l-4 border-edina-gold">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-edina-gold/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-edina-gold-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">Tryouts</h3>
                    <span className="text-xs font-semibold text-edina-gold-dark bg-edina-gold/20 px-2 py-0.5 rounded">Apr 6–9</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Varsity and JV tryouts at Braemar Golf Course. Teams announced April 10th.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Braemar Golf Course, 6364 John Harris Dr, Edina
                  </div>
                  <Link to="/team-info" className="inline-flex items-center gap-1 text-sm text-edina-green hover:underline mt-2">
                    More Info
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Photo Strip */}
      <section className="py-8 bg-white overflow-hidden">
        <div className="flex gap-4 animate-none">
          <div className="flex gap-4 min-w-full justify-center">
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img src="/images/IMG_9149.jpeg" alt="Action shot" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img src="/images/IMG_9152.jpeg" alt="Bunker shot" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img src="/images/Web 10.jpg" alt="Medal winners" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0 hidden md:block">
              <img src="/images/IMG_8248.jpeg" alt="On the course" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Culture Collage */}
      <section className="py-12 md:py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>
            More Than A Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden">
              <img src="/images/unnamed.png" alt="Team photo" className="w-full h-full img-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-lg font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>BROTHERHOOD</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <img src="/images/Web 6.jpg" alt="Team dinner" className="w-full h-full img-cover" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <img src="/images/Web 9.jpg" alt="Sunset" className="w-full h-full img-cover-top" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <img src="/images/IMG_6742.JPEG" alt="Team by water" className="w-full h-full img-cover" />
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <img src="/images/Web 7.jpg" alt="Team at course" className="w-full h-full img-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Go Hornets!
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Follow the Edina Boys Golf team throughout the 2026 season as we compete for conference and state championships.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home
