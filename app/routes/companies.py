from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.company_service import create_company, get_user_companies
from app.schemas.company_schema import CompanySchema

companies_bp = Blueprint("companies", __name__, url_prefix="/companies")


@companies_bp.route("", methods=["POST"])
@jwt_required()
def create():
    user_id = int(get_jwt_identity())
    schema = CompanySchema()
    data = schema.load(request.get_json())

    company = create_company(user_id, data)

    return jsonify({
        "id": company.id,
        "name": company.name,
        "location": company.location,
        "website": company.website
    }), 201

@companies_bp.route("", methods=["GET"])
@jwt_required()
def list_companies():
    user_id = int(get_jwt_identity())
    companies = get_user_companies(user_id)

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "location": c.location,
            "website": c.website
        }
        for c in companies
    ]), 200
