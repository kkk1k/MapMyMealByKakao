// hooks/useGeolocation.ts
import { useEffect, useState } from "react";

interface LocationType {
  latitude: number;
  longitude: number;
}

const defaultLocation: LocationType = {
  latitude: 37.5665, // 서울시 위도
  longitude: 126.978, // 서울시 경도
};

const useGeolocation = () => {
  const [location, setLocation] = useState<LocationType | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation을 지원하지 않습니다.");
      setError("Geolocation을 지원하지 않습니다.");
      setLocation(defaultLocation);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          console.log("현재 위치:", latitude, longitude);
        },
        (error) => {
          console.error("위치 정보를 가져오는 데 실패했습니다:", error);
          setError("위치 정보를 가져오는 데 실패했습니다.");
          setLocation(defaultLocation); // 에러 시 기본 위치 설정
        }
      );
    }
  }, []);

  return { location, error };
};

export default useGeolocation;
