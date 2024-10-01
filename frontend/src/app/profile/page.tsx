"use client"

import Image from "next/image"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function Profile() {
  const { error, loading } = useSelector((state: any) => state.user)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)
  
  const [isClient, setIsClient] = useState(false)
  const [videos, setVideos] = useState([])

  useEffect(() => {
    setIsClient(true)
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/v1/videos/get-all-videos')
        if (!response.ok) {
          throw new Error('Failed to fetch videos')
        }
        const data = await response.json()
        setVideos(data.data.videos)
      } catch (error) {
        console.error(error)
      } 
    }
    fetchVideos()
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
    <div className="w-full h-screen overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Top Half: User Profile */}
        <div className="h-[60vh] w-full flex flex-col relative flex-shrink-0" style={{
          background: "rgba(17, 19, 19, 0.4)",
          boxShadow: "0 0.5rem 1rem hsla(0, 2%, 76%, 0.1)",
          color: "#fff"
        }}>
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
                   backdropFilter: 'blur(20rem)',
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
                      <h1 className="text-3xl sm:text-4xl font-bold text-black  ">{currentUser.fullName}</h1>
                      <p className="text-xl ml-1 text-black">@{currentUser.username}</p>
                      <p className="text-xl ml-1 text-black mt-2">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-black text-xl">Member since: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                      <p className="text-black  text-xl">Last updated: {new Date(currentUser.updatedAt).toLocaleDateString()}</p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Half: Videos Section */}
        <div className="flex-grow w-full py-8 bg-black" style={{

        }}>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
              {videos.length > 0 ? (
                videos.map((video: any, index: number) => (
                  <Link href={`/video/${video._id}`} key={index}>
                    <div className="bg-black rounded-lg overflow-hidden shadow-lg transition-all duration-500 hover:scale-105 p-2 hover:cursor-pointer hover:bg-gray-800" style={{ height: '250px' }}>
                      <div className="relative h-2/3">
                        <img 
                          src={video.thumbnail || '/default-thumbnail.jpg'} 
                          alt={video.title} 
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                        />
                        <p className="text-white text-sm absolute bottom-2 right-2 bg-black bg-opacity-50 p-1 rounded-lg">{parseFloat(video.duration).toFixed(2)}</p>
                      </div>
                      <div className="p-2 h-1/3 flex flex-col justify-start">
                        <h3 className="text-md font-semibold text-white truncate">{video.title}</h3>
                        <div className="flex justify-between items-center text-gray-400 text-xs">
                          <span>{video.views} views</span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400 col-span-full">No videos available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}