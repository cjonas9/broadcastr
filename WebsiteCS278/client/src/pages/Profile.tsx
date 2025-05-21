import ProfileHeader from "@/components/ProfileHeader";
import { musicData } from "@/data/musicData";
import TopArtists from "@/components/TopArtists";
import ExplorationZones from "@/components/ExplorationZones";
import {BottomToolbar} from "@/components/BottomToolbar";

export default function Profile() {
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
        <TopArtists />
        <ExplorationZones />
      </main>
    </div>
  );
}
