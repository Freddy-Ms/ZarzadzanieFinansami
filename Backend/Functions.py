from Models import db
from Models.HouseholdUser import HouseholdUser

def handle_household_ownership_on_delete_or_leave(user_id):
    """Handle the transfer of household ownership or deletion of households when a user is deleted."""
    from Models.Household import Household
    households_created = Household.query.filter_by(ownership=user_id).all()

    for household in households_created:
        member_ids = HouseholdUser.query.filter(
                     HouseholdUser.household_id == household.id,
                     HouseholdUser.user_id != user_id).all()
        member_ids = [user.user_id for user in member_ids]

        if member_ids:
            new_owner_id = member_ids[0]
            household.ownership = new_owner_id
        else:
            db.session.delete(household)

    db.session.commit()

def does_have_permissions(user_id, shopping_list):
    if shopping_list.household_id:
        is_member = HouseholdUser.query.filter_by(user_id = user_id, household_id = shopping_list.household_id).first()
        if not is_member:
            return False
    else:
        if not shopping_list.user_id == user_id:
            return False
    
    return True