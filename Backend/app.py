from Models import db, User
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from Authentication import token_required

app = Flask(__name__)
CORS(app)
load_dotenv()
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://postgres:{os.getenv("DATABASE_PASSWORD")}@localhost/{os.getenv("DATABASE_NAME")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


@app.route('/')
def homepage():
    return "Welcome to the API!"


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    message, status_code = User.register(data)
    return jsonify(message), status_code

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return User.login(data)



if __name__ == '__main__':
    app.run(debug=True)