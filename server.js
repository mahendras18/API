import express from "express";
import path from "path";
import fs from "fs";
import Groq from "groq-sdk";
import cors from "cors";

// ===================== INIT =====================
const app = express();
app.use(cors());
app.use(express.json());

const BASE_DIR = process.cwd();
const FRONTEND_DIR = path.join(BASE_DIR, "frontend");

// Serve frontend
app.use("/frontend", express.static(FRONTEND_DIR));

// Port
const PORT = process.env.PORT || 10000;

// Groq client
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
      model: "groq/compound",

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

      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,

      compound_custom: {
        tools: {
          enabled_tools: [
            "web_search",
            "code_interpreter",
            "visit_website"
          ]
        }
      }
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error" });
  }
});

// ===================== RUN =====================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});