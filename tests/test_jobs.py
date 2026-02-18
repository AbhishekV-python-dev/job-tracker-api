def register_and_login(client):
    client.post("/auth/register", json={
        "email": "test@test.com",
        "password": "123456"
    })

    response = client.post("/auth/login", json={
        "email": "test@test.com",
        "password": "123456"
    })

    return response.json["access_token"]
def test_create_company(client):
    token = register_and_login(client)

    response = client.post(
        "/companies",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "TestCorp",
            "location": "NY",
            "website": "https://test.com"
        }
    )

    assert response.status_code == 201
    assert response.json["name"] == "TestCorp"

def test_job_lifecycle(client):
    token = register_and_login(client)

    # Create company
    company_response = client.post(
        "/companies",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "TestCorp"}
    )

    company_id = company_response.json["id"]

    # Create job
    job_response = client.post(
        "/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Backend Engineer",
            "company_id": company_id
        }
    )

    job_id = job_response.json["id"]

    # Valid transition
    response = client.patch(
        f"/jobs/{job_id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "interview"}
    )

    assert response.status_code == 200
    assert response.json["status"] == "interview"

    # Invalid transition
    response = client.patch(
        f"/jobs/{job_id}/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "applied"}
    )

    assert response.status_code == 400
