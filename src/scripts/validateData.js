#!/usr/bin/env node

/**
 * Data Validation Script for Edina Boys Golf
 *
 * Validates golfData.json for consistency and correctness
 *
 * Usage:
 *   node src/scripts/validateData.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(60));
console.log('Edina Boys Golf - Data Validation');
console.log('='.repeat(60));
console.log('');

const errors = [];
const warnings = [];

/**
 * Add an error
 */
function addError(category, message) {
  errors.push({ category, message });
  console.log(`  [ERROR] ${message}`);
}

/**
 * Add a warning
 */
function addWarning(category, message) {
  warnings.push({ category, message });
  console.log(`  [WARN]  ${message}`);
}

/**
 * Main validation function
 */
function validateData() {
  // Load data
  const dataPath = path.join(__dirname, '../data/golfData.json');

  if (!fs.existsSync(dataPath)) {
    addError('File', `Data file not found: ${dataPath}`);
    return false;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch (e) {
    addError('File', `Invalid JSON: ${e.message}`);
    return false;
  }

  console.log('Checking data structure...\n');

  // 1. Validate Events
  console.log('1. Events Validation');
  console.log('-'.repeat(40));

  const allEvents = [...(data.events || []), ...(data.jvEvents || [])];
  const events2026 = [...(data.events2026 || []), ...(data.jvEvents2026 || [])];
  const totalEvents = [...allEvents, ...events2026];

  if (totalEvents.length === 0) {
    addWarning('Events', 'No events found in data');
  } else {
    console.log(`  Found ${allEvents.length} events (2025), ${events2026.length} events (2026)`);

    totalEvents.forEach(event => {
      // Check par values
      if (event.par) {
        if (event.holes === 9) {
          if (event.par < 30 || event.par > 40) {
            addWarning('Events', `Unusual par for 9-hole event "${event.name}": ${event.par}`);
          }
        } else {
          if (event.par < 68 || event.par > 76) {
            addWarning('Events', `Unusual par for 18-hole event "${event.name}": ${event.par}`);
          }
        }
      }

      // Check for missing course
      if (!event.course) {
        addWarning('Events', `Missing course for event "${event.name}"`);
      }
    });
  }
  console.log('');

  // 2. Validate Player Scores
  console.log('2. Score Validation');
  console.log('-'.repeat(40));

  const heatmapScores = data.heatmap?.playerScores || [];
  const heatmap2026Scores = data.heatmap2026?.playerScores || [];

  let unusualScores = 0;
  let totalScoresChecked = 0;

  [...heatmapScores, ...heatmap2026Scores].forEach(player => {
    player.scores.forEach((score, idx) => {
      if (score !== null) {
        totalScoresChecked++;
        if (score < 30) {
          addWarning('Scores', `Very low score for ${player.name}: ${score}`);
          unusualScores++;
        }
        if (score > 120) {
          addWarning('Scores', `Very high score for ${player.name}: ${score}`);
          unusualScores++;
        }
      }
    });
  });

  console.log(`  Checked ${totalScoresChecked} individual scores`);
  if (unusualScores === 0) {
    console.log('  All scores within normal range (30-120)');
  }
  console.log('');

  // 3. Validate Event Scores Count
  console.log('3. Event Coverage Validation');
  console.log('-'.repeat(40));

  const eventHeaders = data.heatmap?.eventHeaders || [];
  let lowCoverageEvents = 0;

  eventHeaders.forEach((header, idx) => {
    const scoresForEvent = heatmapScores
      .map(p => p.scores[idx])
      .filter(s => s !== null && s > 0);

    if (scoresForEvent.length < 4) {
      addWarning('Coverage', `Event "${header}" has only ${scoresForEvent.length} scores (need at least 4 for team scoring)`);
      lowCoverageEvents++;
    }
  });

  const event2026Headers = data.heatmap2026?.eventHeaders || [];
  event2026Headers.forEach((header, idx) => {
    const scoresForEvent = heatmap2026Scores
      .map(p => p.scores[idx])
      .filter(s => s !== null && s > 0);

    if (scoresForEvent.length > 0 && scoresForEvent.length < 4) {
      addWarning('Coverage', `2026 Event "${header}" has only ${scoresForEvent.length} scores`);
      lowCoverageEvents++;
    }
  });

  console.log(`  Checked ${eventHeaders.length + event2026Headers.length} events`);
  if (lowCoverageEvents === 0) {
    console.log('  All events have adequate score coverage');
  }
  console.log('');

  // 4. Validate 2-Day Event Totals
  console.log('4. Multi-Day Event Validation');
  console.log('-'.repeat(40));

  const scheduleEvents = [...(data.schedule || []), ...(data.jvSchedule || [])];
  let multiDayChecked = 0;
  let multiDayIssues = 0;

  scheduleEvents.forEach(event => {
    if (event.isMultiDay && event.rounds && event.rounds.length >= 2) {
      multiDayChecked++;

      // Extract numeric scores
      const extractScore = (scoreStr) => {
        if (!scoreStr) return null;
        const match = scoreStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
      };

      const r1Score = extractScore(event.rounds[0]?.teamScore);
      const r2Score = extractScore(event.rounds[1]?.teamScore);
      const totalScore = extractScore(event.teamScore);

      if (r1Score && r2Score && totalScore) {
        const calculatedTotal = r1Score + r2Score;
        if (calculatedTotal !== totalScore) {
          if (Math.abs(calculatedTotal - totalScore) > 1) {
            addWarning('Multi-Day', `${event.event}: R1(${r1Score}) + R2(${r2Score}) = ${calculatedTotal}, but total is ${totalScore}`);
            multiDayIssues++;
          }
        }
      }
    }
  });

  console.log(`  Checked ${multiDayChecked} multi-day events`);
  if (multiDayIssues === 0 && multiDayChecked > 0) {
    console.log('  All multi-day event totals are correct');
  }
  console.log('');

  // 5. Validate Player Averages (Weighted Formula)
  console.log('5. Average Calculation Validation');
  console.log('-'.repeat(40));

  // Build event info map for holes lookup
  const eventInfoMap = {};
  allEvents.forEach(event => {
    if (event.name) {
      eventInfoMap[event.name.toLowerCase()] = {
        par: event.par || 72,
        holes: event.holes || 18
      };
    }
  });

  const rankings = data.rankings || [];
  let avgMismatches = 0;
  let avgChecked = 0;

  // Spot-check players
  heatmapScores.slice(0, 10).forEach(player => {
    const ranking = rankings.find(r => r.name === player.name);
    if (!ranking) return;

    avgChecked++;

    // Calculate expected weighted average
    let totalStrokes = 0;
    let totalHoles = 0;

    player.scores.forEach((score, idx) => {
      if (score !== null && score > 0) {
        const header = eventHeaders[idx] || '';
        const eventName = header.replace(/^\d{2}\/\d{2} - /, '').toLowerCase();

        // Find matching event
        let holes = 18;
        const matchingKey = Object.keys(eventInfoMap).find(key =>
          key.includes(eventName) || eventName.includes(key)
        );
        if (matchingKey) {
          holes = eventInfoMap[matchingKey].holes;
        }

        totalStrokes += score;
        totalHoles += holes;
      }
    });

    if (totalHoles > 0) {
      const expectedAvg = (totalStrokes / totalHoles) * 18;
      const storedAvg = ranking.average;

      if (Math.abs(expectedAvg - storedAvg) > 0.5) {
        addWarning('Averages', `${player.name}: stored avg ${storedAvg.toFixed(1)}, calculated ${expectedAvg.toFixed(1)}`);
        avgMismatches++;
      }
    }
  });

  console.log(`  Spot-checked ${avgChecked} player averages`);
  if (avgMismatches === 0) {
    console.log('  All checked averages using weighted formula correctly');
  }
  console.log('');

  // 6. Validate Player Name Consistency
  console.log('6. Player Name Consistency');
  console.log('-'.repeat(40));

  const playerNames = new Set();
  const players = data.players || [];

  players.forEach(p => playerNames.add(p.name));
  heatmapScores.forEach(p => playerNames.add(p.name));
  rankings.forEach(r => playerNames.add(r.name));

  // Check for similar names that might be typos
  const nameArray = Array.from(playerNames);
  let possibleDupes = 0;

  for (let i = 0; i < nameArray.length; i++) {
    for (let j = i + 1; j < nameArray.length; j++) {
      const name1 = nameArray[i].toLowerCase();
      const name2 = nameArray[j].toLowerCase();

      // Check if names are very similar (simple check)
      const parts1 = name1.split(' ');
      const parts2 = name2.split(' ');

      if (parts1.length >= 2 && parts2.length >= 2) {
        if (parts1[1] === parts2[1]) {
          // Same last name
          const first1 = parts1[0];
          const first2 = parts2[0];
          if (first1.startsWith(first2) || first2.startsWith(first1)) {
            addWarning('Names', `Possibly duplicate names: "${nameArray[i]}" and "${nameArray[j]}"`);
            possibleDupes++;
          }
        }
      }
    }
  }

  console.log(`  Checked ${playerNames.size} unique player names`);
  if (possibleDupes === 0) {
    console.log('  No potential duplicate names found');
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('Validation Summary');
  console.log('='.repeat(60));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n  PASS - All validations passed!\n');
    return true;
  }

  if (errors.length > 0) {
    console.log(`\n  FAIL - ${errors.length} error(s) found`);
    errors.forEach(e => console.log(`    - [${e.category}] ${e.message}`));
  }

  if (warnings.length > 0) {
    console.log(`\n  WARNINGS - ${warnings.length} warning(s) found`);
    if (errors.length === 0) {
      console.log('  (Warnings do not cause validation to fail)\n');
      console.log('  PASS - Validation passed with warnings\n');
    }
  }

  return errors.length === 0;
}

// Run validation
const passed = validateData();
process.exit(passed ? 0 : 1);
