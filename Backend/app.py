from Models import db, User
from flask import Flask, request, jsonify, make_response, g
from flask_cors import CORS
from dotenv import load_dotenv
import os
from Authentication import token_required, set_tokens_in_cookies

app = Flask(__name__)
CORS(app, supports_credentials = True)
load_dotenv()
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://postgres:{os.getenv("DATABASE_PASSWORD")}@localhost/{os.getenv("DATABASE_NAME")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


@app.route('/')
def homepage():
    return "Welcome to the API!"


@app.route('/user/register', methods=['POST'])
def register():
    data = request.get_json()
    message, status_code = User.register(data)
    return jsonify(message), status_code

@app.route('/user/login', methods=['POST'])
def login():
    data = request.get_json()
    result, message, status_code = User.login(data)
    if result:
        access_token, refresh_token = result
        response = make_response(jsonify(message),status_code)
        set_tokens_in_cookies(response, access_token, refresh_token)
        return response
    return jsonify(message), status_code

@app.route('/user/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logged out successfully"}), 200)
    response.delete_cookie('access_token', secure=True, samesite='None')
    response.delete_cookie('refresh_token', secure=True, samesite='None')
    return response

@app.route('/user/delete', methods=['POST'])
@token_required
def delete_user():
    message, status_code = User.delete(g.user_id)
    if status_code == 200:
        response = make_response(jsonify(message), status_code)
        response.delete_cookie('access_token', secure=True, samesite='None')
        response.delete_cookie('refresh_token', secure=True, samesite='None')
        return response
    return jsonify(message), status_code

@app.route('/user/edit', methods=['POST'])
@token_required
def edit_user():
    data = request.get_json()
    message, status_code = User.edit(g.user_id, data)
    return jsonify(message), status_code

if __name__ == '__main__':
    app.run(debug=True)