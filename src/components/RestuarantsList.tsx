// components/RestaurantList.tsx
import React from "react";

interface Result {
  id: string;
  distance: string;
  place_name: string;
  place_url: string;
}

interface RestaurantListProps {
  restaurants: Result[];
}

const RestaurantList = ({ restaurants }: RestaurantListProps) => {
  return (
    <div>
      <h2>주변 식당 ({restaurants.length}개)</h2>
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <p>
              <a
                href={restaurant.place_url}
                target="_blank"
              >
                {restaurant.place_name}
              </a>{" "}
              ({restaurant.distance}m)
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantList;
