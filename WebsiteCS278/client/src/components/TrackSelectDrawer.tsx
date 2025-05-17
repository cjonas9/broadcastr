import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader } from "./ui/drawer";
import SongCard, { Song } from "./SongCard";
import SearchBar from "./SearchBar";
import React from "react";

export default function TrackSelectDrawer({
  open,
  onOpenChange,
  songs,
  onSelect,
  search,
  setSearch,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songs: Song[];
  onSelect: (song: Song) => void;
  search: string;
  setSearch: (s: string) => void;
  trigger?: React.ReactNode;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="bg-gray-900 border-none">
        <DrawerHeader>
          <h2 className="text-xl font-bold mb-2 text-white">Select a Track</h2>
        </DrawerHeader>
        <div className="p-4">
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" />
          <div className="max-h-96 overflow-y-auto w-full">
            {songs
              .filter(song =>
                song.title.toLowerCase().includes(search.toLowerCase()) ||
                song.artist.toLowerCase().includes(search.toLowerCase())
              )
              .map(song => (
                <div className="w-full mb-2" key={song.id}>
                  <SongCard song={song} onClick={() => { onSelect(song); onOpenChange(false); }} fullWidth />
                </div>
              ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}