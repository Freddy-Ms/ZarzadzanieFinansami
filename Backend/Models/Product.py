from . import db, Household, HouseholdUser
from .ShoppingList import ShoppingList
from Functions import does_have_permissions
class Product(db.Model):
    __tablename__ = 'product'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('quantity_unit.id'), nullable=True)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'), nullable=True)
    list_id = db.Column(db.Integer, db.ForeignKey('shopping_list.id', ondelete='CASCADE'))

    shopping_list = db.Relationship('ShoppingList', back_populates = 'products', foreign_keys=[list_id])
    unit = db.Relationship('QuantityUnit', back_populates='products', foreign_keys=[unit_id])
    subcategory = db.Relationship('Subcategory', back_populates='products', foreign_keys=[subcategory_id])

    def to_dict(self):
        """Convert the product object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'unit_id': self.unit.name,
            'subcategory_id': self.subcategory.name,
            'list_id': self.list_id
        }
    
    @staticmethod
    def add(user_id, data):
        """
        Add a product to a shopping list.
        The data should include:
        - "list_id"
        - "name" (optional)
        - "quantity" (optional)
        - "unit_id" (optional)
        - "subcategory_id" (optional)
        """
        try:
            list_id = data.get('list_id')
            name = data.get('name')
            quantity = data.get('quantity')
            unit_id = data.get('unit_id')
            subcategory_id = data.get('subcategory_id')

            shopping_list = ShoppingList.query.filter_by(id=list_id).first()
            if not shopping_list:
                return {'message': 'Shopping list not found'}, 404
            
            if not does_have_permissions(user_id, shopping_list):
                return {'message': 'You do not have permssion to access it'}, 401
                
            product = Product(
                name=name,
                quantity=quantity,
                unit_id=unit_id,
                subcategory_id=subcategory_id,
                list_id=list_id
            )
            db.session.add(product)
            db.session.commit()
            return {'message': 'Product added successfully'}, 201
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
        
    @staticmethod
    def remove(user_id, data):
        """Remove product from shoppinglist.
        The data should include:
        - "id" (the product id)
        """
        try:
            product_id = data.get('id')
            product = Product.query.filter_by(id=product_id).first()
            if not product:
                return {'message': 'Product not found'}, 404
            
            shopping_list = ShoppingList.query.filter_by(id=product.list_id).first()
            if not shopping_list:
                return {'message': 'Shopping list not found'}, 404
            
            if not does_have_permissions(user_id, shopping_list):
                return {'message': 'You do not have permssion to access it'}, 401
            
            db.session.delete(product)
            db.session.commit()
            return {'message': 'Product removed successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
        
    @staticmethod
    def edit(user_id, data):
        """
        Edit a product in a shopping list.
        
        Required:
        - "id" (product ID)

        Optional:
        - "name"
        - "quantity"
        - "unit_id"
        - "subcategory_id"
        """
        try:
            product_id = data.get('id')
            if not product_id:
                return {'message': 'Product ID is required'}, 400

            product = Product.query.get(product_id)
            if not product:
                return {'message': 'Product not found'}, 404

            shopping_list = ShoppingList.query.get(product.list_id)
            if not shopping_list:
                return {'message': 'Shopping list not found'}, 404

            if not does_have_permissions(user_id, shopping_list):
                return {'message': 'You do not have permission to edit this product'}, 403

            product.name = data.get('name') or product.name
            product.quantity = data.get('quantity') or product.quantity
            product.unit_id = data.get('unit_id') or product.unit_id
            product.subcategory_id = data.get('subcategory_id') or product.subcategory_id

            db.session.commit()
            return {'message': 'Product updated successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
