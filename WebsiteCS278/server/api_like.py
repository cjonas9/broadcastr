"""
This module provides supporting functions for API routes pertaining to likes.
"""
from flask import Blueprint, jsonify, request
import sql_query
import validation

like_bp = Blueprint('like', __name__)

@like_bp.route("/api/create-like", methods=['POST'])
def api_create_like():
    """
    Creates a like.
    Example:
        POST /api/create-like?user=LastFmProfileName&relatedtype=thing&relatedid=id
    Raises:
        400 Bad Request: If the user is not provided or invalid.
        400 Bad Request: If the related type is not provided or invalid.
        400 Bad Request: If the related id is not provided or invalid.
    Returns:
        201 Success: The database ID of the newly created like record.
        409 Conflict: If the like already exists.
    """
    user = request.args.get("user", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)

    error_string = validation.validate_like(user_id, related_type_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    connection = sql_query.get_db_connection()  # Use default isolation level
    cursor = connection.cursor()

    try:
        # Check if like already exists
        cursor.execute(
            """
            SELECT COUNT(*) as count
            FROM Like
            WHERE UserID = ?
                AND RelatedTypeID = ?
                AND RelatedID = ?
            """,
            (user_id, related_type_id, related_id))
        
        row = cursor.fetchone()
        if row["count"] > 0:
            return jsonify({"error": "Like already exists"}), 409

        # Insert new like
        cursor.execute(
            """
            INSERT INTO Like(UserID, RelatedTypeID, RelatedID, Timestamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (user_id, related_type_id, related_id))
        
        new_id = cursor.lastrowid
        connection.commit()
        return jsonify({"success": new_id}), 201
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@like_bp.route("/api/undo-like", methods=['POST'])
def api_undo_like():
    """
    Undo a like.
    Example:
        POST /api/undo-like?user=LastFmProfileName&relatedtype=thing&relatedid=id
    Raises:
        400 Bad Request: If the user is not provided or invalid.
        400 Bad Request: If the related type is not provided or invalid.
        400 Bad Request: If the related id is not provided or invalid.
    Returns:
        200 Success: boolean indicating the operation was successful
        404 Not Found: If the like does not exist
    """
    user = request.args.get("user", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)

    error_string = validation.validate_like(user_id, related_type_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    connection = sql_query.get_db_connection()  # Use default isolation level
    cursor = connection.cursor()

    try:
        # Check if like exists first
        cursor.execute(
            """
            SELECT COUNT(*) as count
            FROM Like
            WHERE UserID = ?
                AND RelatedTypeID = ?
                AND RelatedID = ?
            """,
            (user_id, related_type_id, related_id))
        
        row = cursor.fetchone()
        if row["count"] == 0:
            return jsonify({"error": "Like does not exist"}), 404

        # Delete the like
        cursor.execute(
            """
            DELETE
            FROM Like
            WHERE UserID = ?
                AND RelatedTypeID = ?
                AND RelatedID = ?
            """,
            (user_id, related_type_id, related_id))
        
        connection.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@like_bp.route("/api/get-likes")
def api_get_likes():
    """
    Check if a user has liked something.
    Example:
        GET /api/get-likes?user=LastFmProfileName&relatedtype=thing&relatedid=id
    Raises:
        400 Bad Request: If the user is not provided or invalid.
        400 Bad Request: If the related type is not provided or invalid.
        400 Bad Request: If the related id is not provided or invalid.
    Returns:
        200 Success: boolean indicating if the user has liked the item
    """
    user = request.args.get("user", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)

    error_string = validation.validate_like(user_id, related_type_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    connection = sql_query.get_db_connection()  # Use default isolation level
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT COUNT(*) as count
            FROM Like
            WHERE UserID = ?
                AND RelatedTypeID = ?
                AND RelatedID = ?
            """,
            (user_id, related_type_id, related_id))

        row = cursor.fetchone()
        has_liked = row["count"] > 0
        return jsonify({"hasLiked": has_liked}), 200
    finally:
        cursor.close()
        connection.close() 