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

import React, { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import SongCard, { Song } from "./SongCard";
import { useAuth } from "@/AuthContext";

const VITE_API_URL = "https://broadcastr.onrender.com";

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
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!userDetails?.profile) return;

      try {
        const response = await fetch(
          `${VITE_API_URL}/api/get-likes?user=${userDetails.profile}&relatedtype=Broadcast&relatedid=${id}`
        );
        if (!response.ok) throw new Error('Failed to fetch like status');
        
        const data = await response.json();
        setIsLiked(data.hasLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [id, userDetails]);

  const handleDelete = async () => {
    if (!userDetails) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${VITE_API_URL}/api/delete-broadcast?id=${id}`,
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
    if (!userDetails?.profile || isLiking) return;

    try {
      setIsLiking(true);
      const response = await fetch(
        `${VITE_API_URL}/api/create-like?user=${userDetails.profile}&relatedtype=Broadcast&relatedid=${id}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to like broadcast');
      }

      setIsLiked(true);
      setLikes(prev => prev + 1);

      // Dispatch an event to notify other components about the like
      window.dispatchEvent(new CustomEvent('broadcastLiked', {
        detail: { broadcastId: id }
      }));
    } catch (error) {
      console.error('Error liking broadcast:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleUnlike = async () => {
    if (!userDetails?.profile || isLiking) return;

    try {
      setIsLiking(true);
      const response = await fetch(
        `${VITE_API_URL}/api/undo-like?user=${userDetails.profile}&relatedtype=Broadcast&relatedid=${id}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to unlike broadcast');
      }

      setIsLiked(false);
      setLikes(prev => prev - 1);

      // Dispatch an event to notify other components about the unlike
      window.dispatchEvent(new CustomEvent('broadcastUnliked', {
        detail: { broadcastId: id }
      }));
    } catch (error) {
      console.error('Error unliking broadcast:', error);
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
              }`}
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
