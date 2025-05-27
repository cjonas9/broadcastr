// Placeholder page for a user's profile page that is not yet a friend
import { useRoute, useLocation } from "wouter";
import { musicData } from "@/data/musicData";
import ProfileHeader from "@/components/ProfileHeader";
import TopArtists from "@/components/TopArtists";
import ExplorationZones from "@/components/ExplorationZones"; // optional
import DropDownMenu from "@/components/DropDownMenu";
import TopTrackPost from "@/components/TopTrackPost";
import { useState } from "react";

export default function FriendProfile() {
  const [, params] = useRoute<{ id: string }>("/profile/:id");
  const [, setLocation] = useLocation();
  const friendId = params?.id ? parseInt(params.id) : null;

  const friend = musicData.friends.find(f => f.id === friendId);
  console.log("friend.topArtists", friend?.topArtists);
  console.log("Friend ID from URL:", friendId);

  if (!friend) {
	const [requestSent, setRequestSent] = useState(false);
  
	return (
	  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
		<p className="text-lg mb-4">Friend not found.</p>
  
		<button
		  onClick={() => setRequestSent(true)}
		  className="px-4 py-2 mb-4 bg-purple-700 text-white rounded-xl hover:bg-purple-600 transition-colors"
		  disabled={requestSent}
		>
		  {requestSent ? "Friend Request Sent!" : "Send Friend Request?"}
		</button>
  
		<div
		  className="text-purple-400 hover:text-purple-300 cursor-pointer"
		  onClick={() => setLocation("/friends")}
		>
		  ← Back to Friends
		</div>
	  </div>
	);
  }
  return (
    <div className="bg-gray-900 min-h-screen">
    <DropDownMenu />
      <ProfileHeader
        username={friend.username}
        profileImage={friend.profileImage}
        swag={friend.swag}
        showActions={true}
        onMessageClick={() => setLocation(`/dm/${friend.id}`)}
      />
      <main className="max-w-md mx-auto px-4 pb-16">
        {/* Top Broadcasted Tracks Section */}
        <section className="mt-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Top Broadcasted Tracks</h2>
          <p className="text-sm text-gray-400 mb-4">
            Tracks broadcasted that were most liked by other broadcastrs
          </p>
          <TopTrackPost
            track={{
              id: musicData.mockSongs[0].id,
              title: musicData.mockSongs[0].title,
              artist: musicData.mockSongs[0].artist,
              albumArt: musicData.mockSongs[0].albumArt,
              trackLink: musicData.mockSongs[0].trackLink
            }}
            likes={16}
          />
        </section>

        <TopArtists artists={friend.topArtists} />
        <ExplorationZones artists={friend.topArtists} />
      </main>
    </div>
  );
}
