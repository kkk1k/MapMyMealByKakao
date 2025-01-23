import { useCallback, useEffect, useRef } from "react";

interface LocationType {
  latitude: number;
  longitude: number;
}

interface UseKakaoMapProps {
  location: LocationType;
  isScriptLoaded: boolean;
}

const useKakaoMap = ({ location, isScriptLoaded }: UseKakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);

  const getLatLng = useCallback((lat: number, lng: number) => {
    return new window.kakao.maps.LatLng(lat, lng);
  }, []);

  const addMarker = useCallback((latLng: kakao.maps.LatLng) => {
    if (!mapInstance.current) return;

    const marker = new window.kakao.maps.Marker({
      position: latLng,
    });
    marker.setMap(mapInstance.current);
  }, []);

  const initMap = useCallback(() => {
    if (!location || !isScriptLoaded || !mapRef.current) return;

    const { latitude, longitude } = location;
    const initialLatLng = getLatLng(latitude, longitude);
    const options = {
      center: initialLatLng,
      level: 3,
    };

    mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
    addMarker(initialLatLng);
  }, [location, isScriptLoaded, getLatLng, addMarker]);

  const moveToCurrentLocation = useCallback(() => {
    if (!location || !isScriptLoaded || !mapInstance.current) return;
    const { latitude, longitude } = location;
    const position = getLatLng(latitude, longitude);
    mapInstance.current.panTo(position);
  }, [location, isScriptLoaded, getLatLng]);

  useEffect(() => {
    if (isScriptLoaded && location) {
      initMap();
    }
  }, [isScriptLoaded, location, initMap]);

  return { mapRef, moveToCurrentLocation, getLatLng };
};

export default useKakaoMap;
