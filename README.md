# Fake News Detection System using DistilBERT

An end-to-end NLP project that detects whether a news article is **Fake** or **Real** using a fine-tuned DistilBERT model. The project includes data preprocessing, model training, evaluation, and deployment using FastAPI.

---

## Features

- Fake vs Real news classification
- Fine-tuned DistilBERT model
- Data preprocessing pipeline
- Model evaluation with:
  - Accuracy
  - Precision
  - Recall
  - F1-Score
  - Confusion Matrix
- REST API using FastAPI
- Interactive Swagger UI
- Confidence score and class probabilities

---

## 🛠 Tech Stack

### Languages
- Python

### Libraries
- PyTorch
- Transformers (Hugging Face)
- Pandas
- NumPy
- Scikit-learn
- Matplotlib
- FastAPI
- Uvicorn

---

## Project Structure

```
Fake_News_Detector/
│
├── api/
│   ├── main.py
│   ├── predictor.py
│   └── schemas.py
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
│   └── best_model/
│
├── notebooks/
│   ├── 01_EDA.ipynb
│   ├── 02_Preprocessing.ipynb
│   ├── 03_Model_Training.ipynb
│   └── 04_Model_Evaluation.ipynb
│
├── reports/
├── src/
├── tests/
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

## Dataset

Dataset contains Fake and Real news articles.

Preprocessing steps:

- Removed duplicates
- Removed missing values
- Combined title and article text
- Created binary labels
- Generated processed dataset

---

## Model

- DistilBERT
- Binary Classification
- Max Sequence Length: 128
- Epochs: 2
- Optimizer: AdamW
- Learning Rate: 2e-5

---

## Results

### Test Accuracy

**99.97%**

### Classification Metrics

| Metric | Score |
|---------|------|
| Accuracy | 99.97% |
| Precision | 1.00 |
| Recall | 1.00 |
| F1 Score | 1.00 |

> Note: These metrics are measured on the held-out test split of the dataset. Performance on unseen news sources may vary due to differences between training and real-world data distributions.

---

## Running the API

Install dependencies

```bash
pip install -r requirements.txt
```

Start the server

```bash
python -m uvicorn api.main:app --reload
```

Open Swagger UI

```
http://127.0.0.1:8000/docs
```

---

## API Request

```json
{
    "title":"Apple launches new AI-powered iPhone",
    "text":"Apple announced its latest smartphone with improved AI features..."
}
```

---

## API Response

```json
{
    "prediction":"Real",
    "confidence":99.98,
    "fake_probability":0.02,
    "real_probability":99.98
}
```

---

## Future Improvements

- Multi-class fake news detection
- Support for multiple news sources
- Explainable AI using SHAP/LIME
- Docker deployment
- Cloud deployment (Render/AWS/Azure)
- Frontend using React

---

##  Author

Tanay Chaturvedi