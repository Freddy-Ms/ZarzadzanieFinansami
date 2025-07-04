from flask import request, jsonify, make_response, g
import jwt
import datetime
from functools import wraps
import os 
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

def token_required(func):
    """Decorator to check if the user is authenticated by verifying the token in the request headers."""
    @wraps(func)
    def decorated(*args, **kwargs):
        decoded_token, response = get_decoded_token()
        if not decoded_token:
            return jsonify({"error": "Unvalid tokens"}), 401

        g.user_id = decoded_token['user_id']
        result = func(*args, **kwargs)
        if isinstance(result, tuple):
            result = make_response(result[0], result[1])

        if response:
            result.direct_passthrough = False
            response.set_data(result.get_data())
            response.status_code = result.status_code
            response.headers = result.headers
            return response
        return result
    return decorated



def set_tokens_in_cookies(response, access_token, refresh_token):
    """Set the access and refresh tokens in the response cookies."""
    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='None')
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='None')


def get_decoded_token():
    """Get the decoded token from the request cookies or refresh it if expired."""
    access_token = request.cookies.get('access_token')

    if access_token:
        decoded_token = decode_token(access_token)
        if decoded_token:
            return decoded_token, None

    refresh_token = request.cookies.get('refresh_token')

    if refresh_token:
        decoded_refresh = decode_token(refresh_token)
        if decoded_refresh:
            new_access_token, new_refresh_token = generate_tokens(decoded_refresh['user_id'])
            decoded_token = decode_token(new_access_token)

            response = make_response(jsonify({"message": "Tokens refreshed"}))
            set_tokens_in_cookies(response, new_access_token, new_refresh_token)
            return decoded_token, response

    return None, None



def decode_token(token):
    """Decode the token and return the payload."""
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded_token
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def generate_tokens(user_id):
    """Generate access and refresh tokens for the user."""
    access_payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes= 15)
    }
    refresh_payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days = 7)
    }
    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm="HS256")
    return access_token, refresh_token