"""
This module provides supporting functions for API routes pertaining to song swaps.
"""
from flask import Blueprint, jsonify, request
import related_type_enum
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

    matched_user_name = sql_query.query_user_name(matched_user_id)

    cursor.execute(
            """
            INSERT INTO SongSwap(InitiatedUserID, MatchedUserID, SwapInitiatedTimestamp)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            """,
            (user_id, matched_user_id))

    cursor.close()
    connection.close()

    sql_query.store_broadcast(0,
                              sql_query.SYSTEM_ACCOUNT_ID,
                              "New Song Swap",
                              f"{user} has initiated a Song Swap with {matched_user_name}!",
                              related_type_enum.RelatedType.SONG_SWAP.value,
                              cursor.lastrowid)

    return jsonify({"success": True,
                    "song_swap_id": cursor.lastrowid, 
                    "matched_user_id": matched_user_id}), 201

@song_swap_bp.route("/api/add-song-swap-track", methods=['POST'])
def api_add_song_swap_track():
    """
    Adds a track to a song swap. The user type (initiated or matched) will be 
    inferred based on user id and song swap id.
    Example:
        POST /api/add-song-swap-track?user=LastFmProfileName&songswapid=n&trackid=n
    Raises:
        400 Bad Request: If the user or recipient is not provided or invalid.
        400 Bad Request: If the song swap id is not provided or invalid.
        400 Bad Request: If the track id is not provided or invalid.
        400 Bad Request: If the user type could not be inferred.
    Returns:
        200 Success: Indicates the track has been added to the song swap.
    """
    user = request.args.get("user", "")
    song_swap_id = int(request.args.get("songswapid", "0"))
    track_id = int(request.args.get("trackid", "0"))

    user_id = sql_query.query_user_id(user)
    user_type = sql_query.query_inferred_type_for_song_swap(song_swap_id, user_id)

    error_string = validation.validate_add_song_swap_track(user_id, song_swap_id,
                                                           track_id, user_type)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    sql = ""
    if user_type == "initiated":
        sql = """
        Update SongSwap
        SET InitiatedTrackID = ?,
            InitiatedTrackTimestamp = CURRENT_TIMESTAMP
        WHERE InitiatedUserID = ?
            AND SongSwapID = ?
        """
    elif user_type == "matched":
        sql = """
        Update SongSwap
        SET MatchedTrackID = ?,
            MatchedTrackTimestamp = CURRENT_TIMESTAMP
        WHERE MatchedUserID = ?
            AND SongSwapID = ?
        """

    cursor.execute(sql, (track_id, user_id, song_swap_id))

    cursor.close()
    connection.close()

    return jsonify({"success": True}), 200

@song_swap_bp.route("/api/add-song-swap-reaction", methods=['POST'])
def api_add_song_swap_reaction():
    """
    Adds a reaction to a song swap. The user type (initiated or matched) will be 
    inferred based on user id and song swap id.
    Doing this will create a broadcast.  If autotitle is 1 (default) it will 
    randomly create a fun title for the broadcast based on the reaction.
    Example:
        POST /api/add-song-swap-reaction?user=LastFmProfileName&songswapid=n
                                        &reaction=n&autotitle=1
    Raises:
        400 Bad Request: If the user or recipient is not provided or invalid.
        400 Bad Request: If the song swap id is not provided or invalid.
        400 Bad Request: If the user type could not be inferred.
    Returns:
        200 Success: Indicates the reaction has been added to the song swap.
    """
    user = request.args.get("user", "")
    song_swap_id = int(request.args.get("songswapid", "0"))
    reaction = int(request.args.get("reaction", "0"))
    auto_generate_title = request.args.get("autotitle", "1")
    auto_generate_title = 1 if auto_generate_title == "" else int(auto_generate_title)

    user_id = sql_query.query_user_id(user)
    user_type = sql_query.query_inferred_type_for_song_swap(song_swap_id, user_id)

    error_string = validation.validate_add_song_swap_reaction(user_id, song_swap_id, user_type)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    sql = ""
    track_sql = ""
    if user_type == "initiated":
        sql = """
            UPDATE SongSwap
            SET InitiatedReaction = ?,
                InitiatedReactionTimestamp = CURRENT_TIMESTAMP
            WHERE InitiatedUserID = ?
                AND SongSwapID = ?
        """
        track_sql = """
            SELECT Track.TrackName
            FROM Track
            INNER JOIN SongSwap ON Track.TrackID = SongSwap.InitiatedTrackID
            WHERE SongSwap.SongSwapID = ?
        """
    elif user_type == "matched":
        sql = """
            UPDATE SongSwap
            SET MatchedReaction = ?,
                MatchedReactionTimestamp = CURRENT_TIMESTAMP
            WHERE MatchedUserID = ?
                AND SongSwapID = ?
        """
        track_sql = """
            SELECT Track.TrackName
            FROM Track
            INNER JOIN SongSwap ON Track.TrackID = SongSwap.MatchedTrackID
            WHERE SongSwap.SongSwapID = ?
        """

    cursor.execute(sql, (reaction, user_id, song_swap_id))

    cursor.close()
    connection.close()

    # Get the name of the track
    connection = sql_query.get_db_connection()
    cursor = connection.cursor()

    cursor.execute(track_sql, (song_swap_id,))
    row = cursor.fetchone()
    if row:
        track_name = row[0]
    else:
        track_name = "unknown"

    cursor.close()
    connection.close()

    if auto_generate_title == 1:
        title = sql_query.query_reaction_text_for_song_swap_reaction(reaction)
    else:
        title = "Song Swap Reaction"

    # These could theoretically link to the track, but opted to link them to the song swap for now.
    sql_query.store_broadcast(0,
                              sql_query.SYSTEM_ACCOUNT_ID,
                              title,
                              f"{user} has given their Song Swap track, {track_name}, a score of {reaction}!",
                              related_type_enum.RelatedType.SONG_SWAP.value,
                              song_swap_id)

    return jsonify({"success": True}), 200

