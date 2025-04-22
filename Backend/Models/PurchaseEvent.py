from . import db
from datetime import datetime
from sqlalchemy import CheckConstraint
class PurchaseEvent(db.Model):
    __tablename__ = 'purchase_event'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    household_id = db.Column(db.Integer, db.ForeignKey('household.id', ondelete='CASCADE'), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    receipt = db.Column(db.LargeBinary, nullable=True)

    __table_args__ = (
        db.CheckConstraint(
            '(user_id IS NOT NULL AND household_id IS NULL) OR (user_id IS NULL AND household_id IS NOT NULL)',
            name='purchase_event_user_or_household_check'
        ),
    )