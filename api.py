"""
This module provides API routes for interacting with the broadcastr backend/database.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from api_broadcast import broadcast_bp
from api_direct_messages import direct_messages_bp
from api_following import following_bp
from api_like import like_bp
from api_song_swap import song_swap_bp
from api_user_profile import user_profile_bp
import related_type_enum
import sql_query
import db_query

app = Flask(__name__)

app.register_blueprint(broadcast_bp, url_prefix='/')
app.register_blueprint(direct_messages_bp, url_prefix='/')
app.register_blueprint(following_bp, url_prefix='/')
app.register_blueprint(like_bp, url_prefix='/')
app.register_blueprint(song_swap_bp, url_prefix='/')
app.register_blueprint(user_profile_bp, url_prefix='/')

CORS(app)

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

    conn = sql_query.get_db_connection()
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

    conn = sql_query.get_db_connection()
    cur = conn.cursor()
    cur.execute(sql, (artistname, periodname, limit))
    results = cur.fetchall()
    cur.close()
    conn.close()

    # results is List[(username:str, playcount:int)]
    return results

@app.route("/api/artist/listens")
def api_listens():
    """GET /api/artist/listens?user=…&artist=…&period=…"""
    user = request.args.get("user", "")
    artist = request.args.get("artist", "")
    period = request.args.get("period", "")
    
    # First try to get from TopArtist table
    count = query_listens_for_artist(user, artist, period)
    
    # If not found in TopArtist table, query Last.fm API directly
    if count == 0:
        count = db_query.get_artist_playcount(user, artist, period)
        
    return jsonify({ "user": user, "artist": artist, "period": period, "plays": count })

@app.route("/api/artist/top-listeners")
def api_top_listeners():
    artist = request.args.get("artist", "")
    period = request.args.get("period", "")
    limit = int(request.args.get("limit", "10"))
    current_user = request.args.get("current_user", "")  # Add current_user parameter
    
    # Get top listeners from database
    results = query_top_listeners_for_artist(artist, period, limit)
    db_listeners = {row[0]: row[1] for row in results}  # username -> playcount
    
    # If current user isn't in top listeners or has 0 plays, check Last.fm
    if current_user:
        current_user_plays = db_listeners.get(current_user, 0)
        if current_user_plays == 0:
            current_user_plays = db_query.get_artist_playcount(current_user, artist, period)
            if current_user_plays > 0:
                db_listeners[current_user] = current_user_plays
    
    # Sort by playcount and take top N
    sorted_listeners = sorted(db_listeners.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    top_listeners = [
        {"username": username, "playcount": playcount}
        for username, playcount in sorted_listeners
    ]
    
    return jsonify({
        "artist": artist,
        "period": period,
        "topListeners": top_listeners
    })

@app.route("/api/user/top-artists")
def api_user_top_artists():
    """
    Gets top artists and number of scrobbles (listens) for a user.
    Example:
        GET /api/user/top-artists?user=LastFmProfileName&period=PeriodName&limit=n
    Returns JSON:
      {
        "topArtists": [
          { "id": int, "name": str, "scrobbles": int, "imageUrl": str },
          …
        ]
      }
    """
    user   = request.args.get("user", "")
    period = request.args.get("period", "")
    limit  = int(request.args.get("limit", "10"))

    sql = """
    SELECT A.ArtistID   AS id,
           A.ArtistName AS name,
           TA.Playcount  AS scrobbles
      FROM TopArtist TA
      JOIN User   U  ON TA.UserID   = U.UserID
      JOIN Artist A  ON TA.ArtistID = A.ArtistID
      JOIN Period P  ON TA.PeriodID = P.PeriodID
     WHERE U.LastFmProfileName = ?
       AND P.PeriodName        = ?
     ORDER BY TA.Playcount DESC
     LIMIT ?
    """

    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (user, period, limit)).fetchall()
    conn.close()

    top_artists = [
        {
          "id":          row["id"],
          "name":        row["name"],
          "scrobbles":   row["scrobbles"],
          # If you don't yet have images in your DB, you can leave it blank:
          "imageUrl":    ""
        }
        for row in rows
    ]

    return jsonify({ "topArtists": top_artists })

@app.route("/api/user/top-tracks")
def api_user_top_tracks():
    """
    Gets top tracks and number of scrobbles (listens) for a user.
    Example:
        GET /api/user/top-tracks?user=LastFmProfileName&period=PeriodName&limit=n
    Returns JSON:
      {
        "topTracks": [
          { 
            "id": int,
            "track": str,
            "artist": str,
            "playcount": int,
            "lastfmtrackurl": str
          },
          …
        ]
      }
    """
    user   = request.args.get("user", "")
    period = request.args.get("period", "")
    limit  = int(request.args.get("limit", "10"))

    sql = """
        SELECT Track.TrackID AS id, Track.TrackName AS track,
               Artist.ArtistName AS artist, TopTrack.Playcount AS playcount,
               Track.LastFmTrackUrl AS lastfmtrackurl
        FROM TopTrack
        INNER JOIN Track ON TopTrack.TrackID = Track.TrackID
        INNER JOIN Artist ON Track.ArtistID = Artist.ArtistID
        INNER JOIN User ON TopTrack.UserID = User.UserID
        INNER JOIN Period ON TopTrack.PeriodID = Period.PeriodID
        WHERE User.LastFmProfileName = ?
            AND Period.PeriodName = ?
        ORDER BY TopTrack.Playcount DESC
        LIMIT ?
    """

    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (user, period, limit)).fetchall()
    conn.close()

    top_tracks = [
        {
          "id":             row["id"],
          "track":          row["track"],
          "artist":         row["artist"],
          "playcount":      row["playcount"],
          "lastfmtrackurl": row["lastfmtrackurl"]
        }
        for row in rows
    ]

    return jsonify({ "topTracks": top_tracks })

@app.route("/api/user/top-broadcasted-tracks")
def api_user_top_broadcasted_tracks():
    """
    Gets top broadcasted tracks for a user and the number of likes.
    Example:
        GET /api/user/top-broadcasted-tracks?user=LastFmProfileName&limit=n
    Returns JSON:
      {
        "topBroadcastedTracks": [
          { 
            "broadcastid": int,
            "trackid": int,
            "track": str,
            "artist": str,
            "lastfmtrackurl": str,
            "likes": int
          },
          …
        ]
      }
    """
    user   = request.args.get("user", "")
    limit  = int(request.args.get("limit", "10"))

    user_id = sql_query.query_user_id(user)

    sql = """
        SELECT Broadcast.BroadcastID AS broadcastid, Track.TrackID AS trackid,
               Track.TrackName AS track, Artist.ArtistName AS artist,
               Track.LastFmTrackUrl AS lastfmtrackurl,
               COUNT(Like.LikeID) AS likes
        FROM Broadcast 
        INNER JOIN Track ON Broadcast.RelatedID = Track.TrackID
        INNER JOIN Artist ON Track.ArtistID = Artist.ArtistID
        LEFT JOIN Like ON Broadcast.BroadcastID = Like.RelatedID
          AND Like.RelatedTypeID = ?
        WHERE Broadcast.RelatedTypeID = ?
          AND Broadcast.UserID = ?
          AND Broadcast.Deleted = 0
        GROUP BY Broadcast.BroadcastID, Track.TrackID, Track.TrackName,
            Artist.ArtistName, Track.LastFmTrackUrl
        ORDER BY COUNT(Like.LikeID) DESC, Broadcast.Timestamp DESC
        LIMIT ?
    """

    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (related_type_enum.RelatedType.BROADCAST.value,
                              related_type_enum.RelatedType.TRACK.value,
                              user_id, limit)).fetchall()
    conn.close()

    top_broadcasted_tracks = [
        {
          "broadcastid":    row["broadcastid"],
          "trackid":        row["trackid"],
          "track":          row["track"],
          "artist":         row["artist"],
          "lastfmtrackurl": row["lastfmtrackurl"],
          "likes":          row["likes"]
        }
        for row in rows
    ]

    return jsonify({ "topTracks": top_broadcasted_tracks })

@app.route("/api/artist/by-id")
@app.route("/artist/by-id")
def get_artist_by_id():
    artist_id = request.args.get("id", type=int)
    if artist_id is None:
        return jsonify({"error": "Missing or invalid artist ID"}), 400

    conn = sql_query.get_db_connection()
    artist = conn.execute(
        "SELECT ArtistID AS id, ArtistName AS name FROM Artist WHERE ArtistID = ?", (artist_id,)
    ).fetchone()
    conn.close()

    if artist is None:
        return jsonify({"error": "Artist not found"}), 404

    return jsonify({
        "artist": {
            "id": artist["id"],
            "name": artist["name"],
        }
    })


if __name__ == "__main__":
    print("Backend is running on port 8000...")
    app.run(host='127.0.0.1', port=8000, debug=True)
