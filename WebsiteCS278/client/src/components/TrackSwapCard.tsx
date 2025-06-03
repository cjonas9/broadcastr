import React, { MouseEvent } from 'react';
import { useLocation } from 'wouter';
import MatchProfileCard from './MatchProfileCard';
import { ButtonWrapper } from './ButtonWrapper';
import StatusTag from './StatusTag';

export interface TrackSwap {
  id: number;
  initiated_user_id: number;
  initiated_user: string;
  matched_user_id: number;
  matched_user: string;
  initiated_track_id: number | null;
  initiated_track_name: string | null;
  initiated_artist_name: string | null;
  matched_track_id: number | null;
  matched_track_name: string | null;
  matched_artist_name: string | null;
  initiated_reaction: number | null;
  matched_reaction: number | null;
  swap_initiated_timestamp: string;
  initiated_track_timestamp: string | null;
  matched_track_timestamp: string | null;
  initiated_reaction_timestamp: string | null;
  matched_reaction_timestamp: string | null;
}

interface UserProfile {
  username: string;
  profileImage: string;
  swag: number;
}

interface TrackSwapCardProps {
  swap: TrackSwap;
  currentUser: string;
  userProfiles: Record<string, UserProfile>;
  onRateTrack: (swapId: number, rating: number) => void;
  onSendTrack: (swap: TrackSwap) => void;
}

export function TrackSwapCard({ swap, currentUser, userProfiles, onRateTrack, onSendTrack }: TrackSwapCardProps) {
  const [, setLocation] = useLocation();
  const isInitiator = swap.initiated_user === currentUser;
  const otherUser = isInitiator ? swap.matched_user : swap.initiated_user;
  const otherUserProfile = userProfiles[otherUser];

  const getSwapStatus = () => {
    if (isInitiator) {
      if (!swap.initiated_track_id) return 'pending';
      if (!swap.matched_track_id) return 'pending';
      if (!swap.initiated_reaction) return 'action_required';
      if (!swap.matched_reaction) return 'pending';
    } else {
      if (!swap.initiated_track_id) return 'pending';
      if (!swap.matched_track_id) return 'action_required';
      if (!swap.matched_reaction) return 'action_required';
      if (!swap.initiated_reaction) return 'pending';
    }
    return 'completed';
  };

  const status = getSwapStatus();
  const statusColors = {
    completed: 'bg-green-900/50 text-green-400',
    action_required: 'bg-yellow-900/50 text-yellow-400',
    pending: 'bg-blue-900/50 text-blue-400',
  };

  const statusText = {
    completed: 'Completed',
    action_required: 'Action Required',
    pending: 'Pending'
  };

  const statusVariants = {
    completed: 'completed',
    action_required: 'action_required',
    pending: 'pending',
  };

  const handleCardClick = () => {
    setLocation(`/track-swap-detail?id=${swap.id}`);
  };

  const handleProfileClick = () => {
    setLocation(`/profile/${otherUser.replace(/^@/, "")}`);
  };

  const handleActionClick = () => {
    // Prevent card click when clicking action buttons
  };

  return (
    <div 
      className={`rounded-lg p-3 cursor-pointer hover:bg-gray-750 transition-colors border-2 ${
        isInitiator ? 'bg-gray-800/30 border-gray-500/10' : 'bg-purple-900/15 border-purple-500/10'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center mb-4">
        <StatusTag label={statusText[status]} variant={statusVariants[status] as 'pending' | 'action_required' | 'completed'} />
        <span className="text-gray-400 text-sm">
          {new Date(swap.swap_initiated_timestamp).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Matched User Profile */}
          <h3 className="text-sm text-gray-400 mb-2">Matched with:</h3>
          <MatchProfileCard
            username={otherUser}
            profileImage={otherUserProfile?.profileImage || ''}
            swag={otherUserProfile?.swag || 0}
            onClick={handleProfileClick}
          />

        {/* Swap Summary */}
        {status === 'completed' && (
          <div className="mt-4 mb-4 p-4 rounded-xl" style={{background: 'linear-gradient(90deg, #2B185A 0%, #A21CAF 100%)'}}>
            <h3 className="text-lg mb-2 text-white font-semibold">Swap Results</h3>
            <div className="text-base text-white/80">
              {isInitiator 
                ? <>Your track received <span className="font-bold">+{swap.initiated_reaction || 0} swag</span></>
                : <>Your track received <span className="font-bold">+{swap.matched_reaction || 0} swag</span></>}
            </div>
            <div className="text-base text-white/80">
              {isInitiator
                ? <>Their track received <span className="font-bold">+{swap.matched_reaction || 0} swag</span></>
                : <>Their track received <span className="font-bold">+{swap.initiated_reaction || 0} swag</span></>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 