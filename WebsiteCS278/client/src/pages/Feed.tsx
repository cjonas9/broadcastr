/* 
Feed.tsx: Page for the feed feature
-----------------------------------
TODO:
- Connect feed to backend of real users
- Save feed posts to backend database
- need to replace mock posts with real posts
*/

import React, { useState } from "react";
import { BottomToolbar } from "@/components/BottomToolbar";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { Plus, Star } from "lucide-react";
import SwagTag from "@/components/SwagTag";
import { Heading } from "@/components/Heading";
import { FeedPost } from "@/components/FeedPost";
import { musicData } from "@/data/musicData";
import { useLocation } from "wouter";

export default function Feed() {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between p-6">
      <div className="max-w-md mx-auto w-full flex-1">
      <Heading level={1}>Discovery Feed</Heading>
      <p className="text-lg text-gray-500 mb-4">Explore other users' activity and their recommended tracks</p>
        <div className="space-y-6">
          <FeedPost
            user={musicData.friends[1]}
            timeAgo="1 hr ago"
            content="reached top 5 and received +5 swag"
            type="activity-link"
            linkText="Beyonce's weekly top listeners"
            linkHref="/beyonce/top-listeners"
            likes={16}
          />

          <FeedPost
            user={musicData.friends[1]}
            timeAgo="1 hr ago"
            content="received +5 swag from track swap with @josh132"
            type="activity"
            likes={16}
          />

          <FeedPost
            user={musicData.friends[0]}
            timeAgo="1 hr ago"
            content="My new jam of the week"
            type="track"
            track={musicData.mockSongs[0]}
            likes={16}
          />

          <FeedPost
            user={musicData.friends[0]}
            timeAgo="1 hr ago"
            content="My new jam of the week"
            type="track"
            track={musicData.mockSongs[0]}
            likes={16}
          />

          <FeedPost
            user={musicData.friends[0]}
            timeAgo="1 hr ago"
            content="My new jam of the week"
            type="track"
            track={musicData.mockSongs[0]}
            likes={16}
          />
        </div>

        <ButtonWrapper
          variant="primary"
          icon={<Plus size={16} />}
          width="hug"
          className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50"
          onClick={() => setLocation("/broadcast-track")}
        >
          Broadcast Track
        </ButtonWrapper>
      </div>
      <BottomToolbar />
    </div>
  );
}