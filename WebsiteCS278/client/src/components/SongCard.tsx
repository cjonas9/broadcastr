import { Play } from "lucide-react";

export type Song = {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  trackLink: string;
};

export default function SongCard({ song, onClick, selected, fullWidth = false }: { song: Song; onClick?: () => void; selected?: boolean; fullWidth?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl ${selected ? 'bg-gray-800' : ''} ${onClick ? 'hover:bg-gray-800 cursor-pointer' : ''} ${fullWidth ? 'w-full' : 'max-w-xl w-full mx-auto'}`}
      onClick={onClick}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <img src={song.albumArt} alt={song.title} className={`w-16 h-16 rounded${selected ? '-xl' : ''} object-cover`} />
      <div className={selected ? 'flex-1 ml-4' : ''}>
        <div className={`font-semibold ${selected ? 'text-lg font-bold' : ''} text-white`}>{song.title}</div>
        <div className="text-gray-400">{song.artist}</div>
      </div>
      {selected && (
        <a href={song.trackLink} target="_blank" rel="noopener noreferrer" className="ml-2">
          <div className="bg-purple-800 rounded-full p-3 flex items-center justify-center">
            <Play size={20} opacity={0.8} className="text-white"/>
          </div>
        </a>
      )}
    </div>
  );
} 