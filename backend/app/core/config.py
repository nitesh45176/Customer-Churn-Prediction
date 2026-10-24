import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
MODELS_DIR = BASE_DIR / "models"
LOCAL_FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
DEPLOYED_FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]
FRONTEND_ORIGINS = list(dict.fromkeys(LOCAL_FRONTEND_ORIGINS + DEPLOYED_FRONTEND_ORIGINS))
