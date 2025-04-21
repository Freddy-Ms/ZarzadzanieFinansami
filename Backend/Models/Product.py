from . import db
class Product(db.Model):
    __tablename__ = 'product'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('quantity_unit.id'))
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'))
    list_id = db.Column(db.Integer, db.ForeignKey('shopping_list.id', ondelete='CASCADE'))