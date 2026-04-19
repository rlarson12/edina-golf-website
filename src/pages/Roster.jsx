import { useState, useMemo } from 'react'
import golfData from '../data/golfData.json'
import SEO from '../components/SEO'

function Roster() {
  const [filter, setFilter] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // 2026 season transition logic
  const players2026 = golfData.players2026 || []
  const isPreSeason = players2026.length === 0

  // Use 2026 players if available, fall back to 2025 for archive display
  const players = isPreSeason ? (golfData.players || []) : players2026

  // Use 2026 heatmap when roster is live, fall back to 2025
  const activeHeatmap = !isPreSeason ? (golfData.heatmap2026 || golfData.heatmap) : golfData.heatmap
  const allEventHeaders = activeHeatmap?.eventHeaders || []

  // Build event info map for holes lookup
  const eventInfoMap = useMemo(() => {
    const map = {}
    const allEvents = !isPreSeason
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

  // Calculate weighted averages for all players
  const playerAveragesMap = useMemo(() => {
    const map = {}
    activeHeatmap?.playerScores?.forEach(player => {
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
      case 8: return '8th Grade'
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

  // Build supplemental lookup from playerStats2026 for individualFinish + matchResult
  // Also resolves Four-Ball pair results: each player in a pair inherits the pair's result
  const playerStats2026Extra = useMemo(() => {
    // Map eventId → MM/DD using both schedule lists
    const eventDateMap = {}
    ;[...(golfData.schedule2026 || []), ...(golfData.jvSchedule2026 || [])].forEach(e => {
      if (e.id && e.dateISO) {
        const parts = e.dateISO.split('-')
        eventDateMap[e.id] = `${parts[1]}/${parts[2]}`
      }
    })

    // Build a player → mmdd → matchResult map from match play pair data in schedule
    // Covers Four-Ball: { pair: ["A", "B"], result: "Won 3&2" }
    const pairResultMap = {} // key: `playerName::mmdd` → result string
    ;[...(golfData.schedule2026 || []), ...(golfData.jvSchedule2026 || [])].forEach(e => {
      if (e.format !== 'matchplay' || !e.matches?.length || !e.dateISO) return
      const parts = e.dateISO.split('-')
      const mmdd = `${parts[1]}/${parts[2]}`
      e.matches.forEach(match => {
        const result = match.result || null
        if (!result) return
        // Pair format: { pair: ["A", "B"], result }
        if (Array.isArray(match.pair)) {
          match.pair.forEach(playerName => {
            pairResultMap[`${playerName}::${mmdd}`] = result
          })
        }
        // Legacy individual format: { player: "A", result }
        if (match.player) {
          pairResultMap[`${match.player}::${mmdd}`] = result
        }
      })
    })

    const map = {}
    ;(golfData.playerStats2026 || []).forEach(player => {
      player.scores.forEach(s => {
        const mmdd = eventDateMap[s.eventId]
        if (!mmdd) return
        const key = `${player.name}::${mmdd}`
        map[key] = {
          individualFinish: s.individualFinish || null,
          // Prefer explicit matchResult on score entry; fall back to pair lookup
          matchResult: s.matchResult || pairResultMap[key] || null,
        }
      })
    })

    // Also inject pair results for players whose score entries may not have matchResult
    // (e.g. match play events with no stroke score recorded)
    Object.entries(pairResultMap).forEach(([key, result]) => {
      if (!map[key]) map[key] = { individualFinish: null, matchResult: result }
      else if (!map[key].matchResult) map[key].matchResult = result
    })

    return map
  }, [])

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
    const playerData = activeHeatmap?.playerScores?.find(p => p.name === playerName)
    const eventHeaders = activeHeatmap?.eventHeaders || []

    if (!playerData) return []

    const rawScores = playerData.scores.map((score, idx) => {
      const header = eventHeaders[idx] || ''
      const eventName = header.replace(/^\d{2}\/\d{2} - /, '') || `Event ${idx + 1}`
      const eventInfo = lookupEventInfo(eventName)
      const mmdd = header.match(/^(\d{2}\/\d{2})/)?.[1] || null
      const extra = mmdd ? (playerStats2026Extra[`${playerName}::${mmdd}`] || {}) : {}
      return {
        idx,
        date: formatHeatmapDate(header),
        event: eventName,
        score,
        par: eventInfo.par,
        holes: eventInfo.holes,
        toPar: (score && eventInfo.par) ? score - eventInfo.par : null,
        individualFinish: extra.individualFinish || null,
        matchResult: extra.matchResult || null,
        mmdd,
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
            isMultiRound: true,
            individualFinish: s.individualFinish || f.individualFinish || null,
            matchResult: s.matchResult || f.matchResult || null,
          })
          continue
        }
      }

      if (s.score !== null) {
        combined.push({ ...s })
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
      <SEO title="Roster" description="Meet the 2026 Edina Boys Golf roster — 13 varsity and 12 JV Hornets competing for a state title." path="/roster" players={players2026} />
      {/* Hero Section with Team Photo */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        <img
          src="/images/Team1.webp"
          alt="Edina Boys Golf Team"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 20%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              2026 ROSTER
            </h1>
            <p className="text-green-200 text-lg">13 Varsity · 12 JV</p>
          </div>
        </div>
      </div>

      <div className="page-container">
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
                      <h3 className="font-semibold text-gray-500">TBD</h3>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Photo coming soon
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
          <>
          {/* Captain featured cards */}
          {filteredPlayers.some(p => p.isCaptain) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-edina-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-sm font-bold text-gray-700 uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2026 Team Captains</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPlayers.filter(p => p.isCaptain).map((player, i) => {
                  const weightedAvg = playerAveragesMap[player.name]
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedPlayer(player)}
                      className="bg-edina-forest text-white rounded-lg p-5 hover:bg-edina-forest/90 transition-colors text-left w-full"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden ring-2 ring-edina-gold ring-offset-2 ring-offset-edina-forest">
                          {player.photo ? (
                            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" style={{ objectPosition: player.photoPosition || 'center top' }} />
                          ) : (
                            <div className="w-full h-full bg-edina-green/30 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">{player.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-3.5 h-3.5 text-edina-gold" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span className="text-xs font-bold text-edina-gold uppercase tracking-wider">Team Captain</span>
                          </div>
                          <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{player.name}</h3>
                          <p className="text-green-200 text-sm">{getGradeLabel(player.grade)} • Class of {player.gradYear}</p>
                          {weightedAvg && <p className="text-green-300 text-sm mt-1">Avg {weightedAvg.toFixed(1)}</p>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
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
                    <div className={`flex-shrink-0 w-14 h-14 rounded-full overflow-hidden ${
                      player.isCaptain
                        ? 'ring-2 ring-edina-gold ring-offset-2'
                        : 'border-2 border-edina-green/30'
                    }`}>
                      {player.photo ? (
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: player.photoPosition || 'center top' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-edina-green/20 to-edina-green/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-edina-green">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{player.name}</h3>
                      </div>
                      {player.isCaptain && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3 text-edina-gold-dark" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="text-xs font-bold text-edina-gold-dark">Team Captain</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        {getGradeLabel(player.grade)} • Class of {player.gradYear}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTeamBadge(player.team)}`}>
                          {player.team === 'jv' ? 'JV' : player.team.charAt(0).toUpperCase() + player.team.slice(1)}
                        </span>
                        {weightedAvg && (
                          <span className="text-sm text-gray-600">
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
          </>
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
                <div className="text-sm text-gray-600">Seniors</div>
                <div className="text-sm text-gray-600">Class of 2026</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{classBreakdown[11]}</div>
                <div className="text-sm text-gray-600">Juniors</div>
                <div className="text-sm text-gray-600">Class of 2027</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{classBreakdown[10]}</div>
                <div className="text-sm text-gray-600">Sophomores</div>
                <div className="text-sm text-gray-600">Class of 2028</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{classBreakdown[9]}</div>
                <div className="text-sm text-gray-600">Freshmen</div>
                <div className="text-sm text-gray-600">Class of 2029</div>
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
              <img src="/images/IMG_9149.webp" alt="Action shot" className="w-full h-full img-cover-top" />
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src="/images/IMG_9152.webp" alt="Bunker shot" className="w-full h-full img-cover-top" />
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src="/images/IMG_8248.webp" alt="On course" className="w-full h-full img-cover-top" />
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
            className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-edina-green p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {selectedPlayer.photo ? (
                      <img
                        src={selectedPlayer.photo}
                        alt={selectedPlayer.name}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: selectedPlayer.photoPosition || 'center top' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/20 flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
                    <p className="text-green-100 text-sm">
                      {getGradeLabel(selectedPlayer.grade)} • {selectedPlayer.team === 'jv' ? 'JV' : 'Varsity'}
                    </p>
                    {selectedPlayer.isCaptain && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-edina-gold mt-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Team Captain
                      </span>
                    )}
                  {/* Social / profile links */}
                  {(selectedPlayer.instagram || selectedPlayer.ajgaUrl || selectedPlayer.jgsUrl) && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {selectedPlayer.instagram && (
                        <a
                          href={`https://www.instagram.com/${selectedPlayer.instagram}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                          @{selectedPlayer.instagram}
                        </a>
                      )}
                      {selectedPlayer.ajgaUrl && (
                        <a
                          href={selectedPlayer.ajgaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                        >
                          AJGA
                        </a>
                      )}
                      {selectedPlayer.jgsUrl && (
                        <a
                          href={selectedPlayer.jgsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                        >
                          JGS
                        </a>
                      )}
                    </div>
                  )}
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
                      <div className="text-sm text-gray-600">Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{lowRound}</div>
                      <div className="text-sm text-gray-600">Low Round</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{validScores.length}</div>
                      <div className="text-sm text-gray-600">Rounds</div>
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

                          // Match result badge color
                          const matchResultLower = s.matchResult?.toLowerCase() || ''
                          const isMatchWin = matchResultLower.startsWith('won')
                          const isMatchLoss = matchResultLower.startsWith('lost')

                          return (
                            <div key={idx} className="rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between p-3 bg-gray-50">
                                <div className="flex-grow min-w-0 mr-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-edina-green whitespace-nowrap">{s.date}</span>
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
                                              <span className={rUnder ? 'text-red-600 font-medium' : 'text-gray-600'}>{r ?? '-'}</span>
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
                                  <span className={`text-sm font-medium ${isUnderPar ? 'text-red-600' : 'text-gray-600'}`}>
                                    ({toParStr})
                                  </span>
                                  {s.individualFinish && (
                                    <span className="text-sm text-gray-600 whitespace-nowrap">{s.individualFinish}</span>
                                  )}
                                </div>
                              </div>
                              {s.matchResult && (
                                <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    isMatchWin ? 'bg-green-100 text-green-800'
                                    : isMatchLoss ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {s.matchResult}
                                  </span>
                                </div>
                              )}
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
