import React from 'react'
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import { getTimeAgo } from '@/app/utills/getTimeAgo';

const SuggestionVideos = () => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        fetchVideos();
    }, []); // Added dependency array to useEffect

    const fetchVideos = async () => {
        try {
            const response = await fetch(`/api/v1/videos/get-all-videos?page=1&limit=12`);
            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }
            const data = await response.json();
            // Shuffle videos every time the component mounts
            const shuffledVideos = data.data.videos.sort(() => Math.random() - 0.5);
            setVideos(shuffledVideos);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    return (
        <div className="ml-5 mt-5 flex-1">
            <h2 className="text-white text-xl font-bold mb-4">Related Videos</h2>
            <div className="flex flex-col gap-4">
                {videos.map((relatedVideo: any) => (
                    <Link href={`/video/${relatedVideo._id}`} key={relatedVideo._id}>
                        <div className="bg-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow hover:border hover:border-gray-600 flex">
                            <div className="relative aspect-video w-1/2">
                                <Image 
                                    src={relatedVideo.thumbnail || "/default-thumbnail.jpg"} 
                                    alt={relatedVideo.title} 
                                    layout="fill" 
                                    objectFit="cover"
                                    unoptimized={true}
                                />
                                <p className="text-white text-sm absolute bottom-2 right-2 bg-black bg-opacity-50 p-1 rounded-lg">{(parseFloat(relatedVideo.duration) / 60).toFixed(2)} </p>
                            </div>
                            <div className="p-4 w-1/2 flex flex-col justify-center">
                                <h3 className="text-white font-semibold mb-2 line-clamp-2">{relatedVideo.title}</h3>
                                <p className="text-gray-400 text-sm">{relatedVideo.views} views • {getTimeAgo(relatedVideo.createdAt)}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SuggestionVideos
