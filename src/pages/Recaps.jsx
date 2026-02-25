import recapsData from '../data/recaps.json'

function RecapCard({ recap }) {
  const paragraphsVarsity = recap.varsityBody.split('\n\n')
  const paragraphsJV = recap.jvBody.split('\n\n')

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Article Header */}
      <div className="bg-edina-green px-6 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-bold text-edina-gold uppercase tracking-widest">
            The Hornet Fairway
          </span>
          <span className="text-green-300 text-xs">·</span>
          <span className="text-xs text-green-200">Week of {recap.weekOf}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
          {recap.title}
        </h2>
      </div>

      {/* Article Body */}
      <div className="p-6 md:p-8 space-y-8">

        {/* Varsity Section */}
        <section>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 border-l-4 border-edina-green pl-3 mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
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
          <h3 className="text-lg md:text-xl font-bold text-gray-900 border-l-4 border-edina-gold pl-3 mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
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
        <p className="text-sm text-gray-500 italic">{recap.closingLine}</p>
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
      <section className="bg-edina-green py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-edina-gold text-xs font-bold uppercase tracking-widest mb-1">Edina Boys Golf</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
                The Hornet Fairway
              </h1>
              <p className="text-green-100 mt-2 text-sm md:text-base">
                Weekly recaps from the 2026 season — scores, standouts, and a healthy amount of Hornet pride.
              </p>
            </div>
          </div>
        </div>
      </section>

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
