from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_endpoint_reports_model_loaded():
    response = client.get('/health')

    assert response.status_code == 200
    body = response.json()
    assert body['status'] == 'ok'
    assert body['model_loaded'] is True
    assert body['threshold'] == 0.4


def test_model_info_returns_metadata():
    response = client.get('/model-info')

    assert response.status_code == 200
    body = response.json()
    assert body['model_type'] == 'LogisticRegression'
    assert body['feature_count'] == 22
    assert body['threshold'] == 0.4


def test_predict_endpoint_uses_the_saved_model_logic():
    payload = {
        'gender': 'Male',
        'senior_citizen': False,
        'partner': True,
        'dependents': False,
        'tenure': 24,
        'phone_service': True,
        'multiple_lines': 'No',
        'online_security': 'No',
        'online_backup': 'Yes',
        'device_protection': 'No',
        'tech_support': 'No',
        'streaming_tv': 'Yes',
        'streaming_movies': 'No',
        'paperless_billing': True,
        'monthly_charges': 75.5,
        'internet_service': 'Fiber optic',
        'contract': 'Month-to-month',
        'payment_method': 'Electronic check',
    }

    response = client.post('/predict', json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body['prediction'] in {'Yes', 'No'}
    assert 0 <= body['churn_probability'] <= 1
    assert body['risk_level'] in {'Low', 'Medium', 'High'}
    assert body['threshold_used'] == 0.4


def test_predict_rejects_invalid_input():
    response = client.post(
        '/predict',
        json={
            'gender': 'Male',
            'senior_citizen': False,
            'partner': True,
            'dependents': False,
            'tenure': 24,
            'phone_service': True,
            'multiple_lines': 'No',
            'online_security': 'No',
            'online_backup': 'Yes',
            'device_protection': 'No',
            'tech_support': 'No',
            'streaming_tv': 'Yes',
            'streaming_movies': 'No',
            'paperless_billing': True,
            'monthly_charges': -1,
            'internet_service': 'Fiber optic',
            'contract': 'Month-to-month',
            'payment_method': 'Electronic check',
        },
    )

    assert response.status_code == 422
