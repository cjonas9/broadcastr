"""
This module provides supporting functions for API routes pertaining to user profiles.
"""
from flask import Blueprint, jsonify, request
import bcrypt

import constants
import db_query
import related_type_enum
import sql_query

user_profile_bp = Blueprint('user-profile', __name__)

@user_profile_bp.route("/api/user/profile")
def api_user_profile():
    """
    Retrieves a user's profile information.
    Example:
        GET /api/user/profile?user=LastFmProfileName&partial=true
    Returns JSON:
      {
        "userProfile": [
          { "id": int, "profile": str, "firstname": str, "lastname": str,
          "email": str, "profileurl": str, "bootstrapped": int, "admin: int",
          "lastlogin": str, "pfpsm": str, "pfpmed": str, "pfplg": str,
           "pfpxl": str, "swag": int },
          …
        ]
      }
    """
    user = request.args.get("user", "")
    partial = request.args.get("partial", "false").lower() == "true"

    if not user.strip():
        return jsonify({"error": "Missing user parameter"}), 400

    sql = """
        SELECT User.UserID AS id, User.LastFmProfileName AS profile, User.FirstName AS firstname,
               User.LastName AS lastname, User.EmailAddress AS email, LastFmProfileUrl AS profileurl,
               User.BootstrappedUser AS bootstrapped, User.Admin AS admin, User.LastLogin AS lastlogin,
               User.Pfpsmall AS pfpsm, User.PfpMedium as pfpmed, User.PfpLarge AS pfplg,
               User.PfpExtraLarge AS pfpxl, User.Swag AS swag
        FROM User
        WHERE LastFmProfileName LIKE ?
        ORDER BY LastFmProfileName
        LIMIT 10
    """
    conn = sql_query.get_db_connection()
    search_term = f"%{user}%" if partial else user
    rows = conn.execute(sql, (search_term,)).fetchall()
    conn.close()

    if not rows and not partial:
        return jsonify({"error": "Missing or invalid user"}), 400

    user_profile = [
        {
          "id":             row["id"],
          "profile":        row["profile"],
          "firstname":      row["firstname"],
          "lastname":       row["lastname"],
          "email":          row["email"],
          "profileurl":     row["profileurl"],
          "bootstrapped":   row["bootstrapped"],
          "admin":          row["admin"],
          "lastlogin":      row["lastlogin"],
          "pfpsm":          row["pfpsm"],
          "pfpmed":         row["pfpmed"],
          "pfplg":          row["pfplg"],
          "pfpxl":          row["pfpxl"],
          "swag":           row["swag"]
        }
        for row in rows
    ]

    return jsonify({ "userProfile": user_profile })

@user_profile_bp.route("/api/user/create-profile", methods=['POST'])
def api_user_create_profile():
    """
    Creates a user profile with provided data.
    Example:
        POST /api/user/create-profile?user=LastFmProfileName&firstname=fname
            &lastname=lname&email=fname@domain.edu&password=pw&bootstrapped=n
    Raises:
        400 Bad Request: If the user already exists in the database (based on profile name).
        400 Bad Request: If the user already exists in the database (based on email address).
        400 Bad Request: If the user's email address is not provided.
        400 Bad Request: If the user's first name is not provided.
        400 Bad Request: If the user's last name is not provided.
        400 Bad Request: If the user's password is not provided.
    Returns:
        201 Success: The database ID of the newly created user record.
    """
    user = request.args.get("user", "")
    first_name = request.args.get("firstname", "")
    last_name = request.args.get("lastname", "")
    email = request.args.get("email", "")
    password = request.args.get("password", "")
    bootstrapped = request.args.get("bootstrapped", "")
    bootstrapped = 0 if bootstrapped == "" else int(bootstrapped)

    user_id = sql_query.query_user_id(user)
    user_id_by_email = sql_query.query_user_id_by_email(email)

    if user_id != 0:
        return jsonify({"error": "User with that profile name already exists"}), 400
    if user_id_by_email != 0:
        return jsonify({"error": "User with that email address already exists"}), 400
    if not first_name.strip():
        return jsonify({"error": "first name is required"}), 400
    if not last_name.strip():
        return jsonify({"error": "last name is required"}), 400
    if not email.strip():
        return jsonify({"error": "email is required"}), 400
    if not password.strip():
        return jsonify({"error": "password is required"}), 400

    password_bytes = password.encode()
    salt = bcrypt.gensalt()  # 16-byte salt by default
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    user_id = sql_query.store_user(user, first_name, last_name,
                                   email, salt, hashed_password, bootstrapped)

    cursor.close()
    connection.close()

    # Refresh/store all last.fm data for this user
    db_query.refresh_user_data(user)

    sql_query.store_broadcast(0,
                              constants.SYSTEM_ACCOUNT_ID,
                              "New Broadcastr",
                              f"{user} has joined Broadcastr. Welcome {user}!",
                              related_type_enum.RelatedType.USER.value,
                              user_id)

    return jsonify({"success": user_id}), 201

