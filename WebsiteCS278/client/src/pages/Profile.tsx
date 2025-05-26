// The user's personal profile page
import ProfileHeader from "@/components/ProfileHeader";
import { musicData } from "@/data/musicData";
import TopArtists from "@/components/TopArtists";
import {BottomToolbar} from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { useLocation } from "wouter";

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
        <TopArtists />
      </main>
    </div>
  );
}
