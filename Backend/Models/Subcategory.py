from . import db
class Subcategory(db.Model):
    __tablename__ = 'subcategory'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id', ondelete='CASCADE'))

    products = db.relationship('Product', back_populates='subcategory')
    category = db.relationship('Category', back_populates='subcategories')

    def to_dict(self):
        """Convert the subcategory object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'category_id': self.category_id
        }

    @staticmethod
    def get():
        """Retrieve all subcategories."""
        subcategories = Subcategory.query.all()
        return [subcategory.to_dict() for subcategory in subcategories], 200