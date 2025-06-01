import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
  } from "react";
  
  // -----------------------------------------------------------------------------
  // 1. UserDetails type (matches /api/user/profile response fields)
  // -----------------------------------------------------------------------------
  export interface UserDetails {
	id: number;
	profile: string;
	firstname: string;
	lastname: string;
	email: string;
	profileurl: string;
	bootstrapped: number;
	admin: number;
	lastlogin: string;
	pfpsm: string;
	pfpmed: string;
	pfplg: string;
	pfpxl: string;
	swag: number;
  }
  
  // -----------------------------------------------------------------------------
  // 2. AuthContextType (kept backwards‐compatible fields, plus new login/logout)
  // -----------------------------------------------------------------------------
  interface AuthContextType {
	isLoggedIn: boolean;
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  
	// for backward compatibility:
	username: string;
	setUsername: React.Dispatch<React.SetStateAction<string>>;
  
	// newly added:
	userDetails: UserDetails | null;
	setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  
	login: (username: string, password: string) => Promise<void>;
	logout: () => void;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  interface AuthProviderProps {
	children: ReactNode;
  }
  
  const VITE_API_URL = "https://broadcastr.onrender.com";
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	// keep old pieces for backward compatibility
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [username, setUsername] = useState("");
  
	// new state to hold full UserDetails
	const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  
	// === Persist/rehydrate on startup ===
	useEffect(() => {
	  // If you stored “bc_user” in localStorage (as { username }), rehydrate
	  const saved = localStorage.getItem("bc_user");
	  if (saved) {
		const { username: savedUsername } = JSON.parse(saved) as {
		  username: string;
		};
		if (savedUsername) {
		  setUsername(savedUsername);
		  setIsLoggedIn(true);
		  // fetch profile immediately
		  fetchUserProfile(savedUsername);
		}
	  }
	}, []);
  
	// === Helper to fetch and store full profile ===
	const fetchUserProfile = async (user: string) => {
	  try {
		const res = await fetch(
		  `${VITE_API_URL}/api/user/profile?user=${encodeURIComponent(user)}`
		);
		if (!res.ok) throw new Error("Failed to fetch user profile");
		const { userProfile } = await res.json();
		// userProfile is an array; take first element
		const details: UserDetails = userProfile[0];
		setUserDetails(details);
	  } catch (err) {
		console.error("Error fetching user profile:", err);
		// If profile fetch fails (e.g. invalid session), force logout:
		setUserDetails(null);
		setIsLoggedIn(false);
		setUsername("");
		localStorage.removeItem("bc_user");
	  }
	};
  
	// === Combined login(username, password) method ===
	const login = async (user: string, password: string) => {
	  // 1. call your /api/user/login
	  try {
		const loginRes = await fetch(
		  `${VITE_API_URL}/api/user/login?user=${encodeURIComponent(
			user
		  )}&password=${encodeURIComponent(password)}`,
		  { method: "POST" }
		);
		if (!loginRes.ok) {
		  const err = await loginRes.json();
		  throw new Error(err.error || "Login failed");
		}
  
		// 2. If login OK, set basic flags & persist username
		setIsLoggedIn(true);
		setUsername(user);
		localStorage.setItem("bc_user", JSON.stringify({ username: user }));
  
		// 3. Then fetch the full profile and store in userDetails
		await fetchUserProfile(user);
	  } catch (err) {
		console.error("Login error:", err);
		// In case of error, make sure we remain logged out
		setIsLoggedIn(false);
		setUsername("");
		setUserDetails(null);
		localStorage.removeItem("bc_user");
		throw err; // rethrow so caller can show an alert
	  }
	};
  
	// === Combined logout method ===
	const logout = () => {
	  setIsLoggedIn(false);
	  setUsername("");
	  setUserDetails(null);
	  localStorage.removeItem("bc_user");
	};
  
	return (
	  <AuthContext.Provider
		value={{
		  isLoggedIn,
		  setIsLoggedIn, // existing code can still call this
		  username,
		  setUsername, // existing code can still call this
		  userDetails,
		  setUserDetails,
		  login,
		  logout,
		}}
	  >
		{children}
	  </AuthContext.Provider>
	);
  };
  
  export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
	  throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
  };
  