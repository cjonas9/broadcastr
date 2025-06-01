/* 
TrackSelectDrawer.tsx: Component for the selecting tracks from users's Last.FM profile
----------------------------------------------------------
EXAMPLE USAGE:
<TrackSelectDrawer
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  songs={mockSongs}
  onSelect={setSelectedTrack}
  search={search}
  setSearch={setSearch}
  trigger={
    <Button className="max-w-xs mt-2 bg-green-600 hover:bg-green-600 text-white font-semibold text-base py-3 rounded-lg">
      Reselect Track
    </Button>
  }
/>
*/

import React from "react";
import { Song } from "./SongCard";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "./ui/drawer";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface TrackSelectDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songs: Song[];
  onSelect: (song: Song) => void;
  search: string;
  setSearch: (s: string) => void;
  trigger?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

export default function TrackSelectDrawer({
  open,
  onOpenChange,
  songs,
  onSelect,
  search,
  setSearch,
  trigger,
  loading = false,
  error = null,
}: TrackSelectDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="bg-gray-900 border-none">
        <DrawerHeader>
          <h2 className="text-xl font-bold mb-2 text-white">Select a Track</h2>
        </DrawerHeader>
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search tracks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-400 py-4">Loading tracks...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-4">{error}</div>
            ) : songs.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No tracks found</div>
            ) : (
              songs.map((song) => (
                <div
                  key={song.id}
                  className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer"
                  onClick={() => onSelect(song)}
                >
                  <div className="font-medium text-white">{song.name}</div>
                  <div className="text-sm text-gray-400">{song.artist}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}