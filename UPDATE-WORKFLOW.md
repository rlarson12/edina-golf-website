# Edina Boys Golf - Score Update Workflow

This guide explains how to update scores and roster data from Google Sheets during the 2026 season.

## Overview

The website pulls 2026 season data from a Google Sheet. This allows coaches and team managers to update scores in a familiar spreadsheet interface, then sync to the website.

**Google Sheet URL:**
https://docs.google.com/spreadsheets/d/e/2PACX-1vSFnXbcpPkOUoYXHMTtI1hOSMNTvqBpexOUNXKpyaLlAX6NpgMNRYhpZkrERkeV8eSSYNy_RTYoqh1r/pubhtml

## Google Sheet Structure

The sheet has 3 tabs:

### Tab 1: Events
| Column | Description | Example |
|--------|-------------|---------|
| EventDate | Date of event (MM/DD/YYYY) | 04/20/2026 |
| EventName | Name of event | Lake Conference Tournament #1 |
| Level | Varsity or JV | Varsity |
| Course | Full course name | Chaska Town Course |
| Holes | 9 or 18 | 18 |
| Par | Course par | 72 |
| TeamScore | Team total strokes | 295 |
| TeamOverUnder | +/- par | +7 |
| TeamFinish | Placement | 2nd of 12 |

### Tab 2: Scores
| Column | Description | Example |
|--------|-------------|---------|
| EventDate | Date of event | 04/20/2026 |
| EventName | Must match Events tab exactly | Lake Conference Tournament #1 |
| PlayerName | Full player name | Anderson Wold |
| Score | Individual score | 74 |
| Par | Course par | 72 |
| +/- | Over/under par | +2 |

### Tab 3: Players
| Column | Description | Example |
|--------|-------------|---------|
| PlayerName | Full name (First Last) | Anderson Wold |
| Grade | Current grade (9-12) | 10 |
| ClassYear | Graduation year | 2028 |
| Level | Varsity or JV | Varsity |

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run update-from-sheets` | Import events and scores only (default) |
| `npm run update-from-sheets-with-roster` | Import events, scores, AND roster |
| `npm run validate` | Validate data integrity |
| `npm run update-and-validate` | Update (no roster) then validate |

## Standard Score Update Workflow

Use this workflow after each tournament to update scores:

### Step 1: Update Google Sheet
1. Open the Google Sheet
2. Add new event to **Events** tab
3. Add individual player scores to **Scores** tab
4. Make sure EventName matches exactly between tabs

### Step 2: Import Data
```bash
npm run update-and-validate
```

This runs:
1. `update-from-sheets` - Fetches data from Google Sheets
2. `validate` - Checks for errors and warnings

### Step 3: Review Validation Output
- **PASS** - Data is valid, proceed to build
- **WARNINGS** - Review warnings, usually OK to proceed
- **FAIL** - Fix errors in Google Sheet and re-run

### Step 4: Build and Deploy
```bash
npm run build && cp -r public/images dist/
```

Then deploy the `dist/` folder to Netlify.

## Roster Update Workflow

**Only update the roster after tryouts are finalized!**

The roster (Players tab) should only be imported at the start of the season or when the roster changes significantly.

### When to Use Roster Import
- Start of season (after tryouts)
- Mid-season roster changes
- Adding new players

### When NOT to Use Roster Import
- Regular score updates
- Adding new events
- Fixing score errors

### Roster Update Steps

1. Update **Players** tab in Google Sheet with final roster
2. Run import WITH roster flag:
   ```bash
   npm run update-from-sheets-with-roster
   ```
3. Validate:
   ```bash
   npm run validate
   ```
4. Build and deploy:
   ```bash
   npm run build && cp -r public/images dist/
   ```

## Important Notes

### Player Name Consistency
- Player names must match **exactly** across all tabs
- Use consistent spelling: "Anderson Wold" not "Andy Wold"
- First name + Last name format

### Event Name Matching
- EventName in **Scores** tab must match **Events** tab exactly
- Copy/paste to avoid typos

### 2-Day Events
For multi-day tournaments, create separate entries:
- Events tab: "Detroit Lakes Day 1", "Detroit Lakes Day 2"
- Or use combined: "Detroit Lakes" with `isMultiDay: true`

### 9-Hole Events
- Set Holes = 9
- Set Par = 35 (or appropriate 9-hole par)
- Scores will be weighted properly in averages

### Weighted Average Formula
The site calculates averages using:
```
(total strokes ÷ total holes) × 18
```
This properly weights 9-hole rounds as half of an 18-hole round.

## Troubleshooting

### "Error fetching Events: HTTP 403"
- Check that the Google Sheet is published to web
- Verify the sheet URL is correct

### "Event not found for score"
- EventName doesn't match between Events and Scores tabs
- Check for extra spaces or typos

### "Very low/high score warning"
- Scores under 30 or over 120 trigger warnings
- Verify the score is correct in Google Sheet

### Player average doesn't match expected
- Check that all scores are entered for the player
- Verify Holes column is correct for 9-hole events
- The site recalculates averages on import

### Roster didn't update
- Make sure you used `--include-roster` flag
- Run: `npm run update-from-sheets-with-roster`

## Data Preservation

- **2025 data is preserved** - Import only affects 2026 data
- The original `golfData.json` contains all 2025 season data
- 2026 data is stored in separate fields (events2026, scores2026, etc.)

## File Locations

| File | Purpose |
|------|---------|
| `src/data/golfData.json` | Main data file |
| `src/scripts/importFromSheets.js` | Import script |
| `src/scripts/validateData.js` | Validation script |
| `UPDATE-WORKFLOW.md` | This documentation |

## Quick Reference

### After every tournament:
```bash
npm run update-and-validate
npm run build && cp -r public/images dist/
# Deploy dist/ to Netlify
```

### After roster changes:
```bash
npm run update-from-sheets-with-roster
npm run validate
npm run build && cp -r public/images dist/
# Deploy dist/ to Netlify
```
