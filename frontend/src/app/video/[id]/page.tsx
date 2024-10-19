"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaThumbsUp, FaThumbsDown, FaDownload, FaShare } from 'react-icons/fa'
import { useSelector } from "react-redux" // Fixed the import from UseSelector to useSelector
import SuggestionVideos from "../../../components/SuggestionVideos" // Capitalized the component name

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
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

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

      const fetchComments = async () => {
        try {
          const response = await fetch(`/api/v1/comments/get-comments-by-video/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch comments');
          }
          const data = await response.json();
          console.log(data.data.comments);

          setComments(data.data.comments || []); // Ensure comments is set to an empty array if data.data is undefined
        } catch (error) {
          setError((error as Error).message);
        }
      }

      fetchVideo()
      fetchVideoOwner()
      fetchComments()
    }
  }, [id])

  const handleAvatarClick = () => {
    if (videoOwner && videoOwner._id) {
      router.push(`/profile/${videoOwner._id}`)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!comment || !currentUser?._id) return; // Check if currentUser._id exists

    try {
      const response = await fetch(`/api/v1/comments/add-comment/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment, userId: currentUser._id }), // Changed 'comment' to 'content' to match the API
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newComment = await response.json();
      setComments((prevComments) => Array.isArray(prevComments) ? [...prevComments, newComment.data] : [newComment.data]);// Handle case where prevComments might be undefined

      setComment("");
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

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

  return (
    <div className="flex w-full h-full bg-black pt-[69px]">
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
        <div className="bg-gray-800 p-4 mt-2 rounded-md"> {/* Added div with slightly different background color for description */}
          <p className="text-white text-sm">{video.description}</p> {/* Added video description here */}
        </div>
        <div className="bg-black p-4 mt-2 rounded-md"> {/* Comments section */}
          <h2 className="text-white text-lg font-bold">Comments</h2>
          <form onSubmit={handleCommentSubmit} className="mt-2">
            <input
              type="text"
              placeholder="Add Comment"
              className="w-full py-2 px-4 rounded-full focus:outline-none border border-gray-800"
              style={{
                background: 'rgba(17, 19, 19, 0.4)',
                borderRadius: '10px',
                boxShadow: '0 .5rem 1rem rgba(194, 192, 192, 0.10) !important',
                color: '#fff',
                fontSize: '16px',
                height: '4rem',
              }}
            />
            <button type="submit" className="mt-2 bg-gray-800 text-white px-4 py-2 rounded-md ">Comment</button>
          </form>
          <div className="mt-4">
            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c._id} className="text-gray-400 text-sm mb-2">
                  <strong>{c.owner}</strong>: {c.content}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>

      <SuggestionVideos />
    </div>
  )
}
