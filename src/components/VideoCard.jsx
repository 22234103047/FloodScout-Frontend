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
            {isPowered ? 'Loading video feed...' : 'No video feed available.'}
          </div>
        )}
      </div>
    </div>
  );
});

export default VideoCard;
