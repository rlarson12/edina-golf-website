import { useState, useMemo } from 'react'
import golfData from '../data/golfData.json'

function Stats() {
  const [activeTab, setActiveTab] = useState('matrix')
  const [teamFilter, setTeamFilter] = useState('all')

  // Get event headers from heatmap data
  const allEventHeaders = golfData.heatmap.eventHeaders || []

  // Build a list of JV event names from the actual jvEvents data
  const jvEventNames = useMemo(() => {
    return golfData.jvEvents?.map(e => e.name.toLowerCase()) || []
  }, [])

  // Check if an event name matches any JV event (exact or partial match)
  const isJVEvent = (eventName) => {
    const nameLower = eventName.toLowerCase()
    // Exact match or partial match (e.g., "holy family jv" matches "holy family jv event a")
    return jvEventNames.some(jvName =>
      jvName === nameLower || jvName.startsWith(nameLower) || nameLower.startsWith(jvName)
    )
  }

  // Build a map of event names to par and holes (needed for weighted average calc)
  const eventInfoMap = useMemo(() => {
    const map = {}
    const allEvents = [...(golfData.events || []), ...(golfData.jvEvents || [])]
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

  // Calculate weighted 18-hole average: (total strokes Ã· total holes) Ã 18
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
      // Extract event name from header (e.g., "05/08 - Duel vs Southwest Christian" -> "duel vs southwest christian")
      const eventName = header.replace(/^\d{2}\/\d{2} - /, '')
      // Check if this event is in the JV events list
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
    return golfData.heatmap.playerScores
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

  // Filter by team
  const filteredPlayers = useMemo(() => {
    if (teamFilter === 'all') return playerData

    const teamPlayers = golfData.players
      .filter(p => p.team === teamFilter)
      .map(p => p.name)

    return playerData.filter(p => teamPlayers.includes(p.name))
  }, [playerData, teamFilter])

  // Calculate scoring round players per event for highlighting
  // Holy Family JV has top 8 (2 teams), all others have top 4
  // Ties at the cutoff position are included
  const scoringPlayersPerEvent = useMemo(() => {
    const result = []
    for (let i = 0; i < eventIndices.length; i++) {
      const originalIndex = eventIndices[i]
      const eventHeader = allEventHeaders[originalIndex] || ''
      const isHolyFamilyJV = eventHeader.toLowerCase().includes('holy family jv')
      const scoringCount = isHolyFamilyJV ? 8 : 4

      const scoresForEvent = filteredPlayers
        .map(p => ({ name: p.name, score: p.scores[originalIndex] }))
        .filter(s => s.score !== null && s.score > 30) // Allow 9-hole scores (>30)
        .sort((a, b) => a.score - b.score)

      // Get the cutoff score (the score at position scoringCount-1)
      const cutoffScore = scoresForEvent[scoringCount - 1]?.score

      // Include all players with score <= cutoff (handles ties)
      const scoringPlayers = scoresForEvent
        .filter(s => cutoffScore && s.score <= cutoffScore)
        .map(s => s.name)

      result.push(scoringPlayers)
    }
    return result
  }, [filteredPlayers, eventIndices, allEventHeaders])

  // Get event info (par and holes) from actual course data
  const getEventInfo = (eventHeader) => {
    // Extract event name from header (e.g., "05/12 - Oak Ridge Day 1" â "Oak Ridge Day 1")
    const eventName = eventHeader?.replace(/^\d{2}\/\d{2} - /, '') || ''
    const eventNameLower = eventName.toLowerCase()

    // Try exact match first
    if (eventInfoMap[eventNameLower]) return eventInfoMap[eventNameLower]

    // Try partial match (e.g., "Holy Family JV" matches "Holy Family JV Event A")
    const matchingKey = Object.keys(eventInfoMap).find(key =>
      key.startsWith(eventNameLower) || eventNameLower.startsWith(key)
    )
    return matchingKey ? eventInfoMap[matchingKey] : { par: 72, holes: 18 }
  }

  // Season results for team view
  const seasonResults = golfData.seasonResults || []

  // Season records
  const seasonRecords = useMemo(() => {
    const teamScores = seasonResults
      .filter(r => r.teamScore)
      .map(r => {
        const match = r.teamScore.match(/(\d+)/)
        return match ? parseInt(match[1]) : null
      })
      .filter(s => s !== null)

    const avgTeamScore = teamScores.length > 0
      ? Math.round(teamScores.reduce((a, b) => a + b, 0) / teamScores.length)
      : '-'

    const lowTeamScore = teamScores.length > 0 ? Math.min(...teamScores) : '-'

    const wins = seasonResults.filter(r =>
      r.finish && (r.finish.startsWith('1st') || r.finish.toLowerCase().includes('win'))
    ).length

    return [
      { label: 'Team Scoring Avg', value: avgTeamScore },
      { label: 'Low Team Round', value: lowTeamScore },
      { label: 'Tournament Wins', value: wins },
      { label: 'Events Played', value: seasonResults.length },
    ]
  }, [seasonResults])

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-72 md:h-80 overflow-hidden">
        <img
          src="/images/Web 3.jpg"
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
            <p className="text-green-200 text-lg">2025 Season Performance</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Season Records - Floating Cards */}
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
        {activeTab === 'matrix' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-4 h-4 bg-edina-green/20 rounded"></span>
            <span>Scoring Round</span>
          </div>
        )}

        {activeTab !== 'team' && (
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
                    // Change "Final" to "Day 2" for two-day events
                    fullName = fullName.replace(/\bFinal\b/gi, 'Day 2')
                    return (
                      <th
                        key={i}
                        className="h-32 md:h-40 w-9 md:w-10 px-1 py-1 pb-3 align-bottom"
                        title={fullName}
                      >
                        <div
                          className="flex justify-center"
                        >
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
                {filteredPlayers.map((player, playerIdx) => (
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
                {filteredPlayers.map((player, idx) => {
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
                {seasonResults.map((result, index) => (
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
                ))}
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
      </div>
    </div>
  )
}

export default Stats
