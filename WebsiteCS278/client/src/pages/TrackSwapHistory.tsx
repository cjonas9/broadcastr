import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/AuthContext';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import { BottomToolbar } from '@/components/BottomToolbar';
import { Heading } from '@/components/Heading';
import MatchProfileCard from '@/components/MatchProfileCard';
import SongCard from '@/components/SongCard';
import { ArrowLeft } from 'lucide-react';

interface TrackSwap {
  id: number;
  status: 'pending' | 'completed' | 'cancelled';
  initiatedBy: {
    username: string;
    profileImage: string;
    swag: number;
  };
  receivedFrom: {
    username: string;
    profileImage: string;
    swag: number;
  };
  sentTrack: {
    id: number;
    name: string;
    artist: string;
    playCount: number;
  };
  receivedTrack: {
    id: number;
    name: string;
    artist: string;
    playCount: number;
  } | null;
  rating: number | null;
  createdAt: string;
}

export default function TrackSwapHistory() {
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [swaps, setSwaps] = useState<TrackSwap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackSwaps = async () => {
      if (!userDetails) return;

      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/track-swaps?user=${userDetails.profile}`);
        // if (!response.ok) throw new Error('Failed to fetch track swaps');
        // const data = await response.json();
        // setSwaps(data.swaps);

        // Mock data for now
        setSwaps([
          {
            id: 1,
            status: 'pending',
            initiatedBy: {
              username: '@user1',
              profileImage: '',
              swag: 100
            },
            receivedFrom: {
              username: '@user2',
              profileImage: '',
              swag: 150
            },
            sentTrack: {
              id: 1,
              name: 'Song 1',
              artist: 'Artist 1',
              playCount: 100
            },
            receivedTrack: null,
            rating: null,
            createdAt: '2024-03-20T10:00:00Z'
          },
          {
            id: 2,
            status: 'completed',
            initiatedBy: {
              username: '@user3',
              profileImage: '',
              swag: 200
            },
            receivedFrom: {
              username: '@user4',
              profileImage: '',
              swag: 180
            },
            sentTrack: {
              id: 2,
              name: 'Song 2',
              artist: 'Artist 2',
              playCount: 200
            },
            receivedTrack: {
              id: 3,
              name: 'Song 3',
              artist: 'Artist 3',
              playCount: 150
            },
            rating: 4,
            createdAt: '2024-03-19T15:30:00Z'
          }
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch track swaps');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackSwaps();
  }, [userDetails]);

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold">Please log in to continue</Heading>
          <ButtonWrapper
            width="hug"
            onClick={() => setLocation('/login')}
          >
            Go to Login
          </ButtonWrapper>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4">Loading track swaps...</Heading>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Heading level={3} serif={false} className="mb-4 font-semibold text-red-400">Error</Heading>
          <p className="text-gray-400 mb-4">{error}</p>
          <ButtonWrapper
            width="hug"
            onClick={() => window.location.reload()}
          >
            Try Again
          </ButtonWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1">
          <button className="text-2xl mb-4" onClick={() => setLocation("/track-swap-entry")}>←</button>
          <Heading level={3} serif={false} className="mb-4 font-bold text-center">Track Swap History</Heading>

          {swaps.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <p>No track swaps yet</p>
              <ButtonWrapper
                width="hug"
                onClick={() => setLocation("/track-swap-entry")}
                className="mt-4"
              >
                Start Your First Swap
              </ButtonWrapper>
            </div>
          ) : (
            <div className="space-y-6">
              {swaps.map((swap) => (
                <div key={swap.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      swap.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                      swap.status === 'cancelled' ? 'bg-red-900/50 text-red-400' :
                      'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-gray-400 mb-2">You sent to:</h3>
                      <MatchProfileCard
                        username={swap.receivedFrom.username}
                        profileImage={swap.receivedFrom.profileImage}
                        swag={swap.receivedFrom.swag}
                        onClick={() => setLocation(`/profile/${swap.receivedFrom.username.replace(/^@/, "")}`)}
                      />
                      <div className="mt-2">
                        <SongCard
                          song={swap.sentTrack}
                          selected={true}
                          onClick={() => {}}
                        />
                      </div>
                    </div>

                    {swap.receivedTrack && (
                      <div>
                        <h3 className="text-sm text-gray-400 mb-2">You received from:</h3>
                        <MatchProfileCard
                          username={swap.initiatedBy.username}
                          profileImage={swap.initiatedBy.profileImage}
                          swag={swap.initiatedBy.swag}
                          onClick={() => setLocation(`/profile/${swap.initiatedBy.username.replace(/^@/, "")}`)}
                        />
                        <div className="mt-2">
                          <SongCard
                            song={swap.receivedTrack}
                            selected={true}
                            onClick={() => {}}
                          />
                        </div>
                        {swap.rating && (
                          <div className="mt-2 text-center text-gray-400">
                            You rated this track {swap.rating} stars
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <BottomToolbar />
      </div>
    </div>
  );
} 