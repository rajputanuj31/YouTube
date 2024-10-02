import React from 'react';
import { FaHome, FaBolt, FaYoutube, FaBook, FaHistory, FaVideo, FaClock, FaCut, FaChevronDown, FaUser } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <nav className="fixed top-16 left-0 h-full w-64 bg-black p-6 text-white z-10">
      <ul className="space-y-4">
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaHome className="mr-2" /> Home</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaBolt className="mr-2" /> Shorts</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaYoutube className="mr-2" /> Subscriptions</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaBook className="mr-2" /> Library</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaHistory className="mr-2" /> History</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaVideo className="mr-2" /> Your videos</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaClock className="mr-2" /> Watch later</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaCut className="mr-2" /> Your clips</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaChevronDown className="mr-2" /> Show more</li>
      </ul>

      <div className="mt-10">
        <h3 className="text-sm font-semibold mb-4">Subscriptions</h3>
        <ul className="space-y-2">
          <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaUser className="mr-2" /> Andres Vidoza</li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;