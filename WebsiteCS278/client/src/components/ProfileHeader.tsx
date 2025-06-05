import { LightningBoltIcon } from "@/lib/icons";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config";
import { ButtonWrapper } from "./ButtonWrapper";

type ProfileHeaderProps = {
  username: string;
  profileImage: string;
  swag: number;
  showActions?: boolean;
  onMessageClick?: () => void;
  refreshKey?: number;
};

export default function ProfileHeader({ username, profileImage, swag, showActions = false, onMessageClick, refreshKey = 0 }: ProfileHeaderProps) {
  const [, setLocation] = useLocation();
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch followers count
        const followersRes = await fetch(
          `${API_CONFIG.baseUrl}/api/user/followers?user=${cleanUsername}`
        );
        const followersData = await followersRes.json();
        setFollowerCount(followersData.followers.length);

        // Fetch following count
        const followingRes = await fetch(
          `${API_CONFIG.baseUrl}/api/user/following?user=${cleanUsername}`
        );
        const followingData = await followingRes.json();
        setFollowingCount(followingData.following.length);
      } catch (err) {
        console.error("Error fetching follow counts:", err);
      }
    };

    fetchCounts();
  }, [cleanUsername, refreshKey]);

  return (
    <header className="flex flex-col items-center pt-4 pb-4">
      <div className="w-28 h-28 rounded-full bg-gray-800 overflow-hidden mb-3 border-2 border-[#7C3AED]">
        <img 
          src={profileImage}
          alt={`${username} profile`} 
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-xl font-bold text-white">{username}</h1>
      
      <div className="flex items-center mt-3 px-4 py-2 bg-[#7C3AED] rounded-full">
        <LightningBoltIcon className="h-5 w-5 mr-1 text-yellow-300" />
        <span className="text-white font-medium">{swag} Swag</span>
      </div>

      {/* Follower/Following Stats */}
      <div className="flex gap-8 mt-4 text-center">
        <div 
          className="cursor-pointer hover:opacity-80 transition"
          onClick={() => setLocation(`/followers/${cleanUsername}`)}
        >
          <div className="text-white font-bold">{followerCount}</div>
          <div className="text-gray-400 text-sm">Followers</div>
        </div>
        <div 
          className="cursor-pointer hover:opacity-80 transition"
          onClick={() => setLocation(`/following/${cleanUsername}`)}
        >
          <div className="text-white font-bold">{followingCount}</div>
          <div className="text-gray-400 text-sm">Following</div>
        </div>
      </div>
    </header>
  );
}
