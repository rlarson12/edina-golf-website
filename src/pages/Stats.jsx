import { useState, useMemo } from 'react'
import golfData from '../data/golfData.json'
import SEO from '../components/SEO'
import { computeAdjustedDiff, formatDiff } from '../utils/diff'

// Abbreviate event headers for matrix column display
const abbreviateEvent = (header) => {
  const name = header.replace(/^\d{2}\/\d{2} - /, '')
  const abbrevs = {
    'Lake Conference': 'LC',
    'Tournament': 'Tourn.',
    'Invitational': 'Inv.',
    'Conference': 'Conf.',
    'Section': 'Sect.',
    'Championship': 'Champ.',
    'MSHSL': 'MSHSL',
    'Boys': '',
    'Varsity': '',
  }
  let abbrev = name
  Object.entries(abbrevs).forEach(([full, short]) => {
    abbrev = abbrev.replace(new RegExp(full, 'gi'), short).trim()
  })
  return abbrev.length > 12 ? abbrev.substring(0, 11) + '…' : abbrev
}

// Sort indicator arrow
const SortArrow = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col) return <span className="ml-1 text-gray-300">↕</span>
  return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

function Stats() {
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [teamFilter, setTeamFilter] = useState('all')
  const [showArchive, setShowArchive] = useState(false)
  const [sortCol, setSortCol] = useState('diff')
  const [sortDir, setSortDir] = useState('asc')


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
    const stripped = eventName.replace(/^\d{2}\/\d{2} - /, '').toLowerCase()
    const nameLower = eventName.toLowerCase()
    return jvEventNames.some(jvName =>
      jvName === stripped || jvName === nameLower ||
      jvName.startsWith(stripped) || stripped.startsWith(jvName)
    )
  }

  // Build a map of event names to par and holes
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

  // Get par for an event header
  const getEventPar = (eventHeader) => {
    const eventName = eventHeader?.replace(/^\d{2}\/\d{2} - /, '') || ''
    const eventNameLower = eventName.toLowerCase()
    if (eventInfoMap[eventNameLower]) return eventInfoMap[eventNameLower].par
    const matchingKey = Object.keys(eventInfoMap).find(key =>
      key.startsWith(eventNameLower) || eventNameLower.startsWith(key)
    )
    return matchingKey ? eventInfoMap[matchingKey].par : 72
  }

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

  // Calculate weighted 18-hole average
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

  // Filter event headers based on team filter (reverse for newest-first)
  const { eventHeaders, eventIndices } = useMemo(() => {
    let headers, indices

    if (teamFilter === 'all') {
      headers = [...allEventHeaders]
      indices = allEventHeaders.map((_, i) => i)
    } else {
      const isJV = teamFilter === 'jv'
      headers = []
      indices = []
      allEventHeaders.forEach((header, index) => {
        const eventName = header.replace(/^\d{2}\/\d{2} - /, '')
        const headerIsJV = isJVEvent(eventName)
        if (isJV === headerIsJV) {
          headers.push(header)
          indices.push(index)
        }
      })
    }

    headers.reverse()
    indices.reverse()

    // Option 4: only show events where at least one player has a score
    const playerScores = activeHeatmap?.playerScores || []
    const played = new Set()
    playerScores.forEach(p => {
      p.scores.forEach((s, i) => {
        if (s !== null && s !== undefined) played.add(i)
      })
    })

    const filteredHeaders = []
    const filteredIndices = []
    indices.forEach((originalIdx, i) => {
      if (played.has(originalIdx)) {
        filteredHeaders.push(headers[i])
        filteredIndices.push(originalIdx)
      }
    })

    return { eventHeaders: filteredHeaders, eventIndices: filteredIndices }
  }, [allEventHeaders, teamFilter, jvEventNames, activeHeatmap])

  // Process player scores with dynamically calculated weighted averages and diff
  const playerData = useMemo(() => {
    return (activeHeatmap?.playerScores || [])
      .map(p => {
        const { diff, isProvisional, validRoundCount } = computeAdjustedDiff(
          p.scores,
          allEventHeaders,
          getEventPar
        )
        return {
          ...p,
          average: calculateWeightedAverage(p.scores),
          diff,
          isProvisional,
          validRoundCount,
        }
      })
      .filter(p => p.average !== null || p.isMatchPlayOnly)
      .sort((a, b) => {
        // Match-play-only players sort to the bottom
        if (a.isMatchPlayOnly && !b.isMatchPlayOnly) return 1
        if (!a.isMatchPlayOnly && b.isMatchPlayOnly) return -1
        if (a.average === null) return 1
        if (b.average === null) return -1
        const roundA = Math.round(a.average * 10)
        const roundB = Math.round(b.average * 10)
        if (roundA !== roundB) return roundA - roundB
        // Tiebreaker: Chase Larson wins display-tied-to-tenth ties
        if (a.name === 'Chase Larson' && b.name !== 'Chase Larson') return -1
        if (b.name === 'Chase Larson' && a.name !== 'Chase Larson') return 1
        const rankingsOrder = (golfData.rankings2026 || []).map(r => r.name)
        const idxA = rankingsOrder.indexOf(a.name)
        const idxB = rankingsOrder.indexOf(b.name)
        if (idxA !== -1 && idxB !== -1) return idxA - idxB
        return a.average - b.average
      })
  }, [eventInfoMap, allEventHeaders])

  // Filter by team
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

  // For the score matrix: show any player who has at least one score in the filtered event columns
  // This lets varsity players appear in the JV tab when they played a JV event
  const matrixPlayers = useMemo(() => {
    if (teamFilter === 'all') return playerData
    return playerData.filter(p =>
      eventIndices.some(i => p.scores[i] !== null && p.scores[i] !== undefined)
    )
  }, [playerData, teamFilter, eventIndices])

  // Sort handler
  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  // Sorted leaderboard players — default sort: adjusted Diff ascending (best/lowest first), null to bottom
  const sortedPlayers = useMemo(() => {
    const getValidScores = (p) => p.scores.filter(s => s !== null && s > 50)
    return [...filteredPlayers]
      .filter(p => !p.isMatchPlayOnly)
      .sort((a, b) => {
        if (sortCol === 'player') {
          return sortDir === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        }
        if (sortCol === 'diff') {
          // null diff (zero rounds) always sort to bottom regardless of direction
          if (a.diff === null && b.diff === null) return 0
          if (a.diff === null) return 1
          if (b.diff === null) return -1
          return sortDir === 'asc' ? a.diff - b.diff : b.diff - a.diff
        }
        if (sortCol === 'avg') {
          const va = a.average ?? 999
          const vb = b.average ?? 999
          const roundA = Math.round(va * 10)
          const roundB = Math.round(vb * 10)
          if (roundA !== roundB) return sortDir === 'asc' ? roundA - roundB : roundB - roundA
          // Tiebreaker: Chase Larson wins display-tied-to-tenth ties (asc only; desc keeps natural order)
          if (sortDir === 'asc') {
            if (a.name === 'Chase Larson' && b.name !== 'Chase Larson') return -1
            if (b.name === 'Chase Larson' && a.name !== 'Chase Larson') return 1
          }
          return 0
        }
        if (sortCol === 'low') {
          const sa = getValidScores(a)
          const sb = getValidScores(b)
          const va = sa.length > 0 ? Math.min(...sa) : 999
          const vb = sb.length > 0 ? Math.min(...sb) : 999
          return sortDir === 'asc' ? va - vb : vb - va
        }
        if (sortCol === 'rounds') {
          const va = getValidScores(a).length
          const vb = getValidScores(b).length
          return sortDir === 'asc' ? va - vb : vb - va
        }
        return 0
      })
  }, [filteredPlayers, sortCol, sortDir])

  // CSV Export
  const exportCSV = () => {
    const headers = ['Rank', 'Player', 'Team', 'Diff', 'Scoring Avg', 'Low Round', 'Rounds']
    const rows = sortedPlayers.map((player, i) => {
      const validScores = player.scores.filter(s => s !== null && s > 50)
      const lowRound = validScores.length > 0 ? Math.min(...validScores) : ''
      return [i + 1, player.name, player.team || '', formatDiff({ diff: player.diff, isProvisional: player.isProvisional }), player.average?.toFixed(1) || '', lowRound, validScores.length]
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edina-golf-stats-2026.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate scoring round players per event for matrix highlighting
  const scoringPlayersPerEvent = useMemo(() => {
    const result = []
    for (let i = 0; i < eventIndices.length; i++) {
      const originalIndex = eventIndices[i]
      const eventHeader = allEventHeaders[originalIndex] || ''
      const isHolyFamilyJV = eventHeader.toLowerCase().includes('holy family jv')
      const scoringCount = isHolyFamilyJV ? 8 : 4

      const scoresForEvent = matrixPlayers
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
  }, [matrixPlayers, eventIndices, allEventHeaders])

  // Get event info (par and holes)
  const getEventInfo = (eventHeader) => {
    const eventName = eventHeader?.replace(/^\d{2}\/\d{2} - /, '') || ''
    const eventNameLower = eventName.toLowerCase()
    if (eventInfoMap[eventNameLower]) return eventInfoMap[eventNameLower]
    const matchingKey = Object.keys(eventInfoMap).find(key =>
      key.startsWith(eventNameLower) || eventNameLower.startsWith(key)
    )
    return matchingKey ? eventInfoMap[matchingKey] : { par: 72, holes: 18 }
  }

  // Context-aware top stat cards (3D)
  const statsCards = useMemo(() => {
    const varsityStrokePlayed = (golfData.schedule2026 || [])
      .filter(r => r.teamScore && !r.isJV && r.format !== 'matchplay').length

    if (varsityStrokePlayed < 3) {
      return [
        { label: 'State Titles', value: '10×', sub: 'All-Time' },
        { label: 'Program History', value: '70+', sub: 'Years' },
        { label: 'Titles Since 2014', value: '4', sub: 'Recent Era' },
        { label: 'Roster Size', value: '25', sub: '2026 Season' },
      ]
    }
    return null
  }, [])

  // Season records — always show 2026 data (zeros pre-season)
  const seasonRecords = useMemo(() => {
    const results = seasonResults2026
    const teamScores = results
      .filter(r => r.teamScore && r.format !== 'matchplay')
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

  // Which season results to show in Team Results tab (newest first)
  const activeSeasonResults = useMemo(() => {
    const results = showArchive ? seasonResults2025 : seasonResults2026
    return [...results].reverse()
  }, [showArchive, seasonResults2025, seasonResults2026])

  return (
    <div>
      <SEO title="Stats" description="2026 Edina Boys Golf stats — individual scoring averages, team leaderboard, and score matrix updated after every event." path="/stats" />
      {/* Hero Section */}
      <div className="relative h-32 md:h-40 overflow-hidden">
        <img
          src="/images/Web%203.webp"
          alt="Team photo"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <span className="text-edina-gold text-xs font-bold tracking-widest uppercase block mb-0.5" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>PERFORMANCE DATA</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              STATS & LEADERBOARD
            </h1>
          </div>
        </div>
      </div>

      <div className="page-container">

        {/* Tabs — order: Leaderboard | Score Matrix | Team Results (3A) */}
        <div className="overflow-x-auto -mx-4 px-4 mb-6">
          <div className="flex gap-2 min-w-max pb-1">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 mb-6">
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

            {/* ── LEADERBOARD (3B) ── */}
            {activeTab === 'leaderboard' && (
              <div className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Player Leaderboard</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* CSV Export button (3E) */}
                    <button
                      onClick={exportCSV}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-edina-green border border-gray-300 hover:border-edina-green rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-edina-green select-none"
                          onClick={() => handleSort('player')}
                        >
                          Player <SortArrow col="player" sortCol={sortCol} sortDir={sortDir} />
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-edina-green select-none"
                          onClick={() => handleSort('diff')}
                        >
                          Diff <SortArrow col="diff" sortCol={sortCol} sortDir={sortDir} />
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-edina-green select-none hidden md:table-cell"
                          onClick={() => handleSort('avg')}
                        >
                          Scoring Avg <SortArrow col="avg" sortCol={sortCol} sortDir={sortDir} />
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-edina-green select-none"
                          onClick={() => handleSort('low')}
                        >
                          Low Round <SortArrow col="low" sortCol={sortCol} sortDir={sortDir} />
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-edina-green select-none"
                          onClick={() => handleSort('rounds')}
                        >
                          Rds <SortArrow col="rounds" sortCol={sortCol} sortDir={sortDir} />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedPlayers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center">
                            <p className="text-gray-500 font-medium">No players found for this filter.</p>
                          </td>
                        </tr>
                      ) : (
                        sortedPlayers.map((player, index) => {
                          const rank = index + 1
                          const scoresWithPar = player.scores
                            .map((s, idx) => {
                              if (s === null || s === undefined || s <= 50) return null
                              return { score: s, par: getEventInfo(allEventHeaders[idx]).par }
                            })
                            .filter(Boolean)
                          const validScores = scoresWithPar.map(x => x.score)
                          const lowEntry = scoresWithPar.length > 0
                            ? scoresWithPar.reduce((a, b) => (a.score < b.score ? a : b))
                            : null
                          const lowRound = lowEntry ? lowEntry.score : null
                          const lowUnderPar = lowEntry ? lowEntry.score < lowEntry.par : false
                          const diffIsNeg = player.diff !== null && player.diff < 0
                          return (
                            <tr key={player.name} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 font-medium text-gray-900">{player.name}</td>
                              <td className="px-4 py-4 text-center font-bold">
                                <span className={diffIsNeg ? 'text-red-600' : 'text-gray-900'}>
                                  {formatDiff({ diff: player.diff, isProvisional: player.isProvisional })}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center text-gray-600 hidden md:table-cell">
                                {player.average?.toFixed(1) ?? '—'}
                              </td>
                              <td className="px-4 py-4 text-center">
                                {lowRound !== null ? (
                                  <span className={`font-medium ${lowUnderPar ? 'text-red-600' : 'text-gray-700'}`}>
                                    {lowRound}{lowEntry && lowEntry.par ? ` (${lowRound - lowEntry.par > 0 ? '+' : ''}${lowRound === lowEntry.par ? 'E' : lowRound - lowEntry.par})` : ''}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center text-gray-600">{validScores.length}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── SCORE MATRIX (3C) ── */}
            {activeTab === 'matrix' && (
              <>
                {/* Mobile scroll hint (3F) */}
                <div className="lg:hidden bg-edina-green-light border border-edina-green/20 rounded-lg px-4 py-2 mb-4 text-sm text-edina-green-dark">
                  Scroll horizontally to see all events →
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="sticky left-0 bg-gray-50 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider z-10 border-r border-gray-200 whitespace-nowrap">
                            Player / Avg
                          </th>
                          {eventHeaders.map((event, i) => {
                            const m = event.match(/^(\d{2}\/\d{2})\s*-\s*(.+)$/)
                            const dateStr = m ? m[1] : ''
                            let fullName = (m ? m[2] : event).replace(/\bFinal\b/gi, 'Day 2')
                            return (
                              <th
                                key={i}
                                className="text-center text-xs font-semibold text-gray-600 w-8"
                                style={{ height: '140px', verticalAlign: 'bottom' }}
                              >
                                <div style={{
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  whiteSpace: 'nowrap',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  margin: '0 auto',
                                  paddingBottom: '4px',
                                }}>
                                  {dateStr && (
                                    <span className="font-bold text-edina-green mr-1.5">{dateStr}</span>
                                  )}
                                  <span>{fullName}</span>
                                </div>
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {matrixPlayers.length === 0 ? (
                          <tr>
                            <td colSpan={1 + eventHeaders.length} className="px-4 py-12 text-center">
                              <p className="text-gray-500 font-medium">Score matrix fills in after the season opens April 20.</p>
                            </td>
                          </tr>
                        ) : (
                          [...matrixPlayers].sort((a, b) => {
                              if (a.average == null && b.average == null) return a.name.localeCompare(b.name)
                              if (a.average == null) return 1
                              if (b.average == null) return -1
                              const roundA = Math.round(a.average * 10)
                              const roundB = Math.round(b.average * 10)
                              if (roundA !== roundB) return roundA - roundB
                              // Tiebreaker: Chase Larson wins display-tied-to-tenth ties
                              if (a.name === 'Chase Larson' && b.name !== 'Chase Larson') return -1
                              if (b.name === 'Chase Larson' && a.name !== 'Chase Larson') return 1
                              return a.average - b.average
                            }).map((player) => (
                            <tr key={player.name} className="hover:bg-gray-50 transition-colors">
                              {/* Sticky player name + avg cell */}
                              <td className="sticky left-0 bg-white z-10 px-3 py-2 border-r border-gray-200 text-xs md:text-sm whitespace-nowrap">
                                <div className="font-medium text-gray-900">{player.name}</div>
                                {player.average != null && (
                                  <div className="text-xs text-edina-green font-semibold">{player.average.toFixed(1)}</div>
                                )}
                              </td>
                              {eventIndices.map((originalIdx, i) => {
                                const score = player.scores[originalIdx]
                                const isScoring = score && scoringPlayersPerEvent[i]?.includes(player.name)
                                const eventInfo = getEventInfo(eventHeaders[i])
                                const isUnderPar = score && eventInfo.par && score < eventInfo.par

                                return (
                                  <td
                                    key={originalIdx}
                                    className={`px-1 py-2 text-center whitespace-nowrap w-10 text-xs md:text-sm ${
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── TEAM RESULTS ── */}
            {activeTab === 'team' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Event</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Course</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Finish</th>
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
                              {result.format === 'matchplay' ? (
                                <span className="font-semibold text-gray-600">
                                  {result.teamResult && result.teamResult !== 'TBD'
                                    ? `${result.teamResult}${result.teamRecord ? ' ' + result.teamRecord : ''}`
                                    : <span className="text-gray-400">—</span>}
                                </span>
                              ) : (
                                <span className={`font-semibold ${
                                  result.teamScore?.includes('-') ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                  {result.teamScore || '-'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {result.format === 'matchplay' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-edina-gold/20 text-edina-gold-dark">
                                  Match Play
                                </span>
                              ) : (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  result.finish?.startsWith('1st') ? 'bg-edina-gold/20 text-edina-gold-dark border border-edina-gold' :
                                  result.finish?.startsWith('2nd') ? 'bg-gray-200 text-gray-800' :
                                  result.finish?.startsWith('3rd') ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-50 text-gray-600'
                                }`}>
                                  {result.finish || '-'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            Season results post after each event. First up: Lake Conference Tournament #1 on April 20.
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
                  <span>Scoring Round (matrix)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-medium">69 / -1.0</span>
                  <span>Under Par</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">—</span>
                  <span>Did Not Play</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-3">
                <strong>Diff</strong> is the average of a player&apos;s best 75% of round differentials (Score &minus; Course Rating &times; 113 &divide; Slope). A lower number means better performance relative to course difficulty. Players with fewer than 4 rounds are marked with ~ and considered provisional.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Stats
