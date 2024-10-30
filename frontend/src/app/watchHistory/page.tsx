"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTimeAgo } from '../utils/getTimeAgo';
import Image from "next/image";

const WatchHistory = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWatchHistory = async () => {
            try {
                const response = await fetch('/api/v1/users/watch-history', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch watch history');
                }
                const data = await response.json();
                setHistory(data.data); // Assuming the response has a data field with the history
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
        <div>
            <h1 className="text-2xl mt-20 font-bold">Watch History</h1>
            {history.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-2">
                    {history.map((video) => (
                        <div key={video._id} className="bg-black rounded-lg overflow-hidden shadow-lg max-w-xs hover:shadow-xl transition-shadow"> {/* Changed background color and added hover effect */}
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
                                    <div className="flex flex-col  mt-1">
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
                <p className="text-gray-400">No watch history available.</p> // Added text color for better visibility
            )}
        </div>
    );
};

export default WatchHistory;