import pytest
from app import create_app
from app.extensions import db
from app.config import TestConfig


def test_register_and_login(client):
    response = client.post("/auth/register", json={
        "email": "test@test.com",
        "password": "123456"
    })

    assert response.status_code == 201

    response = client.post("/auth/login", json={
        "email": "test@test.com",
        "password": "123456"
    })

    assert response.status_code == 200
    assert "access_token" in response.json
