from flask import Flask, render_template, request, jsonify
import db_query
import sql_query
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


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

@app.route('/get_artist_tags', methods=['POST'])
def get_artist_tags():
    artist_input = request.json.get('artist')
    result = db_query.get_artist_tag_counts(artist_input)
    return jsonify({'output': result})

# @app.route('/query_users', methods=['POST'])
# def query_users():
#     result = sql_query.query_users()
#     return jsonify({'output': result})

@app.route('/store_top_artists', methods=['POST'])
def store_top_artists():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = db_query.store_top_artists(user_input, period)
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
    result = db_query.store_top_albums(user_input, period)
    return jsonify({'output': result})

@app.route('/query_top_albums', methods=['POST'])
def query_top_albums():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = sql_query.query_top_albums(user_input, period)
    return jsonify({'output': result})

@app.route('/store_top_tracks', methods=['POST'])
def store_top_tracks():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = db_query.store_top_tracks(user_input, period)
    return jsonify({'output': result})

@app.route('/query_top_tracks', methods=['POST'])
def query_top_tracks():
    user_input = request.json.get('input')
    period = request.json.get('period')
    result = sql_query.query_top_tracks(user_input, period)
    return jsonify({'output': result})

@app.route('/get_user_info', methods=['POST'])
def get_user_info():
    user_input = request.json.get('input')
    result = db_query.get_user_info_data(user_input)
    return jsonify({'output': result})

@app.route('/store_last_fm_user_info', methods=['POST'])
def store_user_last_fm_info():
    user_input = request.json.get('input')
    db_query.store_user_last_fm_info(user_input)
    return jsonify({'output': 'success'})

@app.route('/store_last_fm_all_user_info', methods=['POST'])
def store_all_users_last_fm_info():
    db_query.store_all_users_last_fm_info()
    return jsonify({'output': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
