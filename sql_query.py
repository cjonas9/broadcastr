"""
This module provides functions for creating, reading, updating, and deleting (CRUD)
data in the broadCastr SQLite database.
"""
import json
import sqlite3
import time

import db_query

BROADCASTR_DB = "./data/broadcastr.db"

key = "68237ca563ba0ac6a5915f31452b32d1"
shared_secret = "08921d66963667bccb9f00fe9b35d6e9"

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

def query_users():
    """
    Queries the database for all user records.
    Returns:
        json results for users in the database
    """
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM User")
    data = cursor.fetchall()

    cursor.close()
    connection.close()

    return json.dumps(data)

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

def query_swag(username):
    """
    Queries the database for current swag of a user.
    Args:
        username: The user's last.fm profile name
    Returns:
        numeric swag amount
    """
    return query_id("Swag", "User", [["LastFmProfileName", username]])

def query_user_id_by_email(email):
    """
    Queries the database for the numeric id of a user.
    Args:
        email: The user's email address
    Returns:
        numeric user id
    """
    return query_id("UserID", "User", [["EmailAddress", email]])

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

    print(f"Looking up id for {namelookup}")

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
        print(f"ID with name {namelookup } is: {resultid}")
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
    connection = get_db_connection_isolation_none()
    cursor = connection.cursor()

    print(f"storing artist {artistname}, {mbid}")

    cursor.execute("INSERT INTO Artist (ArtistName, LastFmMbid) VALUES (?, ?)", (artistname, mbid))

    cursor.close()
    connection.close()

    print(f"New record ID: {cursor.lastrowid}")

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
    connection = get_db_connection_isolation_none()
    cursor = connection.cursor()

    print(f"storing album {albumname}, {mbid}")

    cursor.execute(
        "INSERT INTO Album (AlbumName, ArtistID, MBID) " \
        "VALUES (?, ?, ?)",
        (albumname, artistid, mbid))

    cursor.close()
    connection.close()

    print(f"New record ID: {cursor.lastrowid}")

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
    Stores a liike record.
    Args:
        user_id: ID of the user creating the broadcast
        related_type_id: type id that this broadcast relates to
        related_id: record id that this broadcast relates to
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

def store_track(trackname, artistid, mbid):
    """
    Stores a track record.
    Args:
        trackname: The name of the track to store
        mbid: The track's last.fm mbid (sometimes blank) (mb stands for musicbrainz)
    Returns:
        numeric id of the inserted record
    """
    connection = get_db_connection_isolation_none()
    cursor = connection.cursor()

    print(f"storing track {trackname}, {mbid}")

    cursor.execute(
        "INSERT INTO Track (TrackName, ArtistID, MBID) " \
        "VALUES (?, ?, ?)",
        (trackname, artistid, mbid))

    cursor.close()
    connection.close()

    print(f"New record ID: {cursor.lastrowid}")

    return cursor.lastrowid

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
    userid = query_user_id(username)

    # Get the period id (should eventually be passed in by id rather than name?)
    periodid = query_period_id(period)

    # Wipe user top artists data for this period.
    delete_top_artists(userid, periodid)

    # Get updated data
    top_artists_data = db_query.get_top_artists(username, period)["topartists"]["artist"]
    # print(top_artists_data)

    # Store updated data
    for _, top_artist in enumerate(top_artists_data):
        artistname = top_artist["name"]
        artistmbid = top_artist["mbid"]
        artistid = query_artist_id(artistname)
        if artistid == 0:
            artistid = store_artist(artistname, artistmbid)

        store_top_artist(userid, artistid, periodid, top_artist["playcount"])

    return "top artists stored successfully!"

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

    print(f"New record ID: {cursor.lastrowid}")

    return cursor.lastrowid

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
    userid = query_user_id(username)

    # Get the period id (should eventually be passed in by id rather than name?)
    periodid = query_period_id(period)

    # Wipe user top albums data for this period.
    delete_top_albums(userid, periodid)

    # Get updated data
    top_albums_data = db_query.get_top_albums(username, period)["topalbums"]["album"]
    # print(top_albums_data)

    # Store updated data
    for _, top_album in enumerate(top_albums_data):
        albumname = top_album["name"]
        artistname = top_album["artist"]["name"]
        artistmbid = top_album["artist"]["mbid"]
        artistid = query_artist_id(artistname)
        if artistid == 0:
            artistid = store_artist(artistname, artistmbid)
        albummbid = top_album["mbid"]
        albumid = query_album_id(albumname, artistid)
        if albumid == 0:
            albumid = store_album(albumname, artistid, albummbid)

        store_top_album(userid, albumid, periodid, top_album["playcount"])

    return "top albums stored successfully!"

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

    print(f"New record ID: {cursor.lastrowid}")

    return cursor.lastrowid

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
    userid = query_user_id(username)

    # Get the period id (should eventually be passed in by id rather than name?)
    periodid = query_period_id(period)

    # Wipe user top tracks data for this period.
    delete_top_tracks(userid, periodid)

    # Get updated data
    top_tracks_data = db_query.get_top_tracks(username, period)["toptracks"]["track"]
    # print(top_tracks_data)

    # Store updated data
    for _, top_track in enumerate(top_tracks_data):
        trackname = top_track["name"]
        artistname = top_track["artist"]["name"]
        artistmbid = top_track["artist"]["mbid"]
        artistid = query_artist_id(artistname)
        if artistid == 0:
            artistid = store_artist(artistname, artistmbid)
        trackmbid = top_track["mbid"]
        trackid = query_track_id(trackname, artistid)
        if trackid == 0:
            trackid = store_track(trackname, artistid, trackmbid)

        store_top_track(userid, trackid, periodid, top_track["playcount"])

    return "top tracks stored successfully!"

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

    print(f"New record ID: {cursor.lastrowid}")

    return cursor.lastrowid

