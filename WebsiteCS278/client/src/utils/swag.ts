const BACKEND_API_URL = "https://broadcastr.onrender.com";
const BACKEND_API_URL_LOCAL = "http://localhost:8000";

/**
 * Fetches a user's current swag points
 */
export async function fetchSwag(username: string): Promise<number | null> {
  try {
    const res = await fetch(
      // `${BACKEND_API_URL}/api/user/profile?user=${encodeURIComponent(username)}`
      `${BACKEND_API_URL_LOCAL}/api/user/profile?user=${encodeURIComponent(username)}`
    );
    const data = await res.json();
    if (data.userProfile && data.userProfile.length > 0) {
      return data.userProfile[0].swag;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch swag:", err);
    return null;
  }
}

/**
 * Awards swag points to a user
 */
export async function awardSwag(username: string, points: number): Promise<{
  previous_swag: number;
  added_swag: number;
  new_swag: number;
} | null> {
  try {
    const res = await fetch(
      // `${BACKEND_API_URL}/api/user/add-swag?user=${encodeURIComponent(username)}&swag=${points}`,
      `${BACKEND_API_URL_LOCAL}/api/user/add-swag?user=${encodeURIComponent(username)}&swag=${points}`,
      { method: "POST" }
    );
    const data = await res.json();
    // The existing endpoint returns "updated swag balance" instead of the detailed response
    // So we'll construct the response object from the current swag and points
    const currentSwag = await fetchSwag(username);
    if (currentSwag === null) return null;
    
    return {
      previous_swag: currentSwag - points,
      added_swag: points,
      new_swag: currentSwag
    };
  } catch (err) {
    console.error("Failed to award swag:", err);
    return null;
  }
} 