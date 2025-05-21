/* 
FeedPost.tsx: Component for displaying an individual post in the feed
---------------------------------------------------------
EXAMPLE USAGE:
<FeedPost
  avatarUrl="/avatars/daniel123.jpg"
  username="daniel123"
  content="reached top 5 and received +5 swag"
  type="activity-link"
  linkText="Beyonce’s weekly top listeners"
  linkHref="/beyonce/top-listeners"
  likes={16}

TODO:
- Like button needs to be made interactable
- need to be compatible with real backend data
/>

*/

import React from "react";
import { Heart } from "lucide-react";
import SongCard from "./SongCard";

type FeedPostProps = {
  user: {
    id: number,
    username: string,
    swag: number,
    profileImage: string,
  },
  timeAgo: string,
  content: string;
  type: "activity" | "activity-link" | "track";
  linkText?: string;
  linkHref?: string;
  track?: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    trackLink: string;
  };
  likes: number;
};

export const FeedPost: React.FC<FeedPostProps> = ({
  user,
  timeAgo,
  content,
  type,
  linkText,
  linkHref,
  track,
  likes,
}) => (
  <div className="py-4 border-b border-gray-800">
    <div className="flex items-start gap-5">
      <img
        src={user.profileImage}
        alt={user.username}
        className="w-12 h-12 rounded-md object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">@{user.username}</span>
          {timeAgo && (
            <span className="text-xs text-gray-400">{timeAgo}</span>
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
