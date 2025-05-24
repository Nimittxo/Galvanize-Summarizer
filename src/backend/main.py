# summarizer.py
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class NoteIn(BaseModel):
    text: str

@app.post("/summarize")
def summarize(note: NoteIn):
    # Call Pollinations summarization API
    response = requests.post(
        "https://api.pollinations.ai/api/v1/summarize",
        json={"text": note.text}
    )
    if response.status_code == 200:
        summary = response.json().get("summary", "")
        return {"summary": summary}
    raise HTTPException(status_code=500, detail="Summarization failed")
