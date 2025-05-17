import React from "react";
import { useSwap } from "../context/SwapContext";
import SwapPointsCard from "../components/SwapPointsCard";
import { useLocation } from "wouter";
import { musicData } from "@/data/musicData";

// Mock current user data (replace with real user context if available)

export default function SwapPointsResults() {
  const { matchUser } = useSwap();
  const [, setLocation] = useLocation();
  const countdown = "10 Hr 5 Min";
  const currentUser = musicData.user;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-between p-6 text-white">
      <div className="flex flex-col items-center w-full max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 mt-8">Congratulations! It's a<br />Win Win</h1>
        <div className="flex flex-col gap-4 mt-4 w-full">
          <SwapPointsCard {...currentUser} />
          {matchUser && (
            <SwapPointsCard
              username={matchUser.username}
              profileImage={matchUser.profileImage}
              swag={matchUser.swag}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col items-center mb-8 mt-8 w-full max-w-xl mx-auto">
        <div className="text-center text-gray-300 mb-4 text-lg">
          New match available in:<br />
          <span className="font-semibold text-white text-xl">{countdown}</span>
        </div>
        <button
          className="w-full text-lg py-3 mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
          onClick={() => setLocation("/")}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
} 