import ProfileHeader from "@/components/ProfileHeader";
import { musicData } from "@/data/musicData";
import TopArtists from "@/components/TopArtists";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useLocation } from "wouter";
import { FeedPost } from "@/components/FeedPost";

export default function Profile() {
  const [, setLocation] = useLocation();
  const user = musicData.user;

  return (
    <div className="bg-gray-900 min-h-screen">
      <BottomToolbar />
      <ProfileHeader 
        username={user.username}
        profileImage={user.profileImage}
        swag={user.swag}
      />
      <main className="max-w-md mx-auto px-4 pb-16">
        <ButtonWrapper  
          width="full"
          className="mb-4"
          onClick={() => setLocation("/login")}
        >  
          Log in Page
        </ButtonWrapper>

        {/* Top Broadcasted Tracks Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-white">Top Broadcasted Tracks</h2>
          <p className="text-sm text-gray-400 mb-4">
            Tracks you broadcasted that were most liked by other broadcastrs
          </p>
          <FeedPost
            user={musicData.friends[0]}
            timeAgo="1 hr ago"
            content="My new jam of the week"
            type="track"
            track={musicData.mockSongs[0]}
            likes={16}
          />
          <div className="mt-4">
            <button className="w-full bg-purple-600 text-white py-2 rounded-md text-center text-sm font-semibold">
              Explore All
            </button>
          </div>
        </section>

        <TopArtists />
      </main>
    </div>
  );
}
