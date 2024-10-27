"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTimeAgo } from "./utils/getTimeAgo";
import { FaEllipsisV, FaPlus, FaShareAlt } from 'react-icons/fa';
import { useSelector } from "react-redux";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [popupVideoId, setPopupVideoId] = useState<string | null>(null);
  const [playlistPopupVideoId, setPlaylistPopupVideoId] = useState<string | null>(null);
  const currentUser = useSelector((state: any) => state.user.currentUser?.data?.user);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchVideos();
    fetchPlaylists();
  }, [currentPage]);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`/api/v1/videos/get-all-videos?page=${currentPage}&limit=12`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      // Shuffle the videos array
      const shuffledVideos = data.data.videos.sort(() => Math.random() - 0.5);
      setVideos(shuffledVideos);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(`/api/v1/playlist/get-playlists-by-user/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      const data = await response.json();
      setPlaylists(data.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const togglePopup = (videoId: string) => {
    if (popupVideoId === videoId) {
      setPopupVideoId(null); // Close if it's the same video
    } else {
      setPopupVideoId(videoId); // Open for the specific video
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

  const handleShareVideo = (videoId: string) => {
    console.log('Share video:', videoId);
    // Implement share video logic
  };

  const handleCheckboxChange = (playlistId: string) => {
    setSelectedPlaylists((prev) => ({
      ...prev,
      [playlistId]: !prev[playlistId],
    }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 bg-black pt-16">
        <main className={`flex-1 p-6 transition-all duration-300 `}>
          {/* Top navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white mb-4 sm:mb-0">All</h2>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <button className="py-2 px-4 bg-white text-black rounded hover:bg-gray-200 transition-colors">All</button>
              <button className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">Gaming</button>
              <button className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">Music</button>
              <button className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">Sports leagues</button>
              <button className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
                UI design
              </button>
              <button className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">Cricket</button>
              <button className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">Mixes</button>
              <button className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">Live</button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video: any) => (
              <Link href={`/video/${video._id}`} key={video._id}>
                <div className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow hover:border hover:border-gray-600 w-72 h-72"> {/* Fixed size for video window */}
                  <div className="relative aspect-video">
                    <Image 
                      src={video.thumbnail || "/default-thumbnail.jpg"} 
                      alt={video.title} 
                      layout="fill" 
                      objectFit="cover"
                      unoptimized={true}
                    />
                    <p className="text-white text-sm absolute bottom-2 right-2 bg-black bg-opacity-50 p-1 rounded-lg">{(parseFloat(video.duration) / 60).toFixed(2)} </p>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-semibold mb-1 line-clamp-2 overflow-hidden">{video.title}</h3>
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
                      <div className="absolute bg-gray-800 text-white rounded-lg shadow-lg w-40 z-50 ml-10 mt-16"> {/* Added mt-2 for spacing */}
                        <button
                          className="flex items-center w-full text-left py-2 px-3 hover:bg-white hover:text-gray-900 "
                          onClick={(e) => {
                            e.preventDefault();
                            setPlaylistPopupVideoId(video._id);
                          }}
                        >
                          <FaPlus className="mr-2" /> Save to Playlist
                        </button>
                        <button
                          className="flex items-center w-full text-left py-2 px-3 hover:bg-white hover:text-gray-900 "
                          onClick={(e) => {
                            e.preventDefault();
                            handleShareVideo(video._id);
                          }}
                        >
                          <FaShareAlt className="mr-2" /> Share
                        </button>
                      </div>
                    )}
                    </div>
                    <p className="text-gray-400 text-sm">{video.ownerUsername}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-400 text-sm">{video.views} views • {getTimeAgo(video.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded mr-2 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </main>
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
  );
}
