import { ArrowLeft, Play, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { musicData } from "../data/musicData";
import { useState } from "react";
import MatchProfileCard from "@/components/MatchProfileCard";
import SongCard, { Song } from "../components/SongCard";
import SearchBar from "../components/SearchBar";
import TrackSelectDrawer from "../components/TrackSelectDrawer";
import React from "react";
import { useSwap, MatchUser } from "../context/SwapContext";

export default function TrackSwap() {
  const [, setLocation] = useLocation();
  // Mock: use the first friend as the match of the day
  const match = musicData.friends[0];
  // Use topArtists as mock tracks
  const tracks = musicData.topArtists;
  const [selectedTrack, setSelectedTrack] = useState<Song | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Use mockSongs from musicData
  const mockSongs: Song[] = musicData.mockSongs;

  const { setSelectedSong, setMatchUser } = useSwap();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-xl mx-auto">
        <div 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </div>

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
          <h2 className="text-xl font-semibold text-center mb-2">Choose a Track to Swap!</h2>
          {selectedTrack ? (
            <>
              <SongCard song={selectedTrack} selected />
              <div className="flex justify-center w-full">
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
              </div>
            </>
          ) : (
            <>
              <h3 className="text-gray-400 text-center mb-2 flex justify-center">You have not selected your track</h3>
              <div className="flex justify-center w-full">
                <TrackSelectDrawer
                  open={drawerOpen}
                  onOpenChange={setDrawerOpen}
                  songs={mockSongs}
                  onSelect={setSelectedTrack}
                  search={search}
                  setSearch={setSearch}
                  trigger={
                    <Button className="bg-green-600 hover:bg-green-600 text-white font-semibold text-base py-3 rounded-lg">
                      Choose from Spotify
                    </Button>
                  }
                />
              </div>
            </>
          )}
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
      </div>
    </div>
  );
}
