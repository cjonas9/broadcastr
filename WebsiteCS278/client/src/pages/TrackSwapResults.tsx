import MatchProfileCard from "@/components/MatchProfileCard";
import SongCard from "../components/SongCard";
import { Button } from "../components/ui/button";
import React from "react";
import { useSwap } from "../context/SwapContext";
import { useLocation } from "wouter";
import { Heading } from "@/components/Heading";
import { musicData } from "../data/musicData";
import { ButtonWrapper } from "@/components/ButtonWrapper";

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
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 mt-12">Track Swap Results</h1>
        <p className="text-center text-gray-300 mb-8">
          Rate the track you received to give your match swag points!
        </p>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center mb-2">Your Match</h2>
          <MatchProfileCard
            username={matchUser.username}
            profileImage={matchUser.profileImage}
            swag={matchUser.swag}
            onClick={() => setLocation(`/profile/${matchUser.username.replace(/^@/, "")}`)}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center mb-2">Received Track</h2>
          <SongCard
            song={receivedSong}
            selected={true}
            onClick={() => {}}
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center mb-2">Rate the Track</h2>
          <p className="text-center text-gray-300 mb-4">
            Your rating determines how many swag points your match receives:
          </p>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
          />
        </div>

        <div className="fixed bottom-24 w-full max-w-md">
          <ButtonWrapper
            variant={rating === 0 ? "disabled" : "primary"}
            width="full"
            disabled={rating === 0 || isSubmitting}
            onClick={handleSubmitRating}
          >
            View Swap Results
          </ButtonWrapper>
        </div>
      </div>
    </div>
  );
} 