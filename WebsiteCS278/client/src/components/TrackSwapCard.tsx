import React, { MouseEvent } from 'react';
import { useLocation } from 'wouter';
import MatchProfileCard from './MatchProfileCard';
import SongCard from './SongCard';
import { ButtonWrapper } from './ButtonWrapper';

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
    action_required: 'bg-blue-900/50 text-blue-400',
    pending: 'bg-yellow-900/50 text-yellow-400'
  };

  const statusText = {
    completed: 'Completed',
    action_required: 'Action Required',
    pending: 'Pending'
  };

  const handleCardClick = () => {
    setLocation(`/track-swap-detail?id=${swap.id}`);
  };

  const handleProfileClick = () => {
    setLocation(`/profile/${otherUser.replace(/^@/, "")}`);
  };

  const handleSongClick = () => {
    // TODO: Add play functionality
  };

  const handleActionClick = () => {
    // Prevent card click when clicking action buttons
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center mb-4">
        <span className={`px-2 py-1 rounded text-sm ${statusColors[status]}`}>
          {statusText[status]}
        </span>
        <span className="text-gray-400 text-sm">
          {new Date(swap.swap_initiated_timestamp).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Matched User Profile */}
        <div className="mb-4">
          <h3 className="text-sm text-gray-400 mb-2">Matched with:</h3>
          <MatchProfileCard
            username={otherUser}
            profileImage={otherUserProfile?.profileImage || ''}
            swag={otherUserProfile?.swag || 0}
            onClick={handleProfileClick}
          />
        </div>

        {/* Initiated Track Section */}
        {swap.initiated_track_id && (
          <div>
            <h3 className="text-sm text-gray-400 mb-2">
              {isInitiator ? 'You sent:' : 'Received from match:'}
            </h3>
            <SongCard
              song={{
                id: swap.initiated_track_id,
                name: swap.initiated_track_name || '',
                artist: swap.initiated_artist_name || '',
                playCount: 0,
              }}
              className='bg-gray-700'
              showPlayButton={true}
              onClick={handleSongClick}
            />
            {swap.initiated_reaction && (
              <div className="mt-2 text-sm text-gray-400">
                Rating: {swap.initiated_reaction}/5
              </div>
            )}
          </div>
        )}

        {/* Matched Track Section */}
        {swap.matched_track_id && (
          <div>
            <h3 className="text-sm text-gray-400 mb-2">
              {isInitiator ? 'Received from match:' : 'You sent:'}
            </h3>
            <SongCard
              song={{
                id: swap.matched_track_id,
                name: swap.matched_track_name || '',
                artist: swap.matched_artist_name || '',
                playCount: 0
              }}
              className='bg-gray-700'
              showPlayButton={true}
              onClick={handleSongClick}
            />
            {swap.matched_reaction && (
              <div className="mt-2 text-sm text-gray-400">
                Rating: {swap.matched_reaction}/5
              </div>
            )}
          </div>
        )}

        {/* Action Required Sections */}
        {status === 'action_required' && (
          <div className="mt-4" onClick={handleActionClick}>
            {!swap.matched_track_id && !isInitiator && (
              <ButtonWrapper
                width="full"
                onClick={() => onSendTrack(swap)}
              >
                Send a Track
              </ButtonWrapper>
            )}
            {swap.matched_track_id && !isInitiator && !swap.matched_reaction && (
              <div className="space-y-2">
                <p className="text-center text-gray-400">Rate this track:</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onRateTrack(swap.id, rating)}
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {swap.initiated_track_id && isInitiator && !swap.initiated_reaction && (
              <div className="space-y-2">
                <p className="text-center text-gray-400">Rate this track:</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onRateTrack(swap.id, rating)}
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 