"""
This module provides functions for creating, reading, updating, and deleting (CRUD)
data in the broadCastr SQLite database.
"""

import json
import sqlite3

import constants

# BROADCASTR_DB = "./localdisk/data/broadcastr.db" # Local / Development Version
# BROADCASTR_DB = "/renderdisk/data/broadcastr.db" # Production Version
BROADCASTR_DB = "./data/broadcastr.db" # Git Version... obviously having the DB checked into
# source control doesn't make a lot of sense, but a paid version of the hosting
# service is required to have a persistent disk.  I have switched it back to
# this version for now so the hosted/free version of the app is still functional.


def get_db_connection():
	"""
	Gets the connection to the broadcastr database.
	Returns:
		connection to the broadcastr database
	"""
	conn = sqlite3.connect(BROADCASTR_DB)
	conn.row_factory = sqlite3.Row
	return conn

def get_db_connection_isolation_none():
	"""
	Gets the connection to the broadcastr database w/ isolation level = none.
	Returns:
		connection to the broadcastr database
	"""
	conn = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
	conn.row_factory = sqlite3.Row
	return conn

def query_config(config_key):
	"""
	Queries the database for a configuration value.
	Args:
		config_key: The key of the config value to look up
	Returns:
		str config value matching the key
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	# print(f"Looking up config value for {config_key}")

	query = """
		SELECT ConfigValue
		FROM Config
		WHERE ConfigKey = ?
	"""

	cursor.execute(query, (config_key,))
	row = cursor.fetchone()
	if row:
		result = row[0]
		# print(f"Config value for key {config_key} is {result}")
	else:
		result = ""
		print(f"No config value with key {config_key} was found")

	cursor.close()
	connection.close()

	return result

# def query_users():
# 	"""
# 	Queries the database for all user records.
# 	Returns:
# 		json results for users in the database
# 	"""
# 	connection = get_db_connection()
# 	cursor = connection.cursor()

# 	cursor.execute("SELECT * FROM User")
# 	data = cursor.fetchall()

# 	cursor.close()
# 	connection.close()

# 	return json.dumps(data)

def query_related_type_tables():
	"""
	Queries the database for all related type database table records.
	Returns:
		json results related type database tables
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	cursor.execute(
		"""
		SELECT RelatedTypeID, Description, DbTable, DbIdField, DbNameField
		FROM RelatedType
		ORDER BY RelatedTypeID
		"""
	)

	rows = cursor.fetchall()
	cursor.close()
	connection.close()

	# Convert list of tuples to list of dicts
	result = [{
		"RelatedTypeID": row[0],
		"Description": row[1],
		"DbTable": row[2],
		"DbIdField": row[3],
		"DbNameField": row[4]
		}
		for row in rows
	]

	# return json.dumps(result)
	return result

def query_matched_user_for_song_swap(exclude_user_id):
	"""
	Queries the database for a matched user for a song swap.
	Returns:
		Matched user id
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	cursor.execute(
		"""
		SELECT UserID
		FROM User
		WHERE UserID <> ?
			AND LastLogin > DATE(CURRENT_TIMESTAMP, '-7 days')
		ORDER BY RANDOM()
		LIMIT 1
		""",
		(exclude_user_id,)
	)

	row = cursor.fetchone()

	if row:
		matched_user_id = row[0] # Access the first element of the tuple
	else:
		matched_user_id = 0

	cursor.close()
	connection.close()

	return matched_user_id

