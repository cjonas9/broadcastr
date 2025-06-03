@broadcast_bp.route("/api/get-broadcasts")
def api_get_broadcasts():
    """
    Retrieves broadcasts.  User and Type are optional.
    Example:
        GET /api/get-broadcasts?user=LastFmProfileName&type=type&limit=n&current_user=LastFmProfileName
    Returns JSON:
      {
        "broadcasts": [
            { 
                "id": int,
                "user": str,
                "user_pfp_sm": str,
                "user_pfp_med": str,
                "user_pfp_lg": str,
                "user_pfp_xl": str,
                "title": str,
                "body": str,
                "timestamp": str,
                "type": str,
                "relatedto": str,
                "relatedid: int",
                "likes": int,
                "isLiked": bool
            },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    current_user = request.args.get("current_user", "")
    related_type = request.args.get("type", "")
    limit = int(request.args.get("limit", "50"))
    user_id = sql_query.query_user_id(user)
    current_user_id = sql_query.query_user_id(current_user)

    sql = """
        SELECT broadcasts.id, broadcasts.user, 
               broadcasts.user_pfp_sm, broadcasts.user_pfp_med,
               broadcasts.user_pfp_lg, broadcasts.user_pfp_xl,
               broadcasts.title, broadcasts.body,
               broadcasts.timestamp, broadcasts.type, broadcasts.relatedid, broadcasts.relatedto,
               broadcasts.track_url,
               COUNT(DISTINCT l1.LikeID) AS likes,
               MAX(CASE WHEN l2.UserID = ? THEN 1 ELSE 0 END) as isLiked
        FROM (
    """

    first = 1
    related_types = sql_query.query_related_type_tables()
    for row in related_types:
        if related_type == "" or related_type == row['Description']:
            if first == 1:
                first = 0
            else:
                sql += """
                    UNION
                """
            sql += """
                SELECT Broadcast.BroadcastID AS id, UserTable.LastFmProfileName AS user,
                    UserTable.PfpSmall AS user_pfp_sm, UserTable.PfpMedium AS user_pfp_med,
                    UserTable.PfpLarge AS user_pfp_lg, UserTable.PfpExtraLarge AS user_pfp_xl,
                    Broadcast.Title AS title, Broadcast.Body AS body,
                    Broadcast.Timestamp AS timestamp, RelatedType.Description AS type,
                    Broadcast.RelatedID AS relatedid,
            """
            if row['DbIdField'] is not None:
                sql += f"{row['DbTable']}.{row['DbNameField']} AS relatedto,"
            else:
                sql += "'' AS relatedto,"
            if row['DbIdField'] == "TrackID":
                 sql += "Track.LastFmTrackUrl AS track_url,"
            else:
                sql += "'' AS track_url,"
            sql += """
                    Broadcast.Deleted AS deleted
                FROM Broadcast
                INNER JOIN User AS UserTable ON Broadcast.UserID = UserTable.UserID
            """
            if user_id != 0:
                sql += f"AND UserTable.UserID = {user_id}"
            sql += f"""
                INNER JOIN RelatedType ON RelatedType.RelatedTypeID = BroadCast.RelatedTypeID
                    AND RelatedType.RelatedTypeID = {row['RelatedTypeID']}
            """
            if row['DbIdField'] is not None:
                sql += f"""
                LEFT JOIN {row['DbTable']} ON Broadcast.RelatedID
                        = {row['DbTable']}.{row['DbIdField']}
            """

    sql += f"""
        ) AS broadcasts
        LEFT JOIN Like l1 ON broadcasts.id = l1.RelatedID
            AND l1.RelatedTypeID = {related_type_enum.RelatedType.BROADCAST.value}
        LEFT JOIN Like l2 ON broadcasts.id = l2.RelatedID
            AND l2.RelatedTypeID = {related_type_enum.RelatedType.BROADCAST.value}
            AND l2.UserID = ?
        WHERE deleted = 0
        GROUP BY broadcasts.id, broadcasts.user,
                 broadcasts.user_pfp_sm, broadcasts.user_pfp_med,
                 broadcasts.user_pfp_lg, broadcasts.user_pfp_xl,
                 broadcasts.title, broadcasts.body,
                 broadcasts.timestamp, broadcasts.type, broadcasts.RelatedID, broadcasts.relatedto,
                 broadcasts.track_url
        ORDER BY broadcasts.Timestamp DESC
        LIMIT ?
    """

    connection = sql_query.get_db_connection()
    cursor = connection.cursor()

    cursor.execute(sql, (current_user_id, current_user_id, limit))
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    broadcasts = [
        {
          "id":             row["id"],
          "user":           row["user"],
          "user_pfp_sm":    row["user_pfp_sm"],
          "user_pfp_med":   row["user_pfp_med"],
          "user_pfp_lg":    row["user_pfp_lg"],
          "user_pfp_xl":    row["user_pfp_xl"],
          "title":          row["title"],
          "body":           row["body"],
          "timestamp":      row["timestamp"],
          "type":           row["type"],
          "relatedid":      row["relatedid"],
          "relatedto":      row["relatedto"],
          "track_url":      row["track_url"],
          "likes":          row["likes"],
          "isLiked":        row["isLiked"] == 1
        }
        for row in rows
    ]

    return jsonify({ "broadcasts": broadcasts }) 