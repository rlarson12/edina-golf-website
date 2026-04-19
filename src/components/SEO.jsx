import { Helmet } from 'react-helmet-async'

// Build Person schema for a player with optional social/profile links
function buildPersonSchema(player, baseUrl) {
  const sameAs = []
  if (player.instagram) sameAs.push(`https://www.instagram.com/${player.instagram}/`)
  if (player.ajgaUrl) sameAs.push(player.ajgaUrl)
  if (player.jgsUrl) sameAs.push(player.jgsUrl)
  if (player.ghinUrl) sameAs.push(player.ghinUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    url: `${baseUrl}/roster`,
    memberOf: {
      '@type': 'SportsTeam',
      name: 'Edina Boys Golf',
      url: baseUrl,
      sport: 'Golf',
    },
    ...(player.gradYear && { description: `Class of ${player.gradYear} junior golfer at Edina High School` }),
    ...(sameAs.length > 0 && { sameAs }),
  }
}

export default function SEO({ title, description, path = '', players = [] }) {
  const siteName = 'Edina Boys Golf'
  const baseUrl = 'https://edinaboysgolf.com'
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | 10× Minnesota State Champions`
  const fullDescription = description || 'Official home of Edina High School Boys Golf. 10× Minnesota State Champions. Schedules, scores, roster, stats, and weekly recaps from the Hornets.'
  const canonical = `${baseUrl}${path}`

  // Players with social/profile links get Person schema blocks
  const playerSchemas = players
    .filter(p => p.instagram || p.ajgaUrl || p.jgsUrl || p.ghinUrl)
    .map(p => buildPersonSchema(p, baseUrl))

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      {playerSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
