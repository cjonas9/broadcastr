import ProfileHeader from "@/components/ProfileHeader";
import { musicData } from "@/data/musicData";
import TopArtists from "@/components/TopArtists";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useLocation } from "wouter";
import TopTrackPost from "@/components/TopTrackPost";
import { useAuth } from "@/AuthContext";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { userDetails, logout } = useAuth();

  return (
    <div className="bg-gray-900 min-h-screen">
      <BottomToolbar />

      {userDetails ? (
        <>
		<ProfileHeader
		  username={"@" + userDetails.profile}
		  profileImage={
			userDetails.pfpmed ||
			userDetails.pfpsm ||
			userDetails.pfpxl ||
			""
		  }
		  swag={userDetails.swag}
		/>

		<div className="flex justify-center my-4">
		  <ButtonWrapper
			width="full"
			className="bg-red-600 text-white"
			onClick={() => logout()}
		  >
			Sign Out
		  </ButtonWrapper>
		</div>
	  </>
      ) : (
        <div className="text-center text-white pt-4">
          <p>Log in to see your profile data!</p>
          <div className="mt-2">
            <ButtonWrapper
              width="full"
              className="mb-4"
              onClick={() => setLocation("/login")}
            >
              Log In
            </ButtonWrapper>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto px-4 pb-16">
        {/* <ButtonWrapper
          width="full"
          className="mb-4"
          onClick={() => setLocation("/login")}
        >
          Log in Page
        </ButtonWrapper> */}

        {/* Top Broadcasted Tracks Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-white">Top Broadcasted Tracks</h2>
          <p className="text-sm text-gray-400 mb-4">
            Tracks you broadcasted that were most liked by other broadcastrs
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
