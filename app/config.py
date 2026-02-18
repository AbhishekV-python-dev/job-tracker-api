import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class BaseConfig:
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY',"dev-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=7)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    

class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    DEBUG = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

class ProductionConfig(BaseConfig):
    DEBUG = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)

class TestConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "super-secret-test-key-1234567890"
