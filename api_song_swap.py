"""
This module provides supporting functions for API routes pertaining to song swaps.
"""
from flask import Blueprint, jsonify, request
import sql_query
import validation

song_swap_bp = Blueprint('song-swap', __name__)

@song_swap_bp.route("/api/initiate-song-swap", methods=['POST'])
def api_initiate_song_swap():
    """
    Creates a song swap. Matched user is optional, and if it is not provided
    a random user that has logged in within the last 7 days will be matched.
    Example:
        POST /api/initiate-song-swap?user=LastFmProfileName&matched_user=LastFmProfileName
    Raises:
        400 Bad Request: If the user is not provided or invalid.
        400 Bad Request: If a matched user could not be found.
    Returns:
        201 Success: The database ID of the newly created song 
                     swap record and the matched user id.
    """
    user = request.args.get("user", "")
    matched_user = request.args.get("matched_user", "")

    user_id = sql_query.query_user_id(user)
    matched_user_id = sql_query.query_user_id(matched_user)

    error_string = validation.validate_song_swap(user_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    # Find a matched user
    if matched_user_id == 0:
        matched_user_id = sql_query.query_matched_user_for_song_swap(user_id)
    if matched_user_id == 0:
        return jsonify({"error": "Could not locate a matched user for song swap."}), 400

    cursor.execute(
            """
            INSERT INTO SongSwap(InitiatingUserID, MatchedUserID, InitiatedTimestamp)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            """,
            (user_id, matched_user_id))

    cursor.close()
    connection.close()

    return jsonify({"success": True,
                    "song_swap_id": cursor.lastrowid, 
                    "matched_user_id": matched_user_id}), 201
