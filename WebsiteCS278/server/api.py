@app.route("/api/user/top-broadcasted-tracks")
def api_user_top_broadcasted_tracks():
    """
    Gets top broadcasted tracks for a user and the number of likes.
    Example:
        GET /api/user/top-broadcasted-tracks?user=LastFmProfileName&limit=n&current_user=LastFmProfileName
    Returns JSON:
      {
        "topBroadcastedTracks": [
          { 
            "broadcastid": int,
            "trackid": int,
            "track": str,
            "artist": str,
            "lastfmtrackurl": str,
            "likes": int,
            "isLiked": bool
          },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    current_user = request.args.get("current_user", "")
    limit = int(request.args.get("limit", "10"))

    user_id = sql_query.query_user_id(user)
    current_user_id = sql_query.query_user_id(current_user)

    sql = """
        SELECT Broadcast.BroadcastID AS broadcastid, Track.TrackID AS trackid,
               Track.TrackName AS track, Artist.ArtistName AS artist,
               Track.LastFmTrackUrl AS lastfmtrackurl,
               COUNT(DISTINCT l1.LikeID) AS likes,
               MAX(CASE WHEN l2.UserID = ? THEN 1 ELSE 0 END) as isLiked
        FROM Broadcast 
        INNER JOIN Track ON Broadcast.RelatedID = Track.TrackID
        INNER JOIN Artist ON Track.ArtistID = Artist.ArtistID
        LEFT JOIN Like l1 ON Broadcast.BroadcastID = l1.RelatedID
          AND l1.RelatedTypeID = ?
        LEFT JOIN Like l2 ON Broadcast.BroadcastID = l2.RelatedID
          AND l2.RelatedTypeID = ?
          AND l2.UserID = ?
        WHERE Broadcast.RelatedTypeID = ?
          AND Broadcast.UserID = ?
          AND Broadcast.Deleted = 0
        GROUP BY Broadcast.BroadcastID, Track.TrackID, Track.TrackName,
            Artist.ArtistName, Track.LastFmTrackUrl
        ORDER BY COUNT(l1.LikeID) DESC, Broadcast.Timestamp DESC
        LIMIT ?
    """

    connection = sql_query.get_db_connection()
    cursor = connection.cursor()

    cursor.execute(sql, (
        current_user_id,
        related_type_enum.RelatedType.BROADCAST.value,
        related_type_enum.RelatedType.BROADCAST.value,
        current_user_id,
        related_type_enum.RelatedType.TRACK.value,
        user_id,
        limit
    ))
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    top_broadcasted_tracks = [
        {
          "broadcastid":    row["broadcastid"],
          "trackid":        row["trackid"],
          "track":          row["track"],
          "artist":         row["artist"],
          "lastfmtrackurl": row["lastfmtrackurl"],
          "likes":          row["likes"],
          "isLiked":        row["isLiked"] == 1
        }
        for row in rows
    ]

    return jsonify({ "topTracks": top_broadcasted_tracks }) 