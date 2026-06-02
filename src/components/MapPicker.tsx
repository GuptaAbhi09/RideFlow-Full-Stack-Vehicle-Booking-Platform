"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

// Fix for default marker icons in Next.js/Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapPickerProps {
  onSelect: (address: string) => void
  onClose: () => void
  initialLat?: number
  initialLng?: number
}

// Component to handle map clicks and moving the marker
function LocationMarker({ position, setPosition, setAddress, fetchingAddress }: any) {
  const map = useMap()

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  // Whenever position changes, fetch the address
  useEffect(() => {
    if (position) {
      fetchingAddress(true)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setAddress(data.display_name)
          } else {
            setAddress(`${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`)
          }
        })
        .catch(() => {
          setAddress(`${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`)
        })
        .finally(() => {
          fetchingAddress(false)
        })
    }
  }, [position])

  return position === null ? null : (
    <Marker position={position} icon={customIcon} draggable={true} 
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const newPos = marker.getLatLng()
          setPosition(newPos)
          map.flyTo(newPos, map.getZoom())
        }
      }}
    />
  )
}

const MapPicker = ({ onSelect, onClose, initialLat = 20.5937, initialLng = 78.9629 }: MapPickerProps) => {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [findingMe, setFindingMe] = useState(false)

  // Fly to user location if no initial position provided
  useEffect(() => {
    if (initialLat !== 20.5937) {
      setPosition(new L.LatLng(initialLat, initialLng))
    } else {
      handleCurrentLocation()
    }
  }, [])

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    setFindingMe(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition(new L.LatLng(latitude, longitude))
        setFindingMe(false)
      },
      () => {
        toast.error("Unable to retrieve location.")
        setFindingMe(false)
        // Fallback to center of India if failed
        setPosition(new L.LatLng(20.5937, 78.9629))
      }
    )
  }

  const handleConfirm = () => {
    if (!address) {
      toast.error("Please wait for address to resolve or click on map")
      return
    }
    onSelect(address)
    onClose()
  }

  // A wrapper component to access map instance to fly to user location
  const MapControls = () => {
    const map = useMap()
    
    useEffect(() => {
      if (position && findingMe) {
        map.flyTo(position, 15)
      } else if (position && !address) {
        // Initial load focus
        map.setView(position, 13)
      }
    }, [position, findingMe, map])

    return null
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#121212]">
      {/* Header */}
      <div className="p-4 bg-[#1a1a1a] flex items-center justify-between shadow-md z-10">
        <h3 className="text-lg font-bold text-white">Choose Location on Map</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white px-3 py-1">Cancel</button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        {position ? (
          <MapContainer 
            center={position} 
            zoom={13} 
            zoomControl={false}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker 
              position={position} 
              setPosition={setPosition} 
              setAddress={setAddress} 
              fetchingAddress={setLoading}
            />
            <MapControls />
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Current Location Button overlay */}
        <button 
          onClick={handleCurrentLocation}
          className="absolute bottom-6 right-4 z-[400] bg-white p-3 rounded-full shadow-xl text-blue-600 hover:bg-gray-100 transition-colors"
        >
          {findingMe ? <Loader2 size={24} className="animate-spin" /> : <LocateFixed size={24} />}
        </button>
      </div>

      {/* Bottom Panel */}
      <div className="p-6 bg-[#1a1a1a] shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-10">
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Selected Location</p>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
            {loading ? (
              <Loader2 size={20} className="animate-spin text-gray-400" />
            ) : (
              <p className="text-sm text-white font-medium line-clamp-2 leading-relaxed">
                {address || "Click anywhere on the map to set location"}
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleConfirm}
          disabled={loading || !address}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-gray-400 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Resolving Address...' : 'Confirm Location'}
        </button>
      </div>
    </div>
  )
}

export default MapPicker
