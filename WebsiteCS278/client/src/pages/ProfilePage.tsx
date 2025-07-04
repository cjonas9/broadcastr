// Placeholder page for another user's profile page
import { useRoute, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import TopTrackPost from "@/components/TopTrackPost";
import { musicData } from "@/data/musicData";

export default function ProfilePage() {
  const [, params] = useRoute<{ id: string }>("/profile/:id");
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 cursor-pointer"
          onClick={() => setLocation("/friends")}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Friends
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">
          Profile for User ID: {params?.id}
        </h1>
        <p className="text-center text-gray-400 mb-8">
          This is a placeholder for the individual user profile page.
        </p>

        {/* Top Broadcasted Tracks Section */}
        <section className="mt-8">
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
      </div>
    </div>
  );
}
