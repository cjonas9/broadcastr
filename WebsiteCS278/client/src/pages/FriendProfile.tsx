// Placeholder page for a user's profile page that is not yet a friend
import { useRoute, useLocation } from "wouter";
import { musicData } from "@/data/musicData";
import ProfileHeader from "@/components/ProfileHeader";
import TopArtists from "@/components/TopArtists";
import ExplorationZones from "@/components/ExplorationZones"; // optional
import DropDownMenu from "@/components/DropDownMenu";
import TopTrackPost from "@/components/TopTrackPost";
import { useState, useEffect } from "react";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useAuth } from "@/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import TopBroadcastedTracks from "@/components/TopBroadcastedTracks";

const VITE_API_URL = "https://broadcastr.onrender.com";

interface UserProfile {
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
}

export default function FriendProfile() {
  const [, params] = useRoute<{ username: string }>("/profile/:username");
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [friendProfile, setFriendProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const username = params?.username || "";
  const { isFollowing, followUser, unfollowUser, loading: followLoading } = useFollow(username);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${VITE_API_URL}/api/user/profile?user=${encodeURIComponent(username)}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        if (data.userProfile && data.userProfile.length > 0) {
          setFriendProfile(data.userProfile[0]);
        } else {
          setError('User not found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await unfollowUser();
      } else {
        await followUser();
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  if (loading || followLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !friendProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg mb-4">{error || 'User not found'}</p>
        <div
          className="text-purple-400 hover:text-purple-300 cursor-pointer"
          onClick={() => setLocation("/friends")}
        >
          Back to Friends
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <BottomToolbar />
      
      <ProfileHeader
        username={"@" + friendProfile.profile}
        profileImage={
          friendProfile.pfpmed ||
          friendProfile.pfpsm ||
          friendProfile.pfpxl ||
          ""
        }
        swag={friendProfile.swag}
      />

      <div className="flex justify-center gap-4 my-4">
        <ButtonWrapper
          width="hug"
          variant={isFollowing ? "secondary" : "primary"}
          onClick={handleFollowClick}
          className={isFollowing ? "!hover:bg-red-600" : ""}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </ButtonWrapper>

        <ButtonWrapper
          width="hug"
          variant="secondary"
          onClick={() => setLocation(`/dm/${friendProfile.id}`)}
        >
          Message
        </ButtonWrapper>
      </div>

      <main className="max-w-md mx-auto px-4 pb-16">
        {friendProfile && <TopBroadcastedTracks username={friendProfile.profile} />}
        {friendProfile && <TopArtists username={friendProfile.profile} />}
      </main>
    </div>
  );
}
