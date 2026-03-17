import React from 'react'
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import { getTimeAgo } from '@/app/utils/getTimeAgo';

const SuggestionVideos = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`/api/v1/videos/get-all-videos?page=1&limit=12`);
                if (!response.ok) throw new Error('Failed to fetch videos');
                const data = await response.json();
                const shuffledVideos = data.data.videos.sort(() => Math.random() - 0.5);
                setVideos(shuffledVideos);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };
        fetchVideos();
    }, []);

    return (
        <div className="px-2 sm:px-4 lg:px-3 pt-4">
            <h2 className="text-white text-lg font-bold mb-3">Related Videos</h2>
            <div className="flex flex-col gap-3">
                {videos.map((relatedVideo: any) => (
                    <Link href={`/video/${relatedVideo._id}`} key={relatedVideo._id}>
                        <div className="group flex flex-col sm:flex-row gap-2 rounded-xl p-1.5 hover:bg-gray-900/50 transition-colors">
                            <div className="relative aspect-video sm:w-40 md:w-44 flex-shrink-0 rounded-lg overflow-hidden">
                                <Image 
                                    src={relatedVideo.thumbnail || "/default-thumbnail.jpg"} 
                                    alt={relatedVideo.title} 
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    unoptimized
                                />
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">{(parseFloat(relatedVideo.duration) / 60).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col justify-center min-w-0 py-0.5">
                                <h3 className="text-white font-medium text-sm line-clamp-2 leading-snug">{relatedVideo.title}</h3>
                                <p className="text-gray-500 text-xs mt-1">{relatedVideo.views} views • {getTimeAgo(relatedVideo.createdAt)}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SuggestionVideos
