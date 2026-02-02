import XLSX from 'xlsx';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the Excel file
const workbook = XLSX.readFile('/Users/reedlarson/Desktop/Edina Boys Golf – Live Mobile Tracker-1.xlsx');

// Helper to convert Excel date serial to JS Date
function excelDateToJS(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date;
}

function formatDate(date) {
  if (!date) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatDateISO(date) {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

// Parse Players sheet
function parsePlayers() {
  const sheet = workbook.Sheets['Players'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const players = [];
  const playerMap = {};

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || !row[1]) continue;

    const playerId = row[0];
    const name = row[1];
    const gradYear = row[4];
    const team = row[5];
    const active = row[7];

    if (!active) continue;

    const player = {
      id: playerId,
      name: name,
      gradYear: gradYear,
      team: team === 'Varsity' ? 'varsity' : team === 'Junior Varsity' ? 'jv' : 'development',
      grade: gradYear ? 12 - (gradYear - 2025) : null,
    };

    players.push(player);
    playerMap[playerId] = player;
  }

  return { players, playerMap };
}

// Parse Events sheet
function parseEvents() {
  const sheet = workbook.Sheets['Events'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const events = [];
  const eventMap = {};

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    const eventId = row[0];
    const dateSerial = row[1];
    const displayName = row[2];
    const level = row[3];
    const course = row[4];
    const holes = row[6];
    const par = row[7];
    const teamScore = row[13];
    const teamFinish = row[14];
    const sortOrder = row[16];

    if (!displayName) continue;

    const date = excelDateToJS(dateSerial);

    const event = {
      id: eventId,
      date: date,
      dateFormatted: formatDate(date),
      dateISO: formatDateISO(date),
      name: displayName,
      level: level,
      course: course || 'TBD',
      holes: holes || 18,
      par: par || 72,
      teamScore: teamScore || null,
      teamFinish: teamFinish || null,
      sortOrder: sortOrder || 999,
    };

    events.push(event);
    eventMap[eventId] = event;
  }

  // Sort by date
  events.sort((a, b) => (a.date || new Date(0)) - (b.date || new Date(0)));

  return { events, eventMap };
}

// Parse Scores sheet
function parseScores() {
  const sheet = workbook.Sheets['Scores'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const scores = [];

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1] || !row[2] || row[3] === undefined) continue;

    const eventId = row[1];
    const playerId = row[2];
    const score = row[3];
    const counting = row[4];

    if (typeof score !== 'number' || score < 30 || score > 150) continue;

    scores.push({
      eventId,
      playerId,
      score,
      counting: counting === true,
    });
  }

  return scores;
}

// Parse WEB_VIEW_SEASON for team results
function parseSeasonResults() {
  const sheet = workbook.Sheets['WEB_VIEW_SEASON'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const results = [];

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || !row[1]) continue;

    const dateSerial = row[0];
    const eventName = row[1];
    const course = row[2];
    const teamScore = row[3];
    const finish = row[4];

    const date = excelDateToJS(dateSerial);

    results.push({
      date: date,
      dateFormatted: formatDate(date),
      dateISO: formatDateISO(date),
      event: eventName,
      course: course,
      teamScore: teamScore,
      finish: finish,
    });
  }

  return results;
}

// Parse WEB_VIEW_HEATMAP for the performance matrix
function parseHeatmap() {
  const sheet = workbook.Sheets['WEB_VIEW_HEATMAP'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (!data || data.length < 2) return { eventHeaders: [], playerScores: [] };

  // First row is headers: Name, then event names
  const headers = data[0];
  const eventHeaders = headers.slice(1).filter(h => h); // Skip 'Name' column

  const playerScores = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    const playerName = row[0];
    const scores = [];

    for (let j = 1; j < headers.length; j++) {
      const score = row[j];
      scores.push(typeof score === 'number' && score > 30 && score < 150 ? score : null);
    }

    playerScores.push({
      name: playerName,
      scores: scores,
    });
  }

  return { eventHeaders, playerScores };
}

