import { useState, useEffect } from 'react';

export default function LiveLocationModal({ isOpen, onClose, location }) {
  const [latitude, setLatitude] = useState(location?.latitude || 23.8118);
  const [longitude, setLongitude] = useState(location?.longitude || 90.3571);

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px]">
        <h2 className="text-xl font-semibold mb-4">Live Location</h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <span className="text-gray-600">Latitude:</span>
            <span className="ml-2 font-medium">
              {`${latitude}° N`}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600">Longitude:</span>
            <span className="ml-2 font-medium">
              {`${longitude}° E`}
            </span>
          </div>
        </div>

        <div className="w-full h-[200px] bg-gray-100 rounded-lg mb-4">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
            allowFullScreen
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Close
        </button>
      </div>
    </div>
  );
} 