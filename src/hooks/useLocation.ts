import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
}

const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    city: null,
    state: null,
    country: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Get user's coordinates
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        // Use Google's Geocoding API to get location details
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.GOOGLE_MAPS_API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location details');
        }

        const data = await response.json();

        if (data.status !== 'OK') {
          throw new Error('Geocoding API error');
        }

        // Extract city, state, and country from address components
        let city = null;
        let state = null;
        let country = null;

        data.results[0].address_components.forEach((component: any) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        });

        setLocation({
          latitude,
          longitude,
          city,
          state,
          country,
          loading: false,
          error: null,
        });
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get location',
        }));
      }
    };

    getLocation();
  }, []);

  return location;
};

export default useLocation; 