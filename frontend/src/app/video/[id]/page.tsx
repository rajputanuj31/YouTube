"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaThumbsUp, FaDownload, FaShare } from 'react-icons/fa'
import { useSelector } from "react-redux"
import SuggestionVideos from "../../../components/SuggestionVideos"
import Comments from "../../../components/Comments"
import { getTimeAgo } from "@/app/utils/getTimeAgo"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoOwner, setVideoOwner] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)
  const [comments, setComments] = useState<any[]>([])
  const [likes, setLikes] = useState<any[]>([])

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

      const fetchLikes = async () => {
        try {
          const response = await fetch(`/api/v1/likes/get-likes-by-videoId/${id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch Likes')
          }
          const data = await response.json()
          setLikes(data.data)
          
        } catch (error) {
          setError((error as Error).message)
        }
      }

      fetchVideo()
      fetchVideoOwner()
      fetchLikes()
    }
  }, [id])

  const handleAvatarClick = () => {
    if (videoOwner && videoOwner._id) {
      router.push(`/profile/${videoOwner._id}`)
    }
  }

  const handleVideoWatch = async () => {
    try {
      const response = await fetch(`/api/v1/videos/update-views/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to update views')
      }
      const data = await response.json()
      setVideo((prevVideo: any) => ({
        ...prevVideo,
        views: data.data.views
      }))
    } catch (error) {
      console.error('Failed to update views', error)
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
      setVideoOwner((prevOwner: any) => ({
        ...prevOwner,
        totalSubscribers: data.data.isSubscribed
          ? prevOwner.totalSubscribers + 1
          : prevOwner.totalSubscribers - 1
      }))
    } catch (error) {
      console.error('Failed to toggle subscribe', error)
    }
  }

  const toggleLike = async () => {
    try {
      const response = await fetch(`/api/v1/likes/toggle-like-video/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
      const data = await response.json();
      
      // Update local state immediately for better UX
      setLikes((prevLikes) => {
        const isLiked = prevLikes.some(like => like.video === id);
        if (isLiked) {
          return prevLikes.filter(like => like.video !== id); // Remove like
        } else {
          return [...prevLikes, data.data]; // Add new like
        }
      });
    } catch (error) {
      setError((error as Error).message);
    }
  }
  return (
    <div className="flex w-full h-full bg-black pt-[69px]">
      <div className="ml-5 mt-5 flex-grow bg-black shadow-lg rounded-lg overflow-hidden min-w-[800px]">
        <div className="h-[500px]">
          <video controls className="w-full h-full object-cover" onPlay={handleVideoWatch}>
            <source src={video.videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <h1 className="text-white text-2xl font-bold mb-1">{video.title}</h1>
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
                className={`ml-4 mt-2 px-6 py-2 rounded-full transition-colors duration-200 ${isSubscribed
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-white text-black hover:bg-gray-200'
                  }`}
                onClick={toggleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3 ">
            <button className="text-white flex items-center bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600 transition-colors duration-200"
            onClick={toggleLike}
            >
              <FaThumbsUp className="mr-1" /> {likes.length} 
            </button>

            <button className="text-white flex items-center bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600 transition-colors duration-200">
              <FaDownload className="mr-1" /> Download
            </button>
            <button className="text-white flex items-center bg-gray-700 rounded-full px-4 py-2 hover:bg-gray-600 transition-colors duration-200">
              <FaShare className="mr-1" /> Share
            </button>
          </div>
        </div>
        <div className="bg-gray-900 p-4 mt-2 rounded-md">
          <h1>{video.views} views • {getTimeAgo(video.createdAt)}</h1>
          <p className="text-white text-sm">{video.description}</p>
        </div>

        <Comments setComments={setComments} currentUser={currentUser} videoId={id} />
      </div>

      <div className="w-full max-w-[480px]">
        <SuggestionVideos />
      </div>
    </div>
  )
}
