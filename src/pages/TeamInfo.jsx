function TeamInfo() {
  return (
    <div>
      {/* Hero Section with Sunset Photo */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src="/images/Web%209.webp"
          alt="Team bonding"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 50%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              TEAM INFO
            </h1>
            <p className="text-orange-200 text-lg">Everything you need to know for the 2026 season</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="max-w-4xl mx-auto space-y-8">
        {/* 2026 Season Info */}
        <section className="card p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>2026 Season</h1>

          <div className="space-y-4">
            {/* Roster Size */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-edina-green text-white rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Roster</h3>
                <p className="text-gray-600">13 Varsity, 12 JV (25 total players)</p>
              </div>
            </div>

            {/* Season Opener */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">First Match</h3>
                <p className="text-gray-600">April 20 at Braemar Golf Course</p>
              </div>
            </div>
          </div>
        </section>


        </div>
      </div>
    </div>
  )
}

export default TeamInfo
