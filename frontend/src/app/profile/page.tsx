"use client"

import Image from "next/image"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"

export default function Profile() {
  const { error, loading } = useSelector((state: any) => state.user)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null // Return null on the server-side
  }

  if (loading) {
    return <div className="h-1/2 w-full flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 h-1/2 w-full flex items-center justify-center">{error}</div>
  }

  if (!currentUser) {
    return <div className="h-1/2 w-full flex items-center justify-center">User not found</div>
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top Half: User Profile */}
      <div className="h-3/5 w-full flex flex-col relative">
        <div className="absolute inset-0">
          {currentUser.coverImage ? (
            <img
              src={currentUser.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src="/default-cover.jpg"
              alt="Default Cover"
              layout="fill"
              objectFit="cover"
            />
          )}
        </div>
        <div className="relative z-10 flex-grow w-full flex items-end">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden text-white" style={{
                 backdropFilter: 'blur(50px)',
                 WebkitBackdropFilter: 'blur(5px)',
                 backgroundColor: 'rgba(255, 255, 255, 0.18)',
                 boxShadow: '0 1px 4px rgba(0, 0, 0, 0.6)',
            }}>
              <div className="px-6 py-8 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center ">
                  <div className="mb-6 sm:mb-0 sm:mr-8">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt="Avatar"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white"
                      />
                    ) : (
                      <Image
                        src="/default-avatar.jpg"
                        alt="Default Avatar"
                        width={160}
                        height={160}
                        className="rounded-full border-4 border-white"
                      />
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">{currentUser.fullName}</h1>
                    <p className="text-xl text-white">@{currentUser.username}</p>
                    <p className="text-lg text-white mt-2">{currentUser.email}</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-white">Member since: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                    <p className="text-white mt-2">Last updated: {new Date(currentUser.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-white">Watch history: {currentUser.watchHistory?.length || 0} videos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Half: Videos Section */}
      <div className="h-2/5 w-full bg-black flex items-center justify-center">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Map through currentUser's videos or use dummy content */}
            {currentUser.videos && currentUser.videos.length > 0 ? (
              currentUser.videos.map((video: any, index: number) => (
                <div key={index} className="bg-white shadow-lg rounded-lg p-4">
                  <h3 className="text-lg font-semibold">{video.title}</h3>
                  <p className="text-gray-600 mt-2">{video.description}</p>
                  {/* Add a video player or thumbnail */}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No videos available.</p>
            )}
          </div>
        </div>
      </div>
    </div>

  )
}
