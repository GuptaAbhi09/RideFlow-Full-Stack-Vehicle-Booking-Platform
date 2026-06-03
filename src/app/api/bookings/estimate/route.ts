import { NextResponse } from "next/server";
import { auth } from "@/auth";

const VEHICLE_RATES = {
  "Bike": { base: 20, perKm: 8 },
  "Auto": { base: 30, perKm: 12 },
  "Car": { base: 50, perKm: 18 },
  "SUV": { base: 70, perKm: 25 },
  "Loader": { base: 100, perKm: 30 },
  "Bus": { base: 500, perKm: 100 },
  "Truck": { base: 400, perKm: 80 }
} as const;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pickup, drop, vehicleType, pickupLat, pickupLng, dropLat, dropLng } = await req.json();

    if (!pickup || !drop || !vehicleType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const geocodeAddress = async (address: string) => {
      const headers = { 'User-Agent': 'RideFlowApp/1.0' };
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, { headers });
      
      if (!res.ok) return null;
      let data = await res.json();
      if (data && data.length > 0) return data[0];

      const parts = address.split(',');
      if (parts.length > 2) {
        const fallbackAddress = parts.slice(-3).join(',');
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackAddress)}&limit=1`, { headers });
        if (res.ok) {
          data = await res.json();
          if (data && data.length > 0) return data[0];
        }
        
        const finalFallback = parts.slice(-2).join(',');
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalFallback)}&limit=1`, { headers });
        if (res.ok) {
          data = await res.json();
          if (data && data.length > 0) return data[0];
        }
      }
      return null;
    };

    let pLat = pickupLat;
    let pLon = pickupLng;
    let dLat = dropLat;
    let dLon = dropLng;

    // Only geocode if we didn't receive exact coordinates from MapPicker
    if (!pLat || !pLon) {
      const pickupData = await geocodeAddress(pickup);
      if (!pickupData) {
        return NextResponse.json({ error: "Could not find exact coordinates for Pickup. Please try a broader location." }, { status: 400 });
      }
      pLat = parseFloat(pickupData.lat);
      pLon = parseFloat(pickupData.lon);
    }

    if (!dLat || !dLon) {
      const dropData = await geocodeAddress(drop);
      if (!dropData) {
        return NextResponse.json({ error: "Could not find exact coordinates for Dropoff. Please try a broader location." }, { status: 400 });
      }
      dLat = parseFloat(dropData.lat);
      dLon = parseFloat(dropData.lon);
    }

    // 2. Fetch Route from OSRM
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pLon},${pLat};${dLon},${dLat}?overview=false`;
    const routeRes = await fetch(osrmUrl);
    const routeData = await routeRes.json();

    if (routeData.code !== 'Ok' || !routeData.routes.length) {
      return NextResponse.json({ error: "Could not calculate a route between these locations." }, { status: 400 });
    }

    const route = routeData.routes[0];
    const distanceKm = route.distance / 1000;
    const durationMins = Math.round(route.duration / 60);

    // 3. Calculate Fare
    const rates = VEHICLE_RATES[vehicleType as keyof typeof VEHICLE_RATES] || VEHICLE_RATES["Car"];
    const calculatedFare = Math.round(rates.base + (distanceKm * rates.perKm));

    return NextResponse.json({
      success: true,
      fare: calculatedFare,
      distanceKm: distanceKm.toFixed(1),
      durationMins,
      pickupLat: pLat,
      pickupLng: pLon,
      dropLat: dLat,
      dropLng: dLon
    });

  } catch (error: any) {
    console.error("Fare Estimation Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
