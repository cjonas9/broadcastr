import React from "react";
import SongCard, { Song } from "./SongCard";
import TrackSelectDrawer from "./TrackSelectDrawer";
import { ButtonWrapper } from "./ButtonWrapper";

interface TrackSelectorProps {
  selectedTrack: Song | null;
  onTrackSelect: (track: Song) => void;
  songs: Song[];
  label?: string;
  className?: string;
}

export default function TrackSelector({
  selectedTrack,
  onTrackSelect,
  songs,
  label = "Choose your track",
  className = "",
}: TrackSelectorProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <div className={className}>
      <label className="block mb-2 text-gray-300 text-center">{label}</label>
      {!selectedTrack ? (
        <div>
          <div className="w-full rounded-lg border border-dashed border-gray-600 bg-gray-800 text-gray-400 px-4 py-6 mb-4 text-center">
            You have not selected your track
          </div>
          <TrackSelectDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            songs={songs}
            onSelect={track => {
              onTrackSelect(track);
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
            songs={songs}
            onSelect={track => {
              onTrackSelect(track);
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
  );
} 