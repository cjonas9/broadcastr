"""
This module provides supporting functions for API routes pertaining to likes.
"""
from flask import Blueprint, jsonify, request
import constants
import related_type_enum
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
        400 Bad Request: If the like already exists.
    Returns:
        201 Success: The database ID of the newly created like record.
    """
    user = request.args.get("user", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")
    if not related_id.isnumeric():
        related_id = 0

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)
    existing_like_id = sql_query.query_like_id(user_id, related_type_id, related_id)

    error_string = validation.validate_like(user_id, related_type_id, related_id, existing_like_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    new_record_id = sql_query.store_like(user_id, related_type_id, related_id)

    # If this was a user liking another user's broadcast, give the broadcastr a swag
    if related_type_id == related_type_enum.RelatedType.BROADCAST.value:
        broadcastr_id = sql_query.query_broadcastr_id(related_id)
        if user_id != broadcastr_id:
            sql_query.add_swag(broadcastr_id, constants.SWAG_LIKED_BROADCAST)

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
        400 Bad Request: If the like does not exist.
    Returns:
        200 Success: boolean indicating the operation was successful
    """
    user = request.args.get("user", "")
    relatedtype = request.args.get("relatedtype", "")
    related_id = request.args.get("relatedid", "")
    if not related_id.isnumeric():
        related_id = 0

    user_id = sql_query.query_user_id(user)
    related_type_id = sql_query.query_related_type_id(relatedtype)
    existing_like_id = sql_query.query_like_id(user_id, related_type_id, related_id)

    error_string = validation.validate_undo_like(user_id, related_type_id, related_id, existing_like_id)
    if error_string != "":
        return jsonify({"error": error_string}), 400

    deleted_rows = sql_query.delete_like(user_id, related_type_id, related_id)

    print(f"deleted rows: {deleted_rows}")

    return jsonify({"success": True if deleted_rows != 0 else False}), 200
