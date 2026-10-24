from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import MODELS_DIR, FRONTEND_ORIGINS
from backend.app.schemas import BatchPredictionRequest, CustomerProfile, HealthResponse, ModelMetadata, PredictionResult
from backend.app.services.model_service import ModelService

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("customer_churn")

app = FastAPI(title="Customer Churn Prediction API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model_service = ModelService(MODELS_DIR)
except Exception as exc:  # pragma: no cover - startup safety
    logger.exception("Failed to load model artifacts")
    model_service = None


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model artifacts are unavailable")

    return HealthResponse(
        status="ok",
        model_loaded=True,
        model_type=model_service.model.__class__.__name__,
        threshold=model_service.threshold,
    )


@app.get("/model-info", response_model=ModelMetadata)
def model_info() -> ModelMetadata:
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model artifacts are unavailable")

    return ModelMetadata(**model_service.get_model_metadata())


@app.post("/predict", response_model=PredictionResult)
def predict(profile: CustomerProfile) -> PredictionResult:
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model artifacts are unavailable")

    try:
        return model_service.predict_customer(profile)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive guard
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed due to an internal error") from exc


@app.post("/predict/batch")
def predict_batch(payload: BatchPredictionRequest) -> dict[str, list[dict[str, object]]]:
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model artifacts are unavailable")

    results = [model_service.predict_customer(record).model_dump() for record in payload.records]
    return {"results": results}


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Customer churn prediction API is running."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=False)
