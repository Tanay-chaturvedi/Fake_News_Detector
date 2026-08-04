from pydantic import BaseModel


class NewsRequest(BaseModel):
    title: str
    text: str


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    fake_probability: float
    real_probability: float