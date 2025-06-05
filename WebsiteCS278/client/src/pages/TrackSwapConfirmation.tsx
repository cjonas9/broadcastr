import MatchProfileCard from "@/components/MatchProfileCard";
import SongCard from "../components/SongCard";
import { Button } from "../components/ui/button";
import React from "react";
import { useSwap } from "../context/SwapContext";
import { useLocation } from "wouter";
import { Heading } from "@/components/Heading";
import { ButtonWrapper } from "@/components/ButtonWrapper";


export default function TrackSwapConfirmation() {
  const { swapTrack, matchUser } = useSwap();
  const [, setLocation] = useLocation();

  if (!swapTrack || !matchUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl">No track or match user selected for swap.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1">
          <Heading level={2} serif={true} className="mb-3 mt-12 text-center">Track Swap Sent!</Heading>
          <p className="text-center text-gray-400 mb-12">
            Your track has been sent to your match.
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
            <h2 className="text-xl font-semibold text-center mb-2">Your Track</h2>
            <SongCard
              song={swapTrack}
              selected={true}
              onClick={() => {}}
            />
          </div>
        </div>
        <div className="mt-auto pt-6">
          <ButtonWrapper
            width="full"
            variant="primary"
            onClick={() => setLocation("/")}
            >
              Return Home
            </ButtonWrapper>
        </div>
      </div>
    </div>
  );
} 