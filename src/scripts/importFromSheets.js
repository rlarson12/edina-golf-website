#!/usr/bin/env node

/**
 * Google Sheets Import Script for Edina Boys Golf
 *
 * Fetches data from published Google Sheet and updates golfData.json
 *
 * Usage:
 *   node src/scripts/importFromSheets.js              # Import events and scores only (default)
 *   node src/scripts/importFromSheets.js --include-roster  # Import events, scores, AND roster
 *   node src/scripts/importFromSheets.js --no-roster       # Explicit: no roster (same as default)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Sheet base URL (published sheet)
const SHEET_BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSFnXbcpPkOUoYXHMTtI1hOSMNTvqBpexOUNXKpyaLlAX6NpgMNRYhpZkrERkeV8eSSYNy_RTYoqh1r/pub';

// Tab GIDs (from actual published Google Sheet)
const TABS = {
  events: 0,             // First tab: Events
  scores: 1156282880,    // Second tab: Scores
  players: 233790492     // Third tab: Players
};

// Parse command line arguments
const args = process.argv.slice(2);
const includeRoster = args.includes('--include-roster');
const noRoster = args.includes('--no-roster');

if (includeRoster && noRoster) {
  console.error('Error: Cannot use both --include-roster and --no-roster');
  process.exit(1);
}

const shouldImportRoster = includeRoster;

console.log('='.repeat(60));
console.log('Edina Boys Golf - Google Sheets Import');
console.log('='.repeat(60));
console.log(`Roster import: ${shouldImportRoster ? 'YES' : 'NO (use --include-roster to include)'}`);
console.log('');

/**
 * Fetch CSV data from a Google Sheet tab
 */
