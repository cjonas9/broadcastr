import requests
import pprint as pp

key = "68237ca563ba0ac6a5915f31452b32d1"
shared_secret = "08921d66963667bccb9f00fe9b35d6e9" # used where?


# NOTE: PERIOD CAN BE "7day", "1month", "12month", or "overall"
def get_top_artists(username, period, api_key=key, limit=20):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user={username}&api_key={api_key}&format=json&limit={limit}&period={period}"
	return requests.get(url).json()

def get_top_tracks(username, period, api_key=key, limit=50):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user={username}&api_key={api_key}&format=json&limit={limit}&period={period}"
	return requests.get(url).json()

# NOTE: PERIOD CAN BE "7day", "1month", "12month", or "overall"
def get_artist_playcount(username, artist_name, period, api_key=key):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user={username}&api_key={api_key}&format=json&limit=1000&period={period}"
	data = requests.get(url).json()
	for artist in data.get("topartists", {}).get("artist", []):
		if artist["name"].lower() == artist_name.lower():
			return int(artist["playcount"])
	return 0

# NOTE: PERIOD CAN BE "7day", "1month", "12month", or "overall"
def get_track_playcount(username, track_name, artist_name, period, api_key=key):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user={username}&api_key={api_key}&format=json&limit=1000&period={period}"
	data = requests.get(url).json()
	for track in data.get("toptracks", {}).get("track", []):
		if track["name"].lower() == track_name.lower() and track["artist"]["name"].lower() == artist_name.lower():
			return int(track["playcount"])
	return 0

def get_top_artist_plays_overall(username):
	top_artists_data = get_top_artists(username, "overall")["topartists"]["artist"]
	top_artists = []
	top_artist_plays = []
	for i in range(len(top_artists_data)):
		top_artist_plays.append(top_artists_data[i]["playcount"])
		top_artists.append(top_artists_data[i]["name"])
	return pp.pformat(list(zip(top_artists, top_artist_plays)))

def get_top_artist_plays_yearly(username):
	top_artists_data = get_top_artists(username, "12month")["topartists"]["artist"]
	top_artists = []
	top_artist_plays = []
	for i in range(len(top_artists_data)):
		top_artist_plays.append(top_artists_data[i]["playcount"])
		top_artists.append(top_artists_data[i]["name"])
	return pp.pformat(list(zip(top_artists, top_artist_plays)))

# if __name__ == "__main__":
	# print(get_top_artist_plays("cjonas41"))
	# # Get list of all top artists and their playcounts from last.fm
	# top_artists = get_top_artists("cjonas41")["topartists"]["artist"]
	# # print(top_artists[0])
	# top_artist_plays = []
	# for i in range(len(top_artists)):
	# 	top_artist_plays.append(top_artists[i]["playcount"])
	# print(top_artist_plays)
	# ls_top_artists = []
	# for artist in top_artists:
	# 	ls_top_artists.append(artist["name"])

	# weekly_plays = {}
	# for artist in ls_top_artists:
	# 	weekly_plays[artist] = get_artist_playcount("cjonas41", artist, "overall")

	# print(weekly_plays)
	# print(top_artists)