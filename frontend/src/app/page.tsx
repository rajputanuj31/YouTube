"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../components/sideBar";
import Link from "next/link";
import { getTimeAgo } from "./utills/getTimeAgo";

export default function Home() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [videos, setVideos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 bg-black pt-16">
        {isSidebarVisible && <Sidebar />}
        <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarVisible ? 'ml-64' : ''}`}>
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
                <div className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow hover:border hover:border-gray-600 w-64 h-60"> {/* Fixed size for video window */}
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
                    <h3 className="text-white font-semibold mb-1 line-clamp-2 overflow-hidden">{video.title}</h3> 
                    <p className="text-gray-400 text-sm">{video.ownerUsername}</p>
                    <p className="text-gray-400 text-sm">{video.views} views • {getTimeAgo(video.createdAt)}</p>
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
    </div>
  );
}
