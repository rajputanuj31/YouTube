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
  const [, setComments] = useState<any[]>([])
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
      // Update video views
      const response = await fetch(`/api/v1/videos/update-views/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update views');
      }
      const data = await response.json();
      setVideo((prevVideo: any) => ({
        ...prevVideo,
        views: data.data.views,
      }));

      // Add video to watch history
      const watchHistoryResponse = await fetch(`/api/v1/users/addToWatchHistory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: id }),
      });
      if (!watchHistoryResponse.ok) {
        throw new Error('Failed to add video to watch history');
      }
    } catch (error) {
      console.error('Failed to update views or add to watch history', error);
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    )
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
    <div className="flex flex-col lg:flex-row w-full bg-black pt-16 min-h-screen">
      <div className="flex-1 min-w-0 px-2 sm:px-4 lg:px-6 pt-4">
        {/* Video Player */}
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900">
          <video controls className="w-full h-full object-contain" onPlay={handleVideoWatch}>
            <source src={video.videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Title */}
        <h1 className="text-white text-lg sm:text-xl lg:text-2xl font-bold mt-3 px-1">{video.title}</h1>

        {/* Channel info + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 px-1">
          <div className="flex items-center gap-3">
            {videoOwner?.avatar && (
              <img
                src={videoOwner.avatar}
                alt={videoOwner.name}
                className="w-10 h-10 rounded-full cursor-pointer object-cover flex-shrink-0"
                onClick={handleAvatarClick}
              />
            )}
            <div>
              <p className="text-white text-sm font-semibold">{videoOwner?.fullName}</p>
              <p className="text-gray-400 text-xs">{videoOwner?.totalSubscribers} subscribers</p>
            </div>
            {videoOwner && currentUser && videoOwner._id !== currentUser._id && (
              <button
                className={`ml-2 px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${isSubscribed
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-black hover:bg-gray-200'
                  }`}
                onClick={toggleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="text-white flex items-center gap-1.5 bg-gray-800 rounded-full px-3 sm:px-4 py-2 text-sm hover:bg-gray-700 transition-colors active:scale-95"
              onClick={toggleLike}
            >
              <FaThumbsUp size={14} /> {likes.length}
            </button>
            <button className="text-white flex items-center gap-1.5 bg-gray-800 rounded-full px-3 sm:px-4 py-2 text-sm hover:bg-gray-700 transition-colors active:scale-95">
              <FaDownload size={14} /> <span className="hidden sm:inline">Download</span>
            </button>
            <button className="text-white flex items-center gap-1.5 bg-gray-800 rounded-full px-3 sm:px-4 py-2 text-sm hover:bg-gray-700 transition-colors active:scale-95">
              <FaShare size={14} /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900/60 p-3 sm:p-4 mt-3 rounded-xl">
          <p className="text-gray-300 text-sm font-medium">{video.views} views • {getTimeAgo(video.createdAt)}</p>
          <p className="text-gray-200 text-sm mt-1">{video.description}</p>
        </div>

        <Comments setComments={setComments} currentUser={currentUser} videoId={id} />
      </div>

      {/* Suggestions - stacks below on mobile, sidebar on desktop */}
      <div className="w-full lg:w-[400px] xl:w-[420px] lg:min-w-[360px] flex-shrink-0">
        <SuggestionVideos />
      </div>
    </div>
  )
}
