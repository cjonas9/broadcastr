import { useLocation } from "wouter";
import { ArrowLeft, ChevronRightIcon } from "lucide-react";
import { musicData } from "@/data/musicData";

export default function Friends() {
  const [, setLocation] = useLocation();

  const friends = musicData.friends;
  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </div>

        {/* Page Title */}
        <h2 className="text-center text-xl font-semibold text-white mb-2">
          You’re in the same boat!
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Friends with similar music taste to you
        </p>

        {/* Friends List */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {friends.map((friend, index) => (
            <div
              key={friend.id}
              className={`flex items-center p-4 ${
                index < friends.length - 1 ? "border-b border-gray-700" : ""
              }`}
            >
              <div className="flex items-center w-8">
                <span className="font-bold text-white">{index + 1}</span>
              </div>
              <div className="flex-1 flex items-center">
                <img
                  src={friend.profileImage}
                  alt={friend.username}
                  className="h-10 w-10 rounded-full mr-3 object-cover"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{friend.username}</div>
                  <div className="text-gray-400 text-sm">{friend.scrobbles.toLocaleString()} scrobbles</div>
                </div>
                <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setLocation(`/profile/${friend.id}`)}
                    aria-label={`View ${friend.username} profile`}
                >
                <ChevronRightIcon className="h-5 w-5" />
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
