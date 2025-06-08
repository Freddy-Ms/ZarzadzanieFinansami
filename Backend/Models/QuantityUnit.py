from . import db
class QuantityUnit(db.Model):
    __tablename__ = 'quantity_unit'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    shortcut = db.Column(db.String(10), nullable=False)

    products = db.relationship('Product', back_populates='unit')
    purchased_products = db.relationship('PurchasedProduct', back_populates='unit')

    def to_dict(self):
        """Convert the quantity unit object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'shortcut': self.shortcut
        }
    
    @staticmethod
    def get():
        """Retrieve all quantity units."""
        quantity_units = QuantityUnit.query.all()
        return [unit.to_dict() for unit in quantity_units], 200
