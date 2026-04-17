function Coaches() {
  const varsityCoaches = [
    {
      name: 'Tim Vernon',
      title: 'Varsity Head Coach',
      photo: '/images/Coach Vernon .webp',
      credentials: ['PGA', 'MN Section Golf Executive of the Year 2025'],
      email: 'TVernon@yamahagu.com',
      phone: '612-206-6499',
      bio: '36-year PGA Professional in the Minnesota Section and current officer on the Minnesota Section PGA Board. Played in four Michigan state championships and competed at Michigan State University. A lifelong member of the Edina golf community, Tim sponsors the Minnesota State Opens and the MN PGA Junior Tours.',
    },
    {
      name: 'Marty Lass',
      title: 'Assistant Coach',
      photo: '/images/Coach Lass.webp',
      credentials: ['PGA'],
      bio: 'Retired after 35 years as Head Golf Professional at Edina Country Club. Played at Ferris State University, competing in two national championships, before earning his PGA membership in 1984. Widely regarded throughout the Minnesota section as one of the premier short game instructors in the state.',
    },
    {
      name: 'Dave Podas',
      title: 'Assistant Coach',
      photo: '/images/Coach Podas.webp',
      credentials: ['PGA', 'PGA Tour', 'Ryder Cup Official'],
      bio: 'Retired Director of Golf at Bel-Air Country Club and member of the PGA of America Rules Committee, where he officiates major tour events including the Ryder Cup. Has competed on the PGA Tour and PGA Tour Champions across a 40-year professional career.',
    },
    {
      name: 'Dick Blooston',
      title: 'Assistant Coach',
      photo: '/images/Coach Blooston.webp',
      credentials: ['MN Golf Hall of Fame'],
      bio: 'Minnesota Golf Hall of Fame inductee with a competitive career spanning over 60 years. Played for the Gophers in 1963–64 and won the Big Ten title in 1963. Known to generations of Edina families as a legendary hockey coach, he now brings that same championship standard to the golf program.',
    },
    {
      name: 'Jim Deutsch',
      title: 'Assistant Coach',
      photo: '/images/Coach Deutsch.webp',
      credentials: ['PGA'],
      bio: '36-year PGA Professional and rules official for the Minnesota PGA Section. Completed a 13-year head coaching career at St. Thomas University, where the program competed in multiple national championships. Has been playing competitive golf professionally and collegiately for over 60 years.',
    },
  ]

  const jvCoaches = [
    {
      name: 'Cole Johnson',
      title: 'JV Head Coach',
      photo: '/images/Coach-ColeJohnson.webp',
      credentials: [],
      bio: 'Returning for his second season with the Hornets. Based in St. Louis Park and works at OfficeGolf. Played high school golf at West Fargo Sheyenne before continuing his career at the University of North Dakota.',
    },
    {
      name: 'Mitch Cowger',
      title: 'Assistant Coach',
      photo: '/images/Coach-MitchCowger.webp',
      credentials: [],
      bio: 'Returning assistant coach who brings a versatile coaching background across multiple sports. Coach Cowger focuses on the full development of each athlete — on the course and beyond it.',
    },
  ]

  const renderCoachCard = (coach, index) => (
    <div key={index} className={`card p-6 ${coach.placeholder ? 'opacity-60' : ''}`}>
      <div className="flex flex-col items-center text-center">
        {/* Photo */}
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-100 mb-4 shadow-lg ring-4 ring-edina-green/20">
          {coach.photo ? (
            <>
              <img
                src={coach.photo}
                alt={coach.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="w-full h-full bg-edina-green items-center justify-center hidden">
                <span className="text-3xl font-bold text-white">
                  {coach.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Header Info */}
        <h3 className="text-lg font-bold text-gray-900">{coach.name}</h3>
        <p className="text-edina-green font-medium">{coach.title}</p>

        {/* Credentials */}
        {coach.credentials.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {coach.credentials.map((cred, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {cred}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {coach.bio && (
          <p className="text-sm text-gray-600 mt-3 text-center leading-relaxed">{coach.bio}</p>
        )}

        {/* Contact */}
        {(coach.email || coach.phone) && (
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-2 w-full">
            {coach.email && (
              <a
                href={`mailto:${coach.email}`}
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-edina-green transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {coach.email}
              </a>
            )}
            {coach.phone && (
              <a
                href={`tel:${coach.phone}`}
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-edina-green transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {coach.phone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        <img
          src="/images/Web%205.webp"
          alt="Golf course"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              COACHING STAFF
            </h1>
            <p className="text-green-200 text-lg">The leaders behind Edina Boys Golf</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Varsity Coaches */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Varsity</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {varsityCoaches.map((coach, index) => renderCoachCard(coach, index))}
        </div>
      </div>

      {/* JV Coaches */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Junior Varsity</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jvCoaches.map((coach, index) => renderCoachCard(coach, index))}
        </div>
      </div>
      </div>
    </div>
  )
}

export default Coaches