def query_reaction_text_for_song_swap_reaction(reaction_score):
	"""
	Queries the database for a random reaction to a song
	swap reaction score (1-5, with 1 being bad and 5 good).
	Returns:
		Random selection from 10 strings (per tier) describing the reaction.
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	cursor.execute(
		"""
		SELECT Title
		FROM SongSwapReaction
		WHERE Reaction = ?
		ORDER BY RANDOM()
		LIMIT 1;
		""",
		(reaction_score,)
	)

	row = cursor.fetchone()

	if row:
		reaction = row[0]
	else:
		reaction = "That's nice, dear." # should never happen

	cursor.close()
	connection.close()

	return reaction

def query_inferred_type_for_song_swap(song_swap_id, user_id):
	"""
	Determines based on user id whether or not the user is initiated or matched in
	the song swap.
	Returns:
		Type of song swap user (initiated or matched)
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	cursor.execute(
		"""
		SELECT CASE
				WHEN SongSwap.InitiatedUserID = ?
				THEN 'initiated'
				WHEN SongSwap.MatchedUserID = ?
				THEN 'matched'
				ELSE ''
			END AS type
		FROM SongSwap
		WHERE SongSwap.SongSwapID = ?
		""",
		(user_id, user_id, song_swap_id)
	)

	row = cursor.fetchone()

	if row:
		user_type = row[0] # Access the first element of the tuple
	else:
		user_type = "error"

	cursor.close()
	connection.close()

	return user_type

def query_user_id(username):
	"""
	Queries the database for the numeric id of a user.
	Args:
		username: The user's last.fm profile name
	Returns:
		numeric user id
	"""
	return query_id("UserID", "User", [["LastFmProfileName", username]])

def query_user_name(user_id):
	"""
	Queries the database for the user name of a user id.
	Args:
		user_id: The user's database id
	Returns:
		The user's last.fm profile name
	"""
	return query_id("LastFmProfileName", "User", [["UserID", user_id]])

def query_swag(user_id):
	"""
	Queries the database for current swag of a user.
	Args:
		username: The user's numeric database id
	Returns:
		numeric swag amount
	"""
	return query_id("Swag", "User", [["UserID", user_id]])

def query_user_id_by_email(email):
	"""
	Queries the database for the numeric id of a user.
	Args:
		email: The user's email address
	Returns:
		numeric user id
	"""
	return query_id("UserID", "User", [["EmailAddress", email]])

def query_initiated_user_id(song_swap_id):
	"""
	Queries the database for the numeric id of a user who initiated a song swap.
	Args:
		song_swap_id: numeric database id of the song swap record
	Returns:
		numeric initiated user id
	"""
	return query_id("InitiatedUserID", "SongSwap", [["SongSwapID", song_swap_id]])

def query_matched_user_id(song_swap_id):
	"""
	Queries the database for the numeric id of a user who matched a song swap.
	Args:
		song_swap_id: numeric database id of the song swap record
	Returns:
		numeric matched user id
	"""
	return query_id("MatchedUserID", "SongSwap", [["SongSwapID", song_swap_id]])

def query_user_salt(username):
	"""
	Queries the database for a user's salt.  Used for password validation.
	Args:
		username: The user's last.fm profile name
	Returns:
		salt for this user profile
	"""
	return query_id("Salt", "User", [["LastFmProfileName", username]])

def query_user_id_by_password(username, hashed_password):
	"""
	Queries the database for the numeric id of a user based on profile name and hashed password.
	Args:
		username: The user's last.fm profile name
		hashed_password: The user's hashed password for validation
	Returns:
		numeric user id
	"""
	return query_id("UserID", "User",
					[["LastFmProfileName", username], ["Password", hashed_password]])

def query_artist_id(artistname):
	"""
	Queries the database for the numeric id of an artist.
	Args:
		artistname: The artist's name
	Returns:
		numeric artist id
	"""
	# Simply doing a name lookup for now, but MBID might be better with name as a fallback
	return query_id("ArtistID", "Artist", [["ArtistName", artistname]])

def query_album_id(albumname, artistid):
	"""
	Queries the database for the numeric id of an album.
	Args:
		albumname: The album's name
		artistid: The numeric database id of the album's artist
	Returns:
		numeric album id
	"""
	# Simply doing a name lookup for now, but MBID might be better with name as a fallback
	return query_id("AlbumID", "Album", [["AlbumName", albumname], ["ArtistID", artistid]])

def query_broadcastr_id(broadcast_id):
	"""
	Queries the database for the numeric id of a broadcastr.
	Args:
		broadcast_id: The database id of the broadcast to look up
	Returns:
		numeric user id
	"""
	return query_id("UserID", "Broadcast", [["BroadcastID", broadcast_id]])

