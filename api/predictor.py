import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from pathlib import Path

# Detect device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Absolute path to model
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "best_model"

# Load tokenizer and model
tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)

model.to(device)
model.eval()


def predict_news(title: str, text: str):

    content = title + " " + text

    encoding = tokenizer(
        content,
        truncation=True,
        padding="max_length",
        max_length=128,
        return_tensors="pt"
    )

    input_ids = encoding["input_ids"].to(device)
    attention_mask = encoding["attention_mask"].to(device)

    with torch.no_grad():

        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

    probabilities = torch.softmax(outputs.logits, dim=1)

    prediction = torch.argmax(probabilities, dim=1).item()

    fake_probability = probabilities[0][0].item() * 100
    real_probability = probabilities[0][1].item() * 100

    return {
        "prediction": "Fake" if prediction == 0 else "Real",
        "confidence": round(max(fake_probability, real_probability), 2),
        "fake_probability": round(fake_probability, 2),
        "real_probability": round(real_probability, 2)
    }