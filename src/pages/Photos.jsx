import { useState } from 'react'
import SEO from '../components/SEO'

function Photos() {
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)

  const albums2026 = [
    {
      id: '2026-1',
      title: 'Team Photos',
      date: '2026 Season',
      cover: '/images/2026/team-edinburgh-medals-landscape.webp',
      photos: [
        { src: '/images/2026/team-edinburgh-medals-landscape.webp', caption: 'Michael Vernon, Peter Bennett, Sander Ohe, Chase Larson, Charlie Nielsen — 1st place at The Preview, Edinburgh USA, Apr 24-25.' },
        { src: '/images/2026/team-edinburgh-medals.webp', caption: 'Michael Vernon, Peter Bennett, Sander Ohe, Chase Larson, Charlie Nielsen — 1st place at The Preview, Edinburgh USA, Apr 24-25.' },
        { src: '/images/action/varsity-team-chaska.webp', caption: 'Sander Ohe, David Colby, Michael Vernon, Charlie Nielsen, Chase Larson, Peter Bennett — Lake Conference Tournament #1, Apr 20.' },
      ],
    },
    {
      id: '2026-2',
      title: 'Tournament Action',
      date: '2026 Season',
      cover: '/images/action/chase-larson-chaska-swing.webp',
      photos: [
        { src: '/images/tryouts-braemar-2026.webp', caption: 'Tryouts at Braemar — 60+ players competing for roster spots to open the 2026 season.' },
        { src: '/images/action/charlie-nielsen-medalist-chaska.webp', caption: 'Charlie Nielsen — Co-Medalist (72, E), Lake Conference Tournament #1, Apr 20.' },
        { src: '/images/action/charlie-nielsen-chaska-action.webp', caption: 'Charlie Nielsen — Lake Conference Tournament #1, Apr 20.' },
        { src: '/images/action/chase-larson-chaska-swing.webp', caption: 'Chase Larson — Lake Conference Tournament #1, Apr 20.' },
        { src: '/images/action/chase-larson-chaska-putt.webp', caption: 'Chase Larson — Lake Conference Tournament #1, Apr 20.' },
        { src: '/images/action/peter-bennett-chaska-swing.webp', caption: 'Peter Bennett — Lake Conference Tournament #1, Apr 20.' },
        { src: '/images/action/peter-bennett-chaska-putt.webp', caption: 'Peter Bennett — Lake Conference Tournament #1, Apr 20.' },
      
        { src: '/images/2026/max-romslo-east-ridge-putt.webp', caption: 'Max Romslo — East Ridge Invitational at Stoneridge, Apr 22.' },
        { src: '/images/2026/michael-vernon-east-ridge-swing.webp', caption: 'Michael Vernon — East Ridge Invitational at Stoneridge, Apr 22.' },
        { src: '/images/2026/peter-edinburgh-day1-putt.webp', caption: 'Peter Bennett — Round 1, The Preview at Edinburgh USA, Apr 24.' },
        { src: '/images/2026/chase-edinburgh-day2.webp', caption: 'Chase Larson — Round 2, The Preview at Edinburgh USA, Apr 25.' },
        { src: '/images/2026/chase-colby-edinburgh-fairway.webp', caption: 'Chase Larson and David Colby walking the fairway — The Preview at Edinburgh USA, Apr 24-25.' },
      ],
    },
    {
      id: '2026-3',
      title: 'Off Course',
      date: '2026 Season',
      cover: null,
      photos: [],
    },
  ]

  const albums2025 = [
    {
      id: '2025-1',
      title: 'Team Photos',
      date: '2025 Season',
      cover: '/images/Team1.webp',
      photos: [
        { src: '/images/Team1.webp', caption: 'Team photo' },
        { src: '/images/Team2.webp', caption: 'Team photo' },
        { src: '/images/Team3.webp', caption: 'Team photo' },
        { src: '/images/Team4.webp', caption: 'Team photo' },
        { src: '/images/Team5.webp', caption: 'Team photo' },
        { src: '/images/Team6.webp', caption: 'Team photo' },
        { src: '/images/Team7.webp', caption: 'Team photo' },
        { src: '/images/Team8.webp', caption: 'Team photo' },
        { src: '/images/Team9.webp', caption: 'Team photo' },
        { src: '/images/Team10.webp', caption: 'Team photo' },
        { src: '/images/Team11.webp', caption: 'Team photo' },
      ],
    },
    {
      id: '2025-2',
      title: 'Tournament Action',
      date: 'Spring 2025',
      cover: '/images/Action1.webp',
      photos: [
        { src: '/images/Action1.webp', caption: 'Action shot' },
        { src: '/images/Action2.webp', caption: 'Action shot' },
        { src: '/images/Action3.webp', caption: 'Action shot' },
        { src: '/images/Action4.webp', caption: 'Action shot' },
        { src: '/images/Action5.webp', caption: 'Action shot' },
        { src: '/images/Action6.webp', caption: 'Action shot' },
        { src: '/images/Action7.webp', caption: 'Action shot' },
        { src: '/images/Action8.webp', caption: 'Action shot' },
        { src: '/images/Action9.webp', caption: 'Action shot' },
        { src: '/images/Action10.webp', caption: 'Action shot' },
        { src: '/images/Action11.webp', caption: 'Action shot' },
        { src: '/images/Action12.webp', caption: 'Action shot' },
        { src: '/images/Action13.webp', caption: 'Action shot' },
        { src: '/images/ACtion14.webp', caption: 'Action shot' },
      ],
    },
    {
      id: '2025-3',
      title: 'Off Course',
      date: '2025 Season',
      cover: '/images/OffCourse2.webp',
      photos: [
        { src: '/images/OffCourse2.webp', caption: 'Off course' },
        { src: '/images/OffCourse3.webp', caption: 'Off course' },
      ],
    },
  ]

  const handlePrevImage = (e) => {
    e.stopPropagation()
    if (!selectedAlbum || !lightboxImage) return
    const currentIndex = selectedAlbum.photos.findIndex(p => p.src === lightboxImage.src)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : selectedAlbum.photos.length - 1
    setLightboxImage(selectedAlbum.photos[prevIndex])
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    if (!selectedAlbum || !lightboxImage) return
    const currentIndex = selectedAlbum.photos.findIndex(p => p.src === lightboxImage.src)
    const nextIndex = currentIndex < selectedAlbum.photos.length - 1 ? currentIndex + 1 : 0
    setLightboxImage(selectedAlbum.photos[nextIndex])
  }

  const AlbumCard = ({ album }) => {
    const isEmpty = album.photos.length === 0
    return (
      <button
        key={album.id}
        onClick={() => !isEmpty && setSelectedAlbum(album)}
        className={`card overflow-hidden text-left transition-shadow group ${isEmpty ? 'cursor-default opacity-80' : 'hover:shadow-lg'}`}
      >
        {/* Album Cover */}
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          {album.cover ? (
            <>
              <img
                src={album.cover}
                alt={album.title}
                className="w-full h-full img-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-edina-green/5 border-2 border-dashed border-edina-green/20">
              <svg className="w-10 h-10 text-edina-green/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-edina-green/50 font-medium">Season underway April 20 — photos coming</p>
            </div>
          )}
        </div>

        {/* Album Info */}
        <div className="p-4">
          <h3 className={`font-semibold text-gray-900 mb-1 ${!isEmpty ? 'group-hover:text-edina-green transition-colors' : ''}`}>
            {album.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{album.date}</span>
            <span>{isEmpty ? 'Coming soon' : `${album.photos.length} photos`}</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div>
      <SEO title="Photos" description="Photos from the Edina Boys Golf 2026 season and program archives." path="/photos" />
      {/* Hero Section */}
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        <img
          src="/images/Team1.webp"
          alt="Team photo"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 25%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              PHOTO GALLERY
            </h1>
          </div>
        </div>
      </div>

      <div className="page-container">
        {!selectedAlbum ? (
          <>
            {/* 2026 Albums — shown first */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                2026 Season
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {albums2026.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* 2025 Albums */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                2025 Season
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {albums2025.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>

            {/* Submit Photos CTA */}
            <div className="mt-4 bg-gray-100 rounded-lg p-6 md:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Have Photos to Share?</h3>
              <p className="text-gray-600 mb-4">
                Parents and players are encouraged to submit photos from matches and events to be featured on the website. Email your photos to{' '}
                <a href="mailto:photos@edinaboysgolf.com" className="text-edina-green font-medium hover:underline">
                  photos@edinaboysgolf.com
                </a>{' '}
                and include the following in your message:
              </p>
              <ul className="text-gray-600 space-y-1 mb-4 ml-4 list-disc">
                <li>Event name and date</li>
                <li>Names of the players pictured</li>
                <li>Any context you'd like to share</li>
              </ul>
              <p className="text-gray-600">
                High-resolution photos preferred. We'll add approved submissions to the website throughout the season.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={() => setSelectedAlbum(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-edina-green mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Albums
            </button>

            {/* Album Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedAlbum.title}</h2>
              <p className="text-gray-600">{selectedAlbum.date} • {selectedAlbum.photos.length} photos</p>
            </div>

            {/* Photos Grid */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {selectedAlbum.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxImage(photo)}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group"
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="w-full h-full img-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = ''
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm truncate">{photo.caption}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setLightboxImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2"
            onClick={handlePrevImage}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2"
            onClick={handleNextImage}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-white text-center mt-4">{lightboxImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Photos
