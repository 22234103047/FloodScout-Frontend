"use client";

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, History, Video, AlertTriangle, Power, MapPin } from 'lucide-react';
import LiveLocationModal from './LiveLocationModal';
import Link from 'next/link';

export default function Dashboard() {
  const [isPowered, setIsPowered] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState(null);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null
  });
  const [videoStream, setVideoStream] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const videoRef = useRef(null);

  const commands = {
    FORWARD: 'FORWARD_MOVEMENT',
    BACKWARD: 'BACKWARD_MOVEMENT',
    LEFT: 'LEFT_MOVEMENT',
    RIGHT: 'RIGHT_MOVEMENT',
    CHANGE_SPEED: 'CHANGE_SPEED',
    SAVE_LOCATION: 'SAVE_LOCATION',
    GET_LOCATION: 'GET_LOCATION',
    POWER_TOGGLE: 'POWER_TOGGLE',
    BOAT_STATE: 'BOAT_STATE',
    VIDEO_STREAM: 'VIDEO_STREAM',
    VIDEO_FRAME: 'VIDEO_FRAME'
  };

  const getBoatState = (socket) => {
    socket.on(commands.BOAT_STATE, (boatState) => {
      console.log('Boat state updated:', boatState);
    });
  }

  useEffect(() => {
    if (isPowered) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
        getBoatState(newSocket);
      });

      newSocket.emit(commands.POWER_TOGGLE, isPowered);
      
      newSocket.on('location', (data) => {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude
        });
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
        getBoatState(newSocket);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
          setIsConnected(false);
          setSocket(null);
        }
      };
    }
  }, [isPowered]);

  useEffect(() => {
    if (socket) {
      socket.on(commands.VIDEO_STREAM, (frameData) => {
        if (videoRef.current) {
          setVideoStream(frameData);
          videoRef.current.src = frameData;
        }
      });

      return () => {
        socket.off(commands.VIDEO_STREAM);
      };
    }
  }, [socket]);

  const sendCommand = (command, value=null) => {
    if (!isConnected || !socket) return;

    if (command === commands.FORWARD || command === commands.BACKWARD) {
      const newDirection = direction === command ? null : command;
      if (newDirection === null) {
        setSpeed(0);
      } else {
        setSpeed(30);
      }
      setDirection(newDirection);
      socket.emit(newDirection || 'STOP');
    } else if (command === commands.SAVE_LOCATION) {
      socket.emit(command, location);
    } else if (command === commands.CHANGE_SPEED) {
      socket.emit(command, value);
    } else {
      socket.emit(command);
    }

    getBoatState(socket);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    sendCommand(commands.CHANGE_SPEED, newSpeed);
  };

  const togglePower = () => {
    setIsPowered(!isPowered);
    setSocket(null);
    setDirection(null);
    setSpeed(0);
    setLocation({
      latitude: 23.8103,
      longitude: 90.4125
    });
    setVideoStream(null);
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 space-y-4">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl font-extrabold uppercase text-primary text-center">
          Flood Scout
        </h1>
      </header>

      {/* Video Feed */}
      <div className="bg-gray-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2 text-center">Live Video Stream</h2>
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {videoStream ? (
            <img 
              ref={videoRef}
              alt="Live feed" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No video feed available
            </div>
          )}
        </div>
      </div>

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
              Human Found
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
              Live Location
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
                    : direction === commands.FORWARD 
                      ? 'bg-emerald-700 ring-2 ring-emerald-300' 
                      : 'bg-emerald-500 hover:bg-emerald-600'
                } text-white rounded-lg flex items-center justify-center touch-none`}
              >
                <ArrowUp className="w-8 h-8" />
              </button>
              <button
                onTouchStart={handleTouchStart(commands.RIGHT)}
                onTouchEnd={handleTouchEnd}
                onClick={() => sendCommand(commands.RIGHT)}
                disabled={!isPowered}
                className={`p-6 ${
                  !isPowered 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
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
                    : direction === commands.BACKWARD 
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
                    : 'bg-cyan-500 hover:bg-cyan-600'
                } text-white rounded-lg flex items-center justify-center touch-none`}
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
            </div>
            
            {/* Speed Control */}
            <div className="mt-6 max-w-[300px] mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Speed Control</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSpeedChange(Math.max(0, speed - 5))}
                    disabled={!isPowered || !(direction === commands.FORWARD || direction === commands.BACKWARD)}
                    className={`w-6 h-6 flex items-center justify-center ${
                      !isPowered || !(direction === commands.FORWARD || direction === commands.BACKWARD)
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
                    disabled={!isPowered || !(direction === commands.FORWARD || direction === commands.BACKWARD)}
                    className={`w-6 h-6 flex items-center justify-center ${
                      !isPowered || !(direction === commands.FORWARD || direction === commands.BACKWARD)
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
                disabled={!isPowered || !(direction === commands.FORWARD || direction === commands.BACKWARD)}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  !isPowered || !(direction === commands.FORWARD || direction === commands.BACKWARD)
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
        isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      <LiveLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        location={location}
      />
    </div>
  );
} 