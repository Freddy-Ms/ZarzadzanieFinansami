from . import db
class QuantityUnit(db.Model):
    __tablename__ = 'quantity_unit'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    shortcut = db.Column(db.String(10), nullable=False)