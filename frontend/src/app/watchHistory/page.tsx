"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTimeAgo } from '../utils/getTimeAgo';
import Image from "next/image";
import { useSelector } from 'react-redux';

interface WatchHistoryProps {
  showTitle?: boolean;
  additionalClasses?: string;
}

const WatchHistory: React.FC<WatchHistoryProps> = ({ showTitle = true, additionalClasses = "mt-20" }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = useSelector((state: any) => state.user.currentUser?.data?.user);


    useEffect(() => {
        if (!currentUser?._id) {
            setLoading(false);
            return;
        }

        const fetchWatchHistory = async () => {
            try {
                const response = await fetch(`/api/v1/users/watch-history/${currentUser._id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch watch history');
                }
                const data = await response.json();
                
                setHistory(data.data);
            } catch (error) {
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchHistory();
    }, [currentUser?._id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className={`${additionalClasses}`}>
            {showTitle && <h1 className="text-xl sm:text-2xl font-bold">Recent Watched</h1>}
            {history.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    {history.map((video) => (
                        <Link href={`/video/${video._id}`} key={video._id}>
                            <div className="group bg-black rounded-xl overflow-hidden hover:bg-gray-900/50 transition-all duration-200">
                                <div className="relative aspect-video rounded-xl overflow-hidden">
                                    <Image
                                        src={video.thumbnail || "/default-thumbnail.jpg"}
                                        alt={video.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        unoptimized
                                    />
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">{(parseFloat(video.duration) / 60).toFixed(2)}</span>
                                </div>
                                <div className="p-2 pt-3">
                                    <h2 className="font-medium text-white text-sm line-clamp-2">{video.title}</h2>
                                    <p className="text-gray-400 text-xs mt-1">{video.ownerUsername}</p>
                                    <p className="text-gray-500 text-xs">{video.views} views • {getTimeAgo(video.createdAt)}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-sm">No watch history available.</p>
            )}
        </div>
    );
};

export default WatchHistory;
