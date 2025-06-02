import ProfileHeader from "@/components/ProfileHeader";
import TopArtists from "@/components/TopArtists";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useLocation } from "wouter";
import { useAuth } from "@/AuthContext";
import TopBroadcastedTracks from "@/components/TopBroadcastedTracks";

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
			width="hug"
			variant="secondary"  
			className="!hover:bg-red-600 text-white" 
			onClick={logout}
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

        {userDetails && <TopBroadcastedTracks username={userDetails.profile} />}
        {userDetails && <TopArtists username={userDetails.profile} />}
      </main>
    </div>
  );
}
