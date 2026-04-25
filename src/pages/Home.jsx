import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import golfData from '../data/golfData.json'
import recapsData from '../data/recaps.json'
import SEO from '../components/SEO'

// 2026 Varsity Schedule (for Up Next feature - varsity events only)
const schedule2026 = [
  { id: '2026-0',  date: '2026-04-16', dateFormatted: 'Apr 16',    event: 'Match Play @ Heritage Links',          course: 'Heritage Links Golf Club', isJV: true },
  { id: '2026-1',  date: '2026-04-20', dateFormatted: 'Apr 20',    event: 'Lake Conference Tournament #1',       course: 'Chaska Town Course' },
  { id: '2026-2',  date: '2026-04-22', dateFormatted: 'Apr 22',    event: 'East Ridge Invitational',             course: 'Stoneridge' },
  { id: '2026-3',  date: '2026-05-06', dateFormatted: 'May 6',     event: 'Lake Conference Meet #2',             course: 'Pioneer Creek Golf Course', rescheduledFrom: '2026-04-23', statusNote: 'Rescheduled from April 23 (weather)' },
  { id: '2026-4',  date: '2026-04-24', endDate: '2026-04-25', dateFormatted: 'Apr 24-25', event: 'The Preview',                        course: 'Edinburgh Golf Course', isMultiDay: true, status: 'completed' },
  { id: '2026-5',  date: '2026-04-27', dateFormatted: 'Apr 27',    event: 'Lake Conference Meet #3',             course: 'Oak Ridge CC' },
  { id: '2026-6',  date: '2026-05-01', dateFormatted: 'May 1-2',   event: 'Lakeville South Invitational',       course: 'Dacotah Ridge', isMultiDay: true },
  { id: '2026-7a', date: '2026-05-04', dateFormatted: 'May 4',     event: 'Boys Varsity Invitational',          course: 'Oak Ridge CC' },
  { id: '2026-7b', date: '2026-05-04', dateFormatted: 'May 4',     event: 'Spring Lake Park Invitational',      course: 'TPC Twin Cities' },
  { id: '2026-7c', date: '2026-05-04', dateFormatted: 'May 4',     event: 'Lake Conference Meet #4',            course: 'Medina CC' },
  { id: '2026-8',  date: '2026-05-08', dateFormatted: 'May 8-9',   event: 'Northwest Classic',                  course: 'Detroit Lakes', isMultiDay: true },
  { id: '2026-9',  date: '2026-05-11', dateFormatted: 'May 11-12', event: 'Edina Invitational',                 course: 'Oak Ridge', isMultiDay: true },
  { id: '2026-10', date: '2026-05-19', dateFormatted: 'May 19',    event: 'Lake Conference Championship',       course: 'Fox Hollow' },
  { id: '2026-11', date: '2026-05-26', dateFormatted: 'May 26-27', event: 'MSHSL Boys 6AAA Section Tournament', course: 'Meadows at Mystic Lake', isMultiDay: true },
  { id: '2026-12', date: '2026-06-09', dateFormatted: 'Jun 9-10',  event: 'MSHSL Boys AAA State Tournament',    course: 'Bunker Hills', isMultiDay: true },
]

const isActiveEvent = (e) => e.status !== 'rained_out' && e.status !== 'cancelled'

