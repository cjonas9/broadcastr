from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

BROADCASTR_DB = "./data/broadcastr.db"
print("Backend is running on port 8000...")
def get_db_connection():
    conn = sqlite3.connect(BROADCASTR_DB)
    conn.row_factory = sqlite3.Row
    return conn

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

    conn = sqlite3.connect(BROADCASTR_DB)
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

    conn = sqlite3.connect(BROADCASTR_DB)
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
	connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
	cursor = connection.cursor()

	cursor.execute("INSERT INTO Artist (ArtistName, LastFmMbid) VALUES (?, ?)", (artistname, mbid))

	cursor.close()
	connection.close()

	return cursor.lastrowid

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

@app.route("/api/user/top-artists")
def api_user_top_artists():
    """
    GET /api/user/top-artists?user=<LastFmProfileName>&period=<PeriodName>&limit=<n>
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

    conn = get_db_connection()
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
'''
@app.route("/api/artist/top-listeners")
def api_top_listeners():
    print("hello??")
    """GET /api/artist/top-listeners?artist=…&period=…&limit=…"""
    artist = request.args.get("artist", "")
    period = request.args.get("period", "")
    limit  = int(request.args.get("limit", "10"))
    top    = query_top_listeners_for_artist(artist, period, limit)
    return jsonify({ "artist": artist, "period": period, "topListeners": top })
'''
@app.route("/api/artist/by-id")
@app.route("/artist/by-id")
def get_artist_by_id():
    artist_id = request.args.get("id", type=int)
    if artist_id is None:
        return jsonify({"error": "Missing or invalid artist ID"}), 400

    conn = get_db_connection()
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

