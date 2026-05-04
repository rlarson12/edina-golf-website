/**
 * diff.js — Best-75% Diff methodology helpers
 *
 * Differential per round is computed as (score - par) using course par as a proxy
 * (golfData.json does not include courseRating/slope per round, so score-relative-to-par
 * is used as an approximation of the standard USGA formula: (score - courseRating) * 113 / slope).
 *
 * Best-75% means: sort all valid round differentials ascending, keep the lowest
 * Math.ceil(n * 0.75), and average those.
 *
 * Provisional flag: fewer than 4 valid rounds → isProvisional = true.
 */

/**
 * Compute the best-75% adjusted differential for a player.
 *
 * @param {Array<number|null>} scores   - Per-event score array from heatmap playerScores
 * @param {Array<string>} eventHeaders  - Parallel array of event header strings
 * @param {Function} getEventPar        - (eventHeader: string) => number  (returns par for that event)
 * @returns {{ diff: number|null, isProvisional: boolean, validRoundCount: number }}
 */
export function computeAdjustedDiff(scores, eventHeaders, getEventPar) {
  const differentials = []

  scores.forEach((score, idx) => {
    if (score === null || score === undefined || score <= 0) return
    const header = eventHeaders[idx] || ''
    const par = getEventPar(header)
    if (!par || par <= 0) return
    differentials.push(score - par)
  })

  const n = differentials.length
  if (n === 0) return { diff: null, isProvisional: false, validRoundCount: 0 }

  const keepCount = Math.ceil(n * 0.75)
  const sorted = [...differentials].sort((a, b) => a - b)
  const best = sorted.slice(0, keepCount)
  const avg = best.reduce((sum, d) => sum + d, 0) / best.length

  return {
    diff: avg,
    isProvisional: n < 4,
    validRoundCount: n,
  }
}

/**
 * Format a differential result object into a display string.
 *
 * Rules:
 *  - null diff          → '—'
 *  - isProvisional      → prefix with '~'
 *  - diff === 0 (exact) → 'E' (possibly '~E')
 *  - diff > 0           → '+X.X' (possibly '~+X.X')
 *  - diff < 0           → '-X.X' (possibly '~-X.X')
 *
 * @param {{ diff: number|null, isProvisional?: boolean, validRoundCount?: number }|number|null} input
 * @returns {string}
 */
export function formatDiff(input) {
  // Accept legacy scalar calls (diff value only) for backwards-compat
  let diff, isProvisional
  if (input === null || input === undefined || typeof input === 'number') {
    diff = input
    isProvisional = false
  } else {
    diff = input.diff
    isProvisional = input.isProvisional ?? false
  }

  if (diff === null || diff === undefined) return '—'

  const rounded = Math.round(diff * 10) / 10
  const prefix = isProvisional ? '~' : ''

  if (rounded === 0) return `${prefix}E`
  if (rounded > 0) return `${prefix}+${rounded.toFixed(1)}`
  return `${prefix}${rounded.toFixed(1)}`
}
