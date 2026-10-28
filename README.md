# Customer Churn Prediction

A full-stack customer churn prediction application. Enter a customer's account and service details in the web interface to get a churn classification, probability, and risk band from the saved machine-learning artifacts.

## Features

- React and TypeScript interface for entering customer profiles and viewing model metadata and prediction results.
- FastAPI backend with single-customer and batch prediction endpoints.
- Saved scikit-learn model, feature scaler, and decision threshold loaded from `models/`.
- Input validation, health check, and interactive API documentation.
- Configurable CORS origins for local and deployed frontends.

## Project structure

```text
backend/
  app/
    core/config.py              # Model path and CORS configuration
    main.py                     # FastAPI application and endpoints
    schemas.py                  # Request and response validation
    services/model_service.py   # Feature preparation and model inference
  tests/test_api.py             # API tests
frontend/
  src/                          # React application and API client
  .env.example                  # Frontend API URL example
models/
  churn_model.pkl               # Trained classification model
  scaler.pkl                    # Feature scaler
  threshold.pkl                 # Classification threshold
requirements.txt                # Python dependencies
```

The model artifacts are required at startup. The repository does not include a training pipeline or source dataset; the API reports `dataset_available: false`.
The artifacts were serialized with scikit-learn 1.6.1; the dependency is pinned to that version in `requirements.txt` for compatibility.

## Requirements

- Python 3.10 or later
- Node.js and npm

## Run locally

Run the backend and frontend in separate terminals from the repository root.

### Backend

Create and activate a virtual environment, then install the Python dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Start the API:

```powershell
python -m uvicorn backend.app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`). The example environment file points the frontend to `http://localhost:8000`. To use another backend URL, set `VITE_API_BASE_URL` in `frontend/.env` and add the frontend origin to the backend's `FRONTEND_ORIGINS` environment variable. `FRONTEND_ORIGINS` accepts a comma-separated list; the local Vite and port 3000 origins are allowed by default.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Confirm the API is running |
| `GET` | `/health` | Check model availability and threshold |
| `GET` | `/model-info` | Read model type, feature count, threshold, and risk bands |
| `POST` | `/predict` | Predict churn for one customer profile |
| `POST` | `/predict/batch` | Predict churn for a list of profiles |

Example request to `POST /predict`:

```json
{
  "gender": "Male",
  "senior_citizen": false,
  "partner": true,
  "dependents": false,
  "tenure": 24,
  "phone_service": true,
  "multiple_lines": "No",
  "online_security": "No",
  "online_backup": "Yes",
  "device_protection": "No",
  "tech_support": "No",
  "streaming_tv": "Yes",
  "streaming_movies": "No",
  "paperless_billing": true,
  "monthly_charges": 75.5,
  "internet_service": "Fiber optic",
  "contract": "Month-to-month",
  "payment_method": "Electronic check"
}
```

The response contains `prediction` (`Yes` or `No`), `churn_probability`, `risk_level`, `threshold_used`, and `model_type`. The saved threshold determines the prediction; risk bands are Low below `0.4`, Medium from `0.4` to below `0.7`, and High at or above `0.7`.

Profile fields and allowed categorical values are defined in `backend/app/schemas.py`. Invalid requests are rejected by validation.

## Tests and checks

From the repository root, run backend tests:

```powershell
python -m pytest backend/tests
```

For frontend checks:

```powershell
cd frontend
npm test
npm run lint
npm run build
```
