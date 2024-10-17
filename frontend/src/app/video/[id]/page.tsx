"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaThumbsUp, FaThumbsDown, FaDownload, FaShare } from 'react-icons/fa'
import { useSelector } from "react-redux"
import Link from 'next/link'
import Image from 'next/image'
import { getTimeAgo } from "@/app/utills/getTimeAgo"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [video, setVideo] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([]) // Changed to an array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoOwner, setVideoOwner] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)

  useEffect(() => {
    if (id) {
      const fetchVideo = async () => {
        try {
          const response = await fetch(`/api/v1/videos/get-video/${id}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch video')
          }
          const data = await response.json()
          setVideo(data.data)
        } catch (error) {
          setError((error as Error).message)
        } finally {
          setLoading(false)
        }
      }
      const fetchVideos = async () => {
        try {
          const response = await fetch(`/api/v1/videos/get-all-videos?page=1&limit=12`); // Removed currentPage
          if (!response.ok) {
            throw new Error('Failed to fetch videos');
          }
          const data = await response.json();
          // Shuffle the videos array
          const shuffledVideos = data.data.videos.sort(() => Math.random() - 0.5);
          console.log(shuffledVideos);
          
          setVideos(shuffledVideos);
        } catch (error) {
          console.error('Error fetching videos:', error);
        }
      };
      const fetchVideoOwner = async () => {
        try {
          const response = await fetch(`/api/v1/videos/get-video-owner/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch video owner')
          }
          const data = await response.json()
          setVideoOwner(data.data)
          setIsSubscribed(data.data.isSubscribed)
        } catch (error) {
          setError((error as Error).message)
        }
      }

      fetchVideo()
      fetchVideos()
      fetchVideoOwner()
    }
  }, [id]) // Removed currentPage from dependencies

  const handleAvatarClick = () => {
    if (videoOwner && videoOwner._id) {
      router.push(`/profile/${videoOwner._id}`)
    }
  }

  if (loading) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center text-red-500">{error}</div>
  }

  if (!video) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Video not found</div>
  }

  const toggleSubscribe = async () => {
    try {
      const response = await fetch(`/api/v1/subscription/toggle-subscription/${videoOwner._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to toggle subscribe')
      }
      const data = await response.json()
      setIsSubscribed(data.data.isSubscribed)
      setVideoOwner((prevOwner:any) => ({
        ...prevOwner,
        totalSubscribers: data.data.isSubscribed
          ? prevOwner.totalSubscribers + 1
          : prevOwner.totalSubscribers - 1
      }))
    } catch (error) {
      console.error('Failed to toggle subscribe', error)
    }
  }

  return (
    <div className="flex w-full h-screen bg-black pt-[69px]">
      {/* Video Player */}
      <div className="ml-5 mt-5 w-[800px] bg-black shadow-lg rounded-lg overflow-hidden">
        <div className="h-[500px]">
          <video controls className="w-full h-full object-cover">
            <source src={video.videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <h1 className="text-white text-2xl font-bold ">{video.title}</h1>
        <div className="flex items-center justify-between ml-2 mr-2">
          <div className="flex items-center">
            {videoOwner && videoOwner.avatar && (
              <img 
                src={videoOwner.avatar} 
                alt={videoOwner.name} 
                className="w-10 h-10 rounded-full mr-2 cursor-pointer" 
                onClick={handleAvatarClick}
              />
            )}
            <div className="flex flex-col">
              <p className="text-white text-sm font-bold">{videoOwner?.fullName}</p>
              <p className="text-white text-xs">{videoOwner?.totalSubscribers} subscribers</p>
            </div>
            {videoOwner && currentUser && videoOwner._id !== currentUser._id && (
              <button 
                className={`ml-4 mt-2 px-6 py-2 rounded-full transition-colors duration-200 ${
                  isSubscribed 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
                onClick={toggleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3 mb-2">
            <button className="text-white flex items-center bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600 transition-colors duration-200">
              <FaThumbsUp className="mr-1" /> {video.likes} Like
            </button>
            <button className="text-white flex items-center bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600 transition-colors duration-200">
              <FaThumbsDown className="mr-1" /> Dislike
            </button>
            <button className="text-white flex items-center bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600 transition-colors duration-200">
              <FaDownload className="mr-1" /> Download
            </button>
            <button className="text-white flex items-center bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600 transition-colors duration-200">
              <FaShare className="mr-1" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div className="ml-5 mt-5 flex-1">
        <h2 className="text-white text-xl font-bold mb-4">Related Videos</h2>
        <div className="flex flex-col gap-4">
          {videos.map((relatedVideo: any) => (
            <Link href={`/video/${relatedVideo._id}`} key={relatedVideo._id}>
              <div className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow hover:border hover:border-gray-600 flex">
                <div className="relative aspect-video w-1/2">
                  <Image 
                    src={relatedVideo.thumbnail || "/default-thumbnail.jpg"} 
                    alt={relatedVideo.title} 
                    layout="fill" 
                    objectFit="cover"
                    unoptimized={true}
                  />
                  <p className="text-white text-sm absolute bottom-2 right-2 bg-black bg-opacity-50 p-1 rounded-lg">{(parseFloat(relatedVideo.duration) / 60).toFixed(2)} </p>
                </div>
                <div className="p-4 w-1/2 flex flex-col justify-center">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{relatedVideo.title}</h3>
                  <p className="text-gray-400 text-sm">{relatedVideo.views} views • {getTimeAgo(relatedVideo.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
