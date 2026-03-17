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

  const openPlaylistPopup = (videoId: string) => {
    fetchPlaylists(videoId);
    setPlaylistPopupVideoId(videoId);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 bg-black pt-16">
        <main className="flex-1 p-3 sm:p-4 md:p-6 transition-all duration-300 min-w-0">
          {/* Category filters */}
          {/* <div className="mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              <button className="py-1.5 sm:py-2 px-3 sm:px-4 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors active:scale-95">All</button>
              {["Gaming", "Music", "Sports", "UI design", "Cricket", "Mixes", "Live"].map(cat => (
                <button key={cat} className="py-1.5 sm:py-2 px-3 sm:px-4 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors active:scale-95 whitespace-nowrap">{cat}</button>
              ))}
            </div>
          </div> */}

          {/* Video Grid */}
          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {videos.map((video: any) => (
              <Link href={`/video/${video._id}`} key={video._id}>
                <div className="group bg-black rounded-xl overflow-hidden hover:bg-gray-900/50 transition-all duration-200">
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image 
                      src={video.thumbnail || "/default-thumbnail.jpg"} 
                      alt={video.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">{(parseFloat(video.duration) / 60).toFixed(2)}</span>
                  </div>
                  <div className="p-2 pt-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 leading-snug">{video.title}</h3>
                      <button
                        className="text-gray-400 hover:text-white p-1 flex-shrink-0 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          togglePopup(video._id);
                        }}
                        aria-label="Video options"
                      >
                        <FaEllipsisV size={14} />
                      </button>
                    </div>
                    {popupVideoId === video._id && (
                      <div className="absolute right-4 mt-1 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700/50 w-44 z-50 overflow-hidden">
                        <button
                          className="flex items-center gap-2 w-full text-left py-2.5 px-3 text-sm hover:bg-gray-700 transition-colors"
                          onClick={(e) => { e.preventDefault(); openPlaylistPopup(video._id); }}
                        >
                          <FaPlus size={12} /> Save to Playlist
                        </button>
                        <button
                          className="flex items-center gap-2 w-full text-left py-2.5 px-3 text-sm hover:bg-gray-700 transition-colors"
                          onClick={(e) => { e.preventDefault(); handleShareVideo(video._id); }}
                        >
                          <FaShareAlt size={12} /> Share
                        </button>
                      </div>
                    )}
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{video.ownerUsername}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">{video.views} views • {getTimeAgo(video.createdAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-400 text-sm">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </main>
      </div>

      {/* Playlist Popup */}
      {playlistPopupVideoId && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Select Playlists">
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-[95vw] max-w-md mx-4">
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
