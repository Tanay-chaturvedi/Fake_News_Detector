from fastapi import FastAPI
from api.schemas import NewsRequest, PredictionResponse
from api.predictor import predict_news

app = FastAPI(
    title="Fake News Detection API",
    description="Detect whether a news article is Fake or Real using DistilBERT.",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Fake News Detection API is running!"
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: NewsRequest):

    result = predict_news(
        request.title,
        request.text
    )

    return result