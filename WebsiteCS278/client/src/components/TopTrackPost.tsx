import React from "react";
import { Heart } from "lucide-react";
import SongCard, { Song } from "./SongCard";

type TopTrackPostProps = {
  track: Song;
  likes: number;
};

const TopTrackPost: React.FC<TopTrackPostProps> = ({ track, likes }) => (
  <div>
    <SongCard song={track} selected />
    <div className="mt-2 ml-2 flex items-center gap-2 text-sm text-gray-400">
      <Heart size={16} className="text-pink-500" />
      <span>{likes} Likes</span>
    </div>
  </div>
);

export default TopTrackPost;
