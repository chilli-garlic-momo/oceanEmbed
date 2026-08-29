import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model_version" in data
    assert "days_available" in data
    assert len(data["days_available"]) == 2


def test_profile_ocean_cell(client):
    response = client.get("/profile?lat=15.0&lon=85.0&date=2020-05-15")
    assert response.status_code == 200
    data = response.json()
    assert len(data["temperature_degC"]) == 15
    assert len(data["sigma_degC"]) == 15
    assert data["tchp_kJ_cm2"] is not None
    assert data["d20_m"] is not None
    assert data["mld_m"] is not None
    assert data.get("masked") is not True


def test_profile_land_cell_returns_null_and_masked(client):
    response = client.get("/profile?lat=20.0&lon=78.0&date=2020-05-15")
    assert response.status_code == 200
    data = response.json()
    assert data.get("masked") is True
    assert all(val is None for val in data["temperature_degC"])


def test_field_endpoint(client):
    response = client.get("/field?depth=100&date=2020-05-15")
    assert response.status_code == 200
    data = response.json()
    assert len(data["temperature_degC"]) == 100
    assert len(data["temperature_degC"][0]) == 240


def test_tchp_endpoint(client):
    response = client.get("/tchp?date=2020-05-15")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tchp_kJ_cm2"]) == 100
    assert len(data["tchp_kJ_cm2"][0]) == 240


def test_out_of_bounds_returns_400(client):
    response = client.get("/profile?lat=60.0&lon=85.0&date=2020-05-15")
    assert response.status_code == 400


def test_invalid_depth_returns_400(client):
    response = client.get("/field?depth=999&date=2020-05-15")
    assert response.status_code == 400


def test_unavailable_date_returns_404(client):
    response = client.get("/profile?lat=15.0&lon=85.0&date=1990-01-01")
    assert response.status_code == 404
