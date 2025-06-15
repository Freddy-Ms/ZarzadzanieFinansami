from . import db
from .Household import Household
from .HouseholdUser import HouseholdUser
from sqlalchemy import CheckConstraint

class ShoppingList(db.Model):
    __tablename__ = 'shopping_list'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    household_id = db.Column(db.Integer, db.ForeignKey('household.id', ondelete='CASCADE'), nullable=True)

    products = db.Relationship(
        'Product',
        back_populates = 'shopping_list',
        cascade = 'all, delete-orphan',
        passive_deletes=True
    )

    __table_args__ = (
        db.CheckConstraint(
            '(user_id IS NOT NULL AND household_id IS NULL) OR (user_id IS NULL AND household_id IS NOT NULL)',
            name='shopping_list_user_or_household_check'
        ),
    )

    def to_dict(self):
        """Convert the shopping list object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'household_id': self.household_id,
            'products': [product.to_dict() for product in self.products],
        }
    @staticmethod
    def create(user_id, data):
        """Create a new shopping list with the provided data.
        The data should include 'name' and optionally 'household_id'."""
        try:
            household = data.get('household_id')
            name =  data.get('name')
            if household:
                household_exists = Household.query.filter_by(id=household).first()
                if not household_exists:
                    return {'message': 'Household not found'}, 404
                
                household_user = any(member.user_id == user_id for member in household_exists.members)

                if not household_user:
                    return {'message': 'User is not a member of the household'}, 403
                
                shopping_list = ShoppingList(
                    name = name,
                    household_id = household
                )
            else:
                shopping_list = ShoppingList(
                    name = name,
                    user_id = user_id
                )
                
            db.session.add(shopping_list)
            db.session.commit()
            return {'id': shopping_list.id, 'message': 'Shopping list created successfully'}, 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
        
    @staticmethod
    def delete(user_id, data):
        try:
            """Delete a shopping list with the provided data.
            The data should include 'list_id'."""
            list_id = data.get('list_id')
            list_to_remove = ShoppingList.query.filter_by(id=list_id).first()
            if not list_to_remove:
                return {'message': 'Shopping list not found'}, 404
            
            db.session.delete(list_to_remove)
            db.session.commit()
            return {'message': 'Shopping list deleted successfully'}, 200
        
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
        
    @staticmethod
    def get_user_shopping_lists(user_id):
        """Get all shopping lists for a user."""
        try:
            household_ids_subquery = db.session.query(HouseholdUser.household_id).filter_by(user_id=user_id)

            shopping_lists = ShoppingList.query.filter(
                (ShoppingList.user_id == user_id) | (ShoppingList.household_id.in_(household_ids_subquery))
            ).all()

            return [shopping_list.to_dict() for shopping_list in shopping_lists], 200

        except Exception as e:
            return {'error': str(e)}, 500
        
    
    
