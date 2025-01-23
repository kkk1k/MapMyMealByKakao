"use client";

import Script from "next/script";
import React, { useEffect, useRef, useState } from "react";

interface Result {
  distance: string;
  place_name: string;
  place_url: string;
}

// Promise를 반환하는 현재 위치 정보 가져오기 함수
const getCurrentLocation = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저에서는 Geolocation을 지원하지 않습니다."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        resolve([lat, lon]);
      },
      (err) => {
        reject(err);
      }
    );
  });
};

export default function KakaoMapWithCurrentLocation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [restaurants, setRestaurants] = useState<Result[]>([]);
  console.log(mapInstance);

  // 지도 초기화 함수
  const initMap = (lat: number, lon: number) => {
    if (!mapRef.current || !isScriptLoaded) return;

    const initialLatLng = new window.kakao.maps.LatLng(lat, lon);
    const options = {
      center: initialLatLng,
      level: 3,
    };

    mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);

    // 지도 초기화 후 주변 식당 검색
    searchRestaurants(lat, lon);
  };

  // 주변 식당 검색 함수 (카테고리 "FD6": 음식점)
  const searchRestaurants = (lat: number, lon: number) => {
    // Places 서비스 객체 생성
    const ps = new window.kakao.maps.services.Places();

    // 현재 위치를 기준으로 반경 1000m 내의 식당 정보를 검색
    // 카테고리 코드 "FD6"는 음식점에 해당합니다.
    ps.categorySearch("FD6", placesCallback, {
      location: new window.kakao.maps.LatLng(lat, lon),
      radius: 1000,
      sort: "distance",
    });
  };

  const selectRandomRestaurants = (
    results: Result[],
    count: number
  ): Result[] => {
    if (results.length <= count) return results;
    const indices = new Set<number>();
    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * results.length));
    }
    return Array.from(indices).map((i) => results[i]);
  };

  function placesCallback(result: Result[], status: string) {
    if (status === window.kakao.maps.services.Status.OK) {
      setRestaurants(selectRandomRestaurants(result, 5));
    } else {
      console.error("식당 검색에 실패했습니다: ", status);
    }
  }

  // 그리고 호출할 때:
  // "내 위치로 이동" 버튼 클릭 시 현재 위치로 지도의 중심 이동 및 식당 검색 재수행
  const moveToCurrentLocation = async () => {
    try {
      const [lat, lon] = await getCurrentLocation();
      const locPosition = new window.kakao.maps.LatLng(lat, lon);
      mapInstance.current?.panTo(locPosition);
      // 새로운 위치 기준으로 식당 검색
      searchRestaurants(lat, lon);
    } catch (error) {
      console.error("위치 정보를 가져올 수 없습니다:", error);
    }
  };

  // 컴포넌트 최초 렌더링 후 스크립트가 로드되면 현재 위치 정보로 지도 초기화
  useEffect(() => {
    if (!isScriptLoaded) return;

    (async () => {
      try {
        const [lat, lon] = await getCurrentLocation();
        initMap(lat, lon);
      } catch (error) {
        console.error("위치 정보를 가져올 수 없습니다:", error);
      }
    })();
  }, [isScriptLoaded]);

  return (
    <div>
      <Script
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${process.env.NEXT_PUBLIC_KAKAO_KEY}&libraries=services`}
        strategy="afterInteractive"
        onLoad={() => {
          window.kakao.maps.load(() => {
            setIsScriptLoaded(true); // SDK 로드 완료 후 상태 업데이트
          });
        }}
      />
      <div id="map" ref={mapRef} className="w-96 h-96"></div>
      <button onClick={moveToCurrentLocation}>새로고침</button>
      <div>
        <h2>추천 식당</h2>
        <ul>
          {restaurants.map((restaurant, index) => (
            <li key={index}>
              <strong>{restaurant.place_name}</strong> - {restaurant.distance}m
              {
                <div>
                  <a href={restaurant.place_url} target="_blank">
                    {restaurant.place_url}
                  </a>
                </div>
              }
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