@song_swap_bp.route("/api/get-song-swaps")
def api_get_song_swaps():
    """
    Retrieves song swaps.
        If song swap id is specfied, just that song swap is returned
            (else specify zero for all).
        If a user is specified, all song swaps for that user are returned
        If neither is specified, all song swaps are returned (based on limit)
    Example:
        GET /api/get-song-swaps?user=LastFmProfileName&songswapid=n&limit=n
    Returns JSON:
      {
        "songSwaps": [
          { "id": int, 
            "initiated_user_id": int,
            "initiated_user": str,
            "matched_user_id": int,
            "matched_user": str,
            "initiated_track_id": int,
            "initiated_track_name": str,
            "initiated_artist_id": int,
            "initiated_artist_name": str,
            "matched_track_id": int,
            "matched_track_name": str,
            "matched_artist_id": int, 
            "matched_artist_name": str,
            "initiated_reaction": int,
            "matched_reaction": int,
            "swap_initiated_timestamp": str,
            "initiated_track_timestamp": str,
            "matched_track_timestamp": str,
            "initiated_reaction_timestamp": str,
            "matched_reaction_timestamp": str
          },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    song_swap_id = int(request.args.get("songswapid", "0"))
    limit = int(request.args.get("limit", 50))

    user_id = sql_query.query_user_id(user)

    sql = """
        SELECT DISTINCT SongSwap.SongSwapID AS id, 
            InitiatedUser.UserID AS initiated_user_id, InitiatedUser.LastFmProfileName AS initiated_user,
            MatchedUser.UserID AS matched_user_id, MatchedUser.LastFmProfileName AS matched_user,
            InitiatedTrack.TrackID AS initiated_track_id, InitiatedTrack.TrackName AS initiated_track_name,
            InitiatedArtist.ArtistID AS initiated_artist_id, InitiatedArtist.ArtistName AS initiated_artist_name,
            MatchedTrack.TrackID AS matched_track_id, MatchedTrack.TrackName AS matched_track_name,
            MatchedArtist.ArtistID AS matched_artist_id, MatchedArtist.ArtistName AS matched_artist_name,
            SongSwap.InitiatedReaction AS initiated_reaction, SongSwap.MatchedReaction AS matched_reaction,
            SongSwap.SwapInitiatedTimestamp AS swap_initiated_timestamp,
            SongSwap.InitiatedTrackTimestamp AS initiated_track_timestamp,
            SongSwap.MatchedTrackTimestamp AS matched_track_timestamp,
            SongSwap.InitiatedReactionTimestamp AS initiated_reaction_timestamp,
            SongSwap.MatchedReactionTimestamp AS matched_reaction_timestamp	   
        FROM SongSwap
        LEFT JOIN User AS InitiatedUser ON SongSwap.InitiatedUserID = InitiatedUser.UserID
        LEFT JOIN User AS MatchedUser ON SongSwap.MatchedUserID = MatchedUser.UserID
        LEFT JOIN Track AS InitiatedTrack ON SongSwap.InitiatedTrackID = InitiatedTrack.TrackID
        LEFT JOIN Artist AS InitiatedArtist ON InitiatedTrack.ArtistID = InitiatedArtist.ArtistID
        LEFT JOIN Track AS MatchedTrack ON SongSwap.MatchedTrackID = MatchedTrack.TrackID
        LEFT JOIN Artist AS MatchedArtist ON MatchedTrack.ArtistID = MatchedArtist.ArtistID
        WHERE 1=1
    """

    if song_swap_id != 0:
        sql += f"   AND SongSwap.SongSwapID = {song_swap_id}"

    if user_id != 0:
        sql += f"   AND (InitiatedUser.UserID = {user_id} OR MatchedUser.UserID = {user_id})"

    sql += """
        ORDER BY SongSwap.SongSwapID DESC /* Newest to oldest */
        LIMIT ?
    """

    # print(f"song swaps query: {sql}")

    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (limit,)).fetchall()
    conn.close()

    song_swaps = [
        {
            "id":                           row["id"],
            "initiated_user_id":            row["initiated_user_id"],
            "initiated_user":               row["initiated_user"],
            "matched_user_id":              row["matched_user_id"],
            "matched_user":                 row["matched_user"],
            "initiated_track_id":           row["initiated_track_id"],
            "initiated_track_name":         row["initiated_track_name"],
            "initiated_artist_id":          row["initiated_artist_id"],
            "initiated_artist_name":        row["initiated_artist_name"],
            "matched_track_id":             row["matched_track_id"],
            "matched_track_name":           row["matched_track_name"],
            "matched_artist_id":            row["matched_artist_id"],
            "matched_artist_name":          row["matched_artist_name"],
            "initiated_reaction":           row["initiated_reaction"],
            "matched_reaction":             row["matched_reaction"],
            "swap_initiated_timestamp":     row["swap_initiated_timestamp"],
            "initiated_track_timestamp":    row["initiated_track_timestamp"],
            "matched_track_timestamp":      row["matched_track_timestamp"],
            "initiated_reaction_timestamp": row["initiated_reaction_timestamp"],
            "matched_reaction_timestamp":   row["matched_reaction_timestamp"]
        }
        for row in rows
    ]

    return jsonify({ "songSwaps": song_swaps })