def store_user(username, firstname, lastname, email):
    connection = get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "INSERT INTO User (LastFmProfileName,FirstName,LastName,EmailAddress) " \
            "VALUES (?, ?, ?, ?)", 
            (username, firstname, lastname, email))

    cursor.close()
    connection.close()

	# Store user data from last.fm such as profile pictures and profile url
    store_user_last_fm_info(username)

    print(f"New user stored with id: {cursor.lastrowid}")

def store_user_last_fm_info(username):
    """
    Fetches and stores a user's last.fm profile data such as profile pics and profile url.
    Args:
        username: The user's last.fm profile name
    """
    user_id = query_user_id(username)

    result = db_query.get_user_info(username)
    print(result)
    if "user" in result:
        user_result = result["user"]
        profile_url = user_result['url']

        pfp_dict = {img['size']: img['#text'] for img in user_result['image'] if img['#text']}
        pfpsm = pfp_dict.get('small')
        pfpmed = pfp_dict.get('medium')
        pfplg = pfp_dict.get('large')
        pfpxl = pfp_dict.get('extralarge')

        connection = get_db_connection_isolation_none()
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

def store_all_users_last_fm_info():
    """
    Fetches and stores last.fm profile data such as profile pics and profile url for all users.
    """
    connection = get_db_connection()
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
        time.sleep(0.05)

    cursor.close()
    connection.close()

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

# This is a very rudimentary function that just takes a userid and chugs through
# storing all of their top tracks and artists. I'm honestly just calling it by
# putting one line at the end of this file and running the file itself. Super
# hacky but makes the commitments to the DB that we want
#
# We can totally build this up for our needs as we go along
def init_user(username, firstname, lastname, email):
    store_user(username, firstname, lastname, email)

    periods = ["overall", "7day", "1month", "12month", "6month", "3month"]
    for period in periods:
        store_top_artists(username, period)
        time.sleep(0.05)
        store_top_tracks(username, period)
        time.sleep(0.05)



#################################################
#                                                #
#                DEAD CODE BELOW                    #
#                USED FOR DB STUFFING            #
#                                                #
#################################################

"""
# this list is 5 randomly selected NEIGHBORS of Christian, Lucas, and Madison, and Asher.
rando_users = ["VanillaM1lk", "Redport2", "auganz", "gianna333", "rowkn", "nscott356", "inawordaverage", "Meto_martinez55", "Gstv0_", "tiez1901", "thereseannec", "Lapanenn", "hayleyukulele", "FadelShoughari", "PedroDark", "ericktheonlyone", "JCG_ahhhh", "mrirveing", "yenuu1", "dporterfield18"]
for user in rando_users:
    continue
    init_user(user)
# NOTE: If you choose to use this again, you will need to replace 0 with whatever the last "randoUser" index was
for i, user in enumerate(rando_users, 0):
    continue
    init_user(user, "randoFirst" + str(i), "randoLast" + str(i), "randoemail" + str(i) + "@stanford.edu")
for user in rando_users:
    continue
    print("USER")
    print(query_top_artists(user, "overall"))
    print("")

# init_user("zugzug104", "Asher", "Hensley", "asher104@stanford.edu")
print(get_top_listeners_for_artist("Larry June", "overall"))

"""
