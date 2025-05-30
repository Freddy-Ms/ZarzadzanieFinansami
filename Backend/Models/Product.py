from . import db
class Product(db.Model):
    __tablename__ = 'product'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=True)
    quantity = db.Column(db.Integer, nullable=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('quantity_unit.id'))
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'))
    list_id = db.Column(db.Integer, db.ForeignKey('shopping_list.id', ondelete='CASCADE'))

    shopping_list = db.Relationship('ShoppingList', back_populates = 'products', foreign_keys=[list_id])

    def to_dict(self):
        """Convert the product object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'unit_id': self.unit_id,
            'subcategory_id': self.subcategory_id,
            'list_id': self.list_id
        }