def query_related_type_id(relatedtype):
	"""
	Queries the database for the numeric id of a related type.
	Args:
		relatedtype: The related type description
	Returns:
		numeric related type id
	"""
	return query_id("RelatedTypeID", "RelatedType", [["Description", relatedtype]])

def query_track_id(trackname, artistid):
	"""
	Queries the database for the numeric id of a track.
	Args:
		trackname: The track's name
		artistid: The numeric database id of the track's artist
	Returns:
		numeric track id
	"""
	# Simply doing a name lookup for now, but MBID might be better with name as a fallback
	return query_id("TrackID", "Track", [["TrackName", trackname], ["ArtistID", artistid]])

def query_following_id(follower_id, followee_id):
	"""
	Queries the database for the numeric id of a following.
	Args:
		follower_id: The follower's database id
		followee_id: The followee's database id
	Returns:
		numeric following id
	"""
	return query_id("FollowingID", "Following",
					[["FollowerID", follower_id], ["FolloweeID", followee_id]])

def query_period_id(period):
	"""
	Queries the database for the numeric id of a period.
	Args:
		period: The period's name
	Returns:
		numeric period id
	"""
	return query_id("PeriodID", "Period", [["PeriodName", period]])

def query_like_id(user_id, related_type_id, related_id):
	"""
	Queries the database for the numeric id of a like.
	Args:
		user_id: The database id of the user who liked
		related_type_id: The database id of the type the like is related to
		related_id: The database id of the record the like is related to
	Returns:
		numeric like id
	"""

	return query_id("LikeID", "Like", [["UserID", user_id],
									   ["RelatedTypeID", related_type_id],
									   ["RelatedID", related_id]])

def query_id(idfield, table, lookup_pairs):
	"""
	Queries the database for a numeric id of a record.
	Args:
		idfield: The name of the field containing the id
		table: The table containing the record
		lookup_pairs: multi-dimensional array of name/value pairs to use in the lookup (minimum 1)
	Returns:
		numeric record id
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	namefield = lookup_pairs[0][0]
	namelookup = lookup_pairs[0][1]

	# print(f"Looking up id for {namelookup}")

	query = f"SELECT {idfield} FROM {table} WHERE {namefield} = ?"
	params = []
	params.append(namelookup)
	# Append additional lookup parameters
	i = 1
	while i < len(lookup_pairs):
		query += f" AND {lookup_pairs[i][0]} = ?"
		params.append(lookup_pairs[i][1])
		i += 1

	cursor.execute(query, params)
	row = cursor.fetchone()
	if row:
		resultid = row[0] # Access the first element of the tuple
		# print(f"ID with name {namelookup } is: {resultid}")
	else:
		resultid = 0
		print(f"No ID with name {namelookup} was found")

	cursor.close()
	connection.close()

	return resultid

def query_top_artists(username, period):
	"""
	Queries the database for a user's top artist data for a specified period.
	Args:
		username: The last.fm profile name of the user data to query
		period: The period to query data for
	Returns:
		json results for user's top artist data
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	# Get the user's database id
	userid = query_user_id(username)

	# Get the period id (should eventually be passed in by id rather than name?)
	periodid = query_period_id(period)

	cursor.execute(
		"SELECT User.LastFmProfileName, Artist.ArtistName, Period.PeriodName, " \
		"       TopArtist.Playcount, TopArtist.LastUpdated " \
		"FROM TopArtist " \
		"INNER JOIN User ON TopArtist.UserID = User.UserID " \
		"INNER JOIN Artist ON TopArtist.ArtistID = Artist.ArtistID " \
		"INNER JOIN Period ON TopArtist.PeriodID = Period.PeriodID " \
		"WHERE TopArtist.UserID = ? " \
		"   AND TopArtist.PeriodID = ? " \
		"ORDER BY TopArtist.Playcount DESC", (userid, periodid))
	data = cursor.fetchall()

	cursor.close()
	connection.close()

	return json.dumps(data)

