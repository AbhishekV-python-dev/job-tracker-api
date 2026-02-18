from app.extensions import db
from app.models.company import Company
from app.utils.exceptions import AppException


def create_company(user_id, data):
    if not data.get("name"):
        raise AppException("Company name is required")
    company = Company(
        name=data.get("name"),
        location=data.get("location"),
        website=data.get("website"),
        user_id=user_id
    )

    db.session.add(company)
    db.session.commit()

    return company


def get_user_companies(user_id):
    return Company.query.filter_by(user_id=user_id).all()
