from app.extensions import db
from app.models.job_application import JobApplication
from app.models.company import Company
from sqlalchemy.orm import joinedload
from app.utils.exceptions import AppException, NotFoundException
from flask import current_app


ALLOWED_STATUSES = {"applied", "interview", "offer", "rejected"}

ALLOWED_TRANSITIONS = {
    "applied": {"interview", "rejected"},
    "interview": {"offer", "rejected"},
    "offer": set(),
    "rejected": set()
}



def create_job_application(user_id, data):
    current_app.logger.info(f"Creating job for user {user_id}")
    title = data.get("title")
    company_id = data.get("company_id")

    if not title:
        raise AppException("Job title required")

    if not company_id:
        raise AppException("Company ID required")

    # Ensure company belongs to user
    company = Company.query.filter_by(id=company_id, user_id=user_id).first()

    if not company:
        raise NotFoundException("Company not found")

    job = JobApplication(
        title=title,
        company_id=company_id,
        user_id=user_id
    )

    db.session.add(job)
    db.session.commit()
    current_app.logger.info(f"Job {job.id} created for user {user_id}")

    return job


def update_job_status(user_id, job_id, new_status):
    if new_status not in ALLOWED_STATUSES:
        raise AppException("Invalid status")

    job = JobApplication.query.filter_by(id=job_id, user_id=user_id).first()

    if not job:
        raise NotFoundException("Job not found")

    current_status = job.status

    if new_status not in ALLOWED_TRANSITIONS[current_status]:
        raise AppException("Invalid status transition")

    job.status = new_status
    db.session.commit()

    return job

def list_jobs(user_id, status=None, limit=10, offset=0, sort="desc"):
    query = JobApplication.query.options(joinedload(JobApplication.company)).filter_by(user_id=user_id)

    # Optional filtering
    if status:
        query = query.filter_by(status=status)

    # Sorting by applied_date
    if sort == "asc":
        query = query.order_by(JobApplication.applied_date.asc())
    else:
        query = query.order_by(JobApplication.applied_date.desc())

    # Pagination
    jobs = query.limit(limit).offset(offset).all()

    return jobs
