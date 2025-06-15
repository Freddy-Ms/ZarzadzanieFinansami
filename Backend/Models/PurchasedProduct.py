from . import db
class PurchasedProduct(db.Model):
    __tablename__ = 'purchased_product'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('quantity_unit.id'), nullable=True)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('purchase_event.id', ondelete='CASCADE'))

    event = db.relationship('PurchaseEvent', back_populates='products')
    unit = db.Relationship('QuantityUnit', back_populates='purchased_products', foreign_keys=[unit_id])
    subcategory = db.Relationship('Subcategory', back_populates='purchased_products', foreign_keys=[subcategory_id])


    def to_dict(self):
        """Convert the PurchasedProduct instance to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'unit_id': self.unit.name if self.unit else None,
            'subcategory_id': self.subcategory.name if self.subcategory else None,
            'price': str(self.price),  
            'event_id': self.event_id
        }
    
    @staticmethod
    def add(data, commit=True):
        try:
            name = data.get('name')
            price = data.get('price')
            event_id = data.get('event_id')

            if not name or price is None or event_id is None:
                return {'message': 'Missing required fields: name, price, event_id'}, 400

            product = PurchasedProduct(
                name=name,
                price=price,
                quantity=data.get('quantity'),
                unit_id=data.get('unit_id'),
                subcategory_id=data.get('subcategory_id'),
                event_id=event_id
            )

            db.session.add(product)
            if commit:
                db.session.commit()

            return {'message': 'Product added successfully', 'product_id': product.id}, 201

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
        

    @staticmethod
    def remove(data):
        """Remove a purchased product by its ID."""
        try:
            product_id = data.get('id')
            product = PurchasedProduct.query.filter_by(id=product_id).first()
            if not product:
                return {'message': 'Product not found'}, 404

            db.session.delete(product)
            
            db.session.commit()

            return {'message': 'Product removed successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
        
    @staticmethod
    def edit(data):
        """Edit a purchased product."""
        try:
            product_id = data.get('id')
            if not product_id:
                return {'message': 'Product ID is required'}, 400

            product = PurchasedProduct.query.filter_by(id=product_id).first()
            if not product:
                return {'message': 'Product not found'}, 404

            product.name = data.get('name', product.name)
            product.quantity = data.get('quantity', product.quantity)
            product.unit_id = data.get('unit_id', product.unit_id)
            product.subcategory_id = data.get('subcategory_id', product.subcategory_id)
            product.price = data.get('price', product.price)

            db.session.commit()

            return {'message': 'Product updated successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500