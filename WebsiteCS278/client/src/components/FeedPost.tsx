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

import React from "react";
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
  likes,
  onDelete,
}) => {
  const { userDetails } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);

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
          <div className="flex items-center gap-1 text-gray-400 text-sm mt-2">
            <Heart size={16} className="mr-1" />
            {likes} Likes
          </div>
        </div>
      </div>
    </div>
  );
};
