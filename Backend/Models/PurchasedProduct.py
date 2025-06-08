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