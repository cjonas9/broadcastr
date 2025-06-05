/* 
SongCard.tsx: Component for displaying a song card
--------------------------------------------------
EXAMPLE USAGE:
<SongCard song={song} onClick={() => {}} />

//TODO: add track link for user to play the song
*/


import { ExternalLink } from "lucide-react";

export interface Song {
  id: number;
  name: string;
  artist: string;
  playCount: number;
  selected?: boolean;
  url: string;
  track_url?: string;  // Last.fm track URL
}

export default function SongCard({ 
  song, 
  onClick, 
  selected, 
  showPlayButton = true, 
  fullWidth = false, 
  className = '',
  hoverable = true
}: { 
  song: Song; 
  onClick?: () => void; 
  selected?: boolean; 
  showPlayButton?: boolean;
  fullWidth?: boolean; 
  className?: string;
  hoverable?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 p-4 px-5 rounded-xl ${selected ? 'bg-gray-800' : ''} ${onClick && hoverable ? 'hover:bg-gray-800 cursor-pointer' : ''} ${fullWidth ? 'w-full' : 'max-w-xl w-full mx-auto'} ${className}`}
      onClick={onClick}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div className="flex-1">
        <div className={`font-semibold ${selected ? 'text-lg font-bold' : ''} text-white`}>{song.name}</div>
        <div className="text-gray-400">{song.artist}</div>
      </div>
      {showPlayButton && (song.track_url || song.url) && (
        <div className="flex-shrink-0">
          <a
            href={song.track_url || song.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            onClick={(e) => e.stopPropagation()} // Prevent triggering the parent onClick
          >
            <ExternalLink size={16} />
          </a>
        </div>
      )}
    </div>
  );
} 