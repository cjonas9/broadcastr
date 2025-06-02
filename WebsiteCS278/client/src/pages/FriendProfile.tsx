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
const isDevelopment = process.env.NODE_ENV === 'development';

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

// Development fallback profile
const dummyProfile: UserProfile = {
  id: 999,
  profile: "dummyuser",
  firstname: "Dummy",
  lastname: "User",
  email: "dummy@example.com",
  profileurl: "",
  bootstrapped: 0,
  admin: 0,
  lastlogin: new Date().toISOString(),
  pfpsm: "https://via.placeholder.com/40",
  pfpmed: "https://via.placeholder.com/100",
  pfplg: "https://via.placeholder.com/200",
  pfpxl: "https://via.placeholder.com/400",
  swag: 100
};

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

	  if (username === userDetails?.profile) {
		setLocation("/profile");
		return;
	  }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${VITE_API_URL}/api/user/profile?user=${encodeURIComponent(username)}`
        );
        
        if (!response.ok) {
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText
          });
          
          // In development, use dummy profile instead of showing error
          if (isDevelopment) {
            console.log('Using dummy profile for development');
            setFriendProfile({
              ...dummyProfile,
              profile: username
            });
            return;
          }
          
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Profile data:', data); // Debug log
        
        if (data.userProfile && data.userProfile.length > 0) {
          setFriendProfile(data.userProfile[0]);
        } else {
          // In development, use dummy profile for non-existent users
          if (isDevelopment) {
            console.log('Using dummy profile for non-existent user');
            setFriendProfile({
              ...dummyProfile,
              profile: username
            });
          } else {
            setError('User not found');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // In development, use dummy profile on error
        if (isDevelopment) {
          console.log('Using dummy profile after error');
          setFriendProfile({
            ...dummyProfile,
            profile: username
          });
        } else {
          setError(error instanceof Error ? error.message : 'Failed to load profile');
        }
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
          "https://via.placeholder.com/100"
        }
        swag={friendProfile.swag}
        showActions={true}
        onMessageClick={() => setLocation(`/dm/${friendProfile.profile}`)}
      />

      <div className="flex justify-center gap-4 my-4">
        {userDetails && userDetails.profile !== friendProfile.profile && (
          <ButtonWrapper
            width="hug"
            variant={isFollowing ? "secondary" : "primary"}
            onClick={handleFollowClick}
            className={isFollowing ? "!hover:bg-red-600" : ""}
            disabled={followLoading}
          >
            {followLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
          </ButtonWrapper>
        )}
      </div>

      <main className="max-w-md mx-auto px-4 pb-16">
        {friendProfile && <TopBroadcastedTracks username={friendProfile.profile} />}
        {friendProfile && <TopArtists username={friendProfile.profile} />}
      </main>
    </div>
  );
}
