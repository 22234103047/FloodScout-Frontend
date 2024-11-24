"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

const VideoCard = memo(({ isPowered }) => {
  const [videoStream, setVideoStream] = useState(null);

  const fetchStreamData = useCallback(async () => {
    if (!isPowered) return;
    
    try {
      const streamRef = ref(db, 'boatState/stream');
      const snapshot = await get(streamRef);
      const streamData = snapshot.val();
      
      if (streamData) {
        setVideoStream(streamData);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
    }
  }, [isPowered]);

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
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {isPowered && videoStream ? (
          <img 
            src={videoStream}
            alt="Live feed" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
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
