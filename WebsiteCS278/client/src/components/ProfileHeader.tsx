import { LightningBoltIcon } from "@/lib/icons";

type ProfileHeaderProps = {
  username: string;
  profileImage: string;
  swag: number;
  showActions?: boolean;
  onMessageClick?: () => void;
};

export default function ProfileHeader({ username, profileImage, swag, showActions = false, onMessageClick }: ProfileHeaderProps) {
  return (
    <header className="flex flex-col items-center pt-10 pb-4">
      <div className="w-28 h-28 rounded-full bg-gray-800 overflow-hidden mb-3 border-2 border-[#7C3AED]">
        <img 
          src={profileImage}
          alt={`${username} profile`} 
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-xl font-bold text-white">{username}</h1>
      
      <div className="flex items-center mt-3 px-4 py-2 bg-[#7C3AED] rounded-full">
        <LightningBoltIcon className="h-5 w-5 mr-1 text-yellow-300" />
        <span className="text-white font-medium">{swag} Swag</span>
      </div>

      {/* Extra buttons */}
      {showActions && (
        <div className="mt-4 flex gap-4">
          <button className="bg-white text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition" onClick={onMessageClick}>
            Message
          </button>
          <button className="bg-purple-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-purple-500 transition">
            Spotify Profile
          </button>
        </div>
      )}
    </header>
  );
}
