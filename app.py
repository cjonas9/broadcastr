from flask import Flask, render_template, request, jsonify
import db_query
import sql_query

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run_overall', methods=['POST'])
def run_a():
    user_input = request.json.get('input')
    result = db_query.get_top_artist_plays_overall(user_input)
    return jsonify({'output': result})

@app.route('/run_yearly', methods=['POST'])
def run_b():
    user_input = request.json.get('input')
    result = db_query.get_top_artist_plays_yearly(user_input)
    return jsonify({'output': result})

@app.route('/query_users', methods=['POST'])
def run_c():
    result = sql_query.get_users()
    return jsonify({'output': result})

if __name__ == '__main__':
    app.run(debug=True)
