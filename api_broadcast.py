"""
This module provides supporting functions for API routes pertaining to broadcasts.
"""
from flask import Blueprint, jsonify, request
import sql_query
import validation

broadcast_bp = Blueprint('broadcast', __name__)

@broadcast_bp.route("/api/create-broadcast", methods=['POST'])
def api_send_direct_message():
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
