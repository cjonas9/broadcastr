import React from "react";

interface SwapPointsCardProps {
  username: string;
  profileImage: string;
  swag: number;
  pointsAdded?: number;
}

export default function SwapPointsCard({ username, profileImage, swag, pointsAdded = 5 }: SwapPointsCardProps) {
  return (
    <div className="flex items-center bg-gray-800 rounded-2xl p-4 mb-4 w-full max-w-2xl mx-auto">
      <img
        src={profileImage}
        alt={`${username} profile`}
        className="w-14 h-14 rounded-full object-cover mr-4"
      />
      <div className="flex-1">
        <div className="text-lg font-semibold text-white">{username}</div>
        <div className="inline-flex items-center mt-2 bg-purple-200 text-purple-900 font-semibold px-3 py-1 rounded-lg text-base shadow-sm">
          <span className="mr-2">⚡</span> {swag} Swag
        </div>
      </div>
      <div className="text-purple-500 text-2xl font-bold ml-4">+{pointsAdded}</div>
    </div>
  );
} 