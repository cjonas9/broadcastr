import { Button } from "../components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/AuthContext";
import { Heading } from "@/components/Heading";
import { BottomToolbar } from "@/components/BottomToolbar";
import { Music, Users, Trophy } from "lucide-react";
import { ButtonWrapper } from "@/components/ButtonWrapper";

export default function TrackSwapEntry() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();

  // Error handling for unauthenticated users
  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold">Please log in to continue</Heading>
          <Button
            variant="purple"
            className="w-full text-lg py-6 mt-2"
            onClick={() => setLocation('/login')}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1">
          <Heading level={1} serif={true} className="mb-4 mt-12 text-center">Track Swap Battle</Heading>
          <p className="text-center text-gray-400 mb-12">
            Expand your music taste by swapping tracks with other music lovers!
          </p>

          {/* How it works section */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4">
              <Users className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">1. Get Matched</h3>
                <p className="text-gray-400">We'll pair you with another active user who's ready to swap tracks.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Music className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">2. Send & Receive</h3>
                <p className="text-gray-400">Share a track you love and receive one from your match.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Trophy className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">3. Earn Swag</h3>
                <p className="text-gray-400">Your match will rate your track, and you'll get up to +5swag points based on their rating!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 pb-16">
          <ButtonWrapper
            width="full"
            variant="secondary"
            onClick={() => setLocation("/track-swap-history")}
            className="mb-4"
          >
            View Track Swap History
          </ButtonWrapper>
          <ButtonWrapper
            width="full"
            onClick={() => {
              localStorage.setItem('should_fetch_new_match', 'true');
              setLocation("/track-swap");
            }}
          >
            Start Track Swap
          </ButtonWrapper>
        </div>
        <BottomToolbar />
      </div>
    </div>
  );
} 