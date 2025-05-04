from flask import Flask, render_template, request, jsonify
import db_query
import sql_query

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/backend_functions')
def backend_functions():
    return render_template('backendfunctions.html')

@app.route('/get_top_artist_plays', methods=['POST'])
def get_top_artist_plays():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = db_query.get_top_artist_plays(user_input, period)
    return jsonify({'output': result})

@app.route('/get_top_album_plays', methods=['POST'])
def get_top_album_plays():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = db_query.get_top_album_plays(user_input, period)
    return jsonify({'output': result})

@app.route('/get_top_track_plays', methods=['POST'])
def get_top_track_plays():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = db_query.get_top_track_plays(user_input, period)
    return jsonify({'output': result})

@app.route('/query_users', methods=['POST'])
def query_users():
    result = sql_query.query_users()
    return jsonify({'output': result})

@app.route('/store_top_artists', methods=['POST'])
def store_top_artists():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = sql_query.store_top_artists(user_input, period)
    return jsonify({'output': result})

@app.route('/query_top_artists', methods=['POST'])
def query_top_artists():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = sql_query.query_top_artists(user_input, period)
    return jsonify({'output': result})

@app.route('/store_top_albums', methods=['POST'])
def store_top_albums():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = sql_query.store_top_albums(user_input, period)
    return jsonify({'output': result})

@app.route('/query_top_albums', methods=['POST'])
def query_top_albums():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = sql_query.query_top_albums(user_input, period)
    return jsonify({'output': result})

if __name__ == '__main__':
    app.run(debug=True)
