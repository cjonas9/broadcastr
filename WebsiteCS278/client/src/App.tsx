import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Profile";
import ArtistDetail from "@/pages/ArtistDetail";
import ExplorationDetail from "@/pages/ExplorationDetail";
import Friends from "./pages/Friends";
import ProfilePage from "./pages/ProfilePage";
import FriendProfile from "./pages/FriendProfile";
import TrackSwap from "./pages/TrackSwap";
import TrackSwapEntry from "./pages/TrackSwapEntry";
import TrackSwapConfirmation from "./pages/TrackSwapConfirmation";
import { SwapProvider } from "./context/SwapContext";
import TrackSwapResults from "./pages/TrackSwapResults";
import SwapPointsResults from "./pages/SwapPointsResults";
import DirectMessage from "./pages/DirectMessage";
import Feed from "./pages/Feed";
import Profile from "@/pages/Profile";
import BroadcastTrack from "./pages/BroadcastTrack";
import LogIn from "@/pages/LogIn";
import SignUp from "@/pages/SignUp";
import { AuthProvider } from "./AuthContext";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import SearchPage from "./pages/SearchPage";
import TrackSwapHistory from "./pages/TrackSwapHistory";
import TrackSwapDetail from "./pages/TrackSwapDetail";
import TrackSwapAction from "./pages/TrackSwapAction";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Feed} />
      <Route path="/login" component={LogIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/artist/:id" component={ArtistDetail} />
      <Route path="/exploration/:id" component={ExplorationDetail} />
      <Route path="/friends" component={Friends} />
      <Route path="/profile/:id" component={FriendProfile} />
      <Route path="/track-swap-entry" component={TrackSwapEntry}/>
      <Route path="/track-swap" component={TrackSwap}/>
      <Route path="/track-swap-confirmation" component={TrackSwapConfirmation}/>
      <Route path="/track-swap-results" component={TrackSwapResults}/>
      <Route path="/swap-points-results" component={SwapPointsResults}/>
      <Route path="/track-swap-history" component={TrackSwapHistory}/>
      <Route path="/track-swap-detail" component={TrackSwapDetail}/>
      <Route path="/track-swap-action" component={TrackSwapAction}/>
      <Route path="/dm/:username" component={DirectMessage}/>
      <Route path="/profile" component={Profile}/>
      <Route path="/broadcast-track" component={BroadcastTrack}/>
      <Route path="/followers/:username" component={FollowersPage} />
      <Route path="/following/:username" component={FollowingPage} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <SwapProvider>
            <Router />
            <Toaster />
          </SwapProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
