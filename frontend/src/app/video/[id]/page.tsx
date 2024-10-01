"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { FaThumbsUp, FaThumbsDown, FaDownload, FaShare } from 'react-icons/fa'

export default function VideoPage() {
  const params = useParams()
  const id = params.id as string
  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoOwner, setVideoOwner] = useState<any>(null)
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
          console.log(data)
        } catch (error) {
          setError((error as Error).message)
        }
      }

      fetchVideo()
      fetchVideoOwner()
    }
  }, [id])


  if (loading) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center text-red-500">{error}</div>
  }

  if (!video) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Video not found</div>
  }


  return (
    <div className="flex w-full h-screen bg-black pt-[69px]">
      {/* Video Player */}
      <div className="ml-5 mt-5 w-[1000px] bg-black shadow-lg rounded-lg overflow-hidden">
        <div className="h-[550px]">
          <video controls className="w-full h-full object-cover">
            <source src={video.videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <h1 className="text-white text-2xl font-bold ">{video.title}</h1>
        <div className="flex items-center justify-between ml-2 mr-2">
          <div className="flex items-center">
            {videoOwner && videoOwner.avatar && (
              <img src={videoOwner.avatar} alt={videoOwner.name} className="w-10 h-10 rounded-full mr-2" />
            )}
            <div className="flex flex-col">
              <p className="text-white text-sm font-bold">{videoOwner?.fullName}</p>
              <p className="text-white text-xs">{videoOwner?.totalSubscribers} subscribers</p>
            </div>
            {videoOwner && !videoOwner.isSubscribed && (
              <button className="ml-4 mt-2 bg-white text-black px-6 py-2 rounded-full hover:bg-gray-200 transition-colors duration-200">Subscribe</button>
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
    </div>
  )
}
