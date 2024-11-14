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
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className={`${additionalClasses}`}>
            {showTitle && <h1 className="text-2xl font-bold">Recent Watched</h1>}
            {history.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-2 mt-4">
                    {history.map((video) => (
                        <div key={video._id} className="bg-black rounded-lg overflow-hidden shadow-lg max-w-xs hover:shadow-xl transition-shadow">
                            <Link href={`/video/${video._id}`}>
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
                                    <h2 className="font-semibold text-white">{video.title}</h2>
                                    <div className="flex flex-col mt-1">
                                        <p className="text-gray-400 text-sm">{video.ownerUsername}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-400 text-sm">{video.views} views • {getTimeAgo(video.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No watch history available.</p>
            )}
        </div>
    );
};

export default WatchHistory;
