from . import db
class HouseholdUser(db.Model):
    __tablename__ = 'household_user'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    household_id = db.Column(db.Integer, db.ForeignKey('household.id', ondelete='CASCADE'), primary_key=True)