def query_top_albums(username, period):
	"""
	Queries the database for a user's top album data for a specified period.
	Args:
		username: The last.fm profile name of the user data to query
		period: The period to query data for
	Returns:
		json results for user's top album data
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	# Get the user's database id
	userid = query_user_id(username)

	# Get the period id (should eventually be passed in by id rather than name?)
	periodid = query_period_id(period)

	cursor.execute(
		"SELECT User.LastFmProfileName, Album.AlbumName, Artist.ArtistName, " \
		"       Period.PeriodName, TopAlbum.Playcount, TopAlbum.LastUpdated " \
		"FROM TopAlbum " \
		"INNER JOIN User ON TopAlbum.UserID = User.UserID " \
		"INNER JOIN Album ON TopAlbum.AlbumID = Album.AlbumID " \
		"INNER JOIN Artist ON Album.ArtistID = Artist.ArtistID " \
		"INNER JOIN Period ON TopAlbum.PeriodID = Period.PeriodID " \
		"WHERE TopAlbum.UserID = ? " \
		"   AND TopAlbum.PeriodID = ? " \
		"ORDER BY TopAlbum.Playcount DESC", (userid, periodid))

	data = cursor.fetchall()

	cursor.close()
	connection.close()

	return json.dumps(data)

def query_top_tracks(username, period):
	"""
	Queries the database for a user's top track data for a specified period.
	Args:
		username: The last.fm profile name of the user data to query
		period: The period to query data for
	Returns:
		json results for user's top track data
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	# Get the user's database id
	userid = query_user_id(username)

	# Get the period id (should eventually be passed in by id rather than name?)
	periodid = query_period_id(period)

	cursor.execute(
		"SELECT User.LastFmProfileName, Track.TrackName, Artist.ArtistName, " \
		"       Period.PeriodName, TopTrack.Playcount, TopTrack.LastUpdated " \
		"FROM TopTrack " \
		"INNER JOIN User ON TopTrack.UserID = User.UserID " \
		"INNER JOIN Track ON TopTrack.TrackID = Track.TrackID " \
		"INNER JOIN Artist ON Track.ArtistID = Artist.ArtistID " \
		"INNER JOIN Period ON TopTrack.PeriodID = Period.PeriodID " \
		"WHERE TopTrack.UserID = ? " \
		"   AND TopTrack.PeriodID = ? " \
		"ORDER BY TopTrack.Playcount DESC", (userid, periodid))

	data = cursor.fetchall()

	cursor.close()
	connection.close()

	return json.dumps(data)

def query_listens_for_artist(username, artistname, periodname):
	"""
	Return the number of scrobbles (playcount) for a single user+artist+period.
	Returns 0 if no record is found.
	"""
	sql = """
	SELECT TA.Playcount
	  FROM TopArtist AS TA
	  JOIN User   AS U ON TA.UserID   = U.UserID
	  JOIN Artist AS A ON TA.ArtistID = A.ArtistID
	  JOIN Period AS P ON TA.PeriodID = P.PeriodID
	 WHERE U.LastFmProfileName = ?
	   AND A.ArtistName       = ?
	   AND P.PeriodName       = ?
	LIMIT 1
	"""

	conn = get_db_connection()
	cur = conn.cursor()
	cur.execute(sql, (username, artistname, periodname))
	row = cur.fetchone()
	cur.close()
	conn.close()

	return row[0] if row else 0


def query_top_listeners_for_artist(artistname, periodname, limit: int = 10):
	"""
	Return a list of up to `limit` tuples (username, playcount),
	ordered by playcount DESC, for a given artist + period.
	"""
	sql = """
	SELECT U.LastFmProfileName AS username,
		   TA.Playcount            AS playcount
	  FROM TopArtist AS TA
	  JOIN User   AS U ON TA.UserID   = U.UserID
	  JOIN Artist AS A ON TA.ArtistID = A.ArtistID
	  JOIN Period AS P ON TA.PeriodID = P.PeriodID
	 WHERE A.ArtistName = ?
	   AND P.PeriodName = ?
	 ORDER BY TA.Playcount DESC
	 LIMIT ?
	"""

	conn = get_db_connection()
	cur = conn.cursor()
	cur.execute(sql, (artistname, periodname, limit))
	results = cur.fetchall()
	cur.close()
	conn.close()

	# results is List[(username:str, playcount:int)]
	return results

