function SupportTeam() {
  const captainsParents = [
    {
      name: 'Jeff & Alley Ohe',
      photo: '/images/Captains Parents - Ohes.webp',
      email: 'jeffandalleyohe@gmail.com',
      contacts: [
        { name: 'Alley', phone: '612-670-0322' },
        { name: 'Jeff', phone: '612-859-2726' },
      ],
    },
    {
      name: 'Steve & Kristi Colby',
      photo: '/images/Captains Parents - Colbys.webp',
      contacts: [
        { name: 'Kristi', phone: '612-590-2984' },
        { name: 'Steve', phone: '612-910-0708' },
      ],
    },
  ]

  const finance = [
    {
      name: 'Caitlin Sidey',
      role: 'Treasurer',
      photo: '/images/Treasuer - Caitlin.webp',
      email: 'treasurer@edinaboysgolf.com',
      phone: '612-859-0923',
      venmo: '@Caitlin-Sidey',
    },
  ]

  const renderMemberCard = (member, index, large = false) => (
    <div key={index} className="card p-6">
      <div className="flex flex-col items-center text-center">
        {/* Photo */}
        <div className={`rounded-full overflow-hidden bg-gray-100 mb-4 ${
          large ? 'w-40 h-40 md:w-52 md:h-52' : 'w-28 h-28 md:w-36 md:h-36'
        }`}>
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div className="w-full h-full bg-edina-green items-center justify-center hidden">
            <span className={`font-bold text-white ${large ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
              {member.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
            </span>
          </div>
        </div>

        {/* Info */}
        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
        {member.role && <p className="text-edina-green font-medium">{member.role}</p>}
        <div className="mb-4"></div>

        {/* Contact */}
        <div className="border-t border-gray-100 pt-4 w-full space-y-2">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-edina-green transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{member.email}</span>
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-edina-green transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {member.phone}
            </a>
          )}
          {member.contacts && (
            <div className="space-y-1">
              {member.contacts.map((contact, i) => (
                <a
                  key={i}
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-edina-green transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contact.name}: {contact.phone}
                </a>
              ))}
            </div>
          )}
          {member.venmo && (
            <a
              href={`https://venmo.com/${member.venmo.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-edina-green transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.27 3c.76 1.24 1.1 2.54 1.1 4.17 0 5.17-4.4 11.9-7.97 16.63H5.96L3 4.37l5.8-.5.97 11.55c1.82-2.94 4.07-7.58 4.07-10.76 0-1.55-.27-2.61-.72-3.47L19.27 3z"/>
              </svg>
              Venmo: {member.venmo}
            </a>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        <img
          src="/images/Team4.webp"
          alt="Team photo"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 45%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
              SUPPORT TEAM
            </h1>
            <p className="text-green-200 text-lg">The families behind Edina Boys Golf</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Captains Parents */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Oswald', sans-serif" }}>Captains Parents</h2>
            <div className="w-20 h-1 bg-edina-green mt-2 rounded-full"></div>
          </div>
        <div className="grid gap-6 md:grid-cols-2">
          {captainsParents.map((member, index) => renderMemberCard(member, index, true))}
        </div>
      </div>

      {/* Finance */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Oswald', sans-serif" }}>Finance</h2>
          <div className="w-16 h-1 bg-edina-green mt-2 rounded-full"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {finance.map((member, index) => renderMemberCard(member, index))}
        </div>
      </div>

      {/* Support the Program */}
      <div className="mt-12">
        <div className="card-static p-6 md:p-8 bg-gray-50">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>Support the Program</h2>
          <p className="text-gray-600 mb-6">
            Interested in supporting Edina Boys Golf? Whether through sponsorship, donations, or volunteering, we'd love to hear from you.
          </p>
          <a
            href="mailto:info@edinaboysgolf.com?subject=Supporting%20Edina%20Boys%20Golf"
            className="inline-flex items-center gap-2 bg-edina-green hover:bg-edina-green-dark text-white font-medium py-2 px-5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Us
          </a>
        </div>
      </div>
      </div>
    </div>
  )
}

export default SupportTeam
