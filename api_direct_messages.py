"""
This module provides supporting functions for API routes pertaining to direct messages.
"""
from flask import jsonify
import sql_query

def api_user_conversations(request):
    """
    Retrives a conversations for a user.
    Example:
        GET /api/user/conversations?user=LastFmProfileName&limit=n
    Returns JSON:
      {
        "conversations": [
          { "conversant": str, "messagecount": int, "unreadcount": int, "lastconversation": str },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    limit = int(request.args.get("limit", 50))

    sql = """
        SELECT conversant, COUNT(id) AS messagecount, SUM(unread) AS unreadcount, MAX(timestamp) AS lastconversation
        FROM (
            SELECT Sender.LastFmProfileName AS conversant, MessageReceived.DirectMessageID as id,
                   CASE WHEN MessageReceived.Read = 1 THEN 0 ELSE 1 END AS Unread, MessageReceived.TimeSent AS timestamp
            FROM DirectMessage AS MessageReceived
            INNER JOIN User AS Sender ON MessageReceived.SenderID = Sender.UserID
            INNER JOIN User AS Recipient ON MessageReceived.RecipientID = Recipient.UserID
            WHERE Recipient.LastFmProfileName = ?
            UNION
            SELECT Recipient.LastFmProfileName AS conversant, MessageSent.DirectMessageID AS id,
                   0 AS Unread, MessageSent.TimeSent as timestamp
            FROM DirectMessage AS MessageSent
            INNER JOIN User AS Sender ON MessageSent.SenderID = Sender.UserID
            INNER JOIN User AS Recipient ON MessageSent.RecipientID = Recipient.UserID
            WHERE Sender.LastFmProfileName = ?
        ) AS data
        GROUP BY conversant
        ORDER BY lastconversation DESC
        LIMIT ?
    """
    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (user, user, limit)).fetchall()
    conn.close()

    conversations = [
        {
          "conversant":         row["conversant"],
          "messagecount":       row["messagecount"],
          "unreadcount":        row["unreadcount"],
          "lastconversation":   row["lastconversation"]
        }
        for row in rows
    ]

    return jsonify({ "conversations": conversations })

def api_user_direct_messages(request):
    """
    Retrieves direct messages between a user and another user (conversant).
    Example:
        GET /api/user/direct-messages?user=LastFmProfileName&conversant=LastFmProfileName&limit=n
    Returns JSON:
      {
        "directMessages": [
          { "id": int, "type": str, "sender": str, "recipient": str,
          "message": str, "timestamp": str },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    conversant = request.args.get("conversant", "")
    limit = int(request.args.get("limit", 50))

    sql = """
        SELECT *
        FROM (
            SELECT *
            FROM (
                SELECT 'Incoming' AS type, MessageReceived.DirectMessageID as id, Sender.LastFmProfileName AS sender,
                        Recipient.LastFmProfileName AS recipient, MessageReceived.MessageBody AS message,
                        MessageReceived.TimeSent AS timestamp
                FROM DirectMessage AS MessageReceived
                INNER JOIN User AS Recipient ON MessageReceived.RecipientID = Recipient.UserID
                INNER JOIN User AS Sender ON MessageReceived.SenderID = Sender.UserID
                WHERE Recipient.LastFmProfileName = ?
                   AND Sender.LastFmProfileName = ?
                UNION
                SELECT 'Outgoing' As type, MessageSent.DirectMessageID as id, Sender.LastFmProfileName AS sender,
                    Recipient.LastFmProfileName AS recipient, MessageSent.MessageBody AS message,
                    MessageSent.TimeSent AS timestamp
                FROM DirectMessage AS MessageSent
                INNER JOIN User AS Recipient ON MessageSent.RecipientID = Recipient.UserID
                INNER JOIN User AS Sender on MessageSent.SenderID = Sender.UserID
                WHERE Sender.LastFmProfileName = ?
                   AND Recipient.LastFmProfileName = ?
            ) AS innerData /* Inner data ensures we get the most recent messages when limiting */
            ORDER BY innerData.timestamp DESC
            LIMIT ?
        ) AS outerData /* Outer data sorts the limited messages oldest to newest */
        ORDER BY outerData.timestamp
    """
    conn = sql_query.get_db_connection()
    rows = conn.execute(sql, (user, conversant, user, conversant, limit)).fetchall()
    conn.close()

    direct_messages = [
        {
          "id":         row["id"],
          "type":       row["type"],
          "sender":     row["sender"],
          "recipient":  row["recipient"],
          "message":    row["message"],
          "timestamp":  row["timestamp"]
        }
        for row in rows
    ]

    return jsonify({ "directMessages": direct_messages })

def api_send_direct_message(request):
    """
    Sends a direct message from one user to another.
    Example:
        POST /api/send-direct-message?user=LastFmProfileName&recipient=LastFmProfileName&message=str
    Raises:
        400 Bad Request: If the user, recipient, or message is not provided or invalid.
    Returns:
        201 Success: The database ID of the newly created direct message record.
    """
    user = request.args.get("user", "")
    recipient = request.args.get("recipient", "")
    message = request.args.get("message", "")

    sender_id = sql_query.query_user_id(user)
    recipient_id = sql_query.query_user_id(recipient)

    if sender_id == 0:
        return jsonify({"error": "Missing or invalid sender"}), 400
    if recipient_id == 0:
        return jsonify({"error": "Missing or invalid recipient"}), 400
    if not message.strip():
        return jsonify({"error": "message is required"}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "INSERT INTO DirectMessage(SenderID, RecipientID, MessageBody, TimeSent) " \
        "VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
        (sender_id, recipient_id, message))

    cursor.close()
    connection.close()

    return jsonify({"success": cursor.lastrowid}), 201

def api_mark_messages_read(request):
    """
    Marks all messages as read for a conversation between two users.
    Example:
        POST /api/mark-messages-read?sender=LastFmProfileName&recipient=LastFmProfileName
    Raises:
        400 Bad Request: If the user or recipient is not provided or invalid.
    Returns:
        200 Success: Indicates all direct messages for this sender/recipient combo have 
                     been marked as read.
    """
    user = request.args.get("user", "")
    recipient = request.args.get("recipient", "")

    sender_id = sql_query.query_user_id(user)
    recipient_id = sql_query.query_user_id(recipient)

    if sender_id == 0:
        return jsonify({"error": "Missing or invalid sender"}), 400
    if recipient_id == 0:
        return jsonify({"error": "Missing or invalid recipient"}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "Update DirectMessage " \
        "SET Read = 1 " \
        "WHERE SenderID = ? AND RecipientID = ?",
        (sender_id, recipient_id))

    cursor.close()
    connection.close()

    return jsonify({"success": "direct message records marked as read"}), 200