def store_artist(artistname, mbid):
	"""
	Stores an artist record.
	Args:
		artistname: The name of the artist to store
		mbid: The artist's last.fm mbid (sometimes blank) (mb stands for musicbrainz)
	Returns:
		numeric id of the inserted record
	"""
	print(f"storing new artist: {artistname}")
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute("INSERT INTO Artist (ArtistName, LastFmMbid) VALUES (?, ?)", (artistname, mbid))

	cursor.close()
	connection.close()

	# print(f"New artist record ID: {cursor.lastrowid}")

	return cursor.lastrowid

def store_album(albumname, artistid, mbid):
	"""
	Stores an album record.
	Args:
		albumname: The name of the album to store
		mbid: The album's last.fm mbid (sometimes blank) (mb stands for musicbrainz)
	Returns:
		numeric id of the inserted record
	"""
	print(f"storing new album: {albumname}")
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute(
		"INSERT INTO Album (AlbumName, ArtistID, MBID) " \
		"VALUES (?, ?, ?)",
		(albumname, artistid, mbid))

	cursor.close()
	connection.close()

	# print(f"New album record ID: {cursor.lastrowid}")

	return cursor.lastrowid

def store_broadcast(broadcast_id, user_id, title, body, related_type_id, related_id):
	"""
	Stores a broadcast record.
	Args:
		broadcast_id: ID of the broadcast to store (0 if new)
		user_id: ID of the user creating the broadcast
		title: title of the broadcast
		body: body of the broadcast
		related_type_id: type id that this broadcast relates to
		related_id: record id that this broadcast relates to
	Returns:
		numeric id of the inserted record
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	if broadcast_id == 0:
		cursor.execute(
			"""
			INSERT INTO Broadcast(UserID, Title, Body, RelatedTypeID,
								  RelatedID, Timestamp)
			VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
			""",
			(user_id, title, body, related_type_id, related_id))

	cursor.close()
	connection.close()

	return cursor.lastrowid

def store_like(user_id, related_type_id, related_id):
	"""
	Stores a like record.
	Args:
		user_id: ID of the user creating the like
		related_type_id: type id that this like relates to
		related_id: record id that this like relates to
	Returns:
		numeric id of the inserted record
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute(
		"""
		INSERT INTO Like(UserID, RelatedTypeID, RelatedID, Timestamp)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP)
		""",
		(user_id, related_type_id, related_id))

	cursor.close()
	connection.close()

	return cursor.lastrowid

def store_track(trackid, trackname, artistid, mbid, trackurl):
	"""
	Stores a track record.
	Args:
		trackid: database id for this track
		trackname: The name of the track to store
		artistid: database id for the artist of this track
		mbid: The track's last.fm mbid (sometimes blank) (mb stands for musicbrainz)
		trackurl: last.fm url for this track
	Returns:
		numeric id of the inserted record
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	if trackid == 0:
		print(f"storing new track {trackname}, {mbid}")
		cursor.execute(
			"INSERT INTO Track (TrackName, ArtistID, MBID, LastFmTrackUrl) " \
			"VALUES (?, ?, ?, ?)",
			(trackname, artistid, mbid, trackurl))
		return_id = cursor.lastrowid
	else:
		cursor.execute(
			"""
				UPDATE Track
				SET TrackName = ?,
			    	ArtistID = ?,
			    	MBID = ?,
			    	LastFmTrackUrl = ?
				WHERE TrackID = ?
			""",
			(trackname, artistid, mbid, trackurl, trackid))
		return_id = trackid

	cursor.close()
	connection.close()

	# print(f"Track Updated ID: {return_id}")

	return return_id

def store_top_artist(userid, artistid, periodid, playcount):
	"""
	Stores a user's top artist data for a specified artist, period, and playcount.
	Args:
		userid: The numeric user id
		artistid: The numeric artistid
		period: The numeric period id
		playcount: The playcount for this user/artist/period
	Returns:
		numeric id of the inserted record
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	# print(f"storing top artist data")

	cursor.execute(
		"INSERT INTO TopArtist (UserID, ArtistID, PeriodID, Playcount, LastUpdated) " \
		"VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)", 
		(userid, artistid, periodid, playcount))

	cursor.close()
	connection.close()

	# print(f"New top artist record ID: {cursor.lastrowid}")

	return cursor.lastrowid