@user_profile_bp.route("/api/user/login", methods=['POST'])
def api_user_login():
    """
    Logs a user in.  Validates profile name & password, sets last login timestamp.
    Example:
        POST /api/user/login?user=LastFmProfileName&password=pw
    Raises:
        400 Bad Request: If the user's profile could not be found.
        400 Bad Request: If the user's password is not provided.
        400 Bad Request: If the user's password was invalid.
        400 Bad Request: If database integrity issues are detected.
    Returns:
        200 Success: The login was successful.
    """
    user = request.args.get("user", "")
    password = request.args.get("password", "")

    user_id = sql_query.query_user_id(user)

    # Prevent logging in as invalid or system account
    if user_id in (0, constants.SYSTEM_ACCOUNT_ID):
        return jsonify({"success": False, "error": "Missing or invalid user"}), 400
    # if not password.strip():
    #     return jsonify({"error": "password is required"}), 400

    if password.strip():
        salt = sql_query.query_user_salt(user)
        encoded_password = password.encode()
        hashed_password = bcrypt.hashpw(encoded_password, salt)
    else:
        hashed_password = ""

    user_id_pw = sql_query.query_user_id_by_password(user, hashed_password)

    if user_id_pw == 0:
        return jsonify({"success": False, "error": "Invalid password"}), 400

    # This should never happen, but indicates a severe problem with database integrity if it does.
    if user_id != user_id_pw:
        return jsonify({"success": False, "error": "Data integrity issue"}), 400

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "UPDATE User " \
        "SET LastLogin = CURRENT_TIMESTAMP " \
        "WHERE UserID = ?",
        (user_id,))

    cursor.close()
    connection.close()

    # If the user data has not been refreshed in the last day, refresh it.
    if sql_query.user_refresh_due(user_id):
        sql_query.refresh_user_data(user)
        db_query.refresh_user_data(user)

    return jsonify({"success": True, "error": ""}), 201

@user_profile_bp.route("/api/user/reset-password", methods=['POST'])
def api_user_reset_password():
    """
    Resets a user's password.
    Example:
        POST /api/user/reset-password?user=LastFmProfileName&oldpassword=oldpw&newpassword=newpw
    Raises:
        400 Bad Request: If the user's profile could not be found.
        400 Bad Request: If the user's old password was invalid.
        400 Bad Request: If the user's new password is not provided.
        400 Bad Request: If database integrity issues are detected.
    Returns:
        200 Success: The password reset was successful.
    """
    user = request.args.get("user", "")
    old_password = request.args.get("oldpassword", "")
    new_password = request.args.get("newpassword", "")

    user_id = sql_query.query_user_id(user)

    if user_id == 0:
        return jsonify({"error": "Missing or invalid user"}), 400

    # Handle case where user currently does not have a password stored
    if old_password == "":
        user_id_pw = sql_query.query_user_id_by_password(user, "")
    else:
        salt = sql_query.query_user_salt(user)
        encoded_password = old_password.encode()
        hashed_password = bcrypt.hashpw(encoded_password, salt)

        user_id_pw = sql_query.query_user_id_by_password(user, hashed_password)

    if not new_password.strip():
        return jsonify({"error": "new password is required"}), 400

    if user_id_pw == 0:
        return jsonify({"error": "Invalid password"}), 400

    # This should never happen, but indicates a severe problem with database integrity if it does.
    if user_id != user_id_pw:
        return jsonify({"error": "Data integrity issue"}), 400

    password_bytes = new_password.encode()
    salt = bcrypt.gensalt()  # 16-byte salt by default
    hashed_password = bcrypt.hashpw(password_bytes, salt)

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "UPDATE User " \
        "SET Salt = ?, Password = ? " \
        "WHERE UserID = ?",
        (salt, hashed_password, user_id))

    cursor.close()
    connection.close()

    return jsonify({"success": "password successfully updated"}), 200

@user_profile_bp.route("/api/user/add-swag", methods=['POST'])
def api_user_add_swag():
    """
    Adds swag to a user.
    Example:
        POST /api/user/add-swag?user=LastFmProfileName&swag=n
    Raises:
        400 Bad Request: If the user's profile could not be found.
    Returns:
        200 Success: Updated swag balance for this user.
    """
    user = request.args.get("user", "")
    swag = request.args.get("swag", "0")

    user_id = sql_query.query_user_id(user)

    if user_id == 0:
        return jsonify({"error": "Missing or invalid user"}), 400

    current_swag = sql_query.query_swag(user)
    new_swag = current_swag + int(swag)

    connection = sql_query.get_db_connection_isolation_none()
    cursor = connection.cursor()

    cursor.execute(
        "UPDATE User " \
        "SET Swag = ? " \
        "WHERE UserID = ?",
        (new_swag, user_id))

    cursor.close()
    connection.close()

    return jsonify({"updated swag balance": new_swag}), 200
