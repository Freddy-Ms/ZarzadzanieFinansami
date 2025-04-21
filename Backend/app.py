import Models
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

@app.route('/')
def homepage():
    return "Welcome to the API!"



if __name__ == '__main__':
    app.run(debug=True)