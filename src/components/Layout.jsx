import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Roster', href: '/roster' },
  { name: 'Stats', href: '/stats' },
  { name: 'Coaches', href: '/coaches' },
  { name: 'Support Team', href: '/support-team' },
  { name: 'Team Info', href: '/team-info' },
  { name: 'History', href: '/history' },
  { name: 'Photos', href: '/photos' },
]

function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-edina-green shadow-lg sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/images/Hornet.jpeg"
                  alt="Edina Hornets"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <div className="text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
                <div className="font-bold text-sm md:text-lg leading-tight">Edina High School</div>
                <div className="text-xs md:text-sm text-green-100 leading-tight">Boys Golf</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-green-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4">
              <div className="flex flex-col space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'bg-white/20 text-white'
                        : 'text-green-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-edina-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Tagline */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white p-1">
                  <img
                    src="/images/Hornet.jpeg"
                    alt="Edina Hornets"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <div className="font-bold text-lg" style={{ fontFamily: "'Oswald', sans-serif" }}>Edina High School</div>
                  <div className="text-green-100 text-sm">Boys Golf</div>
                </div>
              </div>
              <p className="text-green-100 text-sm mb-4">
                Edina Boys Golf • 2026 Season
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Go Hornets!
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Quick Links</h3>
              <ul className="space-y-2 text-sm text-green-100">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/schedule" className="hover:text-white transition-colors">Schedule</Link></li>
                <li><Link to="/stats" className="hover:text-white transition-colors">Stats</Link></li>
                <li><Link to="/roster" className="hover:text-white transition-colors">Roster</Link></li>
              </ul>
            </div>

            {/* More Links */}
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Team</h3>
              <ul className="space-y-2 text-sm text-green-100">
                <li><Link to="/coaches" className="hover:text-white transition-colors">Coaches</Link></li>
                <li><Link to="/support-team" className="hover:text-white transition-colors">Support Team</Link></li>
                <li><Link to="/team-info" className="hover:text-white transition-colors">Team Info</Link></li>
                <li><Link to="/history" className="hover:text-white transition-colors">History</Link></li>
                <li><Link to="/photos" className="hover:text-white transition-colors">Photos</Link></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Follow Us</h3>
              <a href="https://instagram.com/edina_boysgolf" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-edina-green hover:scale-110 transition-all duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <p className="text-green-100 text-sm mt-2">@edina_boysgolf</p>
              <p className="text-green-100 text-xs mt-4">
                Edina High School<br />
                6754 Valley View Road<br />
                Edina, MN 55439
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-10 pt-6 text-center text-sm text-green-100">
            <p>&copy; {new Date().getFullYear()} Edina High School Boys Golf. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
