from . import db
from .Household import Household
from .PurchasedProduct import PurchasedProduct
from datetime import datetime
from sqlalchemy import CheckConstraint
from sqlalchemy import text
from sqlalchemy.orm import relationship


class PurchaseEvent(db.Model):
    __tablename__ = 'purchase_event'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    household_id = db.Column(db.Integer, db.ForeignKey('household.id', ondelete='CASCADE'), nullable=True)
    date = db.Column(db.Date, server_default=text("CURRENT_DATE"))
    receipt = db.Column(db.LargeBinary, nullable=True)
    name = db.Column(db.String(255), nullable=True)

    products = db.relationship(
        'PurchasedProduct',
        back_populates='event',
        cascade='all, delete-orphan',
        passive_deletes=True
    )
    __table_args__ = (
        db.CheckConstraint(
            '(user_id IS NOT NULL AND household_id IS NULL) OR (user_id IS NULL AND household_id IS NOT NULL)',
            name='purchase_event_user_or_household_check'
        ),
    )

    @staticmethod
    def create(user_id, data):
        """Create a new purchase event with the provided data.
        The data should include 'name', and a list of 'products'.
        If 'household_id' is provided, the event will be associated with that household.
        If 'household_id' is not provided, the event will be associated with the user."""
        try:
            household_id = data.get('household_id')
            name = data.get('name')
            products = data.get('products', [])

            if household_id:
                household = Household.query.filter_by(id=household_id).first()
                if not household:
                    return {'message': 'Household not found'}, 404

                is_member = any(member.user_id == user_id for member in household.members)
                if not is_member:
                    return {'message': 'User is not a member of the household'}, 403

                event = PurchaseEvent(name=name, household_id=household_id)
            else:
                if not user_id:
                    return {'message': 'User ID is required if household ID is not provided'}, 400
                
                event = PurchaseEvent(name=name, user_id=user_id)

            db.session.add(event)
            db.session.flush()  

            for p in products:
                product = PurchasedProduct(
                    name=p.get('name'),
                    quantity=p.get('quantity'),
                    price=p.get('price'),
                    subcategory_id=p.get('subcategory_id'),
                    unit_id=p.get('unit_id'),
                    event_id=event.id
                )
                db.session.add(product)

            db.session.commit()
            return {'message': 'Purchase event and products saved'}, 201

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
        
    @staticmethod
    def delete(user_id, data):
        """Delete a purchase event by its ID.
        The data should include 'event_id'."""
        try:
            event_id = data.get('event_id')
            event = PurchaseEvent.query.filter_by(id=event_id, user_id=user_id).first()

            if not event:
                return {'message': 'Purchase event not found or you do not have permission to delete it'}, 404

            db.session.delete(event)
            db.session.commit()
            return {'message': 'Purchase event deleted successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500