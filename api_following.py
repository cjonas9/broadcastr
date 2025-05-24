"""
This module provides supporting functions for API routes pertaining to following.
"""
from flask import jsonify
import sql_query

def api_user_follow(request):
    """
    Creates a following relationship between two users
    Example:
        POST /api/user/follow?follower=LastFmProfileName&followee=LastFmProfileName
    Raises:
        400 Bad Request: If the follower or followee is not provided or invalid.
        400 Bad Request: If a following record already exists for this follower/followee
                         combination.
    Returns:
        201 Success: The database ID of the newly created following record.
    """
    follower = request.args.get("follower", "")
    followee = request.args.get("followee", "")

    follower_id = sql_query.query_user_id(follower)
    followee_id = sql_query.query_user_id(followee)

    if follower_id == 0:
        return jsonify({"error": "Missing or invalid follower"}), 400
    if followee_id == 0:
        return jsonify({"error": "Missing or invalid followee"}), 400

    following_id = sql_query.query_following_id(follower_id, followee_id)

    if following_id != 0:
        return jsonify({"error": f"This following already exists: {following_id}"}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "INSERT INTO Following(FollowerID, FolloweeID, FollowingSince) " \
        "VALUES (?, ?, CURRENT_TIMESTAMP)",
        (follower_id, followee_id))

    cursor.close()
    connection.close()

    return jsonify({"success": cursor.lastrowid}), 201

def api_user_unfollow(request):
    """
    Removes a following relationship between two users
    Example:
        POST /api/user/unfollow?follower=LastFmProfileName&followee=LastFmProfileName
    Raises:
        400 Bad Request: If the follower or followee is not provided or invalid.
        400 Bad Request: If a following record does not exist for this follower/followee
                         combination.
    Returns:
        200 Success: Indicates the following record was successfully removed.
    """
    follower = request.args.get("follower", "")
    followee = request.args.get("followee", "")

    follower_id = sql_query.query_user_id(follower)
    followee_id = sql_query.query_user_id(followee)

    if follower_id == 0:
        return jsonify({"error": "Missing or invalid follower"}), 400
    if followee_id == 0:
        return jsonify({"error": "Missing or invalid followee"}), 400

    following_id = sql_query.query_following_id(follower_id, followee_id)

    if following_id == 0:
        return jsonify({"error": "Could not locate a following between the specified users."}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM Following " \
        "WHERE FollowingID = ?",
        (following_id,))

    cursor.close()
    connection.close()

    return jsonify({"success": f"Following {following_id} successfully removed."}), 200

def api_user_followers(request):
    """
    Retrieves records for who is following a user.
    Example:
        GET /api/user/followers?user=LastFmProfileName&limit=n
    Returns JSON:
      {
        "followers": [
          { "follower": str, "followingsince": str },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    limit = int(request.args.get("limit", -1))

    user_id = sql_query.query_user_id(user)

    if user_id == 0:
        return jsonify({"error": "Missing or invalid user"}), 400

    sql = """
        SELECT Follower.LastFmProfileName as follower, Following.FollowingSince AS followingsince
        FROM Following
        INNER JOIN User AS Follower ON Following.FollowerID = Follower.UserID
        WHERE Following.FolloweeID = ?
        LIMIT ?
    """
    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (user_id, limit)).fetchall()
    conn.close()

    followers = [
        {
          "follower":       row["follower"],
          "followingsince": row["followingsince"]
        }
        for row in rows
    ]

    return jsonify({ "followers": followers })

def api_user_following(request):
    """
    Retrieves records for who a user is following.
    Example:
        GET /api/user/following?user=LastFmProfileName&limit=n
    Returns JSON:
      {
        "following": [
          { "following": str, "followingsince": str },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    limit = int(request.args.get("limit", -1))

    user_id = sql_query.query_user_id(user)

    if user_id == 0:
        return jsonify({"error": "Missing or invalid user"}), 400

    sql = """
        SELECT Followee.LastFmProfileName as followee, Following.FollowingSince AS followingsince
        FROM Following
        INNER JOIN User AS Followee ON Following.FolloweeID = Followee.UserID
        WHERE Following.FollowerID = ?
        LIMIT ?
    """
    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (user_id, limit)).fetchall()
    conn.close()

    following = [
        {
          "following":      row["followee"],
          "followingsince": row["followingsince"]
        }
        for row in rows
    ]

    return jsonify({ "following": following })
