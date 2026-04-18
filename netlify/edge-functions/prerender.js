// Netlify Edge Function: prerender.js
// Intercepts crawler requests and injects page-specific meta tags into the HTML shell.
// This ensures Googlebot sees unique, meaningful titles and descriptions per page
// even though the app is a SPA. Full content prerendering requires a headless browser
// service; this provides the critical SEO metadata layer.

const BOT_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'applebot', 'twitterbot', 'facebookexternalhit',
  'linkedinbot', 'whatsapp', 'telegrambot', 'discordbot',
  'rogerbot', 'semrushbot', 'ahrefsbot', 'mj12bot',
]

const PAGE_META = {
  '/': {
    title: 'Edina Boys Golf | 10× Minnesota State Champions',
    description: 'Official home of Edina High School Boys Golf. 10× Minnesota State Champions. Schedules, scores, roster, stats, and weekly recaps from the Hornets.',
  },
  '/schedule': {
    title: 'Schedule | Edina Boys Golf',
    description: 'Edina Boys Golf 2026 schedule — varsity and JV events, dates, courses, and results all season long.',
  },
  '/roster': {
    title: 'Roster | Edina Boys Golf',
    description: 'Meet the 2026 Edina Boys Golf roster — 13 varsity and 12 JV Hornets competing for a state title.',
  },
  '/stats': {
    title: 'Stats | Edina Boys Golf',
    description: '2026 Edina Boys Golf stats — individual scoring averages, team leaderboard, and score matrix updated after every event.',
  },
  '/recaps': {
    title: 'Recaps | Edina Boys Golf',
    description: 'The Hornet Fairway — weekly recaps from the 2026 Edina Boys Golf season. Scores, results, and analysis after every event.',
  },
  '/coaches': {
    title: 'Coaches | Edina Boys Golf',
    description: 'Meet the Edina Boys Golf coaching staff — Head Coach Tim Vernon and assistants leading a 10× Minnesota state championship program.',
  },
  '/history': {
    title: 'History | Edina Boys Golf',
    description: 'Edina Boys Golf history — 10 Minnesota state championships, decades of excellence, and a legacy built at Braemar.',
  },
  '/photos': {
    title: 'Photos | Edina Boys Golf',
    description: 'Photos from the Edina Boys Golf 2026 season and program archives.',
  },
  '/support-team': {
    title: 'Support Team | Edina Boys Golf',
    description: "The families and volunteers behind Edina Boys Golf — captains' parents and program supporters.",
  },
  '/team-info': {
    title: 'Team Info | Edina Boys Golf',
    description: 'Edina High School Boys Golf program information — tryout process, team structure, and how to join the Hornets.',
  },
}

export default async function handler(request, context) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  const isBot = BOT_AGENTS.some(bot => ua.includes(bot))

  if (!isBot) {
    // Regular user — serve normally
    return context.next()
  }

  const url = new URL(request.url)
  const pathname = url.pathname.replace(/\/$/, '') || '/'
  const meta = PAGE_META[pathname] || PAGE_META['/']

  // Fetch the SPA shell
  const response = await context.next()
  const html = await response.text()

  // Inject correct title, meta description, and canonical for this route
  const canonical = `https://edinaboysgolf.com${pathname === '/' ? '' : pathname}`
  const patched = html
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${meta.title}</title>`
    )
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${meta.description}"`
    )
    .replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${canonical}"`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${meta.title}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${meta.description}"`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${meta.title}"`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${meta.description}"`
    )

  return new Response(patched, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      'content-type': 'text/html; charset=utf-8',
      'x-prerendered': 'edge-function',
    },
  })
}

export const config = {
  path: '/*',
}
