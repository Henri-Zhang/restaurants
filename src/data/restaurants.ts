import restaurantsData from "./restaurants.json";

export interface RestaurantDemo {
  slug: string;
  name: string;
  tag: string;
  description: string;
  meta: string[];
  /** Gradient used for the thumbnail placeholder. */
  gradient: string;
  emoji: string;
}

export const restaurants: RestaurantDemo[] = restaurantsData;
