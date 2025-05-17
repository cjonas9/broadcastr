import { useRoute, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

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
        <p className="text-center text-gray-400">
          This is a placeholder for the individual user profile page.
        </p>
      </div>
    </div>
  );
}
