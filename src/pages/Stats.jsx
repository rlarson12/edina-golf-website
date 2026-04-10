import { useState, useMemo } from 'react'
import golfData from '../data/golfData.json'

function Stats() {
  const [activeTab, setActiveTab] = useState('matrix')
  const [teamFilter, setTeamFilter] = useState('all')
  const [showArchive, setShowArchive] = useState(false)

  // 2026 season data
  const seasonResults2026 = golfData.seasonResults2026 || []
  const hasSeason2026Results = seasonResults2026.length > 0

  // 2025 archive data
  const seasonResults2025 = golfData.seasonResults || []

  // Use 2026 heatmap when season is live, fall back to 2025 for archive
  const activeHeatmap = (hasSeason2026Results && !showArchive)
    ? (golfData.heatmap2026 || golfData.heatmap)
    : golfData.heatmap

  // Get event headers from active heatmap data
  const allEventHeaders = activeHeatmap?.eventHeaders || []

  // Build a list of JV event names from the actual jvEvents data
  const jvEventNames = useMemo(() => {
    const events = (hasSeason2026Results && !showArchive)
      ? (golfData.jvEvents2026 || golfData.jvEvents || [])
      : (golfData.jvEvents || [])
    return events.map(e => e.name.toLowerCase())
  }, [hasSeason2026Results, showArchive])

  // Check if an event name matches any JV event (exact or partial match)
  const isJVEvent = (eventName) => {
    const nameLower = eventName.toLowerCase()
    return jvEventNames.some(jvName =>
      jvName === nameLower || jvName.startsWith(nameLower) || nameLower.startsWith(jvName)
    )
  }

  // Build a map of event names to par and holes (needed for weighted average calc)
  const eventInfoMap = useMemo(() => {
    const map = {}
    const allEvents = (hasSeason2026Results && !showArchive)
      ? [...(golfData.events2026 || []), ...(golfData.jvEvents2026 || [])]
      : [...(golfData.events || []), ...(golfData.jvEvents || [])]
    allEvents.forEach(event => {
      if (event.name) {
        map[event.name.toLowerCase()] = {
          par: event.par || 72,
          holes: event.holes || 18
        }
      }
    })
    return map
  }, [])

  // Get holes for an event header
  const getEventHoles = (eventHeader) => {
    const eventName = eventHeader?.replace(/^\d{2}\/\d{2} - /, '') || ''
    const eventNameLower = eventName.toLowerCase()

    if (eventInfoMap[eventNameLower]) return eventInfoMap[eventNameLower].holes

    const matchingKey = Object.keys(eventInfoMap).find(key =>
      key.startsWith(eventNameLower) || eventNameLower.startsWith(key)
    )
    return matchingKey ? eventInfoMap[matchingKey].holes : 18
  }

  // Calculate weighted 18-hole average: (total strokes ÷ total holes) × 18
  const calculateWeightedAverage = (scores) => {
    let totalStrokes = 0
    let totalHoles = 0

    scores.forEach((score, idx) => {
      if (score !== null && score > 0) {
        const eventHeader = allEventHeaders[idx] || ''
        const holes = getEventHoles(eventHeader)
        totalStrokes += score
        totalHoles += holes
      }
    })

    if (totalHoles === 0) return null
    return (totalStrokes / totalHoles) * 18
  }

  // Filter event headers based on team filter
  const { eventHeaders, eventIndices } = useMemo(() => {
    if (teamFilter === 'all') {
      return {
        eventHeaders: allEventHeaders,
        eventIndices: allEventHeaders.map((_, i) => i)
      }
    }

    const isJV = teamFilter === 'jv'
    const filtered = []
    const indices = []

    allEventHeaders.forEach((header, index) => {
      const eventName = header.replace(/^\d{2}\/\d{2} - /, '')
      const headerIsJV = isJVEvent(eventName)
      if (isJV === headerIsJV) {
        filtered.push(header)
        indices.push(index)
      }
    })

    return { eventHeaders: filtered, eventIndices: indices }
  }, [allEventHeaders, teamFilter, jvEventNames])

  // Process player scores with dynamically calculated weighted averages
  const playerData = useMemo(() => {
    return (activeHeatmap?.playerScores || [])
      .map(p => ({
        ...p,
        average: calculateWeightedAverage(p.scores),
      }))
      .filter(p => p.average !== null)
      .sort((a, b) => {
        const roundA = Math.round(a.average * 10)
        const roundB = Math.round(b.average * 10)
        if (roundA !== roundB) return roundA - roundB
        const rankingsOrder = (golfData.rankings || []).map(r => r.name)
        const idxA = rankingsOrder.indexOf(a.name)
        const idxB = rankingsOrder.indexOf(b.name)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        return a.average - b.average
      })
  }, [eventInfoMap])

  // Filter by team — in archive/2025 mode use players (2025 data),
  // in live 2026 mode use players2026
  const filteredPlayers = useMemo(() => {
    if (teamFilter === 'all') return playerData

    const sourceList = (hasSeason2026Results && !showArchive)
      ? (golfData.players2026 || [])
      : (golfData.players || [])

    const teamPlayers = sourceList
      .filter(p => p.team === teamFilter)
      .map(p => p.name)

    return playerData.filter(p => teamPlayers.includes(p.name))
  }, [playerData, teamFilter, showArchive, hasSeason2026Results])

  // Calculate scoring round players per event for highlighting
  const scoringPlayersPerEvent = useMemo(() => {
    const result = []
    for (let i = 0; i < eventIndices.length; i++) {
      const originalIndex = eventIndices[i]
      const eventHeader = allEventHeaders[originalIndex] || ''
      const isHolyFamilyJV = eventHeader.toLowerCase().includes('holy family jv')
      const scoringCount = isHolyFamilyJV ? 8 : 4

      const scoresForEvent = filteredPlayers
        .map(p => ({ name: p.name, score: p.scores[originalIndex] }))
        .filter(s => s.score !== null && s.score > 30)
        .sort((a, b) => a.score - b.score)

      const cutoffScore = scoresForEvent[scoringCount - 1]?.score

      const scoringPlayers = scoresForEvent
        .filter(s => cutoffScore && s.score <= cutoffScore)
        .map(s => s.name)

      result.push(scoringPlayers)
    }
    return result
  }, [filteredPlayers, eventIndices, allEventHeaders])

  // Get event info (par and holes) from actual course data
  const getEventInfo = (eventHeader) => {
    const eventName = eventHeader?.replace(/^\d{2}\/\d{2} - /, '') || ''
    const eventNameLower = eventName.toLowerCase()

    if (eventInfoMap[eventNameLower]) return eventInfoMap[eventNameLower]

    const matchingKey = Object.keys(eventInfoMap).find(key =>
      key.startsWith(eventNameLower) || eventNameLower.startsWith(key)
    )
    return matchingKey ? eventInfoMap[matchingKey] : { par: 72, holes: 18 }
  }

  // Season records — always show 2026 data (zeros pre-season)
  const seasonRecords = useMemo(() => {
    const results = seasonResults2026

    const teamScores = results
      .filter(r => r.teamScore)
      .map(r => {
        const match = r.teamScore.match(/(\d+)/)
        return match ? parseInt(match[1]) : null
      })
      .filter(s => s !== null)

    const avgTeamScore = teamScores.length > 0
      ? Math.round(teamScores.reduce((a, b) => a + b, 0) / teamScores.length)
      : 0

    const lowTeamScore = teamScores.length > 0 ? Math.min(...teamScores) : 0

    const wins = results.filter(r =>
      r.finish && (r.finish.startsWith('1st') || r.finish.toLowerCase().includes('win'))
    ).length

    return [
      { label: 'Team Scoring Avg', value: avgTeamScore },
      { label: 'Low Team Round', value: lowTeamScore },
      { label: 'Tournament Wins', value: wins },
      { label: 'Events Played', value: results.length },
    ]
  }, [])

  // Which season results to show in Team Results tab
  const activeSeasonResults = showArchive ? seasonResults2025 : seasonResults2026

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-72 md:h-80 overflow-hidden">
        <img
          src="/images/Web%203.jpg"
          alt="Team photo"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-edina-green/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
              STATS & LEADERBOARD
            </h1>
            <p className="text-green-200 text-lg">2026 Season Performance</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Season Records - Floating Cards (always 2026 data) */}
        <div className="relative -mt-12 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seasonRecords.map((record) => (
              <div key={record.label} className="card p-5 md:p-6 text-center bg-white shadow-lg">
                <div className="text-2xl md:text-3xl font-bold text-edina-green">{record.value}</div>
                <div className="text-sm text-gray-600 mt-1">{record.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Score Matrix
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'team'
                  ? 'bg-white text-edina-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Team Results
            </button>
          </div>

          {/* Legend for scoring round */}
          {activeTab === 'matrix' && (showArchive || hasSeason2026Results) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-4 h-4 bg-edina-green/20 rounded"></span>
              <span>Scoring Round</span>
            </div>
          )}

          {activeTab !== 'team' && (showArchive || hasSeason2026Results) && (
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg ml-auto">
              {[
                { value: 'all', label: 'All' },
                { value: 'varsity', label: 'Varsity' },
                { value: 'jv', label: 'JV' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTeamFilter(option.value)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    teamFilter === option.value
                      ? 'bg-white text-edina-green shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── PRE-SEASON STATE ── */}
        {!hasSeason2026Results && !showArchive ? (
          <div className="card p-10 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-edina-green/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Season not started</h2>
            <p className="text-gray-600 mb-6">
              The 2026 season begins <span className="font-semibold text-edina-green">April 20</span> at Chaska Town Course.
            </p>
            <button
              onClick={() => setShowArchive(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-edina-green text-white font-medium rounded-lg hover:bg-edina-green-dark transition-colors"
            >
              View 2025 Stats
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            {/* ── 2025 ARCHIVE BANNER ── */}
            {showArchive && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6">
                <span className="text-amber-800 font-medium text-sm">
                  📂 Showing 2025 Season
                </span>
                <button
                  onClick={() => setShowArchive(false)}
                  className="text-sm font-medium text-edina-green hover:underline"
                >
                  ← Back to 2026
                </button>
              </div>
            )}

            {/* Score Matrix */}
            {activeTab === 'matrix' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="sticky left-0 bg-gray-50 px-2 pt-2 pb-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider z-10 w-24 md:w-32 align-bottom">
                          Player
                        </th>
                        <th className="px-2 pt-2 pb-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-12 align-bottom">
                          Avg
                        </th>
                        {eventHeaders.map((event, i) => {
                          let fullName = event.replace(/^\d{2}\/\d{2} - /, '')
                          fullName = fullName.replace(/\bFinal\b/gi, 'Day 2')
                          return (
                            <th
                              key={i}
                              className="h-32 md:h-40 w-9 md:w-10 px-1 py-1 pb-3 align-bottom"
                              title={fullName}
                            >
                              <div className="flex justify-center">
                                <div
                                  className="whitespace-nowrap text-xs md:text-sm font-semibold text-gray-600"
                                  style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                  }}
                                >
                                  {fullName}
                                </div>
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPlayers.map((player) => (
                        <tr key={player.name} className="hover:bg-gray-50 transition-colors">
                          <td className="sticky left-0 bg-white px-2 py-2 font-medium text-gray-900 z-10 text-xs md:text-sm w-24 md:w-32 truncate">
                            {player.name}
                          </td>
                          <td className="px-2 py-2 text-center font-semibold text-gray-900 whitespace-nowrap text-sm w-12">
                            {player.average?.toFixed(1)}
                          </td>
                          {eventIndices.map((originalIdx, i) => {
                            const score = player.scores[originalIdx]
                            const isScoring = score && scoringPlayersPerEvent[i]?.includes(player.name)
                            const eventInfo = getEventInfo(eventHeaders[i])
                            const isUnderPar = score && eventInfo.par && score < eventInfo.par

                            return (
                              <td
                                key={originalIdx}
                                className={`px-1 py-2 text-center whitespace-nowrap w-9 md:w-10 text-xs md:text-sm ${
                                  isScoring ? 'bg-edina-green/20' : ''
                                }`}
                              >
                                {score !== null ? (
                                  <span className={`font-medium ${isUnderPar ? 'text-red-600' : 'text-gray-700'}`}>
                                    {score}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Player</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Low</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Rounds</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Last 3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPlayers.map((player) => {
                        const validScores = player.scores.filter(s => s !== null && s > 50)
                        const lowRound = validScores.length > 0 ? Math.min(...validScores) : '-'

                        return (
                          <tr key={player.name} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-900">{player.name}</td>
                            <td className="px-4 py-4 text-center font-semibold text-gray-900">{player.average?.toFixed(1)}</td>
                            <td className="px-4 py-4 text-center">
                              <span className={`font-medium ${lowRound < 72 ? 'text-red-600' : 'text-edina-green'}`}>
                                {lowRound}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center text-gray-600">{validScores.length}</td>
                            <td className="px-4 py-4 text-center text-gray-600 hidden sm:table-cell">
                              {player.last3Avg?.toFixed(1) || '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Team Results Table */}
            {activeTab === 'team' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Course</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Finish</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeSeasonResults.length > 0 ? (
                        activeSeasonResults.map((result, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{result.dateFormatted}</td>
                            <td className="px-4 py-4 font-medium text-gray-900">{result.event}</td>
                            <td className="px-4 py-4 text-gray-600 hidden sm:table-cell">{result.course}</td>
                            <td className="px-4 py-4 text-center">
                              <span className={`font-semibold ${
                                result.teamScore?.includes('-') ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {result.teamScore || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                result.finish?.startsWith('1st') ? 'bg-edina-gold/20 text-edina-gold-dark border border-edina-gold' :
                                result.finish?.startsWith('2nd') ? 'bg-gray-200 text-gray-800' :
                                result.finish?.startsWith('3rd') ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-50 text-gray-600'
                              }`}>
                                {result.finish || '-'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No results yet. Season starts April 20.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-edina-green/20 rounded"></span>
                  <span>Scoring Round</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-medium">69</span>
                  <span>Under Par</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">-</span>
                  <span>Did Not Play</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Stats
