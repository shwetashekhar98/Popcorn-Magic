import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites-list";

export const metadata: Metadata = {
  title: "My Favorites",
};

export default function FavoritesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      <FavoritesList />
    </div>
  );
}
