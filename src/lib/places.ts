interface NearbyPlace {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  distance: number;
}

export async function findNearbyCourts(
  latitude: number,
  longitude: number,
  radius: number = 50000 // 50km default radius
): Promise<NearbyPlace[]> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${latitude},${longitude}&` +
      `radius=${radius}&` +
      `keyword=pickleball+court&` +
      `type=park|gym|sports_complex&` +
      `key=${import.meta.env.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch nearby courts');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      if (data.status === 'ZERO_RESULTS') {
        return [];
      }
      throw new Error(`Places API error: ${data.status}`);
    }

    // Calculate distance and format results
    return data.results.map((place: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      return {
        id: place.place_id,
        name: place.name,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        address: place.vicinity,
        distance: distance
      };
    }).sort((a: NearbyPlace, b: NearbyPlace) => a.distance - b.distance);
  } catch (error) {
    console.error('Error finding nearby courts:', error);
    throw error;
  }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 