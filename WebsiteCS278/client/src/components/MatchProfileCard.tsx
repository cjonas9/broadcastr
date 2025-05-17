import { ChevronRight } from "lucide-react";

interface MatchProfileCardProps {
  username: string;
  profileImage: string;
  swag: number;
  onClick?: () => void;
}

export default function MatchProfileCard({ username, profileImage, swag, onClick }: MatchProfileCardProps) {
  return (
    <div
      className="flex items-center bg-gray-800 rounded-xl shadow p-4 cursor-pointer hover:bg-gray-700 transition group max-w-xl w-full"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <img
        src={profileImage}
        alt={`${username} profile`}
        className="w-16 h-16 rounded-full object-cover border-2 border-purple-400 mr-4"
      />
      <div className="flex-1">
        <div className="text-lg font-semibold text-white">{username}</div>
        <div className="flex items-center mt-1">
          <span className="text-purple-300 font-medium text-sm">⚡ {swag} Swag</span>
        </div>
      </div>
      <ChevronRight className="h-7 w-7 text-gray-400 group-hover:text-white ml-2" />
    </div>
  );
}
