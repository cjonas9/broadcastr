import time
import requests
import pprint as pp

import constants
import sql_query

key = sql_query.query_config(constants.LAST_FM_API_CONFIG_KEY)

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

def get_user_info(username, api_key=key):
	url = f"http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user={username}&api_key={api_key}&format=json"
	return requests.get(url).json()

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

def get_user_info_data(username):
	user_info_data = get_user_info(username)["user"]
	return pp.pformat(zip(user_info_data))

def store_top_albums(username, period):
	"""
	Stores a user's top album data for a specified period.
	Args:
		username: The last.fm profile name of the user data to query
		period: The period to query data for
	Returns:
		string indicating success
	"""
	# Get the user's database id
	userid = sql_query.query_user_id(username)

	# Get the period id (should eventually be passed in by id rather than name?)
	periodid = sql_query.query_period_id(period)

	# Wipe user top albums data for this period.
	sql_query.delete_top_albums(userid, periodid)

	# Get updated data
	top_albums_data = get_top_albums(username, period)["topalbums"]["album"]
	# print(top_albums_data)

	# Store updated data
	for _, top_album in enumerate(top_albums_data):
		albumname = top_album["name"]
		artistname = top_album["artist"]["name"]
		artistmbid = top_album["artist"]["mbid"]
		artistid = sql_query.query_artist_id(artistname)
		if artistid == 0:
			artistid = sql_query.store_artist(artistname, artistmbid)
		albummbid = top_album["mbid"]
		albumid = sql_query.query_album_id(albumname, artistid)
		if albumid == 0:
			albumid = sql_query.store_album(albumname, artistid, albummbid)

		sql_query.store_top_album(userid, albumid, periodid, top_album["playcount"])

	return "top albums stored successfully!"

def store_top_artists(username, period):
	"""
	Stores a user's top artist data for a specified period.
	Args:
		username: The last.fm profile name of the user data to query
		period: The period to query data for
	Returns:
		string indicating success
	"""
	# Get the user's database id
	userid = sql_query.query_user_id(username)

	# Get the period id (should eventually be passed in by id rather than name?)
	periodid = sql_query.query_period_id(period)

	# Wipe user top artists data for this period.
	sql_query.delete_top_artists(userid, periodid)

	# Get updated data
	top_artists_data = get_top_artists(username, period)["topartists"]["artist"]
	# print(top_artists_data)

	# Store updated data
	for _, top_artist in enumerate(top_artists_data):
		artistname = top_artist["name"]
		artistmbid = top_artist["mbid"]
		artistid = sql_query.query_artist_id(artistname)
		if artistid == 0:
			artistid = sql_query.store_artist(artistname, artistmbid)

		sql_query.store_top_artist(userid, artistid, periodid, top_artist["playcount"])

	return "top artists stored successfully!"

def store_top_tracks(username, period):
	"""
	Stores a user's top track data for a specified period.
	Args:
		username: The last.fm profile name of the user data to query
		period: The period to query data for
	Returns:
		string indicating success
	"""
	# Get the user's database id
	userid = sql_query.query_user_id(username)

	# Get the period id (should eventually be passed in by id rather than name?)
	periodid = sql_query.query_period_id(period)

	# Wipe user top tracks data for this period.
	sql_query.delete_top_tracks(userid, periodid)

	# Get updated data
	top_tracks_data = get_top_tracks(username, period)["toptracks"]["track"]
	# print(top_tracks_data)

	# Store updated data
	for _, top_track in enumerate(top_tracks_data):
		trackname = top_track["name"]
		artistname = top_track["artist"]["name"]
		artistmbid = top_track["artist"]["mbid"]
		artistid = sql_query.query_artist_id(artistname)
		if artistid == 0:
			artistid = sql_query.store_artist(artistname, artistmbid)
		trackmbid = top_track["mbid"]
		trackurl = top_track["url"]
		trackid = sql_query.query_track_id(trackname, artistid)
		trackid = sql_query.store_track(trackid, trackname, artistid, trackmbid, trackurl)

		sql_query.store_top_track(userid, trackid, periodid, top_track["playcount"])

	return "top tracks stored successfully!"

def store_all_users_last_fm_info():
	"""
	Fetches and stores last.fm profile data such as profile pics and profile url for all users.
	"""
	connection = sql_query.get_db_connection()
	cursor = connection.cursor()

	cursor.execute("""
		SELECT LastFmProfileName 
		FROM User 
		ORDER BY LastFmProfileName
	""")
	data = cursor.fetchall()

	for _, user in enumerate(data):
		username = user["LastFmProfileName"]
		store_user_last_fm_info(username)
		time.sleep(constants.LAST_FM_API_CALL_SLEEP_TIME)

	cursor.close()
	connection.close()

def store_user_last_fm_info(username):
	"""
	Fetches and stores a user's last.fm profile data such as profile pics and profile url.
	Args:
		username: The user's last.fm profile name
	"""
	user_id = sql_query.query_user_id(username)

	result = get_user_info(username)

	if "user" in result:
		user_result = result["user"]
		profile_url = user_result['url']

		pfp_dict = {img['size']: img['#text'] for img in user_result['image'] if img['#text']}

		pfpsm = pfp_dict.get('small')
		pfpmed = pfp_dict.get('medium')
		pfplg = pfp_dict.get('large')
		pfpxl = pfp_dict.get('extralarge')

		if all(x is None for x in (pfpsm, pfpmed, pfplg, pfpxl)):
			# this is a random pfp png i found online
			pfpsm = pfpmed = pfplg = pfpxl = constants.DEFAULT_PFP

		connection = sql_query.get_db_connection_isolation_none()
		cursor = connection.cursor()

		cursor.execute(
			"UPDATE User " \
			"SET LastFmProfileUrl = ?, " \
			"    PfpSmall = ?, " \
			"    PfpMedium = ?, " \
			"    PfpLarge = ?, " \
			"    PfpExtraLarge = ? " \
			"WHERE UserID = ?",
			(profile_url, pfpsm, pfpmed, pfplg, pfpxl, user_id))

		cursor.close()
		connection.close()

		print(f"Last.fm profile data stored for user: {username}")
	else:
		print(f"Could not locate Last.fm profile data for user: {username}")

def refresh_user_data(username):

    print(f"Refreshing user data for {username}")

	# Store user data from last.fm such as profile pictures and profile url
    store_user_last_fm_info(username)

	# Store last.fm top artist and track data for this user for all periods
    # periods = ["overall", "7day", "1month", "12month", "6month", "3month"]
    for period in constants.REFRESH_PERIODS:
        store_top_artists(username, period)
        time.sleep(constants.LAST_FM_API_CALL_SLEEP_TIME)
        store_top_tracks(username, period)
        time.sleep(constants.LAST_FM_API_CALL_SLEEP_TIME)

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