async function fetchSheetTab(tabName, gid) {
  const url = `${SHEET_BASE_URL}?gid=${gid}&single=true&output=csv`;
  console.log(`Fetching ${tabName} tab...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error(`Error fetching ${tabName}: ${error.message}`);
    throw error;
  }
}

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx]?.trim() || '';
    });
    data.push(row);
  }

  return data;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

/**
 * Calculate weighted 18-hole average: (total strokes / total holes) * 18
 */
function calculateWeightedAverage(scores, eventsMap) {
  let totalStrokes = 0;
  let totalHoles = 0;

  scores.forEach(score => {
    const event = eventsMap[score.eventKey];
    const holes = event?.holes || 18;
    totalStrokes += score.score;
    totalHoles += holes;
  });

  if (totalHoles === 0) return null;
  return (totalStrokes / totalHoles) * 18;
}

/**
 * Format date for display (e.g., "Apr 20")
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Handle various date formats
  let date;
  if (dateStr.includes('/')) {
    // MM/DD/YYYY format
    const [month, day, year] = dateStr.split('/');
    date = new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    // YYYY-MM-DD format
    date = new Date(dateStr + 'T00:00:00');
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return dateStr;
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
function formatDateISO(dateStr) {
  if (!dateStr) return '';

  let date;
  if (dateStr.includes('/')) {
    const [month, day, year] = dateStr.split('/');
    date = new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    date = new Date(dateStr + 'T00:00:00');
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return dateStr;
  return date.toISOString().split('T')[0];
}

/**
 * Create event key for matching events and scores
 */
function createEventKey(dateStr, eventName) {
  return `${formatDateISO(dateStr)}|${eventName.toLowerCase().trim()}`;
}

/**
 * Transform Google Sheet data into golfData.json format
 */
function transformData(eventsData, scoresData, playersData, existingData, shouldImportRoster) {
  console.log('\nTransforming data...');

  // Create events map for quick lookup
  const eventsMap = {};

  // Process events
  const events2026 = [];
  const jvEvents2026 = [];
  const schedule2026 = [];
  const jvSchedule2026 = [];

  // Process each event
  eventsData.forEach((row, idx) => {
    if (!row.EventName || !row.EventDate) return;

    const eventKey = createEventKey(row.EventDate, row.EventName);
    const isJV = (row.Level || '').toLowerCase() === 'jv';
    const holes = parseInt(row.Holes) || 18;
    const par = parseInt(row.Par) || 72;

    eventsMap[eventKey] = { holes, par, isJV };

    // Create event object
    const eventId = `2026-${formatDateISO(row.EventDate)}-${isJV ? 'JV' : 'VAR'}-${idx}`;

    // Format team score with +/- par
    let teamScore = null;
    if (row.TeamScore) {
      const score = parseInt(row.TeamScore);
      const overUnder = row.TeamOverUnder || '';
      if (score && overUnder) {
        teamScore = `${score} (${overUnder})`;
      } else if (score) {
        teamScore = `${score}`;
      }
    }

    const event = {
      id: eventId,
      date: new Date(formatDateISO(row.EventDate)).toISOString(),
      dateFormatted: formatDate(row.EventDate),
      dateISO: formatDateISO(row.EventDate),
      name: row.EventName,
      level: isJV ? 'JV' : 'Varsity',
      course: row.Course || '',
      holes: holes,
      par: par,
      teamScore: teamScore,
      teamFinish: row.TeamFinish || null
    };

    if (isJV) {
      jvEvents2026.push(event);
      jvSchedule2026.push({
        ...event,
        event: row.EventName
      });
    } else {
      events2026.push(event);
      schedule2026.push({
        ...event,
        event: row.EventName
      });
    }
  });

  // Process scores
  const scoresByPlayer = {};
  const scoresByEvent = {};

  scoresData.forEach(row => {
    if (!row.PlayerName || !row.EventName || !row.Score) return;

    const playerName = row.PlayerName.trim();
    const eventKey = createEventKey(row.EventDate, row.EventName);
    const score = parseInt(row.Score);

    if (isNaN(score) || score <= 0) return;

    // Group by player
    if (!scoresByPlayer[playerName]) {
      scoresByPlayer[playerName] = [];
    }
    scoresByPlayer[playerName].push({
      eventKey,
      eventName: row.EventName,
      eventDate: row.EventDate,
      score,
      par: parseInt(row.Par) || eventsMap[eventKey]?.par || 72
    });

    // Group by event
    if (!scoresByEvent[eventKey]) {
      scoresByEvent[eventKey] = [];
    }
    scoresByEvent[eventKey].push({
      playerName,
      score
    });
  });

  // Process players (only if --include-roster flag is set)
  let players2026 = [];
  if (shouldImportRoster && playersData.length > 0) {
    console.log('Importing roster from Players tab...');
    players2026 = playersData
      .filter(row => row.PlayerName)
      .map(row => ({
        name: row.PlayerName.trim(),
        grade: parseInt(row.Grade) || null,
        gradYear: parseInt(row.ClassYear) || null,
        team: (row.Level || '').toLowerCase() === 'jv' ? 'jv' : 'varsity'
      }));
  } else {
    console.log('Skipping roster import (use --include-roster to include)');
  }

  // Calculate player stats
  const playerStats2026 = [];
  const rankings2026 = [];

  Object.entries(scoresByPlayer).forEach(([playerName, scores]) => {
    const weightedAvg = calculateWeightedAverage(scores, eventsMap);
    if (weightedAvg === null) return;

    const allScores = scores.map(s => s.score);
    const lowRound = Math.min(...allScores);

    // Get last 3 scores for trend
    const last3 = scores.slice(-3);
    const last3Avg = last3.length > 0
      ? calculateWeightedAverage(last3, eventsMap)
      : null;

    playerStats2026.push({
      name: playerName,
      rounds: scores.length,
      average: Math.round(weightedAvg * 100) / 100,
      lowRound: lowRound,
      scores: scores.map(s => ({
        eventId: s.eventKey,
        score: s.score,
        counting: true
      }))
    });

    rankings2026.push({
      name: playerName,
      average: Math.round(weightedAvg * 100) / 100,
      trend: '',
      last3Avg: last3Avg ? Math.round(last3Avg * 100) / 100 : null
    });
  });

  // Sort rankings by average
  rankings2026.sort((a, b) => a.average - b.average);

  // Build heatmap data
  const allEvents2026 = [...events2026, ...jvEvents2026]
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const allEventHeaders2026 = allEvents2026.map(e => {
    const dateStr = e.dateISO;
    const month = dateStr.split('-')[1];
    const day = dateStr.split('-')[2];
    return `${month}/${day} - ${e.name}`;
  });

  const heatmapPlayerScores2026 = Object.entries(scoresByPlayer).map(([playerName, scores]) => {
    const scoreArray = new Array(allEventHeaders2026.length).fill(null);

    scores.forEach(s => {
      const event = allEvents2026.find(e =>
        createEventKey(e.dateISO, e.name) === s.eventKey
      );
      if (event) {
        const idx = allEvents2026.indexOf(event);
        if (idx !== -1) {
          scoreArray[idx] = s.score;
        }
      }
    });

    return {
      name: playerName,
      scores: scoreArray
    };
  });

  // Merge with existing data (preserve 2025)
  const result = { ...existingData };

  // Update players only if roster import is enabled
  if (shouldImportRoster && players2026.length > 0) {
    result.players = players2026;
    console.log(`Updated roster with ${players2026.length} players from Google Sheet`);
  } else {
    console.log('Keeping existing roster unchanged');
  }

  // Add 2026 data
  result.events2026 = events2026;
  result.jvEvents2026 = jvEvents2026;
  result.schedule2026 = schedule2026;
  result.jvSchedule2026 = jvSchedule2026;
  result.playerStats2026 = playerStats2026;
  result.rankings2026 = rankings2026;
  result.heatmap2026 = {
    eventHeaders: allEventHeaders2026,
    playerScores: heatmapPlayerScores2026
  };

  return result;
}

/**
 * Main function
 */
async function main() {
  try {
    // Load existing data
    const dataPath = path.join(__dirname, '../data/golfData.json');
    console.log(`Loading existing data from ${dataPath}...`);

    let existingData = {};
    if (fs.existsSync(dataPath)) {
      existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      console.log('Existing data loaded successfully');
    } else {
      console.log('No existing data file found, creating new one');
    }

    // Fetch data from Google Sheets
    console.log('\nFetching data from Google Sheets...');

    const eventsData = await fetchSheetTab('Events', TABS.events);
    console.log(`  Events: ${eventsData.length} rows`);

    const scoresData = await fetchSheetTab('Scores', TABS.scores);
    console.log(`  Scores: ${scoresData.length} rows`);

    let playersData = [];
    if (shouldImportRoster) {
      playersData = await fetchSheetTab('Players', TABS.players);
      console.log(`  Players: ${playersData.length} rows`);
    }

    // Transform data
    const updatedData = transformData(eventsData, scoresData, playersData, existingData, shouldImportRoster);

    // Save updated data
    console.log('\nSaving updated data...');
    fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
    console.log(`Data saved to ${dataPath}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Import Summary:');
    console.log('='.repeat(60));
    console.log(`Events (2026): ${updatedData.events2026?.length || 0} varsity, ${updatedData.jvEvents2026?.length || 0} JV`);
    console.log(`Player Stats (2026): ${updatedData.playerStats2026?.length || 0} players`);
    if (shouldImportRoster) {
      console.log(`Roster: ${updatedData.players?.length || 0} players (UPDATED)`);
    } else {
      console.log(`Roster: ${updatedData.players?.length || 0} players (unchanged)`);
    }
    console.log('\nImport completed successfully!');

  } catch (error) {
    console.error('\nError during import:', error.message);
    process.exit(1);
  }
}

main();
