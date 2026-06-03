"use client"

import React, { useState, useEffect } from 'react'
import { getSocket } from '@/lib/socket'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Power } from 'lucide-react'

interface TrackerProps {
  vehicleType: string
  partnerStatus: string
}

export default function DriverLocationTracker({ vehicleType, partnerStatus }: TrackerProps) {
  const { data: session } = useSession()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (!session?.user || partnerStatus !== 'approved') return;

    let watchId: number | null = null;
    const socket = getSocket();

    if (isOnline) {
      // First, register with the new detailed payload
      socket.emit('register_user', {
        userId: session.user.id,
        role: 'partner',
        vehicleType: vehicleType,
        partnerStatus: partnerStatus,
        isOnline: true
      });

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, heading } = position.coords;
            socket.emit('update_location', {
              latitude,
              longitude,
              heading
            });
          },
          (error) => {
            console.error("GPS Tracking Error:", error.message, error.code);
            
            let errorMsg = "Unable to access GPS.";
            if (error.code === 1) errorMsg = "Please allow Location permissions in your browser.";
            if (error.code === 2) errorMsg = "GPS signal lost or unavailable.";
            if (error.code === 3) errorMsg = "GPS request timed out.";

            toast.error(errorMsg);
            setIsOnline(false); // Force offline if GPS fails
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        toast.error("Geolocation is not supported");
        setIsOnline(false);
      }
    } else {
      // User is offline
      socket.emit('register_user', {
        userId: session.user.id,
        role: 'partner',
        isOnline: false
      });
      if (watchId) navigator.geolocation.clearWatch(watchId);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, session, partnerStatus, vehicleType]);

  if (partnerStatus !== 'approved') return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={() => setIsOnline(!isOnline)}
        className={`flex items-center gap-3 px-8 py-4 rounded-full font-extrabold text-lg shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
          isOnline 
            ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
            : 'bg-gray-800 text-gray-300 border border-white/10 hover:bg-gray-700'
        }`}
      >
        <Power className={`${isOnline ? 'animate-pulse' : ''}`} size={24} />
        {isOnline ? "YOU ARE ONLINE" : "GO ONLINE"}
      </button>
    </div>
  )
}
