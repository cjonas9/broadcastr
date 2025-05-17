import ProfileHeader from "@/components/ProfileHeader";
import { musicData } from "@/data/musicData";
import TopArtists from "@/components/TopArtists";
import ExplorationZones from "@/components/ExplorationZones";
import DropDownMenu from "@/components/DropDownMenu";

export default function Home() {
  const user = musicData.user;
  return (
    <div className="bg-gray-900 min-h-screen">
      <DropDownMenu />
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
