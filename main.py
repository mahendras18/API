from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq
import uvicorn
import os

# ===================== INIT =====================
app = FastAPI(title="Groq_API_Chat")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Serve frontend files
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

# ❗ Hard-coded key (ONLY for local testing)
client = Groq(api_key="")

# ===================== MODELS =====================
class ChatRequest(BaseModel):
    text: str
    language: str

class ChatResponse(BaseModel):
    reply: str

# ===================== FRONTEND ROUTE =====================
@app.get("/", response_class=HTMLResponse)
def serve_ui():
    with open(os.path.join(FRONTEND_DIR, "index.html"), "r", encoding="utf-8") as f:
        return f.read()

# ===================== CHAT API =====================
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    messages = [
        {
            "role": "system",
            "content": f"You are a helpful AI assistant. Reply ONLY in {req.language}."
        },
        {
            "role": "user",
            "content": req.text
        }
    ]

    completion = client.chat.completions.create(
        model="meta-llama/llama-4-maverick-17b-128e-instruct",
        messages=messages,
        temperature=1,
        max_completion_tokens=512,
        top_p=1
    )

    return {"reply": completion.choices[0].message.content}

# ===================== RUN =====================
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5002)
