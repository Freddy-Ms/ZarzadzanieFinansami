from . import db
from sqlalchemy import CheckConstraint
class ShoppingList(db.Model):
    __tablename__ = 'shopping_list'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    household_id = db.Column(db.Integer, db.ForeignKey('household.id', ondelete='CASCADE'), nullable=True)

    __table_args__ = (
        db.CheckConstraint(
            '(user_id IS NOT NULL AND household_id IS NULL) OR (user_id IS NULL AND household_id IS NOT NULL)',
            name='shopping_list_user_or_household_check'
        ),
    )
