from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from Authentication import generate_tokens, set_tokens_in_cookies
from flask import request, make_response, jsonify
from Functions import handle_household_ownership_on_delete_or_leave
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)

    household_memberships = db.relationship(
        'HouseholdUser',
        back_populates='user',
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    owned_household = db.relationship(
        'Household',
        back_populates='owner',
        foreign_keys='Household.ownership'
    )

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
    
    @staticmethod
    def register(data):
        """"Register a new user with the provided data.
        The data should include 'username', 'email', and 'password'."""
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
        """Login a user with the provided data.
        The data should include 'username' or 'email', and 'password'.
        Returns a response dict and status code."""
        try:
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            
            if (not username and not email) or not password:
                return {"message": "Missing required fields"}, 400
            
            if username:
                user = User.query.filter_by(username=username).first()
            else:
                user = User.query.filter_by(email=email).first()

            if not user or not check_password_hash(user.password, password):
                return {"message": "Invalid credentials"}, 401

            access_token, refresh_token = generate_tokens(user.id)

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "message": "Login successful"
            }, 200

        except Exception as e:
            return {"message": str(e)}, 500
        
    @staticmethod
    def delete(user_id):
        """Delete a user with the provided user_id."""
        try:
            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404

            handle_household_ownership_on_delete_or_leave(user_id)
            db.session.delete(user)
            db.session.commit()
            return {"message": "User deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @staticmethod
    def edit(user_id, data):
        """Edit a user with the provided user_id and data.
        The data should include 'username', 'email', and/or 'password'."""
        try:
            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404

            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if username:
                user.username = username
            if email:
                user.email = email
            if password:
                hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
                user.password = hashed_password

            db.session.commit()
            return {"message": "User updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @staticmethod
    def get_user(user_id):
        """Get a user with the provided user_id."""
        try:
            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404

            return user.to_dict(), 200
        except Exception as e:
            return {"message": str(e)}, 500