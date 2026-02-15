# Edina Boys Golf Website

## Project Overview
This is the Edina High School Boys Golf team website built with React + Vite + Tailwind CSS, hosted on Netlify with auto-deploy from GitHub.

- **Live site:** https://edinaboysgolf.com
- **GitHub repo:** https://github.com/rlarson12/edina-golf-website (public)
- **Hosting:** Netlify (auto-deploys on push to main)
- **Data source:** iWanamaker.com (primary) / Google Sheets (fallback)

## Score Update Workflow (Primary — via iWanamaker)

After each tournament, ask Claude to scrape scores from iWanamaker. Say something like: "Update scores from iWanamaker event [code or URL]"

Claude should read IWANAMAKER-WORKFLOW.md for complete scraping instructions.

## Score Update Workflow (Fallback — via Google Sheets)

If iWanamaker is unavailable:
1. Enter scores in Google Sheet
2. Run: npm run update-and-validate
3. Push to GitHub (auto-deploys)

Google Sheet: https://docs.google.com/spreadsheets/d/13zHq2VRQ0939iPrdSl0-D2fS4k_fKXDLQo0mwwZVrE4/edit

## Key Files
- src/data/golfData.json — Main data file
- src/scripts/importFromSheets.js — Google Sheets import
- src/scripts/validateData.js — Data validation
- IWANAMAKER-WORKFLOW.md — iWanamaker scraping instructions
- SITE-MANAGEMENT.md — Full site management guide (setup, scoring, data schema, troubleshooting)

## NPM Scripts
- npm run dev — Local dev server
- npm run build — Production build
- npm run validate — Validate data
- npm run update-and-validate — Import from sheets + validate

## Git Workflow
git add .
git commit -m "Update scores: [Event Name]"
git push
