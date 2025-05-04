import requests
import pprint as pp

key = "68237ca563ba0ac6a5915f31452b32d1"
shared_secret = "08921d66963667bccb9f00fe9b35d6e9" # used where?


# NOTE: PERIOD CAN BE "7day", "1month", "3month", "6month", "12month", or "overall"
def get_top_artists(username, period, api_key=key, limit=20):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user={username}&api_key={api_key}&format=json&limit={limit}&period={period}"
	return requests.get(url).json()

def get_top_albums(username, period, api_key=key, limit=50):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user={username}&api_key={api_key}&format=json&limit={limit}&period={period}"
	return requests.get(url).json()

def get_top_tracks(username, period, api_key=key, limit=50):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user={username}&api_key={api_key}&format=json&limit={limit}&period={period}"
	return requests.get(url).json()

def get_artist_tags(artistname, api_key=key):
	url = f"http://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist={artistname}&api_key={api_key}&format=json&autocorrect=0"
	# print(requests.get(url).json())
	return requests.get(url).json()

def get_artist_playcount(username, artist_name, period, api_key=key):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user={username}&api_key={api_key}&format=json&limit=1000&period={period}"
	data = requests.get(url).json()
	for artist in data.get("topartists", {}).get("artist", []):
		if artist["name"].lower() == artist_name.lower():
			return int(artist["playcount"])
	return 0

def get_track_playcount(username, track_name, artist_name, period, api_key=key):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user={username}&api_key={api_key}&format=json&limit=1000&period={period}"
	data = requests.get(url).json()
	for track in data.get("toptracks", {}).get("track", []):
		if track["name"].lower() == track_name.lower() and track["artist"]["name"].lower() == artist_name.lower():
			return int(track["playcount"])
	return 0

def get_top_artist_plays(username, period):
	top_artists_data = get_top_artists(username, period)["topartists"]["artist"]
	top_artists = []
	top_artist_plays = []
	for i in range(len(top_artists_data)):
		top_artist_plays.append(top_artists_data[i]["playcount"])
		top_artists.append(top_artists_data[i]["name"])
	return pp.pformat(list(zip(top_artists, top_artist_plays)))

def get_top_album_plays(username, period):
	top_albums_data = get_top_albums(username, period)["topalbums"]["album"]
	top_albums = []
	top_albums_artist = []
	top_albums_plays = []
	for i in range(len(top_albums_data)):
		top_albums_plays.append(top_albums_data[i]["playcount"])
		top_albums_artist.append(top_albums_data[i]["artist"]["name"])
		top_albums.append(top_albums_data[i]["name"])
	return pp.pformat(list(zip(top_albums, top_albums_artist, top_albums_plays)))

def get_top_track_plays(username, period):
	top_tracks_data = get_top_tracks(username, period)["toptracks"]["track"]
	top_tracks = []
	top_tracks_artist = []
	top_tracks_plays = []
	for i in range(len(top_tracks_data)):
		top_tracks_plays.append(top_tracks_data[i]["playcount"])
		top_tracks_artist.append(top_tracks_data[i]["artist"]["name"])
		top_tracks.append(top_tracks_data[i]["name"])
	return pp.pformat(list(zip(top_tracks, top_tracks_artist, top_tracks_plays)))

def get_artist_tag_counts(artistname):
	artist_tags_data = get_artist_tags(artistname)["toptags"]["tag"]
	artist_tags = []
	artist_tags_count = []
	for i in range(len(artist_tags_data)):
		artist_tags.append(artist_tags_data[i]["name"])
		artist_tags_count.append(artist_tags_data[i]["count"])
	return pp.pformat(list(zip(artist_tags, artist_tags_count)))

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