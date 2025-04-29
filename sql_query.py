import db_query
import json
import sqlite3

BROADCASTR_DB = "./data/broadcastr.db"

def queryUsers():
    
    connection = sqlite3.connect(BROADCASTR_DB)
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM User")
    data = cursor.fetchall()
    
    cursor.close()
    connection.close()

    return json.dumps(data)

def store_top_artists(username, period):

    # Get the user's database id
    userid = queryUserId(username)

    # Get the period id (should eventually be passed in by id rather than name?)
    periodid = queryPeriodId(period)

    # Wipe user top artists data for this period.
    deleteTopArtistData(userid, periodid)

    # Get updated data
    top_artists_data = db_query.get_top_artists(username, period)["topartists"]["artist"]
    # print(top_artists_data)

    # Store updated data
    for i in range(len(top_artists_data)):
        artistname = top_artists_data[i]["name"]
        artistmbid = top_artists_data[i]["mbid"]
        artistid = queryArtistId(artistname) 
        if (artistid == 0):
            artistid = storeArtist(artistname, artistmbid)

        storeTopArtistData(userid, artistid, periodid, top_artists_data[i]["playcount"])

    return "top artists stored successfully!"

def queryUserId(username):
    return queryId("UserID", "User", "LastFmProfileName", username)

def queryArtistId(artistname):
    # Simply doing a name lookup for now, but MBID might be better with name as a fallback
    return queryId("ArtistID", "Artist", "Artistname", artistname)

def queryPeriodId(period):
    return queryId("PeriodID", "Period", "PeriodName", period)

def queryId(idfield, table, namefield, namelookup):
    connection = sqlite3.connect(BROADCASTR_DB)
    cursor = connection.cursor()

    print(f"Looking up id for {namelookup}")

    # TODO switch to parameterized query
    cursor.execute("SELECT " + idfield + " FROM " + table + " WHERE " + namefield + " = '" + namelookup + "'")
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

def queryTopArtistData(username, period):
    connection = sqlite3.connect(BROADCASTR_DB)
    cursor = connection.cursor()

    # Get the user's database id
    userid = queryUserId(username)

    # Get the period id (should eventually be passed in by id rather than name?)
    periodid = queryPeriodId(period)

    cursor.execute(
        "SELECT User.BroadCastrProfileName, Artist.ArtistName, Period.PeriodName, TopArtist.Playcount, TopArtist.LastUpdated " \
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

def storeArtist(artistname, mbid):
    # TODO Look into isolation level a little more
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
    cursor = connection.cursor()

    print(f"storing artist {artistname}, {mbid}")

    cursor.execute("INSERT INTO Artist (ArtistName, LastFmMbid) VALUES (?, ?)", (artistname, mbid))

    connection.commit
    cursor.close()
    connection.close()

    print(f"New record ID: {cursor.lastrowid}")

    return cursor.lastrowid

def storeTopArtistData(userid, artistid, periodid, playcount):
    # TODO Look into isolation level a little more
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
    cursor = connection.cursor()

    # print(f"storing top artist data")

    cursor.execute(
        "INSERT INTO TopArtist (UserID, ArtistID, PeriodID, Playcount, LastUpdated) " \
        "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)", 
        (userid, artistid, periodid, playcount))

    connection.commit
    cursor.close()
    connection.close()

    print(f"New record ID: {cursor.lastrowid}")

    return cursor.lastrowid

def deleteTopArtistData(userid, periodid):
    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
    cursor = connection.cursor()

    cursor.execute("DELETE FROM TopArtist WHERE UserID = ? AND PeriodID = ?", (userid, periodid))

    connection.commit
    cursor.close()
    connection.close()

    return cursor.lastrowid