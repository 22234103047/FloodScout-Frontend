"use client";

import HistoryCard from '@/components/HistoryCard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState(
    [
      {
        missionNumber: 1,
        date: "2024-01-15",
        latitude: 23.8103,
        longitude: 90.4125,
        status: "Pending",
        imageUrl: "https://images.unsplash.com/photo-1562059390-a761a084768e?ixlib=rb-4.0.3",
      },
      {
        missionNumber: 2,
        date: "2024-01-16",
        latitude: 23.8156,
        longitude: 90.4251,
        status: "In Progress",
        imageUrl: "https://images.unsplash.com/photo-1523532888648-8ceaa84d1959?ixlib=rb-4.0.3",
      },
      {
        missionNumber: 3,
        date: "2024-01-17",
        latitude: 23.8199,
        longitude: 90.4376,
        status: "Completed",
        imageUrl: "https://images.unsplash.com/photo-1523532888648-8ceaa84d1959?ixlib=rb-4.0.3",
      }
    ]
  );

  return (
    <div className="bg-gray-300 w-full h-full p-4 min-h-screen relative pb-20">
      <h1 className="text-2xl font-bold text-foreground text-center">History</h1>
      <div className="p-6">
        {history.map((mission) => (
          <HistoryCard
            key={mission.missionNumber}
            missionNumber={mission.missionNumber}
            date={mission.date}
            latitude={mission.latitude}
            longitude={mission.longitude}
            status={mission.status}
            imageUrl={mission.imageUrl}
            locationLink={`https://www.google.com/maps?q=${mission.latitude},${mission.longitude}`}
          />
        ))}
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