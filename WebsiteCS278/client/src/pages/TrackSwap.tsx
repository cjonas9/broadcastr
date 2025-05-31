import { ArrowLeft, Play, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { musicData } from "../data/musicData";
import { useState } from "react";
import MatchProfileCard from "@/components/MatchProfileCard";
import SongCard, { Song } from "../components/SongCard";
import SearchBar from "../components/SearchBar";
import React from "react";
import { useSwap, MatchUser } from "../context/SwapContext";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import TrackSelector from "@/components/TrackSelector";

export default function TrackSwap() {
  const [, setLocation] = useLocation();
  // Mock: use the first friend as the match of the day
  const match = musicData.friends[0];
  // Use topArtists as mock tracks
  const tracks = musicData.topArtists;
  const [selectedTrack, setSelectedTrack] = useState<Song | null>(null);

  // Use mockSongs from musicData
  const mockSongs: Song[] = musicData.mockSongs;

  const { setSelectedSong, setMatchUser } = useSwap();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-2 mt-12">Track Swap Battle</h1>
        <p className="text-center text-gray-300 mb-8">
          Swap a song with your matched partner to expand your music taste! If your match saves your song, you earn +5 swag
        </p>

        {/* Match of the day */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center mb-2">Your Match of the day</h2>
          <MatchProfileCard
            username={match.username}
            profileImage={match.profileImage}
            swag={match.swag}
            onClick={() => setLocation(`/profile/${match.username.replace(/^@/, "")}`)}
          />
        </div>

        <div className="mb-8">
          <TrackSelector
            selectedTrack={selectedTrack}
            onTrackSelect={setSelectedTrack}
            songs={mockSongs}
            label="Choose a Track to Swap!"
          />
        </div>

        <Button
          variant="purple"
          className="w-full text-lg py-6 mt-2"
          disabled={!selectedTrack}
          onClick={() => {
            if (selectedTrack) {
              setSelectedSong(selectedTrack);
              setMatchUser(match as MatchUser);
              setLocation("/track-swap-confirmation");
            }
          }}
        >
          Send Swap
        </Button>
        <BottomToolbar />
      </div>
    </div>
  );
}
