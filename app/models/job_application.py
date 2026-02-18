from app.extensions import db


class JobApplication(db.Model):
    __tablename__ = "job_applications"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(255), nullable=False)

    status = db.Column(
        db.String(50),
        default="applied",
        nullable=False
    )

    applied_date = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    company = db.relationship("Company", backref="job_applications")
    user = db.relationship("User", backref="job_applications")
