from . import db
class Subcategory(db.Model):
    __tablename__ = 'subcategory'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id', ondelete='CASCADE'))

    products = db.relationship('Product', back_populates='subcategory')

    def to_dict(self):
        """Convert the subcategory object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'category_id': self.category_id
        }