def store_top_album(userid, albumid, periodid, playcount):
	"""
	Stores a user's top album data for a specified album, period, and playcount.
	Args:
		userid: The numeric user id
		albumid: The numeric albumid
		period: The numeric period id
		playcount: The playcount for this user/album/period
	Returns:
		numeric id of the inserted record
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	# print(f"storing top album data")

	cursor.execute(
		"INSERT INTO TopAlbum (UserID, AlbumID, PeriodID, Playcount, LastUpdated) " \
		"VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)", 
		(userid, albumid, periodid, playcount))

	cursor.close()
	connection.close()

	# print(f"New top album record ID: {cursor.lastrowid}")

	return cursor.lastrowid

def store_top_track(userid, trackid, periodid, playcount):
	"""
	Stores a user's top track data for a specified track, period, and playcount.
	Args:
		userid: The numeric user id
		trackid: The numeric trackid
		period: The numeric period id
		playcount: The playcount for this user/track/period
	Returns:
		numeric id of the inserted record
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	# print(f"storing top track data")

	cursor.execute(
		"INSERT INTO TopTrack (UserID, TrackID, PeriodID, Playcount, LastUpdated) " \
		"VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)", 
		(userid, trackid, periodid, playcount))

	cursor.close()
	connection.close()

	# print(f"New top track record ID: {cursor.lastrowid}")

	return cursor.lastrowid

def store_user(user, first_name, last_name, email, salt, hashed_password, bootstrapped):
	print(f"storing new user: {user}")
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute(
		"""
			INSERT INTO User(LastFmProfileName, FirstName, LastName,
							 EmailAddress, Salt, Password, BootstrappedUser, Swag)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		""",
        (user, first_name, last_name, email, salt, hashed_password,
		 bootstrapped, constants.SWAG_STARTING_BALANCE))

	cursor.close()
	connection.close()

	print(f"New user stored with id: {cursor.lastrowid}")
	return cursor.lastrowid

def add_swag(user_id, swag):
	"""
	Adds swag to a user's profile.
	Args:
		username: profile name of the user account
		add_swag: integer amount of swag to add
	Returns:
		numeric new swag balance for this user
	"""
	current_swag = query_swag(user_id)
	new_swag = current_swag + int(swag)

	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute(
        "UPDATE User " \
        "SET Swag = ? " \
        "WHERE UserID = ?",
        (new_swag, user_id))

	cursor.close()
	connection.close()

	return new_swag

def user_refresh_due(user_id):
	"""
	Queries the database to determine if a user's top data
	is due for a refresh.
	Returns:
		Boolean indicating whether or not the refresh is due.
	"""
	connection = get_db_connection()
	cursor = connection.cursor()

	cursor.execute(
		f"""
		SELECT MaxLastUpdated
		FROM (
			SELECT MAX(LastUpdatedData.LastUpdated) AS MaxLastUpdated
			FROM (
				SELECT TopArtist.LastUpdated
				FROM User
				LEFT JOIN TopArtist ON User.UserID = TopArtist.UserID
				WHERE User.UserID = ?
				UNION
				SELECT TopAlbum.LastUpdated
				FROM User
				LEFT JOIN TopAlbum ON User.UserID = TopAlbum.UserID
				WHERE User.UserID = ?
				UNION
				SELECT TopTrack.LastUpdated
				FROM User
				LEFT JOIN TopTrack ON User.UserID = TopTrack.UserID
				WHERE User.UserID = ?
			) AS LastUpdatedData
		) AS MaxLastUpdatedData
		WHERE MaxLastUpdated > DATE(CURRENT_TIMESTAMP, '-{constants.REFRESH_DAYS} days')
		""",
		(user_id, user_id, user_id)
	)

	row = cursor.fetchone()

	if row:
		print("user data does not need to be refreshed")
		return_val = False
	else:
		print("user data needs to be refreshed")
		return_val = True

	cursor.close()
	connection.close()

	return return_val

