import React from 'react';
import { Heading } from './Heading';
import MatchProfileCard from './MatchProfileCard';
import SongCard, { Song } from './SongCard';
import StatusTag from './StatusTag';

interface UserProfile {
  username: string;
  profileImage: string;
  swag: number;
}

interface SwapPendingViewProps {
  otherUser: string;
  otherUserProfile: UserProfile;
  sentTrack: Song;
  onProfileClick: () => void;
  isInitiator: boolean;
}

const SwapPendingView: React.FC<SwapPendingViewProps> = ({
  otherUser,
  otherUserProfile,
  sentTrack,
  onProfileClick,
  isInitiator
}) => (
  <div>
    <Heading level={2} serif={true}>
      {isInitiator ? "You Initiated a Track Swap" : "You've Responded to a Track Swap"}
    </Heading>
    <div className="mb-3">
      <StatusTag label="Pending" variant="pending" />
    </div>
    <p className="mb-8 text-gray-400 text-md">
      {isInitiator ? "Waiting for your match to respond with a track and rating..." : "Waiting for your match to rate your track..."}
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
      <h3 className="text-base text-gray-400 mb-2">You Sent</h3>
      <SongCard song={sentTrack} selected={true} showPlayButton={true} />
    </div>
  </div>
);

export default SwapPendingView; 