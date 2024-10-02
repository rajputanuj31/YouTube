"use client"

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'

export default function SubscriptionsPage() {
  const [subscribedChannels, setSubscribedChannels] = useState([])
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

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-black min-h-screen mt-20">
      <h1 className="text-3xl font-bold mb-8 text-white">Your Subscriptions</h1>
      {subscribedChannels.length === 0 ? (
        <p className="text-gray-300 text-lg">You haven't subscribed to any channels yet.</p>
      ) : (
        <div className="space-y-4">
          {subscribedChannels.map((channel: any) => (
            <div 
              key={channel._id} 
              className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-center"
              onClick={() => router.push(`/profile/${channel.channel}`)}
            >
              <div className="w-20 h-20 mr-4 flex-shrink-0">
                <img
                  src={channel.channelDetails?.avatar || '/default-avatar.png'}
                  alt={channel.channelDetails?.fullName || 'Channel'}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-white">
                  {channel.channelDetails?.fullName || 'Unknown Channel'}
                </h2>
                <p className="text-gray-400 text-sm">
                  @{channel.channelDetails?.username || 'unknown'}
                </p>
                <p className="text-gray-400 text-sm">
                  {channel.totalSubscribers || 0} subscribers
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
