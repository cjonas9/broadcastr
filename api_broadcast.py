"""
This module provides supporting functions for API routes pertaining to broadcasts.
"""
from flask import Blueprint, jsonify, request
import related_type_enum
import sql_query
import validation

broadcast_bp = Blueprint('broadcast', __name__)

@broadcast_bp.route("/api/create-broadcast", methods=['POST'])
def api_create_broadcast():
    """
    Creates a broadcast.
    Example:
        POST /api/create-broadcast?user=LastFmProfileName&title=title&body=body
                                  &relatedtype=thing&relatedid=id
    Raises:
        400 Bad Request: If the user, title or body is not provided or invalid.
                         (At this time, title OR body is required, but not both)
    Returns:
        201 Success: The database ID of the newly created broadcast record.
    """
    user = request.args.get("user", "")
    title = request.args.get("title", "")
    body = request.args.get("body", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)

    error_string = validation.validate_broadcast(user_id, title, body, related_type_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    new_record_id = sql_query.store_broadcast(0, user_id, title, body, related_type_id, related_id)

    return jsonify({"success": new_record_id}), 201

@broadcast_bp.route("/api/delete-broadcast", methods=['POST'])
def api_delete_broadcast():
    """
    Marks a broadcast record as deleted.
    Example:
        POST /api/delete-broadcast?id=n
    Returns:
        200 Success: Deleted broadcast.
    """
    broadcast_id = int(request.args.get("id", "0"))

    if broadcast_id == 0:
        return jsonify({"error": "Missing or invalid broadcast id"}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        """
            UPDATE Broadcast
            SET Deleted = 1
            WHERE BroadcastID = ?
        """,
        (broadcast_id,))

    cursor.close()
    connection.close()

    return jsonify({"success": True}), 200

@broadcast_bp.route("/api/get-broadcasts")
def api_get_broadcasts():
    """
    Retrieves broadcasts.  User and Type are optional.
    Example:
        GET /api/get-broadcasts?user=LastFmProfileName&type=type&limit=n
    Returns JSON:
      {
        "broadcasts": [
          { "id": int, "user": str, "title": str, "body": str,
            "timestamp": str, "type": str, "relatedto": str, "relatedid: int",
            "likes": int },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    related_type = request.args.get("type", "")
    limit = int(request.args.get("limit", "50"))
    user_id = sql_query.query_user_id(user)

    sql = """
        SELECT broadcasts.id, broadcasts.user, broadcasts.title, broadcasts.body,
               broadcasts.timestamp, broadcasts.type, broadcasts.relatedid, broadcasts.relatedto,
               COUNT(Like.LikeID) AS likes
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
                    Broadcast.Title AS title, Broadcast.Body AS body,
                    Broadcast.Timestamp AS timestamp, RelatedType.Description AS type,
                    Broadcast.RelatedID AS relatedid,
            """
            if row['DbIdField'] is not None:
                sql += f"{row['DbTable']}.{row['DbNameField']} AS relatedto,"
            else:
                sql += "'' AS relatedto,"
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
        LEFT JOIN Like ON broadcasts.id = Like.RelatedID
			AND Like.RelatedTypeID = {related_type_enum.RelatedType.BROADCAST.value}
        WHERE deleted = 0
		GROUP BY broadcasts.id, broadcasts.user, broadcasts.title, broadcasts.body,
				 broadcasts.timestamp, broadcasts.type, broadcasts.RelatedID, broadcasts.relatedto
        ORDER BY broadcasts.Timestamp DESC
        LIMIT ?
    """

    # print(f"Broadcasts query: {sql}")

    connection = sql_query.get_db_connection()
    cursor = connection.cursor()

    cursor.execute(sql, (limit,))
    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    broadcasts = [
        {
          "id":         row["id"],
          "user":       row["user"],
          "title":      row["title"],
          "body":       row["body"],
          "timestamp":  row["timestamp"],
          "type":       row["type"],
          "relatedto":  row["relatedto"],
          "relatedid":  row["relatedid"],
          "likes":      row["likes"]
        }
        for row in rows
    ]

    return jsonify({ "broadcasts": broadcasts })
