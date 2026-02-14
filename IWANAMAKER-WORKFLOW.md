# iWanamaker Score Update Workflow

This document tells Claude how to scrape scores from iWanamaker and update the Edina Boys Golf website.

## Trigger

User says: Update scores from iWanamaker event [code or URL]

## Prerequisites

- User must be logged into iWanamaker.com in their browser
- GitHub repo: https://github.com/rlarson12/edina-golf-website
- Main data file: src/data/golfData.json

## Step 1: Get Event Info

Navigate to https://www.iwanamaker.com/event/{eventCode}
Extract: event name, course, date, par, holes, level (Varsity or JV)

## Step 2: Get Team Results

On Team leaderboard, find Edina row.
Extract: team position, overall score, over/under, R1 and R2 scores.
Count total teams. Format as 2nd of 13.

## Step 3: Get Individual Results

Switch to Individual Gross Strokes Full Field dropdown.
For each Edina player extract: finish position, name, grade, overall score, over/under, R1 and R2.
Count total players in field.

## Step 4: Get Hole-by-Hole Scorecards

Click each Edina player to expand scorecard.
Extract PAR and GROSS rows for each round.
For Round 2, click the Round 2 tab and repeat.

## Step 5: Format Data

Match golfData.json schema. Events go in events2026 or jvEvents2026.
Player scores go in playerStats2026 with individualFinish field.
Scorecards go in scorecards2026 array.

## Step 6: Merge and Save

1. Fetch current golfData.json from GitHub
2. Merge new event data
3. Recalculate averages: (total strokes / total holes) x 18
4. Re-sort rankings2026 by average
5. Update heatmap2026
6. Save updated golfData.json

## Step 7: Deliver

Save updated golfData.json. User replaces in project and runs:
git add src/data/golfData.json
git commit -m Update scores
git push
Netlify auto-deploys.

## Notes

- 2-day events: separate entries per day
- 9-hole events: holes=9, par=35/36, weighted in averages
- Player names must match exactly
- JV events go in jvEvents2026 and jvSchedule2026
