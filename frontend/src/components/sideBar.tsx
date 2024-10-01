import React from 'react';

const Sidebar = () => {
  return (
    <nav className="fixed top-16 left-0 h-full w-64 bg-gray-900 p-6 text-white z-10">
      <ul className="space-y-4">
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Home</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Shorts</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Subscriptions</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Library</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">History</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Your videos</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Watch later</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Your clips</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">Show more</li>
      </ul>

      <div className="mt-10">
        <h3 className="text-sm font-semibold mb-4">Subscriptions</h3>
        <ul className="space-y-2">
          <li className="hover:bg-gray-800 p-2 rounded transition-colors">Andres Vidoza</li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;