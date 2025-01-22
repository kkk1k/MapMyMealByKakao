"use client";

import Script from "next/script";
import React, { useEffect, useRef, useState } from "react";

// Promise를 반환하는 위치 정보 가져오기 함수
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
  const mapInstance = useRef<any>(null); // 지도 인스턴스 저장
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // Script 로드 상태

  // 지도 초기화 함수
  const initMap = (lat: number, lon: number) => {
    if (!mapRef.current || !isScriptLoaded) return;

    const initialLatLng = new window.kakao.maps.LatLng(lat, lon);
    const options = {
      center: initialLatLng,
      level: 3,
    };

    // 지도 생성 후 인스턴스를 저장합니다.
    mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
  };

  // 현재 위치로 지도 중심을 이동시키는 함수
  const moveToCurrentLocation = async () => {
    try {
      const [lat, lon] = await getCurrentLocation();
      const locPosition = new window.kakao.maps.LatLng(lat, lon);
      mapInstance.current?.panTo(locPosition);
    } catch (error) {
      console.error("위치 정보를 가져올 수 없습니다:", error);
    }
  };

  // Script가 로드된 후 현재 위치로 지도 초기화
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
      {/* Kakao Maps Script */}
      <Script
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${process.env.NEXT_PUBLIC_KAKAO_KEY}`}
        strategy="afterInteractive"
        onLoad={() => {
          window.kakao.maps.load(() => {
            setIsScriptLoaded(true); // Script 로드 완료
          });
        }}
      />
      <div id="map" ref={mapRef} className="w-96 h-96"></div>

      {/* 내 위치로 이동하는 버튼 */}
      <button onClick={moveToCurrentLocation}>내 위치로 이동</button>
    </div>
  );
}
