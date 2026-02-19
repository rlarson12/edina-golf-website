# Edina Boys Golf Website – Site Management Guide

## Overview

This is the single reference doc for managing edinaboysgolf.com. It covers pre-season setup, post-event score updates, and ongoing maintenance. The site is React + Vite + Tailwind CSS, hosted on Netlify with auto-deploy from GitHub (github.com/rlarson12/edina-golf-website).

## Tools

- **Claude Code:** Code changes, data formatting, bug fixes, anything that touches local files. Open Terminal, cd into ~/Desktop/edina-golf-website, type `claude`.
- **Cowork:** iWanamaker scraping (requires browser to navigate the site). Also useful for verifying deploy previews visually.
- **Claude Chat:** Strategy, planning, prompt writing, reviewing screenshots. Cannot edit files or push code.

## Tech Stack

- **Framework:** React + Vite + Tailwind CSS
- **Hosting:** Netlify (auto-deploys from GitHub main branch)
- **Repo:** github.com/rlarson12/edina-golf-website
- **Data:** src/data/golfData.json (single source of truth for all scores, schedules, rosters)
- **Domain:** edinaboysgolf.com (managed via Namecheap)

## Git Workflow

```bash
# Standard workflow for changes:
cd ~/Desktop/edina-golf-website
git checkout main
git pull                          # Always pull latest before starting
git checkout -b branch-name       # Create feature branch
# ... make changes ...
git add .
git commit -m "Description of changes"
git push -u origin branch-name   # Push and create PR
# Review deploy preview, then merge PR on GitHub
# Netlify auto-deploys to edinaboysgolf.com
```

For quick fixes, Claude Code can commit directly to main and push.

---

## Pre-Season Setup (March, before first event)

### 1. Update Roster

In golfData.json, update the `players` array with the current year's roster:

- Player names, grades (FR/SO/JR/SR), varsity/JV designation
- Remove graduated players
- Add new players

### 2. Update Schedule

In golfData.json, update `schedule2026` (varsity) and `jvSchedule2026` (JV) with:

- Event dates
- Event names
- Course names
- Par for each course
- Whether the event is multi-day (isMultiDay: true)
- Event IDs in format: YYYY-MM-DD-VAR or YYYY-MM-DD-JV

### 3. Prepare Empty Data Sections

Ensure these sections exist and are empty/ready in golfData.json:

- `playerStats2026`: empty scores arrays for each player
- `heatmap2026`: eventHeaders empty, playerScores empty
- `scorecards2026`: empty array (will be populated after each event)
- `rankings2026`: initial varsity order (used for tiebreaking only, leaderboards are dynamic)
- `jvRankings2026`: initial JV order

### 4. Verify

Run `npm run dev` locally and check:
- Schedule page shows all 2026 events in chronological order
- Roster page shows correct players
- Stats/Heatmap pages are empty but functional
- Home page shows 2026 season tab

---

## Post-Event Score Update Workflow

This is the core recurring task. After each tournament, follow this process.

### What You Need

- iWanamaker event code or URL (coach will have this or find it at iwanamaker.com)
- Be logged into iWanamaker in Chrome

### Step 1: Open Cowork

Paste this prompt (fill in the event details):

```
Update the Edina Boys Golf website with scores from today's event.
Repo: github.com/rlarson12/edina-golf-website
Data file: src/data/golfData.json
I am logged into iWanamaker in Chrome.

Event: [EVENT NAME]
iWanamaker event code: [CODE or URL]
Date: [DATE]
Type: [Varsity / JV]
Holes: [18 / 9]

Read IWANAMAKER-WORKFLOW.md and SITE-MANAGEMENT.md from the repo for the full process.

Scrape the following from iWanamaker for this event:
1. Team score and team finish position
2. Individual player scores and finish positions for all Edina players
3. Hole-by-hole scorecards for EVERY Edina player (click into each player's scorecard view)

Then update golfData.json with:
- Event results in schedule section
- Individual scores in playerStats2026 (with eventId, score, counting: true, individualFinish)
- Heatmap column for this event
- Hole-by-hole data in scorecards2026 for every player

Commit to main and push. Verify the deploy on edinaboysgolf.com.
```

### Step 2: Verify

After Cowork pushes and Netlify deploys, check:
- Schedule page: event shows with team score, expands to show individual scores
- Stats page: averages updated, heatmap has new column
- Home page: leaderboard averages reflect new scores
- Roster: player cards show the new event
- Scorecards: clicking the scorecard icon shows hole-by-hole data

---

