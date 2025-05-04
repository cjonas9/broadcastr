"""
This module provides functions for creating, reading, updating, and deleting (CRUD)
data in the broadCastr SQLite database.
"""
import json
import sqlite3

import db_query

BROADCASTR_DB = "./data/broadcastr.db"

def query_users():
    """
    Queries the database for all user records.
    Returns:
        json results for users in the database
    """
    connection = sqlite3.connect(BROADCASTR_DB)
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM User")
    data = cursor.fetchall()

    cursor.close()
    connection.close()

    return json.dumps(data)

def query_user_id(username):
    """
    Queries the database for the numeric id of a user.
    Args:
        username: The user's last.fm profile name
    Returns:
        numeric user id
    """
    return query_id("UserID", "User", [["LastFmProfileName", username]])

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
    connection = sqlite3.connect(BROADCASTR_DB)
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
    connection = sqlite3.connect(BROADCASTR_DB)
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
    connection = sqlite3.connect(BROADCASTR_DB)
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
    connection = sqlite3.connect(BROADCASTR_DB)
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

def store_artist(artistname, mbid):
    """
    Stores an artist record.
    Args:
        artistname: The name of the artist to store
        mbid: The artist's last.fm mbid (sometimes blank) (mb stands for musicbrainz)
    Returns:
        numeric id of the inserted record
    """
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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

def store_track(trackname, artistid, mbid):
    """
    Stores a track record.
    Args:
        trackname: The name of the track to store
        mbid: The track's last.fm mbid (sometimes blank) (mb stands for musicbrainz)
    Returns:
        numeric id of the inserted record
    """
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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

def delete_top_artists(userid, periodid):
    """
    Deletes user's top artist data for a specified period.
    Args:
        userid: The numeric user id data should be deleted for
        periodid: The period data should be deleted for
    """
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
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
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
    cursor = connection.cursor()

    cursor.execute("DELETE FROM TopTrack WHERE UserID = ? AND PeriodID = ?", (userid, periodid))

    cursor.close()
    connection.close()
