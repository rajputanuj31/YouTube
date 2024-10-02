"use client"

import Image from "next/image"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

export default function Profile() {
  const router = useRouter()
  const { error, loading } = useSelector((state: any) => state.user)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)
  const { id } = useParams()
  const [isClient, setIsClient] = useState(false)
  const [videos, setVideos] = useState<any[]>([])
  const [channelDetails, setChannelDetails] = useState<any>(null)
  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };
  useEffect(() => {
    setIsClient(true)
    const fetchChannelDetails = async () => {
      if (currentUser) {
        try {
            const response = await fetch(`/api/v1/users/channel-details/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch user')
          }
          const data = await response.json()
          setChannelDetails(data.data)
        } catch (error) {
          console.error(error)
        }
      }
    }
    fetchChannelDetails()

    const fetchVideos = async () => {
      if (currentUser) {
        try {
          const response = await fetch(`/api/v1/videos/get-video-by-user-id/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch videos')
          }
          const data = await response.json()
          setVideos(data.data)
        } catch (error) {
          console.error(error)
        }
      }
    }
    fetchVideos()
  }, [currentUser])

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
    <div className="w-full min-h-screen bg-black text-white pt-16"> {/* Added pt-16 to account for Navbar height */}
      <div className="flex flex-col">
        {/* Cover Image Section */}
        {channelDetails?.coverImage && (
          <div className="h-[30vh] w-full relative ">
            <div className="absolute inset-0 m-2 rounded-lg">
              <img
                src={channelDetails.coverImage}
                alt="Cover"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        )}

        {/* User Profile Section */}
        <div className="w-full flex flex-col relative mt-12">
          <div className="relative z-10 flex-grow w-full flex items-center justify-center -mt-16">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="px-6 mt-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex flex-col sm:flex-row items-center">
                      <div className="mb-6 sm:mb-0 sm:mr-8">
                        {channelDetails?.avatar ? (
                          <img
                            src={channelDetails.avatar}
                            alt="Avatar"
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-black"
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
                        <h1 className="text-3xl sm:text-4xl font-bold text-white ">{channelDetails?.fullName}</h1>
                        <p className="ml-1 text-gray-500">@{channelDetails?.username} • {channelDetails?.totalSubscribers || 0} subscribers • {videos.length} videos</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <button 
                        className="border-2 border-white rounded-full hover:bg-gray-500 text-white font-bold py-2 px-4"
                        onClick={() => router.push('/video/uploadVideo')}
                      >
                        Upload Video
                      </button>
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-white ">Member since: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                      <p className="text-white ">Last updated: {new Date(currentUser.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="w-full ">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-2 ">Videos</h2>
            <hr className="w-full h-1 border-gray-800" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
              {videos.length > 0 ? (
                videos.map((video: any, index: number) => (
                  <Link href={`/video/${video._id}`} key={index}>
                    <div className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow p-2 hover:cursor-pointer hover:border hover:border-gray-600" style={{ height: '250px' }}>
                      <div className="relative h-2/3">
                        <img
                          src={video.thumbnail || '/default-thumbnail.jpg'}
                          alt={video.title}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                        />
                        <p className="text-white text-sm absolute bottom-2 right-2 bg-black bg-opacity-50 p-1 rounded-lg">{(parseFloat(video.duration) / 60).toFixed(2)} </p>
                      </div>
                      <div className="p-2 h-1/3 flex flex-col justify-start">
                        <h3 className="text-md font-semibold text-white truncate">{video.title}</h3>
                        <div className="flex justify-between items-center text-gray-400 text-xs">
                        <p className="text-gray-400 text-sm">{video.views} views • {getTimeAgo(video.createdAt)}</p>
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