"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

const VideoCard = memo(({ isPowered, onStreamUpdate }) => {
  const [videoStream, setVideoStream] = useState(null);

  const fetchStreamData = useCallback(async () => {
    if (!isPowered) return;
    
    try {
      const streamRef = ref(db, 'boatState/video/stream');
      const snapshot = await get(streamRef);
      const streamData = snapshot.val();
      console.log("Stream Data: ", streamData);
      if (streamData) {
        setVideoStream(streamData);
        onStreamUpdate?.(streamData);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
    }
  }, [isPowered, onStreamUpdate]);

  useEffect(() => {
    if (!isPowered) {
      setVideoStream(null);
      return;
    }

    fetchStreamData();
    const intervalId = setInterval(fetchStreamData, 1000);

    return () => clearInterval(intervalId);
  }, [isPowered, fetchStreamData]);

  return (
    <div className="bg-gray-300 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Live Video Stream</h2>
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
        {isPowered && videoStream ? (
          <>
            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded-full z-10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs">LIVE</span>
            </div>
            <img 
              src={`data:image/png;base64,${videoStream}`}
              alt="Live feed" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            {isPowered ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
                <p>Loading video feed...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>No video feed available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default VideoCard;
