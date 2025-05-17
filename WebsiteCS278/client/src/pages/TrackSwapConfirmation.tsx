import MatchProfileCard from "@/components/MatchProfileCard";
import SongCard from "../components/SongCard";
import { Button } from "../components/ui/button";
import React from "react";
import { useSwap } from "../context/SwapContext";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TrackSwapConfirmation() {
  const { selectedSong, matchUser } = useSwap();
  const [, setLocation] = useLocation();
  // Mock countdown timer value
  const countdown = "10 Hr 5 Min";

  if (!selectedSong || !matchUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl">No track or match user selected for swap.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between p-6">
      {/* Back Button
      <div
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 cursor-pointer"
          onClick={() => setLocation("/track-swap")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Edit Track Selection
        </div> */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-center mb-8 mt-12">
          You have sent your track<br />
          to <span className="text-white">@daniel132!</span>
        </h1>
        
          <div className="w-full max-w-xl flex flex-col gap-6">
            <MatchProfileCard
              username={matchUser.username}
              profileImage={matchUser.profileImage}
              swag={matchUser.swag}
              onClick={() => {}}
            />
            <SongCard song={selectedSong} selected />
          </div>
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="text-center text-gray-300 mb-4 text-lg">
          Your will receive your swapped song in:<br />
          <span className="font-semibold text-white text-xl">{countdown}</span>
        </div>
        <Button
          className="w-full max-w-xl text-lg py-6 mt-2 bg-[#7C3AED] hover:bg-[#a78bfa] text-white font-bold border-none"
          onClick={() => setLocation("/track-swap-results")}
        >
          View Swap
        </Button>
        <Button
          className="w-full max-w-xl text-lg py-6 mt-2 bg-gray-700 text-white font-semibold border-none"
          onClick={() => setLocation("/")}
          variant="secondary"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
} 