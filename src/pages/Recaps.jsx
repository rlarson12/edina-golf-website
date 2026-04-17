import recapsData from '../data/recaps.json'

function RecapCard({ recap }) {
  const paragraphsVarsity = recap.varsityBody.split('\n\n')
  const paragraphsJV = recap.jvBody.split('\n\n')

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Article Header */}
      <div className="bg-edina-forest px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-bold text-edina-gold uppercase tracking-widest">
            The Hornet Fairway
          </span>
          <span className="text-green-300 text-xs">·</span>
          <span className="text-sm text-green-200">Week of {recap.weekOf}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {recap.title}
        </h2>
      </div>

      {/* Article Body */}
      <div className="p-6 md:p-8 space-y-8">

        {/* Varsity Section */}
        <section>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 border-l-4 border-edina-green pl-3 mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {recap.varsityHeadline}
          </h3>
          <div className="space-y-3">
            {paragraphsVarsity.map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed text-sm md:text-base">{p}</p>
            ))}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* JV Section */}
        <section>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 border-l-4 border-edina-gold pl-3 mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {recap.jvHeadline}
          </h3>
          <div className="space-y-3">
            {paragraphsJV.map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed text-sm md:text-base">{p}</p>
            ))}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Closing Line */}
        <p className="text-sm text-gray-600 italic">{recap.closingLine}</p>
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
