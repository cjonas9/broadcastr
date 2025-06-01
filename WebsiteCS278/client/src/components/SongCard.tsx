/* 
SongCard.tsx: Component for displaying a song card
--------------------------------------------------
EXAMPLE USAGE:
<SongCard song={song} onClick={() => {}} />

//TODO: add track link for user to play the song
*/


import { Play } from "lucide-react";

export interface Song {
  id: number;
  name: string;
  artist: string;
  playCount: number;
  selected?: boolean;
}

export default function SongCard({ song, onClick, selected, fullWidth = false, className = '' }: { song: Song; onClick?: () => void; selected?: boolean; fullWidth?: boolean; className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 p-4 px-5 rounded-xl ${selected ? 'bg-gray-800' : ''} ${onClick ? 'hover:bg-gray-800 cursor-pointer' : ''} ${fullWidth ? 'w-full' : 'max-w-xl w-full mx-auto'} ${className}`}
      onClick={onClick}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <div className={selected ? 'flex-1' : ''}>
        <div className={`font-semibold ${selected ? 'text-lg font-bold' : ''} text-white`}>{song.name}</div>
        <div className="text-gray-400">{song.artist}</div>
      </div>
      {selected && (
        <div className="ml-2">
          <div className="bg-[#654DC4] rounded-full p-3 flex items-center justify-center">
            <Play size={20} opacity={0.8} className="text-white"/>
          </div>
        </div>
      )}
    </div>
  );
} 