from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np

from backend.app.schemas import CustomerProfile, PredictionResult


class ModelService:
    def __init__(self, model_dir: str | Path):
        self.model_dir = Path(model_dir)
        self.model = joblib.load(self.model_dir / "churn_model.pkl")
        self.scaler = joblib.load(self.model_dir / "scaler.pkl")
        self.threshold = float(joblib.load(self.model_dir / "threshold.pkl"))
        self.feature_names = list(getattr(self.model, "feature_names_in_", []))

    def build_feature_vector(self, profile: CustomerProfile) -> np.ndarray:
        feature_map: dict[str, float] = {
            "gender": 1.0 if profile.gender == "Male" else 0.0,
            "SeniorCitizen": 1.0 if profile.senior_citizen else 0.0,
            "Partner": 1.0 if profile.partner else 0.0,
            "Dependents": 1.0 if profile.dependents else 0.0,
            "tenure": float(profile.tenure),
            "PhoneService": 1.0 if profile.phone_service else 0.0,
            "MultipleLines": 1.0 if profile.multiple_lines == "Yes" else 0.0,
            "OnlineSecurity": 1.0 if profile.online_security == "Yes" else 0.0,
            "OnlineBackup": 1.0 if profile.online_backup == "Yes" else 0.0,
            "DeviceProtection": 1.0 if profile.device_protection == "Yes" else 0.0,
            "TechSupport": 1.0 if profile.tech_support == "Yes" else 0.0,
            "StreamingTV": 1.0 if profile.streaming_tv == "Yes" else 0.0,
            "StreamingMovies": 1.0 if profile.streaming_movies == "Yes" else 0.0,
            "PaperlessBilling": 1.0 if profile.paperless_billing else 0.0,
            "MonthlyCharges": float(profile.monthly_charges),
            "InternetService_Fiber optic": 1.0 if profile.internet_service == "Fiber optic" else 0.0,
            "InternetService_No": 1.0 if profile.internet_service == "No" else 0.0,
            "Contract_One year": 1.0 if profile.contract == "One year" else 0.0,
            "Contract_Two year": 1.0 if profile.contract == "Two year" else 0.0,
            "PaymentMethod_Credit card (automatic)": 1.0 if profile.payment_method == "Credit card (automatic)" else 0.0,
            "PaymentMethod_Electronic check": 1.0 if profile.payment_method == "Electronic check" else 0.0,
            "PaymentMethod_Mailed check": 1.0 if profile.payment_method == "Mailed check" else 0.0,
        }

        values: list[float] = []
        for feature_name in self.feature_names:
            if feature_name not in feature_map:
                raise ValueError(f"Missing feature mapping for {feature_name}")
            values.append(feature_map[feature_name])

        return np.asarray(values, dtype=float).reshape(1, -1)

    @staticmethod
    def risk_level(probability: float) -> str:
        if probability >= 0.7:
            return "High"
        if probability >= 0.4:
            return "Medium"
        return "Low"

    def predict_customer(self, profile: CustomerProfile) -> PredictionResult:
        feature_vector = self.build_feature_vector(profile)
        scaled_vector = self.scaler.transform(feature_vector)
        probas = self.model.predict_proba(scaled_vector)
        churn_probability = float(probas[0, 1])
        prediction = "Yes" if churn_probability >= self.threshold else "No"

        return PredictionResult(
            prediction=prediction,
            churn_probability=round(churn_probability, 6),
            risk_level=self.risk_level(churn_probability),
            threshold_used=self.threshold,
            model_type=self.model.__class__.__name__,
        )

    def predict_batch(self, profiles: list[CustomerProfile]) -> list[PredictionResult]:
        return [self.predict_customer(profile) for profile in profiles]

    def get_model_metadata(self) -> dict[str, Any]:
        return {
            "model_type": self.model.__class__.__name__,
            "feature_count": len(self.feature_names),
            "threshold": self.threshold,
            "supports_probability": hasattr(self.model, "predict_proba"),
            "scaler_applied": True,
            "risk_thresholds": {"Low": 0.0, "Medium": 0.4, "High": 0.7},
            "dataset_available": False,
        }
