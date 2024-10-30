"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEllipsisV, FaTimes } from 'react-icons/fa'; // Import FaTimes for the cross icon
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Playlist {
  _id: string;
  name: string;
  description: string;
  videos: string[];
}

interface Video {
  _id: string;
  title: string;
  thumbnail?: string; // Added thumbnail property to Video interface
  duration: string;
  ownerUsername: string
}
interface PlaylistProps {
  showTitle?: boolean;
  additionalClasses?: string;
}
const Playlist: React.FC<PlaylistProps> = ({ showTitle = true, additionalClasses = "mt-20" }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [videos, setVideos] = useState<{ [key: string]: Video }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [PlaylistId, setPlaylistId] = useState<string | null>(null);
  const [editPlaylistId, setEditPlaylistId] = useState<string | null>(null);
  const [selectedPlaylistVideos, setSelectedPlaylistVideos] = useState<Video[]>([]);
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  const router = useRouter();

  const currentUser = useSelector((state: any) => state.user.currentUser?.data?.user);

  useEffect(() => {
    if (!currentUser?._id) {
      setError('User not found. Please log in.');
      setLoading(false);
      return;
    }

    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/playlist/get-playlists-by-user/${currentUser._id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch playlists.');
        }

        const data = await response.json();
        setPlaylists(data.data);

        for (const playlist of data.data) {
          for (const videoId of playlist.videos) {
            if (!videos[videoId]) {
              const videoResponse = await fetch(`/api/v1/videos/get-video/${videoId}`);
              if (videoResponse.ok) {
                const videoData = await videoResponse.json();
                setVideos((prev) => ({ ...prev, [videoId]: videoData.data }));
              }
            }
          }
        }
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [currentUser]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewPlaylist({ name: '', description: '' });
    setEditMode(false);
    setEditPlaylistId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPlaylist((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrEditPlaylist = async () => {
    try {
      const url = editMode ? `/api/v1/playlist/update-playlist/${editPlaylistId}` : '/api/v1/playlist/create-playlist';
      const method = editMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPlaylist,
          owner: currentUser._id,
        }),
      });

      if (!response.ok) {
        throw new Error(editMode ? 'Failed to update playlist.' : 'Failed to create playlist.');
      }

      const data = await response.json();
      if (editMode) {
        setPlaylists((prev) => prev.map((playlist) => (playlist._id === editPlaylistId ? data.data : playlist)));
      } else {
        setPlaylists((prev) => [...prev, data.data]);
      }
      closeModal();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handlePlaylistClick = async (playlist: Playlist) => {
    if (playlist.videos.length > 0) {
      const videosInPlaylist = await Promise.all(
        playlist.videos.map(async (videoId) => {
          const videoResponse = await fetch(`/api/v1/videos/get-video/${videoId}`);
          if (videoResponse.ok) {
            const videoData = await videoResponse.json();
            return videoData.data;
          }
          return null;
        })
      );
      setSelectedPlaylistVideos(videosInPlaylist.filter(video => video !== null) as Video[]);
      console.log(playlist._id);

      setPlaylistId(playlist._id);
      setShowVideoPopup(true);
    }
  };

  const handleVideoClick = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const handleOptionsClick = (playlistId: string) => {
    setShowOptions((prev) => (prev === playlistId ? null : playlistId));
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/v1/playlist/delete-playlist/${playlistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete playlist.');
      }

      setPlaylists((prev) => prev.filter((playlist) => playlist._id !== playlistId));
      setShowOptions(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setNewPlaylist({ name: playlist.name, description: playlist.description });
    setEditMode(true);
    setEditPlaylistId(playlist._id);
    openModal();
  };

  const handleRemoveFromPlaylist = async (playlistId: string, videoId: string) => {
    try {
      const response = await fetch(`/api/v1/playlist/remove-video-from-playlist/${playlistId}/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove video from playlist.');
      }

      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist._id === playlistId
            ? { ...playlist, videos: playlist.videos.filter(id => id !== videoId) }
            : playlist
        )
      );

      // Set the selected video here
      setSelectedPlaylistVideos((prev) => prev.filter(video => video._id !== videoId));

    } catch (error) {
      setError((error as Error).message);
    }
  };

  const closeVideoPopup = () => {
    setShowVideoPopup(false);
    setSelectedPlaylistVideos([]);
  };

  if (loading) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className={`container mx-auto px-4 py-8 bg-black min-h-screen relative ${additionalClasses}`}>
      <div className="flex justify-between items-center mb-6">
        {showTitle && <h1 className="text-2xl font-bold">Your Playlists</h1>}
        <button
          onClick={openModal}
          className="bg-black text-white rounded-full p-4 shadow-lg focus:outline-none"
        >
          <FaPlus className="w-6 h-6" />
        </button>
      </div>
      {playlists.length === 0 ? (
        <p className="text-gray-300 text-lg">You don't have any playlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-black p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer relative"
              onClick={() => handlePlaylistClick(playlist)}
            >
              <div className="w-full h-48 bg-gray-700 rounded-md overflow-hidden">
                {playlist.videos.length > 0 && videos[playlist.videos[0]] ? (
                  <img src={videos[playlist.videos[0]].thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Videos</div>
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-xl font-semibold text-white">{playlist.name}</h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the playlist click
                    handleOptionsClick(playlist._id);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <FaEllipsisV />
                </button>
              </div>
              {showOptions === playlist._id && (
                <div className="absolute right-1 bg-gray-800 rounded-md shadow-lg p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPlaylist(playlist)
                    }}
                    className="block text-white hover:bg-gray-700 w-full text-left p-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist._id)
                    }}
                    className="block text-red-500 hover:bg-gray-700 w-full text-left p-2"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showVideoPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-lg">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Videos</h2>
            <div className="space-y-3">
              {selectedPlaylistVideos.map((video) => (
                <div
                  key={video._id}
                  className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300 transform hover:scale-105 shadow-md"
                >
                  <div className="relative">
                    <Image
                      src={video.thumbnail || "/default-thumbnail.jpg"}
                      alt={video.title}
                      width={64}  // Fixed width for thumbnails
                      height={64} // Fixed height for thumbnails
                      className="rounded-md object-cover w-32 h-20 mr-4" // Set fixed width and height for the image
                      unoptimized={true}
                    />
                    <p className="text-white text-sm absolute bottom-0 right-2 bg-black bg-opacity-50 p-1 rounded-lg">{(parseFloat(video.duration) / 60).toFixed(2)} </p>
                  </div>
                  <div className="flex-grow text-left ml-2">
                    <button
                      className="text-sm font-medium text-white rounded-full w-full transition duration-300 text-left" // Changed to smaller text and ensured text is left-aligned
                      onClick={() => handleVideoClick(video._id)}
                    >
                      {video.title}
                    </button>
                    <p className="text-gray-300 text-sm">{video.ownerUsername}</p> {/* Moved ownerUsername below title */}
                  </div>
                  <button
                    onClick={() => PlaylistId && handleRemoveFromPlaylist(PlaylistId, video._id)}
                    className="text-red-500 hover:bg-red-700 p-2 rounded-full transition duration-300"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={closeVideoPopup}
                className="px-6 py-2 rounded-full bg-gray-800 text-white font-semibold hover:bg-white hover:text-black transition duration-300 shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold text-white mb-4">{editMode ? 'Edit Playlist' : 'Create Playlist'}</h2>
            <input
              type="text"
              name="name"
              value={newPlaylist.name}
              onChange={handleInputChange}
              placeholder="Playlist Name"
              className="w-full mb-4 p-2 rounded-md bg-gray-700 text-white"
            />
            <textarea
              name="description"
              value={newPlaylist.description}
              onChange={handleInputChange}
              placeholder="Playlist Description"
              className="w-full mb-4 p-2 rounded-md bg-gray-700 text-white"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="mr-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrEditPlaylist}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {editMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;
