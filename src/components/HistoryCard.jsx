import { memo } from 'react';
import Link from 'next/link';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';

const HistoryCard = memo(({ 
  missionNumber,
  date,
  latitude,
  longitude,
  status,
  imageUrl,
  locationLink
}) => {
  const handleStatusChange = (newStatus) => {
    const missionRef = ref(db, `history/userLocations/${missionNumber}`);
    update(missionRef, {
      status: newStatus
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Rescue Mission #{missionNumber}</h2>
        <span className="text-sm text-gray-500">{date}</span>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center">
          <span className="text-gray-600 w-24">Latitude:</span>
          <span className="font-medium">{latitude}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600 w-24">Longitude:</span>
          <span className="font-medium">{longitude}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600 w-24">Status:</span>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`appearance-none text-center ${getStatusColor(status)} border border-gray-300 py-2 px-4 pr-8 rounded-full leading-tight focus:outline-none`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="w-full h-48 mb-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`Rescue Mission ${missionNumber}`}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>

      <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
        <Link href={locationLink} target="_blank">
          View on Map
        </Link>
      </button>
    </div>
  );
});

HistoryCard.displayName = 'HistoryCard';
export default HistoryCard;
