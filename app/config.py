import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    @staticmethod
    def _fix_db_url(url):
        """Render gives postgres:// but SQLAlchemy needs postgresql://"""
        if url and url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = BaseConfig._fix_db_url(os.environ.get("DATABASE_URL"))
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


class ProductionConfig(BaseConfig):
    DEBUG = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)

    @property
    def SQLALCHEMY_DATABASE_URI(self):
        return self._fix_db_url(os.environ.get("DATABASE_URL"))


class TestConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "super-secret-test-key-1234567890"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
