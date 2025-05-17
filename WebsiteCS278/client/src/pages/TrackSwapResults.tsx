import MatchProfileCard from "@/components/MatchProfileCard";
import SongCard from "../components/SongCard";
import { Button } from "../components/ui/button";
import React from "react";
import { useSwap } from "../context/SwapContext";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { musicData } from "../data/musicData";

export default function TrackSwapResults() {
  const { matchUser } = useSwap();
  const [, setLocation] = useLocation();
  // Mock countdown timer value
  const countdown = "10 Hr 5 Min";

  //Received song for future backend integration
  const receivedSong = musicData.mockSongs[3];

  if (!matchUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2] text-gray-900">
        <div className="text-center">
          <p className="text-xl">No match user found for swap results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between p-6">
      {/* Back Button */}
      <div
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 cursor-pointer"
          onClick={() => setLocation("/track-swap-confirmation")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Edit Track Selection
        </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-center mb-8 mt-12">
          You have received a track from <span className="text-purple-400">{matchUser.username}</span>
        </h1>
        <div className="w-full max-w-xl flex flex-col items-center">
          <h2 className="text-xl font-semibold text-center mb-4 mt-2">Your Match of the day</h2>
          <MatchProfileCard
            username={matchUser.username}
            profileImage={matchUser.profileImage}
            swag={matchUser.swag}
            onClick={() => {}}
          />
          <h2 className="text-xl font-semibold text-center mb-2 mt-8">Received Track</h2>
          <div className="flex flex-col items-center text-gray-500 mb-4 text-base w-full">
            <div className="text-center">
              If you save the track your match sent, you match will receive +5 swag
            </div>
            <div className="w-full mt-2 mb-4">
              <SongCard song={receivedSong} selected />
            </div>
            <Button className="bg-green-600 hover:bg-green-600 text-white font-semibold text-base py-3 rounded-lg">
              + Save Track on Spotify
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="text-center text-gray-500 mb-4 text-sm">
          Swap results revealing in:<br />
          <span className="font-semibold text-white text-lg">{countdown}</span>
        </div>
        <Button className="w-full max-w-xl text-lg py-6 mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold" onClick={() => setLocation("/swap-points-results")}>
          View Swap Results
        </Button>
      </div>
    </div>
  );
} 