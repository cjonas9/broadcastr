from flask import Flask, jsonify, request
import sql_query
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

@app.route("/api/user/conversations")
def api_user_conversations():
    """
    GET /api/user/conversations?user=<LastFmProfileName>&limit=<n>
    Returns JSON:
      {
        "conversations": [
          { "conversant": str, "messagecount": int, "unreadcount": int, "lastconversation": str },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    limit = int(request.args.get("limit", 50))

    sql = """
        SELECT conversant, COUNT(id) AS messagecount, SUM(unread) AS unreadcount, MAX(timestamp) AS lastconversation
        FROM (
            SELECT Sender.LastFmProfileName AS conversant, MessageReceived.DirectMessageID as id,
                   CASE WHEN MessageReceived.Read = 1 THEN 0 ELSE 1 END AS Unread, MessageReceived.TimeSent AS timestamp
            FROM DirectMessage AS MessageReceived
            INNER JOIN User AS Sender ON MessageReceived.SenderID = Sender.UserID
            INNER JOIN User AS Recipient ON MessageReceived.RecipientID = Recipient.UserID
            WHERE Recipient.LastFmProfileName = ?
            UNION ALL
            SELECT Recipient.LastFmProfileName AS conversant, MessageSent.DirectMessageID AS id,
                   0 AS Unread, MessageSent.TimeSent as timestamp
            FROM DirectMessage AS MessageSent
            INNER JOIN User AS Sender ON MessageSent.SenderID = Sender.UserID
            INNER JOIN User AS Recipient ON MessageSent.RecipientID = Recipient.UserID
            WHERE Sender.LastFmProfileName = ?
        ) AS data
        GROUP BY conversant
        ORDER BY lastconversation DESC
        LIMIT ?
    """
    conn = get_db_connection()
    rows = conn.execute(sql, (user, user, limit)).fetchall()
    conn.close()

    conversations = [
        {
          "conversant":         row["conversant"],
          "messagecount":       row["messagecount"],
          "unreadcount":        row["unreadcount"],
          "lastconversation":   row["lastconversation"]
        }
        for row in rows
    ]

    return jsonify({ "conversations": conversations })

@app.route("/api/user/direct-messages")
def api_user_direct_messages():
    """
    GET /api/user/direct-messages?user=<LastFmProfileName>&conversant=<LastFmProfileName>&limit=<n>
    Returns JSON:
      {
        "directMessages": [
          { "id": int, "type": str, "sender": str, "recipient": str, "message": str, "timestamp": str },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    conversant = request.args.get("conversant", "")
    limit = int(request.args.get("limit", 50))

    sql = """
        SELECT *
        FROM (
            SELECT *
            FROM (
                SELECT 'Incoming' AS type, MessageReceived.DirectMessageID as id, Sender.LastFmProfileName AS sender,
                        Recipient.LastFmProfileName AS recipient, MessageReceived.MessageBody AS message,
                        MessageReceived.TimeSent AS timestamp
                FROM DirectMessage AS MessageReceived
                INNER JOIN User AS Recipient ON MessageReceived.RecipientID = Recipient.UserID
                INNER JOIN User AS Sender ON MessageReceived.SenderID = Sender.UserID
                WHERE Recipient.LastFmProfileName = ?
                   AND Sender.LastFmProfileName = ?
                UNION ALL
                SELECT 'Outgoing' As type, MessageSent.DirectMessageID as id, Sender.LastFmProfileName AS sender,
                    Recipient.LastFmProfileName AS recipient, MessageSent.MessageBody AS message,
                    MessageSent.TimeSent AS timestamp
                FROM DirectMessage AS MessageSent
                INNER JOIN User AS Recipient ON MessageSent.RecipientID = Recipient.UserID
                INNER JOIN User AS Sender on MessageSent.SenderID = Sender.UserID
                WHERE Sender.LastFmProfileName = ?
                   AND Recipient.LastFmProfileName = ?
            ) AS innerData /* Inner data ensures we get the most recent messages when limiting */
            ORDER BY innerData.timestamp DESC
            LIMIT ?
        ) AS outerData /* Outer data sorts the limited messages oldest to newest */
        ORDER BY outerData.timestamp
    """
    conn = get_db_connection()
    rows = conn.execute(sql, (user, conversant, user, conversant, limit)).fetchall()
    conn.close()

    direct_messages = [
        {
          "id":         row["id"],
          "type":       row["type"],
          "sender":     row["sender"],
          "recipient":  row["recipient"],
          "message":    row["message"],
          "timestamp":  row["timestamp"]
        }
        for row in rows
    ]

    return jsonify({ "directMessages": direct_messages })

@app.route("/api/send-direct-message", methods=['POST'])
def api_send_direct_message():
    """
    POST /api/send-message?sender=<LastFmProfileName>&recipient=<LastFmProfileName>&message=<str>
    Raises:
        400 Bad Request: If the user, recipient, or message is not provided or invalid.
    Returns:
        201 Success: The database ID of the newly created direct message record.
    """
    user = request.args.get("user", "")
    recipient = request.args.get("recipient", "")
    message = request.args.get("message", "")

    sender_id = sql_query.query_user_id(user)
    recipient_id = sql_query.query_user_id(recipient)

    if sender_id == 0:
        return jsonify({"error": "Missing or invalid user"}), 400
    if recipient_id == 0:
        return jsonify({"error": "Missing or invalid recipient"}), 400
    if not message.strip():
        return jsonify({"error": "message is required"}), 400

    connection = sqlite3.connect(BROADCASTR_DB, isolation_level=None)
    cursor = connection.cursor()

    cursor.execute(
        "INSERT INTO DirectMessage(SenderID, RecipientID, MessageBody, TimeSent) " \
        "VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
        (sender_id, recipient_id, message))

    cursor.close()
    connection.close()

    return jsonify({"success": cursor.lastrowid}), 201

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

