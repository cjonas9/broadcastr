import { useState } from "react";
import { useAuth } from "@/AuthContext";
import { API_CONFIG } from "@/config";

export default function TrackSwapAction({ trackId, onSwap }: { trackId: string; onSwap: () => void }) {
  const { userDetails } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwap = async () => {
    if (!userDetails) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/swap-track?user=${encodeURIComponent(userDetails.profile)}&track=${encodeURIComponent(trackId)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to swap track");
      }

      onSwap();
    } catch (err) {
      console.error("Error swapping track:", err);
      setError("Failed to swap track. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleSwap}
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {isLoading ? "Swapping..." : "Swap Track"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
} 