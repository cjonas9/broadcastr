import React, { useState } from "react";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { BottomToolbar } from "@/components/BottomToolbar";
import { musicData } from "@/data/musicData";
import TrackSelector from "@/components/TrackSelector";

export default function BroadcastTrackPage() {
  const [caption, setCaption] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

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
        <TrackSelector
          selectedTrack={selectedTrack}
          onTrackSelect={setSelectedTrack}
          songs={musicData.mockSongs}
          className="mb-6"
        />
        <ButtonWrapper width="full" className="mt-8" disabled={!selectedTrack}>
          + Post Track
        </ButtonWrapper>
      </div>
      <BottomToolbar />
    </div>
  );
}
