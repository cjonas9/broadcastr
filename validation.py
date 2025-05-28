"""
This module provides supporting functions for validation.
"""
def validate_broadcast(user_id, title, body, related_type_id):
    """
    Validates a broadcast.
    """
    if user_id == 0:
        return "Missing or invalid user"
    if title.strip() == "" and body.strip() == "":
        return "Title or body is required"
    if related_type_id == 0:
        return "Missing or invalid related type id"
    return ""

def validate_like(user_id, related_type_id):
    """
    Validates a like.
    """
    if user_id == 0:
        return "Missing or invalid user"
    if related_type_id == 0:
        return "Missing or invalid related type id"
    return ""

def validate_song_swap(user_id):
    """
    Validates a song swap.
    """
    if user_id == 0:
        return "Missing or invalid user"
    return ""
