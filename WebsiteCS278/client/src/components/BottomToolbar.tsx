/* 
BottomToolBar.tsx: Component for the bottom toolbar
-------------------------------------------------
EXAMPLE USAGE:
<BottomToolbar />
*/

import { User, List, Star, Search } from "lucide-react";
import { useLocation } from "wouter";

export type BottomToolbarTab = "profile" | "feed" | "search" | "trackswap";

interface BottomToolbarProps {
  active: BottomToolbarTab;
  onChange: (value: BottomToolbarTab) => void;
}

const BottomToolbarNoRouting: React.FC<BottomToolbarProps> = ({ active, onChange }) => (
  <nav
    className="fixed bottom-0 left-0 right-0 h-16 bg-neutral-900 border-t border-neutral-800 flex justify-around items-center z-50"
    aria-label="Bottom Navigation"
  >
    <button
      className={`flex flex-col items-center flex-1 py-2 text-white transition-colors
        ${active === "feed" ? "text-purple-400" : "hover:text-purple-300"}
      `}
      aria-label="Feed"
      aria-current={active === "feed" ? "page" : undefined}
      onClick={() => onChange("feed")}
      type="button"
    >
      <List size={20} />
      <span className="text-xs mt-1">Feed</span>
    </button>

    <button
      className={`flex flex-col items-center flex-1 py-2 text-white transition-colors
        ${active === "search" ? "text-purple-400" : "hover:text-purple-300"}
      `}
      aria-label="Search"
      aria-current={active === "search" ? "page" : undefined}
      onClick={() => onChange("search")}
      type="button"
    >
      <Search size={20} />
      <span className="text-xs mt-1">Search</span>
    </button>

    <button
      className={`flex flex-col items-center flex-1 py-2 text-white transition-colors
        ${active === "trackswap" ? "text-purple-400" : "hover:text-purple-300"}
      `}
      aria-label="Track Swap"
      aria-current={active === "trackswap" ? "page" : undefined}
      onClick={() => onChange("trackswap")}
      type="button"
    >
      <Star size={20} />
      <span className="text-xs mt-1">Track Swap</span>
    </button>

    <button
      className={`flex flex-col items-center flex-1 py-2 text-white transition-colors
        ${active === "profile" ? "text-purple-400" : "hover:text-purple-300"}
      `}
      aria-label="Profile"
      aria-current={active === "profile" ? "page" : undefined}
      onClick={() => onChange("profile")}
      type="button"
    >
      <User size={20} />
      <span className="text-xs mt-1">Profile</span>
    </button>
  </nav>
);

function tabForPath(pathname: string): BottomToolbarTab {
  if (pathname === "/") return "feed";
  if (pathname === "/profile") return "profile";
  if (pathname === "/search") return "search";
  if (pathname === "/track-swap") return "trackswap";
  return "profile";
}

export function BottomToolbar() {
  const [location, setLocation] = useLocation();
  const activeTab = tabForPath(location);

  const handleTabChange = (tab: BottomToolbarTab) => {
    if (tab === "feed") setLocation("/");
    if (tab === "profile") setLocation("/profile");
    if (tab === "search") setLocation("/search");
    if (tab === "trackswap") setLocation("/track-swap-entry");
  };

  return (
    <BottomToolbarNoRouting active={activeTab} onChange={handleTabChange} />
  );
}

export default BottomToolbar;