import React, { useEffect, useState } from 'react';
import { FaHome, FaBolt, FaYoutube, FaBook, FaHistory, FaVideo, FaClock, FaCut, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';
import { useSelector } from 'react-redux'

interface Channel {
  _id: string;
  channel: string;
  channelDetails?: {
    avatar?: string;
    fullName?: string;
    username?: string;
  };
  totalSubscribers: number;
  isSubscribed: boolean;
}

const Sidebar = () => {
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        const response = await fetch(`/api/v1/subscription/get-subscribed-channels/${currentUser._id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch subscribed channels');
        }
        const data = await response.json();
        setSubscribedChannels(data.data.subscribedChannels);
        
      } catch (error) {
        console.error('Error fetching subscribed channels:', error);
      }
    };

    fetchSubscribedChannels();
  }, []);

  return (
    <nav className="fixed top-16 left-0 h-full w-64 bg-black p-6 text-white z-10 border-r border-gray-700 border-opacity-50">
      <ul className="space-y-4">
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">
          <Link href="/" className="flex items-center">
            <FaHome className="mr-2" /> Home
          </Link>
        </li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors">
          <Link href="/subscriptions" className="flex items-center">
            <FaYoutube className="mr-2" /> Subscriptions
          </Link>
        </li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaBook className="mr-2" /> Library</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaHistory className="mr-2" /> History</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaVideo className="mr-2" /> 
        <Link  href={`/profile/${currentUser._id}`} className="flex items-center">
        Your videos
        </Link>
       
        </li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaClock className="mr-2" /> Watch later</li>
        <li className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center"><FaCut className="mr-2" /> Your clips</li>
      </ul>

      <div className="mt-10">
        <h3 className="text-sm font-semibold mb-4">
          <Link href="/subscriptions" className="text-white">
            Subscriptions
          </Link>
        </h3>
        <ul className="space-y-2">
          {subscribedChannels.map(channel => (
            <li key={channel._id} className="hover:bg-gray-800 p-2 rounded transition-colors flex items-center">
              <img src={channel.channelDetails?.avatar || ''} alt="Channel Avatar" className="mr-2 w-6 h-6 rounded-full" />
              <Link href={`/profile/${channel.channel}`} className="text-white">
                {channel.channelDetails?.fullName || 'Unknown Channel'}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
