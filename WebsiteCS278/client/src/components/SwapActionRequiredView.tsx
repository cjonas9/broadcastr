import React, { useState } from 'react';
import { Heading } from './Heading';
import MatchProfileCard from './MatchProfileCard';
import SongCard, { Song } from './SongCard';
import TrackSelector from './TrackSelector';
import { ButtonWrapper } from './ButtonWrapper';
import StatusTag from './StatusTag';

interface UserProfile {
  username: string;
  profileImage: string;
  swag: number;
}

interface SwapActionRequiredViewProps {
  isReceiver: boolean;
  otherUser: string;
  otherUserProfile: UserProfile;
  receivedTrack?: Song;
  selectedTrack?: Song | null;
  onProfileClick: () => void;
  onRateTrack?: (rating: number) => void;
  onTrackSelect?: (track: Song) => void;
  onSendTrack?: () => void;
  ratingStage: 'rate' | 'select';
  ratingValue?: number;
  isSending?: boolean;
}

const SwapActionRequiredView: React.FC<SwapActionRequiredViewProps> = ({
  isReceiver,
  otherUser,
  otherUserProfile,
  receivedTrack,
  selectedTrack,
  onProfileClick,
  onRateTrack,
  onTrackSelect,
  onSendTrack,
  ratingStage,
  ratingValue,
  isSending
}) => {
  const [localRating, setLocalRating] = useState<number | undefined>(ratingValue);

  const handleRate = (rating: number) => {
    setLocalRating(rating);
  };

  const handleSend = () => {
    if (typeof localRating === 'number' && onRateTrack) {
      onRateTrack(localRating);
    }
    if (onSendTrack) {
      onSendTrack();
    }
  };

  const canSend = isReceiver
    ? typeof localRating === 'number' && !!selectedTrack && !isSending
    : typeof localRating === 'number' && !isSending;

  return (
    <div>
      <Heading level={2} serif={true}>
        You Received a Track Swap
      </Heading>
      <div className="mb-3">
        <StatusTag label="Action Required" variant="action_required" />
      </div>
      <p className="mb-8 text-gray-400 text-md">
        {isReceiver
          ? 'Rate the track you received and send a track from your recent top tracks. The more your match likes it, the more swag points you get!'
          : 'Let your match know how much you like the track they sent you. This determines how many swag points they get!'}
      </p>
      <div className="mb-6">
        <h3 className="text-base text-gray-400 mb-2">Your match</h3>
        <MatchProfileCard
          username={otherUser}
          profileImage={otherUserProfile?.profileImage || ''}
          swag={otherUserProfile?.swag || 0}
          onClick={onProfileClick}
        />
      </div>
      <div className="mb-2">
        <h3 className="text-base text-gray-400 mb-2">Received Track</h3>
        {receivedTrack && (
          <SongCard song={receivedTrack} selected={true} showPlayButton={true}/>
        )}
      </div>
      {/* Rating section */}
      <div className="mt-8 mb-8">
        <p className="mb-4 text-gray-400 text-base">How much swag would you award this track based on how much you like it?</p>
        <div className="flex justify-center space-x-2 mb-8">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRate(rating)}
              className={`w-12 h-12 rounded-lg text-lg font-bold border-2 transition-colors ${
                localRating === rating
                  ? 'bg-violet-700 border-violet-400 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
      {/* Track selector for receiver */}
      {isReceiver && (
        <div className="mb-6">
          <TrackSelector
            selectedTrack={selectedTrack ?? null}
            onTrackSelect={onTrackSelect ?? (() => {})}
            username={otherUser}
            label="Select a track to send them"
          />
        </div>
      )}
      <ButtonWrapper
        width="full"
        onClick={handleSend}
        disabled={!canSend}
        className={`mt-4 text-lg mb-24 ${!canSend ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isReceiver ? 'Send Rating & Track' : 'View Swap Results'}
      </ButtonWrapper>
    </div>
  );
};

export default SwapActionRequiredView; 