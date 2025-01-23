"use client";

import RestaurantList from "@/components/RestuarantsList";
import useGeolocation from "@/hooks/useGeolocation";
import useKakaoMap from "@/hooks/useKakaoMap";
import Script from "next/script";
import React, { useCallback, useState } from "react";

interface Result {
  id: string;
  distance: string;
  place_name: string;
  place_url: string;
}

function My() {
  const { location, error: geoError } = useGeolocation();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Result[]>([]);

  const { mapRef, moveToCurrentLocation, getLatLng } = useKakaoMap({
    location: location!,
    isScriptLoaded,
  });

  const fetchRestaurants = useCallback(
    (page: number): Promise<{ results: Result[]; hasNextPage: boolean }> => {
      return new Promise((resolve, reject) => {
        if (!location || !isScriptLoaded) {
          reject("Location or script not loaded");
          return;
        }

        const { latitude, longitude } = location;
        const ps = new window.kakao.maps.services.Places();

        ps.categorySearch(
          "FD6",
          (data: Result[], status: string, pagination: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const mappedData: Result[] = data.map((item: Result) => ({
                id: item.id,
                distance: item.distance,
                place_name: item.place_name,
                place_url: item.place_url,
              }));
              resolve({
                results: mappedData,
                hasNextPage: pagination.hasNextPage,
              });
            } else {
              reject(status);
            }
          },
          {
            location: getLatLng(latitude, longitude),
            radius: 1000,
            sort: "distance",
            page: page,
          }
        );
      });
    },
    [location, isScriptLoaded, getLatLng]
  );

  const loadMultiplePages = useCallback(
    async (totalPages: number, selectionCount: number = 45) => {
      setIsLoading(true);
      setError(null);
      const allResults: Result[] = [];

      try {
        for (let page = 1; page <= totalPages; page++) {
          const { results, hasNextPage } = await fetchRestaurants(page);
          allResults.push(...results);
          if (!hasNextPage) {
            break;
          }
        }

        const selectedRestaurants = selectRandomItems(
          allResults,
          selectionCount
        );
        setRestaurants(selectedRestaurants);
      } catch (err) {
        console.error("식당 검색에 실패했습니다:", err);
        setError("식당 검색에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRestaurants]
  );

  const searchRestaurants = () => {
    if (!location || !isScriptLoaded || isLoading) return;
    loadMultiplePages(3, 5); // 최대 3페이지, 45개 추천
  };

  const selectRandomItems = <T,>(items: T[], count: number): T[] => {
    if (items.length <= count) return items;

    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  };

  return (
    <>
      <Script
        type="text/javascript"
        src={`//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${process.env.NEXT_PUBLIC_KAKAO_KEY}&libraries=services`}
        strategy="afterInteractive"
        onLoad={() => {
          window.kakao.maps.load(() => {
            setIsScriptLoaded(true);
          });
        }}
      />
      <div
        ref={mapRef}
        id="map"
        style={{ width: "500px", height: "500px", marginTop: "1rem" }}
      ></div>
      <button onClick={moveToCurrentLocation}>새로고침</button>
      <button onClick={searchRestaurants}>
        {!restaurants.length ? "식당추천받기" : "재추천"}
      </button>
      <RestaurantList restaurants={restaurants} />
    </>
  );
}

export default My;
