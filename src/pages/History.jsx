function History() {
  const championshipYears = [2023, 2022, 2019, 2014, 1987, 1978, 1977, 1973, 1970, 1954]

  const collegeGolfers = [
    { gradYear: '2025', player: 'Torger Ohe', college: 'University of Minnesota', notes: 'Individual State Champion - 2024' },
    { gradYear: '2025', player: 'Sam LaFrenz', college: 'Gustavus Adolphus College', notes: '' },
    { gradYear: '2024', player: 'Gavin Sendar', college: 'Wesleyan University', notes: '' },
    { gradYear: '2024', player: 'Jimmy Abdo', college: 'Gustavus Adolphus College', notes: '2025 U.S. Amateur Championship - Round of 8' },
    { gradYear: '2024', player: 'Ben Sanderson', college: 'Amherst College', notes: '' },
    { gradYear: '2024', player: 'Gus Breuer', college: 'Hamilton College', notes: '' },
    { gradYear: '2023', player: 'Parker Hughes', college: 'Eastern Illinois University', notes: '' },
    { gradYear: '2023', player: 'Owen Nielsen', college: 'Williams College', notes: '' },
    { gradYear: '2022', player: 'Jack Wetzel', college: 'University of Minnesota', notes: 'Individual State Champion - 2022' },
    { gradYear: '2022', player: 'Charlie Nasby', college: 'University of St. Thomas', notes: '' },
    { gradYear: '2017', player: 'Jack Ebner', college: 'Miami University (OH)', notes: '' },
    { gradYear: '2015', player: 'Kobi Boe', college: 'University of Nebraska Omaha', notes: '' },
    { gradYear: '2015', player: 'Ben Olson', college: 'University of Loyola Chicago', notes: '' },
    { gradYear: '2015', player: 'Sam Foust', college: 'University of Oregon', notes: '2016 NCAA National Champion (Oregon), Current Associate Head Coach, University of San Diego' },
    { gradYear: '1980', player: 'Chris Perry', college: 'Ohio State University', notes: '3x Individual State Champion (1978, 1979, 1980), PGA Tour Pro, 2025 MN Golf Hall of Fame' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        <img
          src="/images/School.png"
          alt="Edina High School"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 50%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
              PROGRAM HISTORY
            </h1>
            <p className="text-green-200 text-lg">A Legacy of Excellence</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* State Championships Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            {/* MSHSL Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/images/mshsl.png"
                alt="MSHSL"
                className="h-24 md:h-32 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>

            {/* Championship Header */}
            <div className="inline-block">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-edina-green mb-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                10x MSHSL AAA State Champions
              </h2>
              <div className="w-32 h-1 bg-edina-gold mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Championship Years */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {championshipYears.map((year) => (
              <div
                key={year}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-edina-gold to-yellow-600 text-white font-bold text-lg md:text-xl px-5 py-3 md:px-6 md:py-4 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {year}
                </div>
                {/* Trophy icon on hover */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-edina-gold drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4H19C19 2.9 19.9 2 21 2V4H22V8C22 9.1 21.1 10 20 10H19.8C19.3 11.2 18.4 12.3 17.2 13C17.7 13.9 18 14.9 18 16C18 19.3 15.3 22 12 22S6 19.3 6 16C6 14.9 6.3 13.9 6.8 13C5.6 12.3 4.7 11.2 4.2 10H4C2.9 10 2 9.1 2 8V4H3V2C4.1 2 5 2.9 5 4H10C10 2.9 10.9 2 12 2ZM4 8H4.4C4.2 7.4 4 6.7 4 6H4V8ZM20 8V6H20C20 6.7 19.8 7.4 19.6 8H20ZM12 4C8.7 4 6 6.7 6 10S8.7 16 12 16 18 13.3 18 10 15.3 4 12 4Z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Championship Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-edina-gold" style={{ fontFamily: "'Oswald', sans-serif" }}>10</div>
              <div className="text-sm text-gray-600">State Titles</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-edina-green" style={{ fontFamily: "'Oswald', sans-serif" }}>70</div>
              <div className="text-sm text-gray-600">Years of History</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-edina-green" style={{ fontFamily: "'Oswald', sans-serif" }}>4</div>
              <div className="text-sm text-gray-600">Titles Since 2014</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-edina-green" style={{ fontFamily: "'Oswald', sans-serif" }}>2</div>
              <div className="text-sm text-gray-600">Back-to-Back ('22-'23)</div>
            </div>
          </div>
        </div>

        {/* College Golfers Section */}
        <div>
          <div className="mb-8">
            <h2
              className="text-2xl md:text-3xl font-bold text-gray-900"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Hornets Playing at the Next Level
            </h2>
            <div className="w-24 h-1 bg-edina-green mt-2 rounded-full"></div>
            <p className="text-gray-600 mt-3">Edina golfers who continued their careers at the collegiate level</p>
          </div>

          {/* Featured Photos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="relative rounded-xl overflow-hidden shadow-lg group">
              <img
                src="/images/Torger state.jpeg"
                alt="Torger Ohe at State"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-semibold">Torger Ohe</p>
                <p className="text-green-200 text-sm">University of Minnesota</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-lg group">
              <img
                src="/images/Jimmy Abdo Am.jpeg"
                alt="Jimmy Abdo"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-semibold">Jimmy Abdo</p>
                <p className="text-green-200 text-sm">Gustavus Adolphus College</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-lg group">
              <img
                src="/images/Jack state.jpeg"
                alt="Jack Wetzel at State"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-semibold">Jack Wetzel</p>
                <p className="text-green-200 text-sm">University of Minnesota</p>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Grad Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {collegeGolfers.map((golfer, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {golfer.gradYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{golfer.player}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-edina-green font-medium">
                      {golfer.college}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 italic">
                      {golfer.notes && `*${golfer.notes}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {collegeGolfers.map((golfer, index) => (
              <div key={index} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{golfer.player}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {golfer.gradYear}
                  </span>
                </div>
                <div className="text-sm text-edina-green font-medium mb-1">
                  {golfer.college}
                </div>
                {golfer.notes && (
                  <div className="text-xs text-gray-500 italic">
                    *{golfer.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-10 bg-gray-50 rounded-xl p-6 md:p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Know a Hornet playing college golf?</h3>
            <p className="text-gray-600 mb-4">
              Help us keep this list updated. Contact us with information about Edina alumni playing collegiate golf.
            </p>
            <a
              href="mailto:rlarson12@gmail.com?subject=Edina%20Golf%20Alumni%20Update"
              className="inline-flex items-center gap-2 bg-edina-green hover:bg-edina-green-dark text-white font-medium py-2 px-5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Submit Update
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default History
