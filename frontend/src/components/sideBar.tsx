import React, { useEffect, useState } from 'react';
import { FaHome, FaYoutube, FaBook, FaHistory, FaVideo, FaClock, FaCut } from 'react-icons/fa';
import Link from 'next/link';
import { useSelector } from 'react-redux';

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
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user);

  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchSubscribedChannels = async () => {
      try {
        const response = await fetch(`/api/v1/subscription/get-subscribed-channels/${currentUser._id}`);
        if (!response.ok) throw new Error('Failed to fetch subscribed channels');
        const data = await response.json();
        setSubscribedChannels(data.data.subscribedChannels);
      } catch (error) {
        console.error('Error fetching subscribed channels:', error);
      }
    };

    fetchSubscribedChannels();
  }, [currentUser?._id]);

  return (
    <nav className="h-full w-64 bg-black p-4 md:p-6 text-white border-r border-gray-700/50 overflow-y-auto">
      <ul className="space-y-1">
        {[
          { href: "/", icon: FaHome, label: "Home" },
          { href: "/subscriptions", icon: FaYoutube, label: "Subscriptions" },
          { href: "/playlist", icon: FaBook, label: "PlayLists" },
          { href: "/watchHistory", icon: FaHistory, label: "Watch History" },
          { href: currentUser ? `/profile/${currentUser._id}` : "/", icon: FaVideo, label: "Your videos" },
        ].map(({ href, icon: Icon, label }) => (
          <li key={label}>
            <Link href={href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors">
              <Icon className="text-lg flex-shrink-0" /> <span className="truncate">{label}</span>
            </Link>
          </li>
        ))}
        {/* <li className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <FaClock className="text-lg flex-shrink-0" /> <span>Watch later</span>
        </li>
        <li className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
          <FaCut className="text-lg flex-shrink-0" /> <span>Your clips</span>
        </li> */}
      </ul>

      {currentUser && subscribedChannels.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-700/50">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-2.5">
            <Link href="/subscriptions" className="hover:text-white transition-colors">
              Subscriptions
            </Link>
          </h3>
          <ul className="space-y-1">
            {subscribedChannels.map(channel => (
              <li key={channel._id}>
                <Link href={`/profile/${channel.channel}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors text-white">
                  <img
                    src={channel.channelDetails?.avatar || '/default-avatar.png'}
                    alt={channel.channelDetails?.fullName || 'Channel'}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="truncate text-sm">{channel.channelDetails?.fullName || 'Unknown Channel'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
