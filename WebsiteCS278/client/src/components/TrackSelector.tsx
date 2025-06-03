import React from "react";
import SongCard, { Song } from "./SongCard";
import TrackSelectDrawer from "./TrackSelectDrawer";
import { ButtonWrapper } from "./ButtonWrapper";
import { useTopTracks } from "@/hooks/useTopTracks";

interface TrackSelectorProps {
  selectedTrack: Song | null;
  onTrackSelect: (track: Song) => void;
  username: string;
  label?: string;
  className?: string;
  period?: string;
  limit?: number;
}

export default function TrackSelector({
  selectedTrack,
  onTrackSelect,
  username,
  label = "Choose your track",
  className = "",
  period = "1month",
  limit = 100,
}: TrackSelectorProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { tracks, loading, error } = useTopTracks(username, period, limit);

  const filteredTracks = React.useMemo(() => {
    if (!search) return tracks;
    const searchLower = search.toLowerCase();
    return tracks.filter(
      track =>
        track.name.toLowerCase().includes(searchLower) ||
        track.artist.toLowerCase().includes(searchLower)
    );
  }, [tracks, search]);

  return (
    <div className={className}>
      <label className="block mb-2 text-gray-400">{label}</label>
      {!selectedTrack ? (
        <div>
          <div className="w-full rounded-lg border border-dashed border-gray-600 bg-gray-800 text-gray-400 px-4 py-6 mb-4 text-center">
            You have not selected your track
          </div>
          <TrackSelectDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            songs={filteredTracks}
            onSelect={track => {
              onTrackSelect(track);
              setDrawerOpen(false);
            }}
            search={search}
            setSearch={setSearch}
            loading={loading}
            error={error}
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
            songs={filteredTracks}
            onSelect={track => {
              onTrackSelect(track);
              setDrawerOpen(false);
            }}
            search={search}
            setSearch={setSearch}
            loading={loading}
            error={error}
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