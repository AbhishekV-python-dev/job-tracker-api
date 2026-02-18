from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.job_service import create_job_application,update_job_status,list_jobs
from app.schemas.job_schema import JobCreateSchema, JobStatusSchema


jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")


@jobs_bp.route("", methods=["POST"])
@jwt_required()
def create_job():
    user_id = int(get_jwt_identity())
    schema = JobCreateSchema()
    data = schema.load(request.get_json())

    job = create_job_application(user_id, data)

    return jsonify({
        "id": job.id,
        "title": job.title,
        "status": job.status,
        "company_id": job.company_id
    }), 201


@jobs_bp.route("/<int:job_id>/status", methods=["PATCH"])
@jwt_required()
def change_status(job_id):
    user_id = int(get_jwt_identity())
    schema = JobStatusSchema()
    data = schema.load(request.get_json())

    job = update_job_status(user_id, job_id, data.get("status"))

    return jsonify({
        "id": job.id,
        "title": job.title,
        "status": job.status
    }), 200


@jobs_bp.route("", methods=["GET"])
@jwt_required()
def get_jobs():
    user_id = int(get_jwt_identity())

    status = request.args.get("status")
    limit = request.args.get("limit", 10, type=int)
    offset = request.args.get("offset", 0, type=int)
    sort = request.args.get("sort", "desc")

    jobs = list_jobs(user_id, status, limit, offset, sort)

    return jsonify([
        {
        "id": job.id,
        "title": job.title,
        "status": job.status,
        "company": {
            "id": job.company.id,
            "name": job.company.name
        },
        "applied_date": job.applied_date
        }
        for job in jobs
    ]), 200