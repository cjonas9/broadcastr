import React, { useState } from "react";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import SongCard from "@/components/SongCard";
import { BottomToolbar } from "@/components/BottomToolbar";
import TrackSelectDrawer from "@/components/TrackSelectDrawer";
import { musicData } from "@/data/musicData";

export default function BroadcastTrackPage() {
  const [caption, setCaption] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full flex-1">
        <button className="text-2xl mb-4" onClick={() => window.history.back()}>←</button>
        <h1 className="font-heading text-4xl mb-2 text-center">Broadcast a Track</h1>
        <p className="text-gray-400 mb-8 text-center">
          Share a track you are recently jamming to with all BroadCastrs! Tracks must be selected within your most recently played 100 songs.
        </p>
        <div className="mb-6">
          <label className="block mb-2 text-gray-300 text-center">Caption</label>
          <input
            className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 outline-none"
            placeholder="Your thoughts here"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-gray-300 text-center">Choose your track</label>
          {!selectedTrack ? (
            <div>
              <div className="w-full rounded-lg border border-dashed border-gray-600 bg-gray-800 text-gray-400 px-4 py-6 mb-4 text-center">
                You have not selected your track
              </div>
              <TrackSelectDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                songs={musicData.mockSongs}
                onSelect={track => {
                  setSelectedTrack(track);
                  setDrawerOpen(false);
                }}
                search={search}
                setSearch={setSearch}
                trigger={
                  <ButtonWrapper width="full" variant="secondary">
                    Select Track
                  </ButtonWrapper>
                }
              />
            </div>
          ) : (
            <div>
              <SongCard song={selectedTrack} selected className="mb-4" />
              <TrackSelectDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                songs={musicData.mockSongs}
                onSelect={track => {
                  setSelectedTrack(track);
                  setDrawerOpen(false);
                }}
                search={search}
                setSearch={setSearch}
                trigger={
                  <ButtonWrapper width="full" variant="secondary">
                    Reselect Track
                  </ButtonWrapper>
                }
              />
            </div>
          )}
        </div>
        <ButtonWrapper width="full" className="mt-8" disabled={!selectedTrack}>
          + Post Track
        </ButtonWrapper>
      </div>
      <BottomToolbar />
    </div>
  );
}
