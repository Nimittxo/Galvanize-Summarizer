from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from newspaper import Article
import nltk

nltk.download('punkt')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

summarizer = pipeline("summarization", model="facebook/bart-large-cnn", framework="pt")

class SummarizeRequest(BaseModel):
    url: str = None
    text: str = None

def fetch_article_text(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        return article.text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch article: {e}")

@app.post("/api/summarize")
def summarize(req: SummarizeRequest):
    if req.url:
        text = fetch_article_text(req.url)
    elif req.text:
        text = req.text
    else:
        raise HTTPException(status_code=400, detail="Please provide either 'url' or 'text'.")

    prompt = (
        "Summarize the following text in 3 bullet points. "
        "Each bullet point should be a complete sentence:\n" + text
    )
    summary = summarizer(prompt, max_length=200, min_length=40, do_sample=False)
    summary_text = summary[0]['summary_text']

    from nltk.tokenize import sent_tokenize
    sentences = [s.strip() for s in sent_tokenize(summary_text) if s.strip()]
    summary_bullets = "\n".join([f"- {s}" for s in sentences])
    return {"summary": summary_bullets}
