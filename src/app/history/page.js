"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import dynamic from 'next/dynamic';

const HistoryCard = dynamic(() => import('@/components/HistoryCard'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg mb-4" />
});

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  useEffect(() => {
    const historyRef = ref(db, 'history/userLocations');
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray = Object.entries(data).map(([key, value]) => ({
          missionNumber: key,
          date: new Date(value.timestamp).toLocaleDateString(),
          latitude: value.latitude,
          longitude: value.longitude,
          status: value.status,
          imageUrl: value.image || null,
        }));
        
        historyArray.sort((a, b) => b.missionNumber - a.missionNumber);
        setHistory(historyArray);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const visibleHistory = useMemo(() => 
    history.slice(visibleRange.start, visibleRange.end),
    [history, visibleRange]
  );

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && visibleRange.end < history.length) {
      setVisibleRange(prev => ({
        start: prev.start,
        end: Math.min(prev.end + 10, history.length)
      }));
    }
  };

  return (
    <div className="bg-gray-300 w-full h-full p-4 min-h-screen relative pb-20">
      <h1 className="text-2xl font-bold text-foreground text-center">History</h1>
      <div className="p-6 overflow-auto h-[calc(100vh-200px)]" onScroll={handleScroll}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          visibleHistory.map((mission) => (
            <HistoryCard
              key={mission.missionNumber}
              {...mission}
              locationLink={`https://www.google.com/maps?q=${mission.latitude},${mission.longitude}`}
            />
          ))
        )}
      </div>
      
      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <button 
          onClick={() => router.back()} 
          className="px-6 py-3 bg-blue-500 flex items-center text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 