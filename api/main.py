from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeRequest(BaseModel):
    url: str = None
    text: str = None

@app.post("/api/summarize")
def summarize(req: SummarizeRequest):
    if req.url:
        # Use a simple URL extraction service
        text = f"Content from: {req.url}"  # Simplified for now
    elif req.text:
        text = req.text
    else:
        raise HTTPException(status_code=400, detail="Please provide either 'url' or 'text'.")
    
    # Use Hugging Face Inference API instead of local model
    headers = {"Authorization": f"Bearer {os.getenv('HF_TOKEN')}"}
    response = requests.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        headers=headers,
        json={"inputs": text}
    )
    
    if response.status_code == 200:
        summary = response.json()[0]['summary_text']
        return {"summary": f"- {summary}"}
    else:
        raise HTTPException(status_code=500, detail="Summarization failed")
