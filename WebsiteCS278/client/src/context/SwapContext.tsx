import React, { createContext, useContext, useState } from "react";
import { Song } from "../components/SongCard";

export type MatchUser = {
  username: string;
  profileImage: string;
  swag: number;
};

type SwapContextType = {
  swapTrack: Song | null;
  setSwapTrack: (track: Song | null) => void;
  matchUser: MatchUser | null;
  setMatchUser: (user: MatchUser | null) => void;
};

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export function SwapProvider({ children }: { children: React.ReactNode }) {
  const [swapTrack, setSwapTrack] = useState<Song | null>(null);
  const [matchUser, setMatchUser] = useState<MatchUser | null>(null);
  return (
    <SwapContext.Provider value={{ swapTrack, setSwapTrack, matchUser, setMatchUser }}>
      {children}
    </SwapContext.Provider>
  );
}

export function useSwap() {
  const ctx = useContext(SwapContext);
  if (!ctx) throw new Error("useSwap must be used within a SwapProvider");
  return ctx;
} 