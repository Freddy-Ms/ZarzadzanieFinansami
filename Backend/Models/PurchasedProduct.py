from . import db
class PurchasedProduct(db.Model):
    __tablename__ = 'purchased_product'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=True)
    quantity = db.Column(db.Integer, nullable=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('quantity_unit.id'))
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'))
    price = db.Column(db.Numeric(10, 2))
    event_id = db.Column(db.Integer, db.ForeignKey('purchase_event.id', ondelete='CASCADE'))