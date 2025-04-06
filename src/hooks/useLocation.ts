import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const useLocation = (options: LocationOptions = {}) => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        // Try multiple location services in sequence
        await tryGeolocationServices(isMounted);
      } catch (error) {
        if (isMounted) {
          setLocation(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get location',
          }));
        }
      }
    };

    const tryGeolocationServices = async (isMounted: boolean) => {
      // First try: High accuracy GPS
      try {
        const position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        });

        if (isMounted) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
          });
          return;
        }
      } catch (error) {
        console.log('High accuracy location failed, trying low accuracy...');
      }

      // Second try: Low accuracy
      try {
        const position = await getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
          ...options,
        });

        if (isMounted) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
          });
          return;
        }
      } catch (error) {
        console.log('Low accuracy location failed, trying alternative services...');
      }

      // Third try: OpenStreetMap Nominatim (IP-based)
      try {
        const response = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=me', {
          headers: {
            'User-Agent': 'PickleballCourts/1.0'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch location from OpenStreetMap');
        
        const data = await response.json();
        if (data && data[0]) {
          if (isMounted) {
            setLocation({
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon),
              accuracy: 5000, // Approximate accuracy for IP-based location
              loading: false,
              error: null,
            });
            return;
          }
        }
      } catch (error) {
        console.log('OpenStreetMap location failed, trying next service...');
      }

      // Fourth try: Abstract API (IP-based, free tier)
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch location from IP API');
        
        const data = await response.json();
        if (data && data.latitude && data.longitude) {
          if (isMounted) {
            setLocation({
              latitude: data.latitude,
              longitude: data.longitude,
              accuracy: 5000, // Approximate accuracy for IP-based location
              loading: false,
              error: null,
            });
            return;
          }
        }
      } catch (error) {
        console.log('IP API location failed');
        throw new Error('Unable to determine your location. Please check your internet connection and try again.');
      }
    };

    const getCurrentPosition = (positionOptions: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, positionOptions);
      });
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  return location;
};

export default useLocation; 