function TeamInfo() {
  return (
    <div>
      {/* Hero Section with Sunset Photo */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src="/images/Web 9.jpg"
          alt="Team bonding"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 50%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
              TEAM INFO
            </h1>
            <p className="text-orange-200 text-lg">Everything you need to know for the 2026 season</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Tryouts & Registration */}
        <section className="card p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>2026 Tryouts & Registration</h1>

          <div className="space-y-4">
            {/* Registration */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-edina-green/10 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-edina-green text-white rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Registration</h3>
                <p className="text-gray-600">Spring sports registration is now open and <span className="font-semibold text-edina-green">REQUIRED</span> to participate in tryouts</p>
                <a
                  href="https://1922a.cf.wordwareinc.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-edina-green hover:underline mt-2"
                >
                  Register Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Optional Spring Break Practice */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-400 text-white rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Optional Spring Break Practice — March 16–19</h3>
                <p className="text-gray-600 mt-1">No official practice during spring break week, but optional sessions are available at OfficeGolf for fully registered players with an up-to-date physical.</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>📅 Monday–Thursday, March 16–19</li>
                  <li>🕓 Tee time blocks available 4:00–7:00 PM</li>
                  <li>📍 OfficeGolf — 5600 W 83rd St, Bloomington</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2 italic">Sign-up form sent separately by Coach Vernon. Open to registered players only.</p>
              </div>
            </div>

            {/* Practice Start */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Official Practice Begins — March 23</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li>📅 Monday–Thursday, March 23–27</li>
                  <li>🕓 3:30 PM – 7:30 PM</li>
                  <li>📍 OfficeGolf (indoor facility)</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">Individual time block assignments will be communicated by Coach Vernon. Conflicts can be accommodated on a case-by-case basis.</p>
                <p className="text-sm text-gray-500 mt-2 italic">Week of March 30: Same schedule unless courses open early — if we move outdoors to Braemar, revised times will be sent via the Sunday night communication.</p>
                <a
                  href="https://maps.google.com/?q=Office+Golf+5600+W+83rd+St+Bloomington+MN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-edina-green hover:underline mt-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Directions to OfficeGolf
                </a>
              </div>
            </div>

            {/* Tryout Dates */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tryout Dates — April 6–9</h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>📅 <span className="font-medium">Mon Apr 6 & Tue Apr 7</span> — Minimum 9-hole shotgun at Braemar, 4:00 PM</li>
                  <li>📅 <span className="font-medium">Wed Apr 8</span> — 18 holes at Edina Country Club, tee times from 3:00 PM</li>
                  <li>📅 <span className="font-medium">Thu Apr 9</span> — Braemar or Edina Country Club (weather contingency)</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">At least 36 holes total. Ideal format: 9 holes Mon & Tue, 18 holes Wed & Thu.</p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <a
                    href="https://maps.google.com/?q=Braemar+Golf+Course+6364+John+Harris+Dr+Edina+MN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-edina-green hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Braemar Golf Course
                  </a>
                  <a
                    href="https://maps.google.com/?q=Edina+Country+Club+5100+Londonderry+Rd+Edina+MN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-edina-green hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Edina Country Club
                  </a>
                </div>
              </div>
            </div>

            {/* Team Selection */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Selection</h3>
                <p className="text-gray-600">Varsity and JV teams announced April 10th</p>
              </div>
            </div>

            {/* Roster Size */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Roster</h3>
                <p className="text-gray-600">10 Varsity, 10 JV (20 total players)</p>
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
