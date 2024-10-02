"use client";
import { useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Sidebar from "../components/sideBar";

export default function Home() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 bg-black pt-16"> {/* Added pt-16 to account for Navbar height */}
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
            {/* Individual Video Tile */}
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative aspect-video">
                <Image src="/path-to-thumbnail.jpg" alt="Video Thumbnail" layout="fill" objectFit="cover" />
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">Diljit Dosanjh - G.O.A.T.</h3>
                <p className="text-gray-400 text-sm">3.7M views • 4 months ago</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative aspect-video">
                <Image src="/path-to-thumbnail.jpg" alt="Video Thumbnail" layout="fill" objectFit="cover" />
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">MegaRaptor 6x6 vs Mercedes-Benz</h3>
                <p className="text-gray-400 text-sm">4.2M views • 1 year ago</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative aspect-video">
                <Image src="/path-to-thumbnail.jpg" alt="Video Thumbnail" layout="fill" objectFit="cover" />
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">ChatGPT Crash Course</h3>
                <p className="text-gray-400 text-sm">4.2M views • 4 months ago</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative aspect-video">
                <Image src="/path-to-thumbnail.jpg" alt="Video Thumbnail" layout="fill" objectFit="cover" />
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">How I Made My First Short Film</h3>
                <p className="text-gray-400 text-sm">10K views • 2 hours ago</p>
              </div>
            </div>

            {/* Add more video tiles as necessary */}
          </div>
        </main>
      </div>
    </div>
  );
}