function Home() {
  // Find all events on the next upcoming date from 2026 schedule
  const nextEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find the earliest upcoming date (skip rained-out / cancelled)
    let nextDate = null
    let daysUntil = null
    for (const event of schedule2026) {
      if (!isActiveEvent(event)) continue
      const [year, month, day] = event.date.split('-').map(Number)
      const eventDate = new Date(year, month - 1, day)
      if (eventDate >= today) {
        nextDate = event.date
        daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
        break
      }
    }
    if (!nextDate) return []

    // Return all events on that same date
    return schedule2026
      .filter(e => e.date === nextDate && isActiveEvent(e))
      .map(e => ({ ...e, daysUntil }))
  }, [])

  // Calculate quick stats from 2026 season data
  const quickStats = useMemo(() => {
    const results2026 = golfData.seasonResults2026 || []
    const varsityStrokePlayed = (golfData.events2026 || [])
      .filter(r => r.teamScore && r.level !== 'JV' && r.format !== 'matchplay').length

    const wins = results2026.filter(r =>
      r.finish?.startsWith('1st') ||
      r.teamResult?.toLowerCase() === 'win'
    ).length
    const totalEvents = results2026.length

    // Calculate low avg dynamically from 2026 playerStats (normalize 9-hole scores)
    const allAverages = (golfData.playerStats2026 || [])
      .filter(p => p.scores?.length > 0)
      .map(p => {
        const total = p.scores.reduce((sum, s) => sum + (s.score < 50 ? s.score * 2 : s.score), 0)
        return total / p.scores.length
      })
    const lowAvg = allAverages.length > 0 ? Math.min(...allAverages) : null

    // Before first varsity stroke play event: show program history stats
    if (varsityStrokePlayed < 1) {
      return [
        { label: 'State Champions', value: '10×', sublabel: 'All-Time' },
        { label: 'Years of History', value: '70+', sublabel: 'Est. 1956' },
        { label: 'State Titles', value: '4', sublabel: 'Since 2014' },
      ]
    }

    return [
      { label: 'Events Won', value: wins.toString(), sublabel: '2026 Season' },
      { label: 'Events Played', value: totalEvents.toString(), sublabel: '2026 Season' },
      { label: 'Low Avg', value: lowAvg ? lowAvg.toFixed(1) : '-', sublabel: 'Season' },
    ]
  }, [])

  // Get recent varsity results (most recent first) — 2026 season
  const recentVarsityResults = useMemo(() => {
    return (golfData.events2026 || [])
      .filter(r => r.teamScore)
      .slice(-3)
      .reverse()
  }, [])

  // Get recent JV results (most recent first) — 2026 season
  const recentJVResults = useMemo(() => {
    return (golfData.jvEvents2026 || [])
      .filter(r => r.teamScore || r.teamResult)
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
        // Tiebreaker 0: Chase Larson wins display-tied-to-tenth ties (site owner's kid; intentional)
        if (a.name === 'Chase Larson' && b.name !== 'Chase Larson') return -1
        if (b.name === 'Chase Larson' && a.name !== 'Chase Larson') return 1
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
    return calculateLeaderboard(golfData.playerStats2026 || [], 'varsity')
  }, [])

  // Get JV players for leaderboard
  const jvPlayers = useMemo(() => {
    return calculateLeaderboard(golfData.playerStats2026 || [], 'jv')
  }, [])

  // Transition logic: show pre-season layout until 2026 results exist
  const hasSeason2026Results = (golfData.seasonResults2026 || []).length > 0

  // Next 4 upcoming varsity events (exclude JV/dev events, rained-out, cancelled)
  const upcomingVarsity = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return schedule2026
      .filter(e => {
        if (e.isJV) return false
        if (!isActiveEvent(e)) return false
        if (e.status === 'completed') return false
        // For multi-day events, use endDate (or last round date) for the cutoff so finished
        // multi-day events fall off Up Next after the final round.
        const cutoffStr = e.endDate || e.date
        const [year, month, day] = cutoffStr.split('-').map(Number)
        return new Date(year, month - 1, day) >= today
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4)
  }, [])

  // Next 4 upcoming JV events
  const upcomingJV = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return (golfData.jvSchedule2026 || [])
      .filter(e => {
        if (!isActiveEvent(e)) return false
        if (e.status === 'completed') return false
        const dateStr = e.dateISO || (e.date ? e.date.substring(0, 10) : null)
        if (!dateStr) return false
        const [year, month, day] = dateStr.split('-').map(Number)
        return new Date(year, month - 1, day) >= today
      })
      .map(e => ({ ...e, event: e.event || e.name }))
      .sort((a, b) => {
        const aStr = a.dateISO || (a.date ? a.date.substring(0, 10) : '')
        const bStr = b.dateISO || (b.date ? b.date.substring(0, 10) : '')
        return aStr.localeCompare(bStr)
      })
      .slice(0, 4)
  }, [])

  return (
    <div>
      <SEO path="/" />
      {/* Hero Section */}
      <section className="relative bg-edina-forest">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: "url('/images/unnamed.webp')", backgroundPosition: 'center 60%' }}
        ></div>
        {/* Dark gradient — stronger for text legibility on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
        {/* NOTE: Hero is aspect-ratio sensitive — source photo is 4:3. Min-height set to ~680px on desktop so background-position is not load-bearing. Do not reduce hero height or the crop will break. */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 md:pt-20 md:pb-24 lg:min-h-[680px] flex flex-col justify-start">
          <div className="text-center">
            {/* Subtitle above the statement — setup-and-payoff structure */}
            <p className="text-base md:text-xl text-white mb-3 max-w-2xl mx-auto font-medium tracking-wide" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
              10× Minnesota State Champions • Est. 1954
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif", textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
              Chasing 11.
            </h1>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Up Next - 2026 Season */}
      {(upcomingVarsity.length > 0 || upcomingJV.length > 0) && (
        <section className="bg-gray-50 py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-edina-green text-white">
                UP NEXT
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Varsity Column */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-edina-green/10 border-b border-edina-green/15">
                  <span className="text-sm font-bold text-edina-green uppercase tracking-wider">Varsity</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {upcomingVarsity.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-shrink-0 w-14 text-center">
                        <div className="text-sm font-bold text-edina-green bg-edina-green/10 rounded-md px-3 py-1.5">{ev.dateFormatted}</div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-bold text-gray-900 text-base truncate">{ev.event}</div>
                        <div className="text-sm text-gray-600 truncate">{ev.course}</div>
                      </div>
                    </div>
                  ))}
                  {upcomingVarsity.length === 0 && (
                    <div className="px-4 py-6 text-sm text-gray-400 text-center">No upcoming events.</div>
                  )}
                </div>
              </div>

              {/* JV Column */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-edina-green/10 border-b border-edina-green/15">
                  <span className="text-sm font-bold text-edina-green uppercase tracking-wider">JV</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {upcomingJV.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-shrink-0 w-14 text-center">
                        <div className="text-sm font-bold text-edina-green bg-edina-green/10 rounded-md px-3 py-1.5">{ev.dateFormatted}</div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-bold text-gray-900 text-base truncate">{ev.event}</div>
                        <div className="text-sm text-gray-600 truncate">{ev.course}</div>
                      </div>
                    </div>
                  ))}
                  {upcomingJV.length === 0 && (
                    <div className="px-4 py-6 text-sm text-gray-400 text-center">No upcoming events.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center mt-5">
              <Link
                to="/schedule"
                className="inline-flex items-center gap-1.5 text-edina-green font-medium text-sm hover:underline"
              >
                Full Schedule
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Results & Leaderboards - 2x2 Grid (toggles based on season data) */}
      <section className="page-container">
        {hasSeason2026Results ? (
          /* Live-season layout: results + leaderboards */
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Top Left - Recent Varsity Results */}
            <div className="card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2026 Varsity Results</h2>
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
                        <div className="text-sm font-semibold text-edina-green">{result.dateFormatted}</div>
                      </div>
                      <div className="ml-3 flex-grow min-w-0">
                        <div className="font-semibold text-gray-900 text-base truncate">{result.event || result.name}</div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className={`font-bold text-base ${
                          String(result.teamScore || '').includes('(-') ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {result.teamScore}
                        </div>
                        {result.teamFinish && (
                          <div className={`text-sm font-semibold ${
                            result.teamFinish?.startsWith('1st') ? 'text-edina-gold-dark' : 'text-gray-500'
                          }`}>
                            {result.teamFinish}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">Season results post after April 20 at Chaska Town Course.</div>
                )}
              </div>
            </div>

            {/* Top Right - Recent JV Results */}
            <div className="card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2026 JV Results</h2>
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
                        <div className="text-sm font-semibold text-edina-green">{result.dateFormatted}</div>
                      </div>
                      <div className="ml-3 flex-grow min-w-0">
                        <div className="font-semibold text-gray-900 text-base truncate">{result.event || result.name}</div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        {result.format === 'matchplay' ? (
                          <>
                            <div className={`font-bold text-base ${
                              result.teamResult?.toLowerCase() === 'win' ? 'text-green-700' :
                              result.teamResult?.toLowerCase() === 'loss' ? 'text-red-600' : 'text-gray-700'
                            }`}>
                              {result.teamResult}
                            </div>
                            {result.teamRecord && (
                              <div className="text-sm text-gray-600">{result.teamRecord}</div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className={`font-bold text-base ${
                              String(result.teamScore || '').includes('(-') ? 'text-red-600' : 'text-gray-700'
                            }`}>
                              {result.teamScore}
                            </div>
                            {result.teamFinish && (
                              <div className={`text-sm font-semibold ${
                                result.teamFinish?.startsWith('1st') ? 'text-edina-gold-dark' : 'text-gray-500'
                              }`}>
                                {result.teamFinish}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">Season results post after April 20 at Chaska Town Course.</div>
                )}
              </div>
            </div>

            {/* Bottom Left - Varsity Leaderboard */}
            <div className="card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2026 Varsity Leaderboard</h2>
                <Link to="/stats" className="text-edina-green font-medium text-sm hover:underline">
                  Full Stats
                </Link>
              </div>
              <div className="space-y-2">
                {varsityPlayers.length > 0 ? (
                  varsityPlayers.map((player, index) => (
                    <div key={index} className="flex items-center p-2 md:p-3 bg-gray-50 rounded-lg">
                      <div className="flex-grow">
                        <div className="font-semibold text-gray-900 text-sm md:text-base">{player.name}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-edina-green text-base md:text-lg">{player.average?.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">avg</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">First tee 4/20 at Chaska Town Course — leaderboard lights up after Round 1.</div>
                )}
              </div>
            </div>

            {/* Bottom Right - JV Leaderboard */}
            <div className="card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2026 JV Leaderboard</h2>
                <Link to="/stats" className="text-edina-green font-medium text-sm hover:underline">
                  Full Stats
                </Link>
              </div>
              <div className="space-y-2">
                {jvPlayers.length > 0 ? (
                  jvPlayers.map((player, index) => (
                    <div key={index} className="flex items-center p-2 md:p-3 bg-gray-50 rounded-lg">
                      <div className="flex-grow">
                        <div className="font-semibold text-gray-900 text-sm md:text-base">{player.name}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-edina-green text-base md:text-lg">{player.average?.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">avg</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">First tee 4/20 at Chaska Town Course — leaderboard lights up after Round 1.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Pre-season / no-results layout: season kickoff module */
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-edina-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-edina-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Season Kicks Off Apr 20</h3>
            <p className="text-gray-600">Results and leaderboards update automatically after each event. Check back after the Lake Conference Tournament #1 at Chaska Town Course.</p>
            <a href="/schedule" className="inline-flex items-center gap-1 text-edina-green font-semibold hover:underline mt-4">
              View Full Schedule →
            </a>
          </div>
        )}
      </section>

      {/* From the Fairway - News & Recaps */}
      <section className="bg-edina-green/5 border-y border-edina-green/20 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>From the Fairway</h2>
            <Link to="/recaps" className="text-sm font-medium text-edina-green hover:underline">All articles →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[...recapsData.recaps]
              .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
              .slice(0, 2)
              .map((recap) => (
                <Link
                  key={recap.id}
                  to="/recaps"
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="bg-edina-forest px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-edina-gold uppercase tracking-widest">The Hornet Fairway</span>
                      <span className="text-green-300 text-xs">·</span>
                      <span className="text-xs text-green-200">{recap.weekOf}</span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{recap.title}</h3>
                  </div>
                  <div className="p-5 flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-3">{recap.varsityBody.split('\n\n')[0]}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-edina-green font-medium mt-4">
                      Read more
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>



      {/* Team Culture Collage */}
      <section className="py-12 md:py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            More Than A Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden">
              <img src="/images/unnamed.webp" alt="Team photo" className="w-full h-full img-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-lg font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>BROTHERHOOD</p>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-square">
              <img src="/images/Web%206.webp" alt="Team dinner" className="w-full h-full img-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-square">
              <img src="/images/Web%209.webp" alt="Sunset" className="w-full h-full img-cover-top" />
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-square">
              <img src="/images/IMG_6742.webp" alt="Team by water" className="w-full h-full img-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-square">
              <img src="/images/Web%207.webp" alt="Team at course" className="w-full h-full img-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Action Photo Strip */}
      <section className="py-8 bg-white overflow-hidden">
        <div className="flex gap-4 animate-none">
          <div className="flex gap-4 min-w-full justify-center">
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img src="/images/IMG_9149.webp" alt="Action shot" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img src="/images/IMG_9152.webp" alt="Bunker shot" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
              <img src="/images/Web%2010.webp" alt="Medal winners" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative w-72 h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0 hidden md:block">
              <img src="/images/IMG_8248.webp" alt="On the course" className="w-full h-full img-cover-top hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
