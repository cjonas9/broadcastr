def store_like(user_id, related_type_id, related_id):
    """
    Stores a like record.
    Args:
        user_id: ID of the user creating the like
        related_type_id: type id that this like relates to
        related_id: record id that this like relates to
    Returns:
        numeric id of the inserted record
    """
    connection = get_db_connection()  # Use default isolation level
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
            return 0  # Like already exists

        # Insert new like
        cursor.execute(
            """
            INSERT INTO Like(UserID, RelatedTypeID, RelatedID, Timestamp)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (user_id, related_type_id, related_id))
        
        new_id = cursor.lastrowid
        connection.commit()
        return new_id
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()

def delete_like(user_id, related_type_id, related_id):
    """
    Deletes a like record.
    Args:
        user_id: ID of the user who liked
        related_type_id: type id that this like relates to
        related_id: record id that this like relates to
    Returns:
        number of deleted rows
    """
    connection = get_db_connection()  # Use default isolation level
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            DELETE
            FROM Like
            WHERE UserID = ?
                AND RelatedTypeID = ?
                AND RelatedID = ?
            """,
            (user_id, related_type_id, related_id))
        
        deleted_count = cursor.rowcount
        connection.commit()
        return deleted_count
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close() 