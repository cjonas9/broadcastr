// TopTrackPost.tsx

import React from "react";
import { Heart, Play } from "lucide-react";

type TopTrackPostProps = {
  track: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    trackLink: string;
  };
  likes: number;
};

const TopTrackPost: React.FC<TopTrackPostProps> = ({ track, likes }) => (
  <div className="bg-[#1c2230] rounded-xl p-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <img
        src={track.albumArt}
        alt={track.artist}
        className="w-16 h-16 rounded-md object-cover"
      />
      <div className="text-white">
        <p className="font-semibold text-white text-base">{track.title}</p>
        <p className="text-sm text-gray-400">{track.artist}</p>
        <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
          <Heart size={14} className="text-pink-500" />
          <span>{likes} Likes</span>
        </div>
      </div>
    </div>
    <a
      href={track.trackLink}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded-full hover:bg-purple-700"
    >
      <Play size={18} className="text-white" />
    </a>
  </div>
);

export default TopTrackPost;
