# Broadcastr: a social music listening app
Broadcastr aims to connect Stanford's music lovers on the basis of their shared music tastes. Our platform is seamlessly integrated with Last.fm, allowing users to have their music stats on the platform without any overhead beyond having a Last.fm account.

Developed by Christian Jonas, Lucas Scott, Asher Hensley, and Madison Fan.

## Key Features/Pages

### Feed
- Real-time feed that shows community's broadcasts (track posts with captions), with like functionality
- Show off your favorite track discoveries by making your own broadcasts
- Direct message others on the platform from this home page
- See other's activity on the platform

### Search & Profile Discovery
- Search for users on the platform by username
- View other's user profiles with:
  - Top artists with play counts
  - Most liked broadcasts
  - Follow/unfollow functionality
  - Direct message integration
- Artist exploration with detailed listening statistics

### Track Swap
- Music recommendation system through track swapping
  - Send/receive tracks from others in the Stanford community
- Rate, and have your received tracks rated! High ratings earn your profile Swag points
- Track swap history and statistics

### Profile Page
- Your personal music statistics dashboard
- Top artists are displayed with play counts
- Most broadcasted tracks with like counts

### Artist Pages
On each artist's page (accessible through one's own profile or a friend's), view:
- The top 5 listeners of the artist at Stanford and how many listens each listener has for this artist
- Your placement on this leaderboard, and your listens to this artist
- Determine if you are truly "the biggest Taylor Swift fan at Stanford"

## Implementation

### Backend
- All data powered by an SQL database tracking relevant user stats, posts, and actions
- Data added to this table through a custom Python Flask API we designed
  - Makes queries to Last.fm's API as necessary

### Frontend
- React with TypeScript for type-safe development
- Tailwind CSS for modern, responsive styling
- React queries made to backend for efficient data fetching and caching

## Demo
We were hosting this through Render, which enabled us to make live updates to the database (as it was stored through Render). Because this project has concluded, the demo that we have here is now on the free plan, which means our SQL database can no longer be updated in real-time (as it is stored through git). Functionality can still be seen through our static demo.

To view our demo, visit https://broadcastr-backend2.onrender.com/ to launch the backend. Then, visit https://broadcastr-tde6.onrender.com/ to launch the main website. This process may take a minute for each to load/build.
