"use client";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEllipsisV } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Playlist {
  _id: string;
  name: string;
  description: string;
  videos: string[];
}

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
}

const Page = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [videos, setVideos] = useState<{ [key: string]: Video }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [showOptions, setShowOptions] = useState<string | null>(null); // State to manage options popup
  const [editMode, setEditMode] = useState(false); // State to manage edit mode
  const [editPlaylistId, setEditPlaylistId] = useState<string | null>(null); // State to manage the playlist being edited

  const router = useRouter(); // Initialize useRouter

  // Retrieve the current user from the Redux store
  const currentUser = useSelector((state: any) => state.user.currentUser?.data?.user);

  useEffect(() => {
    // If currentUser is not available, do not proceed
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

        // Fetch videos for each playlist
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

  // Function to handle opening the modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setShowModal(false);
    setNewPlaylist({ name: '', description: '' });
    setEditMode(false);
    setEditPlaylistId(null);
  };

  // Function to handle input changes in the modal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPlaylist((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle form submission (creating or editing a playlist)
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
        setPlaylists((prev) => [...prev, data.data]); // Add new playlist to the list
      }
      closeModal();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Function to handle playlist click
  const handlePlaylistClick = (playlist: Playlist) => {
    if (playlist.videos.length > 0) {
      router.push(`/video/${playlist.videos[0]}`);
    }
  };

  // Function to handle options click
  const handleOptionsClick = (playlistId: string) => {
    setShowOptions((prev) => (prev === playlistId ? null : playlistId));
  };

  // Function to handle delete playlist
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

  // Function to handle edit playlist
  const handleEditPlaylist = (playlist: Playlist) => {
    setNewPlaylist({ name: playlist.name, description: playlist.description });
    setEditMode(true);
    setEditPlaylistId(playlist._id);
    openModal();
  };

  // Render loading state
  if (loading) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center">Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div className="h-[calc(100vh-64px)] flex items-center justify-center text-red-500">{error}</div>;
  }

  // Render playlists
  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen mt-20 relative">
      <button
        onClick={openModal}
        className="fixed right-8  bg-black text-white rounded-full p-4 shadow-lg focus:outline-none"
      >
        <FaPlus className="w-6 h-6" /> {/* Using the plus icon from react-icons */}
      </button>
      <h1 className="text-3xl font-bold mb-8 text-white">Your Playlists</h1>
      {playlists.length === 0 ? (
        <p className="text-gray-300 text-lg">You don't have any playlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-black p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handlePlaylistClick(playlist)}
            >
              <div className="w-full h-48 bg-gray-700 rounded-md overflow-hidden">
                {playlist.videos.length > 0 && videos[playlist.videos[0]] ? (
                  <img src={videos[playlist.videos[0]].thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">No Thumbnail</div>
                )}
              </div>
              <div className='flex flex-row mt-2 ml-2 justify-between'>
                <h2 className="text-xl font-semibold text-white ">{playlist.name}</h2>
                <div className="relative">
                  <FaEllipsisV className='mt-3 cursor-pointer' onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation()
                    handleOptionsClick(playlist._id)
                  }
                  } />
                  {showOptions === playlist._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-black rounded-md shadow-lg z-10">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
                        onClick={() => handleDeletePlaylist(playlist._id)}
                      >
                        Delete
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white hover:text-black"
                        onClick={(e) => {
                        e.stopPropagation()
                          handleEditPlaylist(playlist);
                          setShowOptions(null);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plus Icon Button */}

      {/* Modal for creating or editing a playlist */}
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

export default Page;
