"use client"

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface VideoUploadData {
  title: string;
  description: string;
  videoFile: File | null;
  thumbnail: File | null;
}

const UploadVideo = () => {
  const router = useRouter();
  const [videoData, setVideoData] = useState<VideoUploadData>({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVideoData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setVideoData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const uploadVideo = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      if (videoData.videoFile) formData.append('videoFile', videoData.videoFile);
      if (videoData.thumbnail) formData.append('thumbnail', videoData.thumbnail);

      const response = await axios.post('/api/v1/videos/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        console.log('Video uploaded successfully');
        router.push(`/profile/${response.data.data.owner}`);
      } else {
        throw new Error('Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Upload Video</h1>
        <form onSubmit={uploadVideo} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={videoData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={videoData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            />
          </div>
          <div>
            <label htmlFor="videoFile" className="block text-sm font-medium text-gray-300 mb-1">Video File</label>
            <input
              type="file"
              id="videoFile"
              name="videoFile"
              onChange={handleFileChange}
              accept="video/*"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
          </div>
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-300 mb-1">Thumbnail</label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              onChange={handleFileChange}
              accept="image/*"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;
