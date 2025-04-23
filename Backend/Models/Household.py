from . import db
class Household(db.Model):
    __tablename__ = 'household'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    ownership = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))


    @staticmethod
    def create(user_id, data):
        try:
            household = Household(
                name = data.get('name'),
                ownership = user_id
            )
            db.session.add(household)
            db.session.commit()
            return {"message": "Household created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @staticmethod
    def edit(user_id, data):
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