"use client"

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'

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

export default function SubscriptionsPage() {
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/')
      return
    }

    const fetchSubscribedChannels = async () => {
      try {
        const response = await fetch(`/api/v1/subscription/get-subscribed-channels/${currentUser._id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch subscribed channels')
        }
        const data = await response.json()
        console.log(data)
        setSubscribedChannels(data.data.subscribedChannels)
      } catch (error) {
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscribedChannels()
  }, [currentUser, router])

  const toggleSubscribe = async (channelId: string) => {
    try {
      const response = await fetch(`/api/v1/subscription/toggle-subscription/${channelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to toggle subscribe')
      }
      const data = await response.json()
      setSubscribedChannels(prevChannels =>
        prevChannels.map(channel =>
          channel.channel === channelId
            ? {
                ...channel,
                isSubscribed: data.data.isSubscribed,
                totalSubscribers: data.data.isSubscribed
                  ? channel.totalSubscribers + 1
                  : channel.totalSubscribers - 1
              }
            : channel
        )
      )
    } catch (error) {
      console.error('Failed to toggle subscribe', error)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 bg-black min-h-screen pt-20">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">Your Subscriptions</h1>
      {subscribedChannels.length === 0 ? (
        <p className="text-gray-400 text-base">You haven&apos;t subscribed to any channels yet.</p>
      ) : (
        <div className="space-y-3">
          {subscribedChannels.map((channel: Channel) => (
            <div 
              key={channel._id} 
              className="bg-gray-900/50 rounded-xl p-3 sm:p-4 hover:bg-gray-800/60 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div 
                className="flex items-center gap-3 sm:gap-4 cursor-pointer min-w-0"
                onClick={() => router.push(`/profile/${channel.channel}`)}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                  <img
                    src={channel.channelDetails?.avatar || '/default-avatar.png'}
                    alt={channel.channelDetails?.fullName || 'Channel'}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                    {channel.channelDetails?.fullName || 'Unknown Channel'}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    @{channel.channelDetails?.username || 'unknown'} • {channel.totalSubscribers || 0} subscribers
                  </p>
                </div>
              </div>
              <button 
                className="px-4 py-2 bg-gray-700 text-white text-sm rounded-full hover:bg-red-600 transition-colors duration-200 flex-shrink-0 w-full sm:w-auto active:scale-95"
                onClick={() => toggleSubscribe(channel.channel)}
              >
                Unsubscribe
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
