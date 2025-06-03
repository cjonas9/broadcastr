/* 
FeedPost.tsx: Component for displaying an individual post in the feed
---------------------------------------------------------
EXAMPLE USAGE:
<FeedPost
  avatarUrl="/avatars/daniel123.jpg"
  username="daniel123"
  content="reached top 5 and received +5 swag"
  type="activity-link"
  linkText="Beyonce's weekly top listeners"
  linkHref="/beyonce/top-listeners"
  likes={16}

TODO:
- Like button needs to be made interactable
- need to be compatible with real backend data
/>

*/

import React, { useEffect, useState, useCallback } from "react";
import { Heart, Trash2 } from "lucide-react";
import SongCard, { Song } from "./SongCard";
import { useAuth } from "@/AuthContext";
import { API_CONFIG } from "@/config";

type FeedPostProps = {
  id: number;
  user: {
    id: number,
    username: string,
    swag: number,
    profileImage: string,
  },
  timeAgo: string;
  content: string;
  type: "activity" | "activity-link" | "track";
  linkText?: string;
  linkHref?: string;
  track?: Song;
  likes: number;
  onDelete?: () => void;
};

export const FeedPost: React.FC<FeedPostProps> = ({
  id,
  user,
  timeAgo,
  content,
  type,
  linkText,
  linkHref,
  track,
  likes: initialLikes,
  onDelete,
}) => {
  const { userDetails } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  // Check if the user has liked this broadcast
  const checkLikeStatus = useCallback(async () => {
    if (!userDetails?.profile) return;

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/get-likes?user=${userDetails.profile}&relatedtype=Broadcast&relatedid=${id}`
      );
      if (!response.ok) throw new Error('Failed to fetch like status');
      
      const data = await response.json();
      setIsLiked(data.hasLiked);
      setLikes(data.totalLikes); // Update likes count from server
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }, [id, userDetails]);

  // Check like status on mount and when user changes
  useEffect(() => {
    checkLikeStatus();
  }, [checkLikeStatus]);

  // Listen for visibility changes to recheck like status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLikeStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkLikeStatus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkLikeStatus);
    };
  }, [checkLikeStatus]);

  // Listen for like/unlike events from other components
  useEffect(() => {
    const handleBroadcastLiked = (event: CustomEvent) => {
      if (event.detail.broadcastId === id) {
        checkLikeStatus(); // Recheck status and count from server
      }
    };

    const handleBroadcastUnliked = (event: CustomEvent) => {
      if (event.detail.broadcastId === id) {
        checkLikeStatus(); // Recheck status and count from server
      }
    };

    window.addEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
    window.addEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);

    return () => {
      window.removeEventListener('broadcastLiked', handleBroadcastLiked as EventListener);
      window.removeEventListener('broadcastUnliked', handleBroadcastUnliked as EventListener);
    };
  }, [id, checkLikeStatus]);

  const handleDelete = async () => {
    if (!userDetails) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/delete-broadcast?id=${id}`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete broadcast');
      }

      onDelete?.();
    } catch (error) {
      console.error('Error deleting broadcast:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!userDetails?.profile || isLiking || isLiked) return;

    try {
      setIsLiking(true);
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/create-like?user=${userDetails.profile}&relatedtype=Broadcast&relatedid=${id}`,
        { method: 'POST' }
      );

      const data = await response.json();
      
      if (response.status === 409 || data.success === 0) {
        // Like already exists, just update the UI state
        setIsLiked(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to like broadcast');
      }

      if (data.success) {
        setIsLiked(true);
        setLikes(prev => prev + 1);
        // Dispatch event after successful server response
        window.dispatchEvent(new CustomEvent('broadcastLiked', {
          detail: { broadcastId: id }
        }));
      } else {
        throw new Error('Server returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error liking broadcast:', error);
      // Revert optimistic updates and recheck status
      await checkLikeStatus();
    } finally {
      setIsLiking(false);
    }
  };

  const handleUnlike = async () => {
    if (!userDetails?.profile || isLiking || !isLiked) return;

    try {
      setIsLiking(true);
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/undo-like?user=${userDetails.profile}&relatedtype=Broadcast&relatedid=${id}`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (response.status === 404) {
        // Like doesn't exist, just update the UI state
        setIsLiked(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlike broadcast');
      }

      if (data.success) {
        setIsLiked(false);
        setLikes(prev => prev - 1);
        // Dispatch event after successful server response
        window.dispatchEvent(new CustomEvent('broadcastUnliked', {
          detail: { broadcastId: id }
        }));
      } else {
        throw new Error('Server returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error unliking broadcast:', error);
      // Revert optimistic updates and recheck status
      await checkLikeStatus();
    } finally {
      setIsLiking(false);
    }
  };

  const canDelete = userDetails?.admin === 1 || userDetails?.profile === user.username;

  return (
    <div className="py-4 border-b border-gray-800">
      <div className="flex items-start gap-5">
        <img
          src={user.profileImage}
          alt={user.username}
          className="w-12 h-12 rounded-md object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">@{user.username}</span>
              {timeAgo && (
                <span className="text-xs text-gray-400">{timeAgo}</span>
              )}
            </div>
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete broadcast"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="text-white mt-1">
            {content}
            {type === "activity-link" && linkText && linkHref && (
              <div>
                <a
                  href={linkHref}
                  className="text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  {linkText}
                  <span className="ml-1">{'>'}</span>
                </a>
              </div>
            )}
          </div>
          {type === "track" && track && (
            <SongCard song={track} selected className="mt-2"/>
          )}
          <div className="flex items-center gap-1 text-sm mt-2">
            <button
              onClick={isLiked ? handleUnlike : handleLike}
              disabled={isLiking || !userDetails}
              className={`flex items-center gap-1 transition-colors ${
                isLiked 
                  ? 'text-pink-500 hover:text-pink-600' 
                  : 'text-gray-400 hover:text-pink-500'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-current' : ''}
              />
              <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
