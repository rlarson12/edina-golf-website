import { useState, useMemo } from 'react'
import golfData from '../data/golfData.json'

function Roster() {
  const [filter, setFilter] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // Use player data from JSON
  const players = golfData.players || []
  const allEventHeaders = golfData.heatmap?.eventHeaders || []

  // Build event info map for holes lookup
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

  // Calculate weighted averages for all players: (total strokes ÷ total holes) × 18
  const playerAveragesMap = useMemo(() => {
    const map = {}
    golfData.heatmap?.playerScores?.forEach(player => {
      let totalStrokes = 0
      let totalHoles = 0

      player.scores.forEach((score, idx) => {
        if (score !== null && score > 0) {
          const eventHeader = allEventHeaders[idx] || ''
          const holes = getEventHoles(eventHeader)
          totalStrokes += score
          totalHoles += holes
        }
      })

      if (totalHoles > 0) {
        map[player.name] = (totalStrokes / totalHoles) * 18
      }
    })
    return map
  }, [eventInfoMap, allEventHeaders])

  const filteredPlayers = useMemo(() => {
    if (filter === 'all') return players
    return players.filter(player => player.team === filter)
  }, [players, filter])

  const getGradeLabel = (grade) => {
    switch (grade) {
      case 9: return 'Freshman'
      case 10: return 'Sophomore'
      case 11: return 'Junior'
      case 12: return 'Senior'
      default: return ''
    }
  }

  const getTeamBadge = (team) => {
    switch (team) {
      case 'varsity':
        return 'bg-edina-green text-white'
      case 'jv':
        return 'bg-blue-100 text-blue-800'
      case 'development':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const teamCounts = useMemo(() => ({
    all: players.length,
    varsity: players.filter(p => p.team === 'varsity').length,
    jv: players.filter(p => p.team === 'jv').length,
    development: players.filter(p => p.team === 'development').length,
  }), [players])

  // Get player scores from heatmap data
  const getPlayerScores = (playerName) => {
    const playerData = golfData.heatmap?.playerScores?.find(p => p.name === playerName)
    const eventHeaders = golfData.heatmap?.eventHeaders || []

    if (!playerData) return []

    return playerData.scores
      .map((score, idx) => {
        const header = eventHeaders[idx] || ''
        // Extract date (e.g., "04/22" from "04/22 - Lake Conference Opener")
        const dateMatch = header.match(/^(\d{2})\/(\d{2})/)
        const dateFormatted = dateMatch ?
          `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dateMatch[1], 10) - 1]} ${parseInt(dateMatch[2], 10)}` : ''

        // Extract event name
        const eventName = header.replace(/^\d{2}\/\d{2} - /, '') || `Event ${idx + 1}`
        const eventNameLower = eventName.toLowerCase()

        // Find event info - try exact match first, then partial match
        let eventInfo = eventInfoMap[eventNameLower]
        if (!eventInfo) {
          // Try partial match (e.g., "Holy Family JV" matches "Holy Family JV Event A")
          const matchingKey = Object.keys(eventInfoMap).find(key =>
            key.startsWith(eventNameLower) || eventNameLower.startsWith(key)
          )
          eventInfo = matchingKey ? eventInfoMap[matchingKey] : { par: 72, holes: 18 }
        }

        const par = eventInfo.par
        const holes = eventInfo.holes

        return {
          date: dateFormatted,
          event: eventName,
          score: score,
          par: par,
          holes: holes,
          toPar: (score && par) ? score - par : null
        }
      })
      .filter(s => s.score !== null)
  }

  // Calculate weighted 18-hole average from scores
  const getWeightedAverage = (scores) => {
    if (!scores || scores.length === 0) return null

    let totalStrokes = 0
    let totalHoles = 0

    scores.forEach(s => {
      if (s.score && s.holes) {
        totalStrokes += s.score
        totalHoles += s.holes
      }
    })

    if (totalHoles === 0) return null

    // Convert to 18-hole equivalent
    const strokesPerHole = totalStrokes / totalHoles
    return strokesPerHole * 18
  }

  // Class breakdown
  const classBreakdown = useMemo(() => {
    const counts = { 12: 0, 11: 0, 10: 0, 9: 0 }
    players.forEach(p => {
      if (p.grade && counts[p.grade] !== undefined) {
        counts[p.grade]++
      }
    })
    return counts
  }, [players])

  return (
    <div>
      {/* Hero Section with Team Photo */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        <img
          src="/images/unnamed.png"
          alt="Edina Boys Golf Team"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 70%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
              2025 ROSTER
            </h1>
            <p className="text-green-200 text-lg">{players.length} Players • Varsity & JV</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* 2026 Tryouts Banner */}
        <div className="bg-edina-green/10 border border-edina-green/30 rounded-xl p-5 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-edina-green text-white">
                2026 TRYOUTS
              </span>
            </div>
            <div className="flex-grow">
              <p className="text-gray-900 font-medium">
                April 6-9 at Braemar Golf Course. Registration required.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                The 2026 roster (10 Varsity, 10 JV) will be announced April 10th.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="https://edinaathletics.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-edina-green text-white font-medium rounded-lg hover:bg-edina-green-dark transition-colors"
              >
                Register Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'All' },
          { value: 'varsity', label: 'Varsity' },
          { value: 'jv', label: 'JV' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === option.value
                ? 'bg-edina-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label} ({teamCounts[option.value]})
          </button>
        ))}
      </div>

      {/* Roster Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlayers.map((player, index) => {
          const weightedAvg = playerAveragesMap[player.name]

          return (
            <button
              key={index}
              onClick={() => setSelectedPlayer(player)}
              className="card p-5 hover:shadow-lg transition-shadow text-left w-full"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-edina-green/20 to-edina-green/10 rounded-full flex items-center justify-center border-2 border-edina-green/30">
                  <span className="text-xl font-bold text-edina-green">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {getGradeLabel(player.grade)} • Class of {player.gradYear}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTeamBadge(player.team)}`}>
                      {player.team === 'jv' ? 'JV' : player.team.charAt(0).toUpperCase() + player.team.slice(1)}
                    </span>
                    {weightedAvg && (
                      <span className="text-xs text-gray-500">
                        Avg: <span className="font-medium text-gray-700">{weightedAvg.toFixed(1)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Team Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-edina-green">{teamCounts.varsity}</div>
          <div className="text-sm text-gray-600">Varsity</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{teamCounts.jv}</div>
          <div className="text-sm text-gray-600">Junior Varsity</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{classBreakdown[12]}</div>
          <div className="text-sm text-gray-600">Seniors</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{classBreakdown[11] + classBreakdown[10] + classBreakdown[9]}</div>
          <div className="text-sm text-gray-600">Underclassmen</div>
        </div>
      </div>

      {/* Class Breakdown */}
      <div className="mt-6 card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Class Breakdown</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{classBreakdown[12]}</div>
            <div className="text-xs text-gray-500">Seniors</div>
            <div className="text-xs text-gray-400">Class of 2025</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{classBreakdown[11]}</div>
            <div className="text-xs text-gray-500">Juniors</div>
            <div className="text-xs text-gray-400">Class of 2026</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{classBreakdown[10]}</div>
            <div className="text-xs text-gray-500">Sophomores</div>
            <div className="text-xs text-gray-400">Class of 2027</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{classBreakdown[9]}</div>
            <div className="text-xs text-gray-500">Freshmen</div>
            <div className="text-xs text-gray-400">Class of 2028</div>
          </div>
        </div>
      </div>
      </div>

      {/* Action Photos Strip */}
      <div className="bg-edina-green py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src="/images/IMG_9149.jpeg" alt="Action shot" className="w-full h-full img-cover-top" />
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src="/images/IMG_9152.jpeg" alt="Bunker shot" className="w-full h-full img-cover-top" />
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src="/images/IMG_8248.jpeg" alt="On course" className="w-full h-full img-cover-top" />
            </div>
          </div>
        </div>
      </div>

      {/* Player Stats Modal */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-edina-green p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
                    <p className="text-green-100 text-sm">
                      {getGradeLabel(selectedPlayer.grade)} • {selectedPlayer.team === 'jv' ? 'JV' : 'Varsity'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            {(() => {
              const scores = getPlayerScores(selectedPlayer.name)
              const weightedAvg = getWeightedAverage(scores)
              const validScores = scores.map(s => s.score).filter(s => s > 30)
              const lowRound = validScores.length > 0 ? Math.min(...validScores) : '-'

              return (
                <>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-edina-green">
                        {weightedAvg?.toFixed(1) || '-'}
                      </div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{lowRound}</div>
                      <div className="text-xs text-gray-500">Low Round</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{validScores.length}</div>
                      <div className="text-xs text-gray-500">Rounds</div>
                    </div>
                  </div>

                  {/* Score History */}
                  <div className="p-4 overflow-y-auto max-h-[40vh]">
                    <h3 className="font-semibold text-gray-900 mb-3">Score History</h3>
                    {scores.length > 0 ? (
                      <div className="space-y-2">
                        {scores.map((s, idx) => {
                          const toParStr = s.toPar === 0 ? 'E' :
                            s.toPar > 0 ? `+${s.toPar}` : `${s.toPar}`
                          const isUnderPar = s.toPar < 0

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-grow min-w-0 mr-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-edina-green whitespace-nowrap">{s.date}</span>
                                  <span className="text-sm text-gray-700 truncate">{s.event}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`font-bold text-lg ${isUnderPar ? 'text-red-600' : 'text-gray-900'}`}>
                                  {s.score}
                                </span>
                                <span className={`text-sm font-medium ${isUnderPar ? 'text-red-600' : 'text-gray-500'}`}>
                                  ({toParStr})
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No scores recorded yet.</p>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default Roster
