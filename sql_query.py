import sqlite3
import json



def get_users():
    
    connection = sqlite3.connect("./data/broadcastr.db")
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM User")
    data = cursor.fetchall()
    return json.dumps(data)

        
