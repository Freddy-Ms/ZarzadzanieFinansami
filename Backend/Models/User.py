from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from Authentication import generate_tokens, set_tokens_in_cookies
from flask import request, make_response, jsonify
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)

    @staticmethod
    def register(data):
        try:
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if not username or not email or not password:
                return {"message": "Missing required fields"}, 400

            if User.query.filter_by(username=username).first():
                return {"message": "Username already exists"}, 400

            if User.query.filter_by(email=email).first():
                return {"message": "Email already exists"}, 400

            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
            new_user = User(username=username, email=email, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()

            return {"message": "User registered successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @staticmethod
    def login(data):
        try:
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            if (not username and not email) or not password:
                return {"message": "Missing required fields"}, 400
            
            if username:
                user = User.query.filter_by(username=username).first()

            if email:
                user = User.query.filter_by(email=email).first()

            if not user or not check_password_hash(user.password, password):
                return {"message": "Invalid credentials"}, 401

            access_token, refresh_token = generate_tokens(user.id)
            response = make_response(jsonify({"message": "Login successful"}))
            response = set_tokens_in_cookies(response, access_token, refresh_token)
            return response, 200
        except Exception as e:
            return {"message": str(e)}, 500