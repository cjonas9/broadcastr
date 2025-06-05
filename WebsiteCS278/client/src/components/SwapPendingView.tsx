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
  receivedTrack?: Song;
  receivedRating?: number;
  onProfileClick: () => void;
  isInitiator: boolean;
}

const SwapPendingView: React.FC<SwapPendingViewProps> = ({
  otherUser,
  otherUserProfile,
  sentTrack,
  receivedTrack,
  receivedRating,
  onProfileClick,
  isInitiator
}) => (
  <div className="mb-24">
    <Heading level={2} serif={true} className="mb-3">
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
    {!isInitiator && receivedTrack && (
      <>
        <div className="mb-4">
          <h3 className="text-base text-gray-400 mb-2">You Received</h3>
          <SongCard song={receivedTrack} selected={true} showPlayButton={true} />
        </div>
        {receivedRating && (
          <div className="mb-8 p-4 rounded-xl" style={{background: 'linear-gradient(90deg, #2B185A 0%, #A21CAF 100%)'}}>
            <h3 className="text-lg mb-2 text-white font-semibold">Your Rating</h3>
            <div className="text-base text-white/80">You awarded <span className="font-bold">+{receivedRating} swag</span> to this track</div>
          </div>
        )}
      </>
    )}
    <div className="mb-2">
      <h3 className="text-base text-gray-400 mb-2">You Sent</h3>
      <SongCard song={sentTrack} selected={true} showPlayButton={true} />
    </div>
  </div>
);

export default SwapPendingView; 