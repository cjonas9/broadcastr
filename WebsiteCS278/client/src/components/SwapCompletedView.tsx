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

interface SwapCompletedViewProps {
  otherUser: string;
  otherUserProfile: UserProfile;
  sentTrack: Song;
  receivedTrack: Song;
  sentSwag: number;
  receivedSwag: number;
  onProfileClick: () => void;
}

const SwapCompletedView: React.FC<SwapCompletedViewProps> = ({
  otherUser,
  otherUserProfile,
  sentTrack,
  receivedTrack,
  sentSwag,
  receivedSwag,
  onProfileClick
}) => (
  <div className="mb-24">
    <Heading level={2} serif={true} className="mb-6 text-4xl text-white">
      Track Swap Results
    </Heading>
    <div className="mb-4">
      <StatusTag label="Complete" variant="completed" />
    </div>
    <p className="mb-8 text-gray-400 text-md">
      See how many swag points you rewarded each other's track swap!
    </p>
    <div className="mb-8 p-4 rounded-xl" style={{background: 'linear-gradient(90deg, #2B185A 0%, #A21CAF 100%)'}}>
      <h3 className="text-lg mb-2 text-white font-semibold">Swap Results</h3>
      <div className="text-base text-white/80">Your track received <span className="font-bold">+{sentSwag} swag</span></div>
      <div className="text-base text-white/80">Their track received <span className="font-bold">+{receivedSwag} swag</span></div>
    </div>
    <div className="mb-6">
      <h3 className="text-base text-gray-400 mb-2">Your match</h3>
      <MatchProfileCard
        username={otherUser}
        profileImage={otherUserProfile?.profileImage || ''}
        swag={otherUserProfile?.swag || 0}
        onClick={onProfileClick}
      />
    </div>
    <div className="mb-4">
      <h3 className="text-base text-gray-400 mb-2">You Sent</h3>
      <SongCard song={sentTrack} selected={true} showPlayButton={true} />
    </div>
    <div className="mb-2">
      <h3 className="text-base text-gray-400 mb-2">You Received</h3>
      <SongCard song={receivedTrack} selected={true} showPlayButton={true} />
    </div>
  </div>
);

export default SwapCompletedView; 