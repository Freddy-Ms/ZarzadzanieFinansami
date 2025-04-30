from . import db
from .HouseholdUser import HouseholdUser
from .User import User
import datetime
import jwt
from dotenv import load_dotenv
import os
from Authentication import decode_token
from Functions import handle_household_ownership_on_delete_or_leave
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
class Household(db.Model):
    __tablename__ = 'household'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    ownership = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))

    owner = db.relationship('User', back_populates='owned_household', foreign_keys=[ownership]
                            )
    members = db.relationship(
        'HouseholdUser',
        back_populates='household',
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    def to_dict(self, current_user_id):
        """Convert the household object to a dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'owner_username': self.owner.username,
            'is_owner': self.ownership == current_user_id,
            'members': [member.user.username for member in self.members],
        }
    @staticmethod
    def create(user_id, data):
        """Create a new household with the provided data.
        The data should include 'name'."""
        try:
            household_name = data.get('name')
            if not household_name:
                return {"message": "Household name is required"}, 400
            user_household = Household.query.filter_by(ownership=user_id).first()

            if user_household:
                return {"message": "You already own a household"}, 400
            
            household = Household(
                name = household_name,
                ownership = user_id
            )

            db.session.add(household)
            db.session.flush() 

            household_user = HouseholdUser(
                household_id = household.id,
                user_id = user_id
            )
            db.session.add(household_user)
            db.session.commit()
            return {"message": "Household created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @staticmethod
    def edit(user_id, data):
        """Edit an existing household with the provided data.
        The data should include 'household_id' and 'name'."""
        try:
            household_id = data.get('household_id')
            household_name = data.get('name')
            household = Household.query.filter_by(id=household_id, ownership=user_id).first()
            if not household:
                return {"message": "Household not found or you are not the owner"}, 404

            if not household_name:
                return {"message": "Household name is required"}, 400
            household.name = household_name
            db.session.commit()
            return {"message": "Household updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @staticmethod
    def delete(user_id, data):
        """Delete an existing household with the provided data.
        The data should include 'household_id'."""
        try:
            household_id = data.get('household_id')
            household = Household.query.filter_by(id=household_id, ownership=user_id).first()
            if not household:
                return {"message": "Household not found or you are not the owner"}, 404

            db.session.delete(household)
            db.session.commit()
            return {"message": "Household deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @staticmethod
    def invite_user(user_id, data):
        """Create an invite token for a user to join a household.
        The data should include 'household_id' and 'email'."""
        try:
            household_id = data.get('household_id')
            email = data.get('email')
            household = Household.query.filter_by(id = household_id, ownership = user_id).first()
            if not household:
                return {"message": "Household not found"}, 404

            token = jwt.encode({
                'household_id': household_id,
                'email': email,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }, SECRET_KEY, algorithm='HS256')

            return {"message": "Token created successfully!", "token": token}, 200
        except Exception as e:
            return {"message": str(e)}, 500

    @staticmethod
    def accept_invite(user_id, data):
        """Accept an invite to join a household.
        The data should include 'token'."""
        try:
            token = data.get('token')
            if not token:
                return {"message": "Token is required"}, 400

            decoded_token = decode_token(token)
            if not decoded_token:
                return {"message": "Invalid or expired token"}, 400

            household_id = decoded_token['household_id']
            email = decoded_token['email']

            current_user = User.query.filter_by(id=user_id).first()

            if current_user.email != email:
                return {"message": "You are not authorized to accept this invite"}, 403
            
            household = Household.query.filter_by(id=household_id).first()
            
            if not household:
                return {"message": "Household not found"}, 404
            
            exists = HouseholdUser.query.filter_by(household_id=household_id, user_id=user_id).first()
            if exists:
                return {"message": "You are already a member of this household"}, 400
            
            value = HouseholdUser(
                household_id = household_id,
                user_id = user_id
            )
            db.session.add(value)
            db.session.commit()
            return {"message": "Invite accepted successfully!"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @staticmethod
    def get_user_households(user_id):
        """Get all households of a user."""
        try:
            households = HouseholdUser.query.filter_by(user_id=user_id).all()
            if not households:
                return {"message": "No households found"}, 404

            return [house.household.to_dict(user_id) for house in households], 200
        except Exception as e:
            return {"message": str(e)}, 500
    
    @staticmethod
    def leave_household(user_id, data):
        """Leave a household.
        The data should include 'household_id'."""
        try:
            household_id = data.get('household_id')
            household_user = HouseholdUser.query.filter_by(household_id=household_id, user_id=user_id).first()
            if not household_user:
                return {"message": "You are not a member of this household"}, 404
            
            handle_household_ownership_on_delete_or_leave(user_id)
            
            return {"message": "Left household successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500