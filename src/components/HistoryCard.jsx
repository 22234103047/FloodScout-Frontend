import Link from 'next/link';

export default function HistoryCard({ 
  missionNumber,
  date,
  latitude,
  longitude,
  status,
  imageUrl,
  locationLink
}) {
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
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            {status}
          </span>
        </div>
      </div>

      <div className="w-full h-48 mb-4">
        <img 
          src={imageUrl} 
          alt={`Rescue Mission ${missionNumber}`}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
        <Link href={locationLink} target="_blank">
          View on Map
        </Link>
      </button>
    </div>
  );
}
