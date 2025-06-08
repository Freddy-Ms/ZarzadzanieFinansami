from Models import db, User, Household, ShoppingList, Product, PurchaseEvent, Subcategory, QuantityUnit
from flask import Flask, request, jsonify, make_response, g, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
from Authentication import token_required, set_tokens_in_cookies
import json
from io import BytesIO


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
    response_data, status_code = User.login(data)
    
    if "access_token" in response_data and "refresh_token" in response_data:
        access_token = response_data.pop("access_token")
        refresh_token = response_data.pop("refresh_token")
        
        response = make_response(jsonify(response_data), status_code)
        set_tokens_in_cookies(response, access_token, refresh_token)
        return response
    
    return jsonify(response_data), status_code
    

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

@app.route('/user/get', methods=['GET'])
@token_required
def get_user():
    message, status_code = User.get_user(g.user_id)
    return jsonify(message), status_code

@app.route('/household/create', methods=['POST'])
@token_required
def create_household():
    data = request.get_json()
    message, status_code = Household.create(g.user_id, data)
    return jsonify(message), status_code

@app.route('/household/edit', methods=['POST'])
@token_required
def edit_household():
    data = request.get_json()
    message, status_code = Household.edit(g.user_id, data)
    return jsonify(message), status_code

@app.route('/household/delete', methods=['POST'])
@token_required
def delete_household():
    data = request.get_json()
    message, status_code = Household.delete(g.user_id, data)
    return jsonify(message), status_code

@app.route('/household/create_invite_token', methods=['POST'])
@token_required
def invite_user_to_household():
    data = request.get_json()
    message, status_code = Household.invite_user(g.user_id, data)
    return jsonify(message), status_code

@app.route('/household/accept_invite', methods=['POST'])
@token_required
def accept_invite():
    data = request.get_json()
    message, status_code = Household.accept_invite(g.user_id, data)
    return jsonify(message), status_code

@app.route('/household/get', methods=['GET'])
@token_required
def get_households():
    message, status_code = Household.get_user_households(g.user_id)
    return jsonify(message), status_code

@app.route('/household/leave', methods=['DELETE'])
@token_required
def leave_household():
    data = request.get_json()
    message, status_code = Household.leave_household(g.user_id, data)
    return jsonify(message), status_code

@app.route('/household/kick', methods=['POST'])
@token_required
def kick_user_from_household():
    data = request.get_json()
    message, status_code = Household.kick_user(g.user_id, data)
    return jsonify(message), status_code

@app.route('/shoppinglist/create', methods = ['POST'])
@token_required
def create_shopping_list():
    data = request.get_json()
    message, status_code = ShoppingList.create(g.user_id, data)
    return jsonify(message), status_code

@app.route('/shoppinglist/delete', methods = ['POST'])
@token_required
def delete_shopping_list():
    data = request.get_json()
    message, status_code = ShoppingList.delete(g.user_id, data)
    return jsonify(message), status_code

@app.route('/shoppinglist/get', methods = ['GET'])
@token_required
def get_shopping_lists():
    message, status_code = ShoppingList.get_user_shopping_lists(g.user_id)
    return jsonify(message), status_code

@app.route('/shoppinglist/product/add', methods = ['POST'])
@token_required
def add_product_to_shopping_list():
    data = request.get_json()
    message, status_code = Product.add(g.user_id, data)
    return jsonify(message), status_code

@app.route('/shoppinglist/product/remove', methods = ['POST'])
@token_required
def remove_product_from_shopping_list():
    data = request.get_json()
    message, status_code = Product.remove(g.user_id, data)
    return jsonify(message), status_code

@app.route('/shoppinglist/product/edit', methods = ['POST'])
@token_required
def edit_product_in_shopping_list():
    data = request.get_json()
    message, status_code = Product.edit(g.user_id, data)
    return jsonify(message), status_code

@app.route('/purchaseevent/create', methods=['POST'])
@token_required
def create_purchase_event():
    try:
        name = request.form.get('name')
        household_id = request.form.get('household_id')
        receipt_file = request.files.get('receipt')
        products_raw = request.form.get('products')

        file_content = receipt_file.read() if receipt_file else None
        
        try:
            products = json.loads(products_raw) if products_raw else []
        except json.JSONDecodeError:
            return jsonify({'message': 'Invalid JSON in products field'}), 400
        data = {
            'name': name,
            'household_id': int(household_id) if household_id else None,
            'receipt': file_content,
            'products': products
        }

        message, status_code = PurchaseEvent.create(g.user_id, data)
        return jsonify(message), status_code
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/purchaseevent/delete', methods=['POST'])
@token_required
def delete_purchase_events():
    data = request.get_json()
    message, status_code = PurchaseEvent.delete(g.user_id, data)
    return jsonify(message), status_code

@app.route('/purchaseevent/get', methods=['POST'])
@token_required
def get_purchase_events():
    try:
        data = request.get_json()
        message, status_code = PurchaseEvent.get(g.user_id, data)
        return jsonify(message), status_code
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@app.route('/purchaseevent/receipt/get', methods=['POST'])
@token_required
def get_receipt():
    try:
        data = request.get_json()
        message, status_code = PurchaseEvent.receipt_get(g.user_id, data)
        if status_code == 200:
            return send_file(
                BytesIO(message['receipt']),
                mimetype='image/jpeg',
                as_attachment=False,
                download_name=f"receipt_{message['event_id']}.jpg"
            )
        return jsonify(message), status_code
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/subcategory/get', methods=['GET'])
@token_required
def get_subcategories():
    try:
        message, status_code = Subcategory.get()
        return jsonify(message), status_code
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/quantityunit/get', methods=['GET'])
@token_required
def get_quantity_units():
    try:
        message, summary = QuantityUnit.get()
        return jsonify(message), summary
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/OCR', methods=['POST'])
@token_required
def ocr_receipt():
    try:
        receipt_file = request.files.get('receipt')
        if not receipt_file:
            return jsonify({'message': 'No receipt file provided'}), 400

        
        # Simulating OCR result for demonstration purposes
        ocr_result = {
            'Milk': 1.50,
            'Eggs': 3.20,
            'Cheese': 4.50,
            'Apples': 2.30,
            'Bananas': 1.20,
            'Chicken': 5.00,
            'Rice': 1.80,
            'Pasta': 1.60,
            'Tomato Sauce': 2.50,
            }
        #ocr_result = SZYMON DO ROBOTY
        products = []
        for name, price in ocr_result.items():
            products.append({
                'name': name,
                'quantity': 1,  
                'price': price,
                'subcategory_id': None,  
                'unit_id': None  
            })

        return jsonify({'message': 'OCR processed successfully', 'products': products}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)