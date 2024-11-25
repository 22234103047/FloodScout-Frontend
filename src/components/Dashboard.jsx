"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, History, Video, AlertTriangle, Power, MapPin } from 'lucide-react';
import LiveLocationModal from './LiveLocationModal';
import Link from 'next/link';
import { ref, onValue, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import VideoCard from './VideoCard';
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { toast } = useToast();

  const [isPowered, setIsPowered] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [forwardBackward, setForwardBackward] = useState(null);
  const [leftRightStraight, setLeftRightStraight] = useState('STRAIGHT');
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [videoStream, setVideoStream] = useState(null);

  const commands = {
    FORWARD: 'FORWARD_MOVEMENT',
    BACKWARD: 'BACKWARD_MOVEMENT',
    LEFT: 'LEFT_MOVEMENT',
    RIGHT: 'RIGHT_MOVEMENT',
    STRAIGHT: 'STRAIGHT',
    CHANGE_SPEED: 'CHANGE_SPEED',
    SAVE_LOCATION: 'SAVE_LOCATION',
    GET_LOCATION: 'GET_LOCATION',
    STOP: 'STOP'
  };

  const getBoatState = () => {
    const boatStateRef = ref(db, 'boatState');
      
    const unsubscribe = onValue(boatStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsPowered(data.power);
        setSpeed(data.speed);
        setForwardBackward(data.forwardBackward);
        setLeftRightStraight(data.leftRightStraight);
        setLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude
        });
      }
    });
    return unsubscribe;
  }

  useEffect(() => {
    const unsubscribe = getBoatState();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isPowered) {
      const unsubscribe = getBoatState();
      // Set initial power state
      set(ref(db, 'boatState/power'), isPowered);

      return () => {
        unsubscribe();
      };
    }
  }, [isPowered]);


  const sendCommand = (command, value = null) => {
    if (!isPowered) return;

    switch (command) {
      case commands.FORWARD:
      case commands.BACKWARD:
        const newForwardBackward = forwardBackward === command ? commands.STOP : command;
        const newSpeed = newForwardBackward === commands.STOP ? 0 : 35;
        
        setSpeed(newSpeed);
        setForwardBackward(newForwardBackward);
        set(ref(db, 'boatState/forwardBackward'), newForwardBackward);
        set(ref(db, 'boatState/speed'), newSpeed);
        break;

      case commands.LEFT:
      case commands.RIGHT:
        const newLeftRightStraight = leftRightStraight === command ? commands.STRAIGHT : command;
        setLeftRightStraight(newLeftRightStraight);
        set(ref(db, 'boatState/leftRightStraight'), newLeftRightStraight);
        break;

      case commands.CHANGE_SPEED:
        set(ref(db, 'boatState/speed'), value);
        break;

      case commands.SAVE_LOCATION:
        set(ref(db, `history/userLocations/${Date.now()}`), {
          image: videoStream ? `data:image/png;base64,${videoStream}` : "",
          latitude: location.latitude,
          longitude: location.longitude,
          status: "pending",
          timestamp: Date.now()
        });
        toast({
          description: "Location saved to history",
          variant: "success",
        });
        break;

      case commands.GET_LOCATION:
        get(ref(db, 'boatState/location')).then((snapshot) => {
          if (snapshot.exists()) {
            setLocation(snapshot.val());
          }
        });
        break;

      default:
        set(ref(db, 'boatState/direction'), command);
        break;
    }
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    sendCommand(commands.CHANGE_SPEED, newSpeed);
  };

  const togglePower = () => {
    setIsPowered(!isPowered);
    set(ref(db, 'boatState/power'), false);
    set(ref(db, 'boatState/forwardBackward'), commands.STOP);
    set(ref(db, 'boatState/leftRightStraight'), commands.STRAIGHT);
    set(ref(db, 'boatState/speed'), 0);
    set(ref(db, 'boatState/stream'), null);
    set(ref(db, 'boatState/location'), {
      latitude: 23.811851,
      longitude: 90.3545386
    });
  };

  const handleStreamUpdate = useCallback((stream) => {
    setVideoStream(stream);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 space-y-4">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl font-extrabold uppercase text-primary text-center">
          Flood Scout
        </h1>
      </header>

      {/* Video Feed */}
      <VideoCard 
        isPowered={isPowered} 
        onStreamUpdate={handleStreamUpdate}
      />

      {/* Boat Controls */}
      <div className="bg-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Boat Controls</h2>
        <div className="flex gap-8">
          {/* Left Side - Action Buttons */}
          <div className="flex flex-col gap-3 w-1/3">
            <button 
              onClick={togglePower}
              className={`w-full py-3 px-4 ${
                isPowered ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded font-medium flex items-center justify-center gap-2`}
            >
              <Power className="w-5 h-5" />
              {isPowered ? 'Stop' : 'Start'}
            </button>
            <button 
              onClick={() => sendCommand(commands.SAVE_LOCATION)}
              disabled={!isPowered}
              className={`w-full py-3 px-4 ${
                !isPowered 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-green-700 hover:bg-green-800'
              } text-white rounded font-medium flex items-center justify-center gap-2`}
            >
              <AlertTriangle className="w-5 h-5" />
              Found
            </button>
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              disabled={!isPowered}
              className={`w-full py-3 px-4 ${
                !isPowered 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded font-medium flex items-center justify-center gap-2`}
            >
              <MapPin className="w-5 h-5" />
              Location
            </button>
            <Link 
              href="/history" 
              className="w-full py-3 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              History
            </Link>
          </div>

          {/* Right Side - Direction Controls */}
          <div className="flex-grow">
            <div className="grid grid-cols-2 gap-4 max-w-[300px] mx-auto">
              <button
                onClick={() => sendCommand(commands.FORWARD)}
                disabled={!isPowered}
                className={`p-6 ${
                  !isPowered 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : forwardBackward === commands.FORWARD 
                      ? 'bg-emerald-700 ring-2 ring-emerald-300' 
                      : 'bg-emerald-500 hover:bg-emerald-600'
                } text-white rounded-lg flex items-center justify-center touch-none`}
              >
                <ArrowUp className="w-8 h-8" />
              </button>
              <button
                onClick={() => sendCommand(commands.RIGHT)}
                disabled={!isPowered}
                className={`p-6 ${
                  !isPowered 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : leftRightStraight === commands.RIGHT
                      ? 'bg-gray-900 ring-2 ring-gray-300'
                      : 'bg-gray-800 hover:bg-gray-900'
                } text-white rounded-lg flex items-center justify-center touch-none`}
              >
                <ArrowRight className="w-8 h-8" />
              </button>
              <button
                onClick={() => sendCommand(commands.BACKWARD)}
                disabled={!isPowered}
                className={`p-6 ${
                  !isPowered 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : forwardBackward === commands.BACKWARD 
                      ? 'bg-amber-700 ring-2 ring-amber-300' 
                      : 'bg-amber-500 hover:bg-amber-600'
                } text-white rounded-lg flex items-center justify-center touch-none`}
              >
                <ArrowDown className="w-8 h-8" />
              </button>
              <button
                onClick={() => sendCommand(commands.LEFT)}
                disabled={!isPowered}
                className={`p-6 ${
                  !isPowered 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                    : leftRightStraight === commands.LEFT
                      ? 'bg-cyan-700 ring-2 ring-cyan-300'
                      : 'bg-cyan-500 hover:bg-cyan-600'
                } text-white rounded-lg flex items-center justify-center touch-none`}
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
            </div>
            
            {/* Speed Control */}
            <div className="mt-6 max-w-[300px] mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Speed</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSpeedChange(Math.max(0, speed - 5))}
                    disabled={!isPowered || !(forwardBackward === commands.FORWARD || forwardBackward === commands.BACKWARD)}
                    className={`w-6 h-6 flex items-center justify-center ${
                      !isPowered || !(forwardBackward === commands.FORWARD || forwardBackward === commands.BACKWARD)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    } rounded`}
                  >
                    -
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[3ch] text-center">
                    {speed}%
                  </span>
                  <button 
                    onClick={() => handleSpeedChange(Math.min(100, speed + 5))}
                    disabled={!isPowered || !(forwardBackward === commands.FORWARD || forwardBackward === commands.BACKWARD)}
                    className={`w-6 h-6 flex items-center justify-center ${
                      !isPowered || !(forwardBackward === commands.FORWARD || forwardBackward === commands.BACKWARD)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    } rounded`}
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => {
                  const newSpeed = parseInt(e.target.value);
                  handleSpeedChange(newSpeed);
                }}
                disabled={!isPowered || !(forwardBackward === commands.FORWARD || forwardBackward === commands.BACKWARD)}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  !isPowered || !(forwardBackward === commands.FORWARD || forwardBackward === commands.BACKWARD)
                    ? 'bg-gray-200 opacity-50 cursor-not-allowed' 
                    : 'bg-gray-200 accent-blue-600'
                }`}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`fixed bottom-4 right-4 px-3 py-1 rounded-full text-sm ${
        isPowered ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {isPowered ? 'Connected' : 'Disconnected'}
      </div>

      <LiveLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        location={location}
      />
    </div>
  );
} 