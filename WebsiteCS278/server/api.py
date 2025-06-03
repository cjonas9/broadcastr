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

    conn = sql_query.get_db_connection_isolation_none()
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