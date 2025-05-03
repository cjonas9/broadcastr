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
    return query_id("UserID", "User", "LastFmProfileName", username)

def query_artist_id(artistname):
    """
    Queries the database for the numeric id of an artist.
    Args:
        artistname: The artist's name
    Returns:
        numeric artist id
    """
    # Simply doing a name lookup for now, but MBID might be better with name as a fallback
    return query_id("ArtistID", "Artist", "Artistname", artistname)

def query_period_id(period):
    """
    Queries the database for the numeric id of a period.
    Args:
        period: The period's name
    Returns:
        numeric period id
    """
    return query_id("PeriodID", "Period", "PeriodName", period)

def query_id(idfield, table, namefield, namelookup):
    """
    Queries the database for a numeric id of a record.
    Args:
        idfield: The name of the field containing the id
        table: The table containing the record
        namefield: The name of the field containing the name
        namelookup: The value of the name field to lookup
    Returns:
        numeric record id
    """
    connection = sqlite3.connect(BROADCASTR_DB)
    cursor = connection.cursor()

    print(f"Looking up id for {namelookup}")

    query = f"SELECT {idfield} FROM {table} WHERE {namefield} = ?"
    cursor.execute(query, (namelookup,))
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
        "ORDER BY Playcount DESC", (userid, periodid))
    data = cursor.fetchall()

    cursor.close()
    connection.close()

    return json.dumps(data)

def store_artist(artistname, mbid):
    """
    Stores an artist record.
    Args:
        artistname: The name of the artist to store
        mbid: The artist's last.fm mbid (sometimes blank)
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
