import React from "react";
import { Heart } from "lucide-react";

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
  <div className="py-4 border-b border-gray-800 flex items-start gap-5">
    <img
      src={track.albumArt}
      alt={track.artist}
      className="w-16 h-16 rounded-md object-cover"
    />
    <div className="flex-1">
      <div className="text-white font-semibold">{track.title}</div>
      <div className="text-sm text-gray-400">{track.artist}</div>
      <div className="flex items-center gap-2 mt-2">
        <Heart size={16} className="text-gray-400" />
        <span className="text-sm text-gray-400">{likes} Likes</span>
        <a
          href={track.trackLink}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
        >
          Play
        </a>
      </div>
    </div>
  </div>
);

export default TopTrackPost;
