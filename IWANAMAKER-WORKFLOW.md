# iWanamaker Workflow

**Superseded by SCORE-UPDATE-RUNBOOK.md (Apr 20, 2026)**

See `SCORE-UPDATE-RUNBOOK.md` for the authoritative, tested procedure.

Key changes from this old doc:
- Do NOT require Reed to be logged in — Ava logs in programmatically via Playwright
- Use `/event/{id}` (singular), not `/events/`
- Find event IDs via API interception, not brute-force scanning
- Write scores to `events2026[]` and `jvEvents2026[]`, NOT `schedule2026[]`
