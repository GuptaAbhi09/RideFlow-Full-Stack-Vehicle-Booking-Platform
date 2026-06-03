"use client"

import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'

// Fix for default marker icons
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const carIcon = new L.DivIcon({
  html: '<div style="font-size: 20px; background: #1a1a1a; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 2px solid #3b82f6; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">🚕</div>',
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface MapTrackingProps {
  pickupAddress: string
  dropAddress: string
  onRouteCalculated?: (distance: string, duration: string) => void
  driverLocation?: { lat: number; lng: number } | null
  exactPickup?: { lat: number; lng: number }
  exactDrop?: { lat: number; lng: number }
}

// Component to automatically fit the map bounds to the route
const MapFitter = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds, map])
  return null
}

const MapTracking = ({ pickupAddress, dropAddress, onRouteCalculated, driverLocation, exactPickup, exactDrop }: MapTrackingProps) => {
  const [pickupCoords, setPickupCoords] = useState<L.LatLngTuple | null>(null)
  const [dropCoords, setDropCoords] = useState<L.LatLngTuple | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<L.LatLngTuple[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchRouteData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Helper function for resilient geocoding
        const geocodeAddress = async (address: string) => {
          const headers = { 'User-Agent': 'RideFlowApp/1.0' }
          let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, { headers })
          if (!res.ok) return null
          let data = await res.json()
          if (data && data.length > 0) return data

          // Fallback: if address is too specific (e.g. B-14, Kalyani City...), Nominatim fails.
          // Let's strip the first part and try again.
          const parts = address.split(',')
          if (parts.length > 2) {
            // Try with just the last 3 parts (usually City, State, Country)
            const fallbackAddress = parts.slice(-3).join(',')
            res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&limit=1`, { headers })
            if (res.ok) {
              data = await res.json()
              if (data && data.length > 0) return data
            }
            
            // Try with just the last 2 parts
            const finalFallback = parts.slice(-2).join(',')
            res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalFallback)}&limit=1`, { headers })
            if (res.ok) {
              data = await res.json()
              if (data && data.length > 0) return data
            }
          }
          return null
        }

        // 1. Get Pickup
        let pLat = exactPickup?.lat
        let pLon = exactPickup?.lng
        if (!pLat || !pLon) {
          const pickupData = await geocodeAddress(pickupAddress)
          if (!pickupData) throw new Error("Could not find coordinates for pickup address.")
          pLat = parseFloat(pickupData[0].lat)
          pLon = parseFloat(pickupData[0].lon)
        }

        // 2. Get Drop
        let dLat = exactDrop?.lat
        let dLon = exactDrop?.lng
        if (!dLat || !dLon) {
          const dropData = await geocodeAddress(dropAddress)
          if (!dropData) throw new Error("Could not find coordinates for drop address.")
          dLat = parseFloat(dropData[0].lat)
          dLon = parseFloat(dropData[0].lon)
        }

        if (!isMounted) return

        setPickupCoords([pLat, pLon])
        setDropCoords([dLat, dLon])

        // 3. Fetch Route from OSRM
        // Note: OSRM uses longitude,latitude order!
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pLon},${pLat};${dLon},${dLat}?overview=full&geometries=geojson`
        const routeRes = await fetch(osrmUrl)
        const routeData = await routeRes.json()

        if (routeData.code !== 'Ok' || !routeData.routes.length) {
          throw new Error("Could not calculate a route between these locations.")
        }

        const route = routeData.routes[0]
        
        // Convert GeoJSON coordinates [lon, lat] back to Leaflet [lat, lon]
        const polylineCoords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as L.LatLngTuple)
        setRouteCoordinates(polylineCoords)

        // Calculate friendly strings
        const distanceKm = (route.distance / 1000).toFixed(1) + " km"
        const durationMins = Math.round(route.duration / 60) + " mins"

        if (onRouteCalculated) {
          onRouteCalculated(distanceKm, durationMins)
        }

      } catch (err: any) {
        console.error("Map Data Fetch Error:", err)
        if (isMounted) setError(err.message || "Failed to load map data")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (pickupAddress && dropAddress) {
      fetchRouteData()
    }

    return () => {
      isMounted = false
    }
  }, [pickupAddress, dropAddress])

  if (loading) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-[#1a1a1a] rounded-2xl border border-white/10">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400 font-medium">Calculating optimal route...</p>
      </div>
    )
  }

  if (error || !pickupCoords || !dropCoords) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 text-center">
        <p className="text-red-400 font-bold mb-2">Map Error</p>
        <p className="text-gray-400 text-sm">{error || "Failed to load map"}</p>
      </div>
    )
  }

  // Calculate bounds to fit both points, the route, and the driver
  const points = [pickupCoords, dropCoords]
  if (driverLocation) {
    points.push([driverLocation.lat, driverLocation.lng] as L.LatLngTuple)
  }
  const bounds = L.latLngBounds(points)

  return (
    <div className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-white/10 relative z-0">
      <MapContainer 
        bounds={bounds}
        zoomControl={false}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={pickupCoords} icon={customIcon} />
        <Marker position={dropCoords} icon={customIcon} />
        
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon} />
        )}
        
        {routeCoordinates.length > 0 && (
          <Polyline 
            positions={routeCoordinates} 
            color="#3b82f6" 
            weight={5} 
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
            dashArray="10, 10" // Make it a dashed line to look cooler
          />
        )}

        <MapFitter bounds={bounds} />
      </MapContainer>
    </div>
  )
}

export default MapTracking
