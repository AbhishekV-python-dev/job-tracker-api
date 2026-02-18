from flask import Flask
from app.config import DevelopmentConfig
from app.extensions import db, migrate, jwt
from app.routes.health import health_bp
from app.models.user import User
from app.routes.auth import auth_bp
from app import models
from app.routes.companies import companies_bp
from app.routes.jobs import jobs_bp
import logging


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(health_bp)

    jwt.init_app(app)

    app.register_blueprint(auth_bp)

    app.register_blueprint(companies_bp)

    app.register_blueprint(jobs_bp) 

    logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s")

    app.logger.info("Application startup")


    from marshmallow import ValidationError
    from app.utils.exceptions import AppException
    from flask import jsonify

    @app.errorhandler(AppException)
    def handle_app_exception(error):
        return jsonify({"error": error.message}), error.status_code

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({"error": error.messages}), 400

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        return jsonify({"error": "Internal Server Error"}), 500

    return app

