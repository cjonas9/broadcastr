import ProfileHeader from "@/components/ProfileHeader";
import { musicData } from "@/data/musicData";
import TopArtists from "@/components/TopArtists";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useLocation } from "wouter";
import TopTrackPost from "@/components/TopTrackPost";
import { useEffect, useState } from "react";
import { useAuth } from "@/AuthContext";

type UserProfile = {
	id: number;
	profile: string;
	firstname: string;
	lastname: string;
	email: string;
	profileurl: string;
	bootstrapped: number;
	admin: number;
	lastlogin: string;
	pfpsm: string;
	pfpmed: string;
	pfplg: string;
	pfpxl: string;
	swag: number;
  };

const VITE_API_URL="https://broadcastr.onrender.com"

export default function Profile() {
  const [, setLocation] = useLocation();
  const { username } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!username) return;

      try {
        const res = await fetch(
          `${VITE_API_URL}/api/user/profile?user=${encodeURIComponent(username)}`
        );
        if (!res.ok) throw new Error("Failed to fetch user profile");

        const data = await res.json();
        setUser(data.userProfile[0]);            // assuming exactly one item
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }

    fetchUserProfile();
  }, [username]);

  return (
    <div className="bg-gray-900 min-h-screen">
      <BottomToolbar />

      {user ? (
        <ProfileHeader
          username={user.profile}
          profileImage={user.pfpmed || user.pfpsm || user.pfpxl}
          swag={user.swag}
        />
      ) : (
        <p className="text-white text-center pt-4">Loading profile...</p>
      )}

      <main className="max-w-md mx-auto px-4 pb-16">
        <ButtonWrapper  
          width="full"
          className="mb-4"
          onClick={() => setLocation("/login")}
        >  
          Log in Page
        </ButtonWrapper>

        {/* Top Broadcasted Tracks Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-white">Top Broadcasted Tracks</h2>
          <p className="text-sm text-gray-400 mb-4">
            Tracks you broadcasted that were most liked by other broadcastrs
          </p>
          <TopTrackPost
            track={{
              id: musicData.mockSongs[0].id,
              title: musicData.mockSongs[0].title,
              artist: musicData.mockSongs[0].artist,
              albumArt: musicData.mockSongs[0].albumArt,
              trackLink: musicData.mockSongs[0].trackLink
            }}
            likes={16}
          />

          <div className="mt-4">
            <button className="w-full bg-purple-600 text-white py-2 rounded-md text-center text-sm font-semibold">
              Explore All
            </button>
          </div>
        </section>

        <TopArtists />
      </main>
    </div>
  );
}