// Parse WEB_VIEW_RANKINGS for player rankings
function parseRankings() {
  const sheet = workbook.Sheets['WEB_VIEW_RANKINGS'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rankings = [];

  // Row 0 is event IDs, Row 1 is headers
  const eventIds = data[0] ? data[0].slice(7) : [];
  const eventNames = data[1] ? data[1].slice(7) : [];

  // Player data starts at row 2
  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1]) continue;

    const playerName = row[1];
    const average = row[2];
    const trend = row[3];
    const last3Avg = row[4];

    if (typeof average !== 'number') continue;

    // Get individual scores
    const scores = [];
    for (let j = 7; j < row.length; j++) {
      const score = row[j];
      scores.push(typeof score === 'number' && score > 30 && score < 150 ? score : null);
    }

    rankings.push({
      name: playerName,
      average: Math.round(average * 100) / 100,
      trend: trend || '',
      last3Avg: typeof last3Avg === 'number' ? Math.round(last3Avg * 100) / 100 : null,
      scores: scores,
    });
  }

  // Sort by average
  rankings.sort((a, b) => a.average - b.average);

  return { rankings, eventIds, eventNames };
}

// Build comprehensive data
function buildData() {
  const { players, playerMap } = parsePlayers();
  const { events, eventMap } = parseEvents();
  const scores = parseScores();
  const seasonResults = parseSeasonResults();
  const heatmap = parseHeatmap();
  const { rankings, eventIds, eventNames } = parseRankings();

  // Build player stats with scores per event
  const playerStats = [];
  const playerScoreMap = {};

  // Group scores by player
  scores.forEach(s => {
    if (!playerScoreMap[s.playerId]) {
      playerScoreMap[s.playerId] = [];
    }
    playerScoreMap[s.playerId].push(s);
  });

  // Calculate stats for each player
  players.forEach(player => {
    const playerScores = playerScoreMap[player.id] || [];
    const validScores = playerScores.map(s => s.score).filter(s => s && s > 30 && s < 150);

    if (validScores.length === 0) return;

    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const low = Math.min(...validScores);

    playerStats.push({
      ...player,
      rounds: validScores.length,
      average: Math.round(avg * 100) / 100,
      lowRound: low,
      scores: playerScores,
    });
  });

  // Sort by average
  playerStats.sort((a, b) => a.average - b.average);

  // Filter varsity and JV events
  const varsityEvents = events.filter(e => e.level === 'Varsity');
  const jvEventsRaw = events.filter(e => e.level === 'JV' || e.level === 'Junior Varsity');

  // Group scores by event for calculating team scores
  const scoresByEvent = {};
  scores.forEach(s => {
    if (!scoresByEvent[s.eventId]) {
      scoresByEvent[s.eventId] = [];
    }
    scoresByEvent[s.eventId].push(s);
  });

  // Calculate team score from top 4 individual scores
  function calculateTeamScore(eventId, par) {
    const eventScores = scoresByEvent[eventId] || [];
    if (eventScores.length < 4) return null;

    const sortedScores = eventScores
      .filter(s => s.score && s.score > 50 && s.score < 150)
      .sort((a, b) => a.score - b.score)
      .slice(0, 4);

    if (sortedScores.length < 4) return null;

    const total = sortedScores.reduce((sum, s) => sum + s.score, 0);
    const toPar = total - (par * 4);
    const toParStr = toPar >= 0 ? `+${toPar}` : `${toPar}`;
    return `${total} (${toParStr})`;
  }

  // Helper to get event type
  function getEventType(name) {
    const lower = name.toLowerCase();
    if (lower.includes('conference')) return 'conference';
    if (lower.includes('section') || lower.includes('state')) return 'tournament';
    if (lower.includes('duel') || lower.includes('tri')) return 'match';
    return 'invitational';
  }

  // Helper to build event entry with calculated scores
  function buildEventEntry(e) {
    let teamScore = e.teamScore;
    const isDay1 = e.name.includes('Day 1');
    const isFinal = e.name.includes('Final');

    if (!teamScore) {
      teamScore = calculateTeamScore(e.id, e.par || 72);
    }

    return {
      id: e.id,
      date: e.dateISO,
      dateFormatted: e.dateFormatted,
      event: e.name,
      course: e.course,
      par: e.par,
      teamScore: teamScore,
      teamFinish: e.teamFinish,
      isDay1: isDay1,
      isFinal: isFinal,
      type: getEventType(e.name),
    };
  }

  // Group multi-day events together
  function groupMultiDayEvents(eventsList) {
    const grouped = [];
    const processed = new Set();

    eventsList.forEach(e => {
      if (processed.has(e.id)) return;

      const entry = buildEventEntry(e);

      // Check if this is part of a multi-day event
      const baseName = e.name.replace(' Day 1', '').replace(' Final', '').trim();
      const isMultiDay = e.name.includes('Day 1') || e.name.includes('Final');

      if (isMultiDay) {
        // Find the matching day
        const day1Event = eventsList.find(ev =>
          ev.name.includes('Day 1') && ev.name.replace(' Day 1', '').trim() === baseName
        );
        const finalEvent = eventsList.find(ev =>
          ev.name.includes('Final') && ev.name.replace(' Final', '').trim() === baseName
        );

        if (day1Event && finalEvent) {
          // Mark both as processed
          processed.add(day1Event.id);
          processed.add(finalEvent.id);

          const day1Entry = buildEventEntry(day1Event);
          const finalEntry = buildEventEntry(finalEvent);

          // Create combined entry
          grouped.push({
            id: finalEvent.id,
            date: finalEntry.date,
            dateFormatted: finalEntry.dateFormatted,
            event: baseName,
            course: `${day1Entry.course} / ${finalEntry.course}`,
            par: null,
            teamScore: finalEntry.teamScore,
            teamFinish: finalEntry.teamFinish,
            isMultiDay: true,
            type: getEventType(baseName),
            rounds: [
              {
                round: 1,
                date: day1Entry.date,
                dateFormatted: day1Entry.dateFormatted,
                course: day1Entry.course,
                par: day1Entry.par,
                teamScore: day1Entry.teamScore,
              },
              {
                round: 2,
                date: finalEntry.date,
                dateFormatted: finalEntry.dateFormatted,
                course: finalEntry.course,
                par: finalEntry.par,
                teamScore: finalEntry.teamScore,
              },
            ],
          });
        } else {
          // Only one day found, add as single event
          processed.add(e.id);
          grouped.push(entry);
        }
      } else {
        // Single day event
        processed.add(e.id);
        grouped.push(entry);
      }
    });

    // Sort by date
    grouped.sort((a, b) => new Date(a.date) - new Date(b.date));

    return grouped;
  }

  // Build schedule data for varsity and JV
  const schedule = groupMultiDayEvents(varsityEvents);
  const jvSchedule = groupMultiDayEvents(jvEventsRaw);

  // Build roster data
  const roster = players.map(p => ({
    name: p.name,
    gradYear: p.gradYear,
    grade: p.grade,
    team: p.team,
  })).sort((a, b) => {
    if (a.team !== b.team) {
      const order = { varsity: 0, jv: 1, development: 2 };
      return order[a.team] - order[b.team];
    }
    return a.name.localeCompare(b.name);
  });

  return {
    players: roster,
    events: varsityEvents,
    jvEvents: jvEventsRaw,
    schedule: schedule,
    jvSchedule: jvSchedule,
    seasonResults: seasonResults,
    playerStats: playerStats,
    rankings: rankings,
    heatmap: heatmap,
    eventNames: eventNames.filter(e => e),
  };
}

// Generate and write data
const data = buildData();

// Ensure data directory exists
mkdirSync(join(__dirname, '../src/data'), { recursive: true });

// Write data files
writeFileSync(
  join(__dirname, '../src/data/golfData.json'),
  JSON.stringify(data, null, 2)
);

console.log('Data exported successfully!');
console.log(`- ${data.players.length} players`);
console.log(`- ${data.events.length} varsity events`);
console.log(`- ${data.jvEvents.length} JV events`);
console.log(`- ${data.playerStats.length} players with stats`);
console.log(`- ${data.rankings.length} ranked players`);
console.log(`- ${data.seasonResults.length} season results`);
