from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import NewsRequest, PredictionResponse
from api.predictor import predict_news

app = FastAPI(
    title="Fake News Detection API",
    description="Detect whether a news article is Fake or Real using DistilBERT.",
    version="1.0.0"
)

# Allow React frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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