## Scoring Rules

### Average Calculation (2026)

The site calculates player averages using the **per-hole method**:

1. Sum all individual hole scores across all events for that player
2. Divide by total number of holes played
3. Multiply by 18

This naturally handles both 9-hole and 18-hole events without any special logic. A 9-hole round contributes 9 data points and an 18-hole round contributes 18, weighted fairly.

**Requires:** Hole-by-hole scorecard data for every player in every event. This is why the scraping workflow must capture scorecards for all players, not just top finishers.

### Average Calculation (2025 Legacy)

The 2025 season uses a simpler method: sum of all round scores divided by number of rounds. 9-hole rounds are doubled to create an 18-hole equivalent. This is less accurate but acceptable for a completed season.

### Counting Rounds

All tournament rounds count toward averages by default. If an event should be excluded (exhibition, scramble), set `counting: false` in the playerStats entry.

### Multi-Day Events

Each round is stored as a separate entry in playerStats with the same event ID prefix. The Schedule page combines them into R1/R2/Total/Finish format. The Roster page also combines them into a single line.

### Tiebreaking

When two players have the same displayed average, the rankings array order is used as a tiebreaker. This is set manually by the coach and reflects head-to-head performance or other factors.

---

## Data Schema Reference

### golfData.json Structure

```
{
  players: [...],                    // Roster
  schedule2026: [...],               // Varsity schedule
  jvSchedule2026: [...],             // JV schedule
  playerStats2026: [                 // Individual scores
    {
      name: "Player Name",
      scores: [
        {
          eventId: "2026-04-20-VAR",
          score: 72,
          counting: true,
          individualFinish: "T3"
        }
      ]
    }
  ],
  rankings2026: [...],               // Varsity tiebreak order
  jvRankings2026: [...],             // JV tiebreak order
  heatmap2026: {                     // Score matrix
    eventHeaders: ["04/20 - Event Name", ...],
    playerScores: [
      { name: "Player", scores: [72, null, ...] }
    ]
  },
  scorecards2026: [                  // Hole-by-hole data
    {
      playerName: "Player Name",
      eventDate: "2026-04-20",
      eventName: "Event Name",
      round: 1,
      par: [4,4,3,5,4,5,3,4,4, 4,5,3,4,5,4,4,3,4],
      scores: [4,4,3,4,4,5,3,4,4, 4,4,3,4,4,4,4,3,5],
      total: 70
    }
  ]
}
```

### 9-Hole Events

For 9-hole events, par and scores arrays have 9 entries instead of 18. The per-hole average calculation handles this automatically. On the scorecard display, only 9 holes are shown (no back 9 columns).

---

## Scorecard Display

Scorecards appear on the Schedule page when you expand a multi-day event and click the scorecard icon next to a player's round score. They show:

- Hole numbers (1-9, OUT, 10-18, IN, TOT) or (1-9, TOT) for 9-hole events
- Par row
- Score row with standard golf decorations:
  - Birdie (-1): red circle
  - Eagle (-2): double red circle
  - Bogey (+1): blue square
  - Double bogey (+2): double blue square
  - Triple bogey+ (+3 or worse): double blue square
  - Par: no decoration

---

## Dynamic vs Static Data

These update automatically when scores change (no manual work needed):
- Home page Varsity and JV leaderboards (calculated from playerStats)
- Stats page averages and heatmap
- Roster page player card averages and score history

These need manual updating:
- rankings2026 / jvRankings2026 (tiebreak order, update when coach wants to change it)
- Player roster changes (injuries, varsity/JV moves)

---

## iWanamaker Navigation

League → Minnesota State High School League → Schools → search "Edina" → Events → PAST (or current) → filter Boys

Each event has an event code in the URL. This code is what you give to Cowork.

---

## Troubleshooting

**Cowork won't connect (ECONNRESET):** Check status.anthropic.com. Wait and retry. This is an Anthropic service issue, not your problem.

**Claude Code context window low:** If you see "Context left until auto-compact: X%" getting below 15%, finish the current task, exit (`/exit`), and start a fresh session. Your code changes are saved in git.

**Deploy preview not updating:** Check the Netlify dashboard at app.netlify.com. Look for build errors. Most common issue: JSON syntax error in golfData.json.

**Averages look wrong:** Check for 9-hole scores that weren't handled correctly, or missing scorecard data. The per-hole calculation requires hole-by-hole data for every round.

**Player name wrong:** Find and replace in golfData.json. Check playerStats, heatmap, scorecards, and schedule sections — the name may appear in multiple places.
