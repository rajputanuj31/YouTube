"use client"

import Image from "next/image"
import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FaTimes, FaEllipsisV, FaTrash, FaEdit, FaShareAlt, FaPlus } from 'react-icons/fa'; // Added FaShareAlt and FaPlus
import { getTimeAgo } from "@/app/utils/getTimeAgo"

export default function Profile() {
  const { error, loading } = useSelector((state: any) => state.user)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)
  const { id } = useParams()
  const [isClient, setIsClient] = useState(false)
  const [videos, setVideos] = useState<any[]>([])
  const [channelDetails, setChannelDetails] = useState<any>(null)
  const [showEdits, setShowEdits] = useState(false);
  const [popupVideoId, setPopupVideoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: ''
  });
  const [videoEditData, setVideoEditData] = useState<any>({
    title: '',
    description: '',
    isPublished: false
  });
  const [showVideoEdit, setShowVideoEdit] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState([]); // Add this state for playlists
  const [selectedPlaylists, setSelectedPlaylists] = useState<{ [key: string]: boolean }>({}); // Add this state for selected playlists
  const [playlistPopupVideoId, setPlaylistPopupVideoId] = useState<string | null>(null); // Add this state for playlist popup

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
          setFormData({
            username: data.data.username,
            fullName: data.data.fullName,
            email: currentUser.email // Assuming email is part of currentUser
          });
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
  }, [currentUser, id]) // Added id to the dependency array

  const handleEditProfileClick = () => {
    setShowEdits(!showEdits)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    if (currentUser) {
      try {
        const response = await fetch(`/api/v1/users/update-account-details`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        const data = await response.json();
        setShowEdits(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleVideoEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVideoEditData((prev: { title: string; description: string; isPublished: boolean }) => ({ ...prev, [name]: value }));
  };

  const handleUpdateVideo = async () => {
    if (popupVideoId) {
      try {
        const response = await fetch(`/api/v1/videos/update-video/${popupVideoId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(videoEditData)
        });
        if (!response.ok) {
          throw new Error('Failed to update video');
        }
        const data = await response.json();
        setShowVideoEdit(false);
        // Refresh the video list or update the state accordingly
        setVideos(prev => prev.map(video => video._id === popupVideoId ? { ...video, ...videoEditData } : video));
      } catch (error) {
        console.error("Error updating video:", error);
      }
    }
  };

  const fetchPlaylists = async (videoId: string) => {
    try {
      const response = await fetch(`/api/v1/playlist/get-playlists-by-user/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      const data = await response.json();
      const filteredPlaylists = data.data.filter(
        (playlist: any) => !playlist.videos.includes(videoId)
      );
      setPlaylists(filteredPlaylists); // All playlists
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleSaveToPlaylist = async (videoId: string) => {
    try {
      for (const playlistId in selectedPlaylists) {
        if (selectedPlaylists[playlistId]) {
          const response = await fetch(`/api/v1/playlist/add-video-to-playlist/${playlistId}/${videoId}`, {
            method: 'PATCH',
          });
          if (!response.ok) {
            throw new Error('Failed to add video to playlist');
          }
        }
      }
      setPlaylistPopupVideoId(null); // Close the popup after saving
    } catch (error) {
      console.error('Error saving to playlist:', error);
    }
  };

  const handleCheckboxChange = (playlistId: string) => {
    setSelectedPlaylists((prev) => ({
      ...prev,
      [playlistId]: !prev[playlistId],
    }));
  };

  const openPlaylistPopup = (videoId: string) => {
    fetchPlaylists(videoId);
    setPlaylistPopupVideoId(videoId);
  };

  const handleShareVideo = (videoId: string) => {
    console.log('Share video:', videoId);
    // Implement share video logic
  };

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

  const togglePopup = (videoId: string) => {
    if (popupVideoId === videoId) {
      setPopupVideoId(null); // Close if it's the same video
    } else {
      setPopupVideoId(videoId); // Open for the specific video
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    setDeletingVideoId(videoId);
    try {
      const response = await fetch(`/api/v1/videos/delete-video/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      console.log("success");
      
      if (response.ok) {
        // Refresh the video list or remove the deleted video from state
        setVideos(prev => prev.filter(video => video._id !== videoId));
      } else {
        console.error('Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setDeletingVideoId(null);
    }
  };

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
                    {currentUser._id === id && (
                      <button
                        className="border-2 border-white rounded-full hover:bg-gray-500 text-white font-bold py-2 px-4"
                        onClick={handleEditProfileClick}
                      >
                        Edit Profile
                      </button>
                    )}
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

        {/* Edit Profile Form Popup */}
        {showEdits && (
          <div className="fixed inset-0 flex items-center justify-center ml-10 bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 relative">
              <h2 className="text-2xl font-bold mb-2">Edit Profile</h2>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowEdits(false)} // Close the popup
              >
                <FaTimes size={20} />
              </button>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Video Edit Form Popup */}
        {showVideoEdit && (
          <div className="fixed inset-0 flex items-center justify-center ml-10 bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 relative">
              <h2 className="text-2xl font-bold mb-2">Edit Video</h2>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowVideoEdit(false)} // Close the popup
              >
                <FaTimes size={20} />
              </button>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateVideo(); }} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={videoEditData.title}
                    onChange={handleVideoEditChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={videoEditData.description}
                    onChange={handleVideoEditChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="isPublished" className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={videoEditData.isPublished}
                      onChange={(e) => setVideoEditData((prev: { title: string; description: string; isPublished: boolean }) => ({ ...prev, isPublished: e.target.checked }))}
                      className="mr-2"
                    />
                    Is Published
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                >
                  Update Video
                </button>
              </form>
            </div>
          </div>
        )}

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
                      <div className="flex justify-between items-center mt-1">
                        <h3 className="h-1/3 flex flex-col justify-start text-md font-semibold text-white truncate">{video.title}</h3>
                        <div className="relative">
                          <FaEllipsisV
                            className="text-gray-400 hover:text-white cursor-pointer"
                            size={20}
                            onClick={(e) => {
                              e.preventDefault();
                              togglePopup(video._id);                           
                            }}
                          />
                          {/* Popup for video options */}
                          {popupVideoId === video._id && (
                            <div className="absolute right-3 bottom-1 bg-black text-white rounded-lg shadow-lg w-40 z-50 ">
                              {currentUser._id === video.owner && ( // Only show delete and update options if the user is the owner
                                <>
                                  <button
                                    className="flex items-center w-full text-left py-2 px-3 hover:bg-white hover:text-gray-900 "
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (popupVideoId) {
                                        handleDeleteVideo(popupVideoId);
                                      }
                                    }}
                                  >
                                    <FaTrash className="mr-2" /> {deletingVideoId === video._id ? 'Deleting...' : 'Delete'}
                                  </button>
                                  <button
                                    className="flex items-center w-full text-left py-2 px-3 hover:bg-white hover:text-gray-900 "
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setVideoEditData({
                                        title: video.title,
                                        description: video.description,
                                        isPublished: video.isPublished
                                      });
                                      setShowVideoEdit(true);
                                    }}
                                  >
                                    <FaEdit className="mr-2" /> Update
                                  </button>
                                </>
                              )}
                              <button
                                className="flex items-center w-full text-left py-2 px-3 hover:bg-white hover:text-gray-900 "
                                onClick={(e) => {
                                  e.preventDefault();
                                  openPlaylistPopup(video._id); // Open the playlist popup
                                }}
                              >
                                <FaPlus className="mr-2" /> Save to Playlist
                              </button>
                              <button
                                className="flex items-center w-full text-left py-2 px-3 hover:bg-white hover:text-gray-900 "
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (popupVideoId) {
                                    handleShareVideo(popupVideoId);
                                  }
                                }}
                              >
                                <FaShareAlt className="mr-2" /> Share
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-gray-400 text-xs">
                        <p className="text-gray-400 text-sm">{video.views} views • {getTimeAgo(video.createdAt)}</p>
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

        {/* Playlist Popup */}
        {playlistPopupVideoId && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-semibold text-white mb-4">Select Playlists</h2>
              <div className="p-2">
                {playlists.map((playlist: any) => (
                  <div key={playlist._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`playlist-${playlist._id}`}
                      checked={selectedPlaylists[playlist._id] || false}
                      onChange={() => handleCheckboxChange(playlist._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`playlist-${playlist._id}`} className="text-white">{playlist.name}</label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setPlaylistPopupVideoId(null)}
                  className="mr-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveToPlaylist(playlistPopupVideoId)}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}