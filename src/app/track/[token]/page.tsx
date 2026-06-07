"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import dynamic from 'next/dynamic';
import { Car, MapPin, Navigation } from 'lucide-react';

const MapTracking = dynamic(() => import('@/components/MapTracking'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-[#9ca3af]">Loading Map...</div> });

export default function PublicTrackingPage() {
  const { token } = useParams() as { token: string };
  const [rideData, setRideData] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let socket: any = null;

    fetch(`/api/track/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRideData(data.booking);
          
          // Connect to the socket server
          socket = getSocket();
          
          // Join the ride room using the internal _id
          socket.emit('join_ride', { rideId: data.booking._id });
          
          // Listen for driver updates
          socket.on('driver_location_updated', (locData: any) => {
            setDriverLocation({ lat: locData.latitude, lng: locData.longitude });
          });
          
          socket.on('ride_status_updated', (statusData: any) => {
             setRideData((prev: any) => ({ ...prev, status: statusData.status }));
             if (statusData.status === 'completed' || statusData.status === 'cancelled') {
               socket.off('driver_location_updated');
             }
          });
        } else {
          setError(data.error || "Tracking link invalid or expired");
        }
      })
      .catch(() => setError("Network error"));
      
    return () => {
      if (socket) {
        socket.off('driver_location_updated');
        socket.off('ride_status_updated');
      }
    }
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6 text-center">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-xl max-w-md w-full">
          <p className="text-red-500 font-medium mb-2">Error</p>
          <p className="text-[#9ca3af]">{error}</p>
        </div>
      </div>
    );
  }

  if (!rideData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 lg:w-[65%] h-[50vh] md:h-screen relative z-0 border-b md:border-b-0 md:border-r border-[#2a2a2a] flex items-center justify-center">
        {(rideData.status === 'completed' || rideData.status === 'cancelled') ? (
          <div className="text-center p-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl max-w-sm">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${rideData.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <MapPin size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#f5f5f5] mb-2">
              {rideData.status === 'completed' ? 'Ride Completed' : 'Ride Cancelled'}
            </h2>
            <p className="text-[#9ca3af]">Live tracking has ended.</p>
          </div>
        ) : (
          <MapTracking 
            pickupAddress={rideData.pickup} 
            dropAddress={rideData.drop} 
            driverLocation={driverLocation} 
            exactPickup={rideData.pickupLat && rideData.pickupLng ? { lat: rideData.pickupLat, lng: rideData.pickupLng } : undefined}
            exactDrop={rideData.dropLat && rideData.dropLng ? { lat: rideData.dropLat, lng: rideData.dropLng } : undefined}
          />
        )}
      </div>
      
      <div className="w-full md:w-1/2 lg:w-[35%] p-6 bg-[#0f0f0f] flex flex-col gap-6 overflow-y-auto">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h1 className="text-xl font-semibold text-[#f5f5f5] mb-4">Live Ride Tracking</h1>
          
          <div className="flex items-center justify-between mb-6">
            <span className="text-[#9ca3af] text-sm font-medium">Status</span>
            <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${
              rideData.status === 'completed' ? 'bg-green-500/10 text-green-500' :
              rideData.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              {rideData.status !== 'completed' && rideData.status !== 'cancelled' && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
              <span className="text-xs font-medium capitalize">{rideData.status}</span>
            </div>
          </div>

          {rideData.driverId && (
            <div className="flex items-center gap-3 p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg mb-6">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#9ca3af]">
                <Car size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#f5f5f5]">{rideData.driverId.name}</p>
                <p className="text-xs text-[#9ca3af]">{rideData.vehicleType}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 relative">
            <div className="absolute left-3 top-6 bottom-6 w-[1px] bg-[#2a2a2a] z-0"></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-1.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-full mt-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] mb-1">Pickup</p>
                <p className="text-sm text-[#f5f5f5] line-clamp-2">{rideData.pickup}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="p-1.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-full mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] mb-1">Drop</p>
                <p className="text-sm text-[#f5f5f5] line-clamp-2">{rideData.drop}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mt-auto">
          <p className="text-xs text-blue-400 text-center">
            You are securely tracking this ride live via RideFlow.
          </p>
        </div>
      </div>
    </div>
  );
}
