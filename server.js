import express from "express";
import path from "path";
import fs from "fs";
import Groq from "groq-sdk";
import cors from "cors";            // <-- add this

// ===================== INIT =====================
const app = express();
app.use(cors());                    // <-- and this
app.use(express.json());

const BASE_DIR = process.cwd();
const FRONTEND_DIR = path.join(BASE_DIR, "frontend");

// Serve frontend files
app.use("/frontend", express.static(FRONTEND_DIR));

// Port (local or Render)
const PORT = process.env.PORT || 10000;

// Groq client (NO hard-coded key)
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ===================== FRONTEND =====================
app.get("/", (req, res) => {
  const filePath = path.join(FRONTEND_DIR, "index.html");
  const html = fs.readFileSync(filePath, "utf-8");
  res.send(html);
});

// ===================== CHAT API =====================
app.post("/chat", async (req, res) => {
  const { text, language } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Reply ONLY in ${language}.`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_completion_tokens: 512
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error" });
  }
});

// ===================== RUN =====================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
