"""
This module provides API routes for interacting with the broadcastr backend/database.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import api_direct_messages
import api_following
import sql_query

app = Flask(__name__)
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
    user   = request.args.get("user",   "")
    artist = request.args.get("artist", "")
    period = request.args.get("period", "")
    count  = query_listens_for_artist(user, artist, period)
    return jsonify({ "user": user, "artist": artist, "period": period, "plays": count })

@app.route("/api/artist/top-listeners")
def api_top_listeners():
    artist = request.args.get("artist", "")
    period = request.args.get("period", "")
    limit  = int(request.args.get("limit", "10"))
    results = query_top_listeners_for_artist(artist, period, limit)
    # results is List[(username, playcount)]
    top_listeners = [
        {"username": row[0], "playcount": row[1]}
        for row in results
    ]
    return jsonify({
        "artist": artist,
        "period": period,
        "topListeners": top_listeners
    })

##############################################
#                Following                   #
##############################################
@app.route("/api/user/follow", methods=['POST'])
def api_user_follow_route():
    return api_following.api_user_follow(request)

@app.route("/api/user/unfollow", methods=['POST'])
def api_user_unfollow_route():
    return api_following.api_user_unfollow(request)
   
@app.route("/api/user/followers")
def api_user_followers_route():
    return api_following.api_user_followers(request)

@app.route("/api/user/following")
def api_user_following_route():
    return api_following.api_user_following(request)

##############################################
#    Direct Messages and Conversations       #
##############################################
@app.route("/api/user/conversations")
def api_user_conversations_route():
    return api_direct_messages.api_user_conversations(request)

@app.route("/api/user/direct-messages")
def api_user_direct_messages_route():
    return api_direct_messages.api_user_direct_messages(request)

@app.route("/api/send-direct-message", methods=['POST'])
def api_send_direct_message_route():
    return api_direct_messages.api_send_direct_message(request)

@app.route("/api/mark-messages-read", methods=['POST'])
def api_mark_messages_read_route():
    return api_direct_messages.api_mark_messages_read(request)

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
          # If you don’t yet have images in your DB, you can leave it blank:
          "imageUrl":    ""
        }
        for row in rows
    ]

    return jsonify({ "topArtists": top_artists })

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
