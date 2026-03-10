import { useState, useMemo } from 'react'
import golfData from '../data/golfData.json'

function Roster() {
  const [filter, setFilter] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // 2026 season transition logic
  const players2026 = golfData.players2026 || []
  const isPreSeason = players2026.length === 0

  // Use 2026 players if available, fall back to 2025 for archive display
  const players = isPreSeason ? (golfData.players || []) : players2026

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

  // Calculate weighted averages for all players (2025 heatmap data)
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

  // Generate 20 placeholder cards for pre-season: 10 Varsity + 10 JV
  const placeholderPlayers = useMemo(() => {
    const cards = []
    for (let i = 0; i < 10; i++) {
      cards.push({ id: `varsity-${i}`, team: 'varsity' })
    }
    for (let i = 0; i < 10; i++) {
      cards.push({ id: `jv-${i}`, team: 'jv' })
    }
    return cards
  }, [])

  const filteredPlaceholders = useMemo(() => {
    if (filter === 'all') return placeholderPlayers
    return placeholderPlayers.filter(p => p.team === filter)
  }, [placeholderPlayers, filter])

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

  // Filter button counts
  const filterCounts = useMemo(() => {
    if (isPreSeason) {
      return { all: 20, varsity: 10, jv: 10 }
    }
    return {
      all: players.length,
      varsity: players.filter(p => p.team === 'varsity').length,
      jv: players.filter(p => p.team === 'jv').length,
    }
  }, [isPreSeason, players])

  // Format MM/DD date string to readable format
  const formatHeatmapDate = (header) => {
    const dateMatch = header.match(/^(\d{2})\/(\d{2})/)
    if (!dateMatch) return ''
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(dateMatch[1], 10) - 1]} ${parseInt(dateMatch[2], 10)}`
  }

  // Look up event info (par, holes) by event name
  const lookupEventInfo = (eventName) => {
    const eventNameLower = eventName.toLowerCase()
    let eventInfo = eventInfoMap[eventNameLower]
    if (!eventInfo) {
      const matchingKey = Object.keys(eventInfoMap).find(key =>
        key.startsWith(eventNameLower) || eventNameLower.startsWith(key)
      )
      eventInfo = matchingKey ? eventInfoMap[matchingKey] : { par: 72, holes: 18 }
    }
    return eventInfo
  }

  // Get player scores from heatmap data, combining multi-round events
  const getPlayerScores = (playerName) => {
    const playerData = golfData.heatmap?.playerScores?.find(p => p.name === playerName)
    const eventHeaders = golfData.heatmap?.eventHeaders || []

    if (!playerData) return []

    const rawScores = playerData.scores.map((score, idx) => {
      const header = eventHeaders[idx] || ''
      const eventName = header.replace(/^\d{2}\/\d{2} - /, '') || `Event ${idx + 1}`
      const eventInfo = lookupEventInfo(eventName)
      return {
        idx,
        date: formatHeatmapDate(header),
        event: eventName,
        score,
        par: eventInfo.par,
        holes: eventInfo.holes,
        toPar: (score && eventInfo.par) ? score - eventInfo.par : null
      }
    })

    const combined = []
    const consumed = new Set()

    for (let i = 0; i < rawScores.length; i++) {
      if (consumed.has(i)) continue
      const s = rawScores[i]

      if (s.event.endsWith('Day 1')) {
        const baseName = s.event.replace(/ Day 1$/, '')
        const finalIdx = rawScores.findIndex((f, j) =>
          j > i && !consumed.has(j) && f.event === `${baseName} Final`
        )

        if (finalIdx !== -1) {
          const f = rawScores[finalIdx]
          consumed.add(finalIdx)

          const r1 = s.score
          const r2 = f.score
          const hasR1 = r1 !== null
          const hasR2 = r2 !== null

          if (!hasR1 && !hasR2) continue

          const totalScore = (hasR1 ? r1 : 0) + (hasR2 ? r2 : 0)
          const totalPar = (s.par || 0) + (f.par || 0)
          const totalHoles = (s.holes || 0) + (f.holes || 0)

          combined.push({
            date: `${s.date}`,
            event: baseName,
            score: totalScore,
            rounds: [r1, r2],
            roundPars: [s.par, f.par],
            par: totalPar,
            holes: totalHoles,
            toPar: totalPar ? totalScore - totalPar : null,
            isMultiRound: true
          })
          continue
        }
      }

      if (s.score !== null) {
        combined.push(s)
      }
    }

    return combined.reverse()
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

    const strokesPerHole = totalStrokes / totalHoles
    return strokesPerHole * 18
  }

  // Class breakdown (only meaningful in live mode)
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
              2026 ROSTER
            </h1>
            <p className="text-green-200 text-lg">10 Varsity · 10 JV — Announced April 10</p>
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
              <div className="text-gray-900 font-medium space-y-1">
                <div>• Mon Apr 6 &amp; Tue Apr 7: 9-hole shotgun at Braemar, 4:00 PM</div>
                <div>• Wed Apr 8: 18 holes at Edina Country Club, tee times from 3:00 PM</div>
                <div>• Thu Apr 9: Braemar or Edina CC (weather contingency)</div>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                At least 36 holes total. Roster (10 Varsity, 10 JV) announced April 10.
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
              {option.label} ({filterCounts[option.value]})
            </button>
          ))}
        </div>

        {/* ── PRE-SEASON PLACEHOLDER GRID ── */}
        {isPreSeason ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaceholders.map((placeholder) => (
              <div
                key={placeholder.id}
                className="card p-5 text-left w-full opacity-60"
              >
                <div className="flex items-start gap-4">
                  {/* Placeholder Avatar */}
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-400">TBD</h3>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Announced April 10
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTeamBadge(placeholder.team)}`}>
                        {placeholder.team === 'jv' ? 'JV' : 'Varsity'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── LIVE ROSTER GRID ── */
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
        )}

        {/* Team Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-edina-green">
              {isPreSeason ? 10 : filterCounts.varsity}
            </div>
            <div className="text-sm text-gray-600">Varsity</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isPreSeason ? 10 : filterCounts.jv}
            </div>
            <div className="text-sm text-gray-600">Junior Varsity</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {isPreSeason ? 'TBD' : classBreakdown[12]}
            </div>
            <div className="text-sm text-gray-600">Seniors</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {isPreSeason ? 'TBD' : (classBreakdown[11] + classBreakdown[10] + classBreakdown[9])}
            </div>
            <div className="text-sm text-gray-600">Underclassmen</div>
          </div>
        </div>

        {/* Class Breakdown — hidden in pre-season */}
        {!isPreSeason && (
          <div className="mt-6 card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Class Breakdown</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{classBreakdown[12]}</div>
                <div className="text-xs text-gray-500">Seniors</div>
                <div className="text-xs text-gray-400">Class of 2026</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{classBreakdown[11]}</div>
                <div className="text-xs text-gray-500">Juniors</div>
                <div className="text-xs text-gray-400">Class of 2027</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{classBreakdown[10]}</div>
                <div className="text-xs text-gray-500">Sophomores</div>
                <div className="text-xs text-gray-400">Class of 2028</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{classBreakdown[9]}</div>
                <div className="text-xs text-gray-500">Freshmen</div>
                <div className="text-xs text-gray-400">Class of 2029</div>
              </div>
            </div>
          </div>
        )}
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

      {/* Player Stats Modal — only in live mode */}
      {!isPreSeason && selectedPlayer && (
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
                                {s.isMultiRound ? (
                                  <>
                                    <span className="text-sm">
                                      {s.rounds.map((r, i) => {
                                        const rPar = s.roundPars?.[i]
                                        const rUnder = r !== null && rPar && r < rPar
                                        return (
                                          <span key={i}>
                                            {i > 0 && <span className="text-gray-400">-</span>}
                                            <span className={rUnder ? 'text-red-600 font-medium' : 'text-gray-500'}>{r ?? '-'}</span>
                                          </span>
                                        )
                                      })}
                                    </span>
                                    <span className={`font-bold text-lg ${isUnderPar ? 'text-red-600' : 'text-gray-900'}`}>
                                      {s.score}
                                    </span>
                                  </>
                                ) : (
                                  <span className={`font-bold text-lg ${isUnderPar ? 'text-red-600' : 'text-gray-900'}`}>
                                    {s.score}
                                  </span>
                                )}
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
