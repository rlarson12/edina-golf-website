import { useState } from 'react'

function Photos() {
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)

  const albums = [
    {
      id: 1,
      title: 'Team Photos',
      date: '2025 Season',
      cover: '/images/Team1.jpeg',
      photos: [
        { src: '/images/Team1.jpeg', caption: 'Team photo' },
        { src: '/images/Team2.jpeg', caption: 'Team photo' },
        { src: '/images/Team3.jpeg', caption: 'Team photo' },
        { src: '/images/Team4.JPEG', caption: 'Team photo' },
        { src: '/images/Team5.JPEG', caption: 'Team photo' },
        { src: '/images/Team6.jpg', caption: 'Team photo' },
        { src: '/images/Team7.png', caption: 'Team photo' },
        { src: '/images/Team8.jpg', caption: 'Team photo' },
        { src: '/images/Team9.jpg', caption: 'Team photo' },
        { src: '/images/Team10.jpg', caption: 'Team photo' },
        { src: '/images/Team11.jpg', caption: 'Team photo' },
      ],
    },
    {
      id: 2,
      title: 'Tournament Action',
      date: 'Spring 2025',
      cover: '/images/Action1.jpeg',
      photos: [
        { src: '/images/Action1.jpeg', caption: 'Action shot' },
        { src: '/images/Action2.jpeg', caption: 'Action shot' },
        { src: '/images/Action3.jpeg', caption: 'Action shot' },
        { src: '/images/Action4.jpeg', caption: 'Action shot' },
        { src: '/images/Action5.jpeg', caption: 'Action shot' },
        { src: '/images/Action6.jpeg', caption: 'Action shot' },
        { src: '/images/Action7.jpeg', caption: 'Action shot' },
        { src: '/images/Action8.jpeg', caption: 'Action shot' },
        { src: '/images/Action9.jpeg', caption: 'Action shot' },
        { src: '/images/Action10.jpeg', caption: 'Action shot' },
        { src: '/images/Action11.jpeg', caption: 'Action shot' },
        { src: '/images/Action12.JPG', caption: 'Action shot' },
        { src: '/images/Action13.jpg', caption: 'Action shot' },
        { src: '/images/ACtion14.jpg', caption: 'Action shot' },
      ],
    },
    {
      id: 3,
      title: 'Off Course',
      date: '2025 Season',
      cover: '/images/OffCourse1.jpeg',
      photos: [
        { src: '/images/OffCourse1.jpeg', caption: 'Off course' },
        { src: '/images/OffCourse2.jpg', caption: 'Off course' },
        { src: '/images/OffCourse3.jpg', caption: 'Off course' },
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

  return (
    <div>
      {/* Hero Section with Photo Collage Background */}
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        <img
          src="/images/Team1.jpeg"
          alt="Team photo"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 25%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
              PHOTO GALLERY
            </h1>
            <p className="text-green-200 text-lg">Memories from the 2025 Season</p>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Album Grid or Photo View */}
      {!selectedAlbum ? (
        <>
          {/* Albums Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbum(album)}
                className="card overflow-hidden text-left hover:shadow-lg transition-shadow group"
              >
                {/* Album Cover */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-full img-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>

                {/* Album Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-edina-green transition-colors">
                    {album.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{album.date}</span>
                    <span>{album.photos.length} photos</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Upload CTA */}
          <div className="mt-12 bg-gray-100 rounded-xl p-6 md:p-8">
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
                  <p className="text-white text-xs truncate">{photo.caption}</p>
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
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setLightboxImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2"
            onClick={handlePrevImage}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
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
