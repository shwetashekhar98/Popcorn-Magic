import type { Metadata } from "next";
import { ProfileTabs } from "@/components/profile-tabs";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <ProfileTabs />
    </div>
  );
}
