import { useState, useEffect } from 'react';
import { useAuth } from '@/AuthContext';

const VITE_API_URL = "https://broadcastr.onrender.com";

export function useFollow(targetUsername: string) {
  const { userDetails } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state when user changes
    setIsFollowing(false);
    setLoading(true);

    if (!userDetails || !targetUsername) {
      setLoading(false);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        const response = await fetch(
          `${VITE_API_URL}/api/user/following?user=${userDetails.profile}`
        );
        if (!response.ok) throw new Error('Failed to fetch following status');
        
        const data = await response.json();
        setIsFollowing(data.following.some((f: any) => f.following === targetUsername));
      } catch (error) {
        console.error('Error checking follow status:', error);
        setIsFollowing(false);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [userDetails, targetUsername]);

  const followUser = async () => {
    if (!userDetails || !targetUsername) return;
    
    try {
      const response = await fetch(
        `${VITE_API_URL}/api/user/follow?follower=${userDetails.profile}&followee=${targetUsername}`,
        { method: 'POST' }
      );
      
      if (!response.ok) throw new Error('Failed to follow user');
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async () => {
    if (!userDetails || !targetUsername) return;
    
    try {
      const response = await fetch(
        `${VITE_API_URL}/api/user/unfollow?follower=${userDetails.profile}&followee=${targetUsername}`,
        { method: 'POST' }
      );
      
      if (!response.ok) throw new Error('Failed to unfollow user');
      setIsFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  return {
    isFollowing,
    followUser,
    unfollowUser,
    loading
  };
} 