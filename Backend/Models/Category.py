from . import db
class Category(db.Model):
    __tablename__ = 'category'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)

    subcategories = db.relationship('Subcategory', back_populates='category', cascade='all, delete-orphan')
    def to_dict(self):
        """Convert the category object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name
        }