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

    def to_dict(self):
        """Convert the purchase event object to a dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'household_id': self.household_id,
            'date': self.date.isoformat(),
            'name': self.name,
            'products': [product.to_dict() for product in self.products]
        }
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
            receipt = data.get('receipt')

            if household_id:
                household = Household.query.filter_by(id=household_id).first()
                if not household:
                    return {'message': 'Household not found'}, 404

                is_member = any(member.user_id == user_id for member in household.members)
                if not is_member:
                    return {'message': 'User is not a member of the household'}, 403

                event = PurchaseEvent(name=name, household_id=household_id, receipt=receipt)
            else:
                if not user_id:
                    return {'message': 'User ID is required if household ID is not provided'}, 400
                
                event = PurchaseEvent(name=name, user_id=user_id, receipt=receipt)

            db.session.add(event)
            db.session.flush()  

            for p in products:
                p['event_id'] = event.id  
                PurchasedProduct.add(p, commit=False)  

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
            event = PurchaseEvent.query.filter_by(id=event_id).first()

            if not event:
                return {'message': 'Purchase event not found or you do not have permission to delete it'}, 404

            db.session.delete(event)
            db.session.commit()
            return {'message': 'Purchase event deleted successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
        
    @staticmethod
    def get(user_id, data):
        """Retrieve purchase events for a user or household.
        The data should include 'household_id' if fetching household events."""
        try:
            household_id = data.get('household_id')
            if household_id:
                events = PurchaseEvent.query.filter_by(household_id=household_id).all()
            else:
                events = PurchaseEvent.query.filter_by(user_id=user_id).all()

            result = []
            for event in events:
                event_dict = event.to_dict()
                result.append(event_dict)

            return {'events': result}, 200

        except Exception as e:
            return {'message': str(e)}, 500
        
    @staticmethod
    def receipt_get(user_id, data):
        """Retrieve the receipt image for a purchase event.
        The data should include 'event_id'."""
        try:
            event_id = data.get('event_id')
            if not event_id:
                return {'message': 'Event ID is required'}, 400

            event = PurchaseEvent.query.filter_by(id=event_id).first()
            if not event or not event.receipt:
                return {'message': 'Receipt not found'}, 404

            if event.user_id:
                if event.user_id != user_id:
                    return {'message': 'Access denied'}, 403
            elif event.household_id:
                household = Household.query.filter_by(id=event.household_id).first()
                if not household:
                    return {'message': 'Household not found'}, 404

                is_member = any(member.user_id == user_id for member in household.members)
                if not is_member:
                    return {'message': 'Access denied'}, 403

            return {'message': 'Image sent!','receipt': event.receipt, 'event_id': event.id}, 200

        except Exception as e:
            return {'message': str(e)}, 500
        

    @staticmethod
    def edit(user_id, data):
        """Edit a purchase event's name and date.
        Required: 'event_id'.
        Optional: 'name' and 'date' (format: YYYY-MM-DD)."""
        try:
            event_id = data.get('event_id')
            if not event_id:
                return {'message': 'Missing event_id'}, 400

            event = PurchaseEvent.query.filter_by(id=event_id).first()
            if not event:
                return {'message': 'Purchase event not found'}, 404

            if 'name' in data:
                event.name = data['name']

            if 'date' in data:
                try:
                    event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                except ValueError:
                    return {'message': 'Invalid date format. Use YYYY-MM-DD.'}, 400

            db.session.commit()
            return {'message': 'Purchase event updated successfully'}, 200

        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
