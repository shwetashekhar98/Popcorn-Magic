import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites",
};

export default function FavoritesPage() {
  redirect("/profile");
}