def delete_user(username):
	"""
	Deletes the user with the given Last.fm profile name.
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute(
		"DELETE FROM User WHERE LastFmProfileName = ?",
		(username,)
	)

	# How many rows were deleted?
	deleted_count = cursor.rowcount

	cursor.close()
	connection.close()

	print(f"Deleted {deleted_count} user(s) with username: {username}")

def delete_top_artists(userid, periodid):
	"""
	Deletes user's top artist data for a specified period.
	Args:
		userid: The numeric user id data should be deleted for
		periodid: The period data should be deleted for
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute("DELETE FROM TopArtist WHERE UserID = ? AND PeriodID = ?", (userid, periodid))

	cursor.close()
	connection.close()

def delete_top_albums(userid, periodid):
	"""
	Deletes user's top album data for a specified period.
	Args:
		userid: The numeric user id data should be deleted for
		periodid: The period data should be deleted for
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute("DELETE FROM TopAlbum WHERE UserID = ? AND PeriodID = ?", (userid, periodid))

	cursor.close()
	connection.close()

def delete_top_tracks(userid, periodid):
	"""
	Deletes user's top track data for a specified period.
	Args:
		userid: The numeric user id data should be deleted for
		periodid: The period data should be deleted for
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute("DELETE FROM TopTrack WHERE UserID = ? AND PeriodID = ?", (userid, periodid))

	cursor.close()
	connection.close()

def delete_like(user_id, related_type_id, related_id):
	"""
	Deletes a like record.
	Args:
		user_id: ID of the user who liked
		related_type_id: type id that this like relates to
		related_id: record id that this like relates to
	Returns:
		number of deleted rows
	"""
	connection = get_db_connection_isolation_none()
	cursor = connection.cursor()

	cursor.execute(
		"""
		DELETE
		FROM Like
		WHERE UserID = ?
			AND RelatedTypeID = ?
			AND RelatedID = ?
		""",
		(user_id, related_type_id, related_id))

	cursor.close()
	connection.close()

	return cursor.rowcount

#################################################
#                                                #
#                DEAD CODE BELOW                 #
#                USED FOR DB STUFFING            #
#                                                #
#################################################

# # This is a very rudimentary function that just takes a userid and chugs through
# # storing all of their top tracks and artists. I'm honestly just calling it by
# # putting one line at the end of this file and running the file itself. Super
# # hacky but makes the commitments to the DB that we want
# #
# # We can totally build this up for our needs as we go along
# def init_user(username, firstname, lastname, email):
# 	store_user(username, firstname, lastname, email, "", "")

# 	periods = ["overall", "7day", "1month", "12month", "6month", "3month"]
# 	for period in periods:
# 		store_top_artists(username, period)
# 		time.sleep(0.05)
# 		store_top_tracks(username, period)
# 		time.sleep(0.05)

# # this list is 5 randomly selected NEIGHBORS of Christian, Lucas, and Madison, and Asher.
# rando_users = ["VanillaM1lk", "Redport2", "auganz", "gianna333", "rowkn", "nscott356", "inawordaverage", "Meto_martinez55", "Gstv0_", "tiez1901", "thereseannec", "Lapanenn", "hayleyukulele", "FadelShoughari", "PedroDark", "ericktheonlyone", "JCG_ahhhh", "mrirveing", "yenuu1", "dporterfield18"]
# for user in rando_users:
# 	continue
# 	init_user(user)
# # NOTE: If you choose to use this again, you will need to replace 0 with whatever the last "randoUser" index was
# for i, user in enumerate(rando_users, 0):
# 	continue
# 	init_user(user, "randoFirst" + str(i), "randoLast" + str(i), "randoemail" + str(i) + "@stanford.edu")
# for user in rando_users:
# 	continue
# 	print("USER")
# 	print(query_top_artists(user, "overall"))
# 	print("")

# # init_user("zugzug104", "Asher", "Hensley", "asher104@stanford.edu")
# print(get_top_listeners_for_artist("Larry June", "overall"))
