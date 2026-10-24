from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

LineService = Literal["No", "Yes", "No phone service"]
InternetFeature = Literal["No", "Yes", "No internet service"]
InternetService = Literal["DSL", "Fiber optic", "No"]
ContractType = Literal["Month-to-month", "One year", "Two year"]
PaymentMethod = Literal[
    "Credit card (automatic)",
    "Electronic check",
    "Mailed check",
]


class CustomerProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    gender: Literal["Male", "Female"] = "Male"
    senior_citizen: bool = False
    partner: bool = False
    dependents: bool = False
    tenure: int = Field(..., ge=0, le=72)
    phone_service: bool = True
    multiple_lines: LineService = "No"
    online_security: InternetFeature = "No"
    online_backup: InternetFeature = "No"
    device_protection: InternetFeature = "No"
    tech_support: InternetFeature = "No"
    streaming_tv: InternetFeature = "No"
    streaming_movies: InternetFeature = "No"
    paperless_billing: bool = False
    monthly_charges: float = Field(..., gt=0)
    internet_service: InternetService = "DSL"
    contract: ContractType = "Month-to-month"
    payment_method: PaymentMethod = "Electronic check"


class PredictionResult(BaseModel):
    prediction: Literal["Yes", "No"]
    churn_probability: float
    risk_level: Literal["Low", "Medium", "High"]
    threshold_used: float
    model_type: str


class BatchPredictionRequest(BaseModel):
    records: list[CustomerProfile]


class ModelMetadata(BaseModel):
    model_type: str
    feature_count: int
    threshold: float
    supports_probability: bool
    scaler_applied: bool
    risk_thresholds: dict[str, float]
    dataset_available: bool


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_type: str | None = None
    threshold: float | None = None
