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
    """
    user = request.args.get("user", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)

    error_string = validation.validate_like(user_id, related_type_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    new_record_id = sql_query.store_like(user_id, related_type_id, related_id)

    return jsonify({"success": new_record_id}), 201

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
    """
    user = request.args.get("user", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)

    error_string = validation.validate_like(user_id, related_type_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    deleted_rows = sql_query.delete_like(user_id, related_type_id, related_id)

    print(f"deleted rows: {deleted_rows}")

    return jsonify({"success": True if deleted_rows != 0 else False}), 200

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

    connection = sql_query.get_db_connection()
    cursor = connection.cursor()

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

    cursor.close()
    connection.close()

    return jsonify({"hasLiked": has_liked}), 200 