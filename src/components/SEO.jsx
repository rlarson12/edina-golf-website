import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, path = '' }) {
  const siteName = 'Edina Boys Golf'
  const baseUrl = 'https://edinaboysgolf.com'
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | 10× Minnesota State Champions`
  const fullDescription = description || 'Official home of Edina High School Boys Golf. 10× Minnesota State Champions. Schedules, scores, roster, stats, and weekly recaps from the Hornets.'
  const canonical = `${baseUrl}${path}`

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
    </Helmet>
  )
}
