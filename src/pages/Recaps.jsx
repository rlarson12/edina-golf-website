import recapsData from '../data/recaps.json'
import SEO from '../components/SEO'

// Renders inline markdown: [text](url) links and **bold**
function renderInline(text) {
  const parts = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[1] && match[2]) {
      parts.push(<a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-edina-green underline hover:text-edina-forest">{match[1]}</a>)
    } else if (match[3]) {
      parts.push(<strong key={match.index}>{match[3]}</strong>)
    }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function renderParagraphs(body) {
  return body.split('\n\n').map((p, i) => {
    // **Heading** on its own line
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <h4 key={i} className="font-bold text-gray-900 text-lg md:text-xl mt-6 mb-1" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {p.slice(2, -2)}
        </h4>
      )
    }
    return (
      <p key={i} className="text-gray-700 leading-relaxed text-sm md:text-base">
        {renderInline(p)}
      </p>
    )
  })
}

function RecapCard({ recap }) {
  // Single-body articles: use varsityBody as the full article body, skip section headers
  const isSingleBody = recap.singleBody === true

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Hero image if present — image is pre-cropped to 3:1, container matches */}
      {recap.heroImage && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3 / 1' }}>
          <img
            src={recap.heroImage}
            alt={recap.heroCaption || recap.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: recap.heroImagePosition || 'center center' }}
          />
          {recap.heroCaption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2">
              <p className="text-white text-xs italic">{recap.heroCaption}</p>
            </div>
          )}
        </div>
      )}

      {/* Article Header */}
      <div className="bg-edina-forest px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-bold text-edina-gold uppercase tracking-widest">
            The Hornet Fairway
          </span>
          <span className="text-green-300 text-xs">·</span>
          <span className="text-sm text-green-200">{recap.weekOf}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {recap.title}
        </h2>
      </div>

      {/* Article Body */}
      <div className="p-6 md:p-8">
        {isSingleBody ? (
          // Single continuous article
          <div className="space-y-4">
            {renderParagraphs(recap.varsityBody)}
            {recap.closingLine && (
              <>
                <hr className="border-gray-100 my-6" />
                <p className="text-sm text-gray-600 italic">{recap.closingLine}</p>
              </>
            )}
            <p className="font-bold text-edina-green mt-6">Go Hornets.</p>
          </div>
        ) : (
          // Two-section varsity/JV layout
          <div className="space-y-8">
            <section>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 border-l-4 border-edina-green pl-3 mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {recap.varsityHeadline}
              </h3>
              <div className="space-y-3">
                {renderParagraphs(recap.varsityBody)}
              </div>
            </section>

            <hr className="border-gray-100" />

            <section>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 border-l-4 border-edina-gold pl-3 mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                {recap.jvHeadline}
              </h3>
              <div className="space-y-3">
                {renderParagraphs(recap.jvBody)}
              </div>
            </section>

            <hr className="border-gray-100" />

            <p className="text-sm text-gray-600 italic">{recap.closingLine}</p>
          </div>
        )}
      </div>
    </article>
  )
}

function Recaps() {
  const sorted = [...recapsData.recaps].sort(
    (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
  )

  return (
    <div>
      <SEO title="Recaps" description="The Hornet Fairway — weekly recaps from the 2026 Edina Boys Golf season. Scores, results, and analysis after every event." path="/recaps" />
      {/* Hero */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="/images/Web%209.webp"
          alt="Season recaps"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 50%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-edina-gold text-sm font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>THE HORNET FAIRWAY</div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Season Recaps
            </h1>
            <p className="text-green-100 mt-2 text-sm md:text-base">
              Weekly recaps from the 2026 season — scores, standouts, and a healthy amount of Hornet pride.
            </p>
          </div>
        </div>
      </div>

      {/* Recaps Feed */}
      <section className="page-container">
        {sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Season recaps coming soon.</p>
            <p className="text-sm mt-1">Check back after the first event of the 2026 season.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {sorted.map((recap) => (
              <RecapCard key={recap.id} recap={recap} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Recaps
