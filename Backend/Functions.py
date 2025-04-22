from Models import db, HouseholdUser, Household, User


def handle_household_ownership_on_delete(user_id):
    households_created = Household.query.filter_by(created_by=user_id).all()

    for household in households_created:
        member_ids = HouseholdUser.query.filter(
                     HouseholdUser.household_id == household.id,
                     HouseholdUser.user_id != user_id).all()
        member_ids = [uid for (uid,) in member_ids]

        if member_ids:
            new_owner_id = member_ids[0]
            household.created_by = new_owner_id
        else:
            db.session.delete(household)

    db.session.commit()