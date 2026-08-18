import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const AI_PHRASES = [
  "in today's fast-paced world","it's important to note","it is important to note",
  "in conclusion","furthermore","moreover","it is worth mentioning","it's worth mentioning",
  "needless to say","without further ado","in this article we will","delve into","leverage",
  "comprehensive guide","dive into","in summary","to summarize","as we can see",
  "it goes without saying","at the end of the day","game changer","paradigm shift",
  "holistic approach","going forward","in the realm of","stands out","pivotal","crucial",
  "multifaceted","ever-evolving","cutting-edge","revolutionize","transformative",
  "seamlessly","in order to","utilize","robust","commendable","invaluable",
];

const HUMANIZE_PROMPT = `You are an expert blog editor who rewrites AI-generated content to sound like a real human wrote it.

STRICT RULES — follow every single one:

1. SENTENCE VARIETY — Mix very short sentences (3-6 words) with longer ones (20-30 words). Never three consecutive sentences of similar length.

2. BANNED PHRASES — Never use: "In today's fast-paced world", "It's important to note", "In conclusion", "Furthermore", "Moreover", "Needless to say", "Without further ado", "Delve into", "Seamlessly", "Robust", "Revolutionize", "Transformative", "Cutting-edge", "Pivotal", "Multifaceted", "Game changer", "Paradigm shift".

3. CONTRACTIONS & CASUAL TONE — Use: you're, it's, don't, isn't, can't, won't. Ask rhetorical questions. Say "we think" or "our view" occasionally.

4. INDIA-SPECIFIC GROUNDING — Include real Indian context: broker names (Zerodha, Groww, Angel One, Upstox), SEBI, INR amounts (₹500 not "$5"), NSE/BSE, Sensex/Nifty, real companies (Reliance, HDFC Bank, Infosys, TCS).

5. IMPERFECT TRANSITIONS — Start new thoughts abruptly. Use "But here's the thing:" or "One more thing:" instead of "Furthermore".

6. OPINION & ANALYSIS — Add 2-3 sentences of genuine opinion: "We'd argue that...", "Most people miss this:", "Honestly,", "Hot take:".

7. PARAGRAPH LENGTH VARIETY — Mix 1-sentence paragraphs with 4-5 sentence ones.

8. SPECIFIC NUMBERS — Use precise numbers (₹12,450 not ₹12,000), specific dates, real examples.

9. ENDING — End with a specific actionable recommendation. Never summarize what was just said.

OUTPUT: Return only the rewritten content. No meta-commentary, just the article.`;

function detectPhrases(text) {
  const lower = text.toLowerCase();
  return AI_PHRASES.filter((p) => lower.includes(p));
}

// SSE streaming endpoint
app.post("/api/humanize", async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "No text provided" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const foundPhrases = detectPhrases(text);
    send("phrases", { phrases: foundPhrases, wordCount: text.trim().split(/\s+/).length });

    const client = new Anthropic({ apiKey });
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: HUMANIZE_PROMPT,
      messages: [{ role: "user", content: `Rewrite this article to sound human:\n\n${text}` }],
    });

    let output = "";
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        output += chunk.delta.text;
        send("token", { text: chunk.delta.text });
      }
    }

    const outPhrases = detectPhrases(output);
    send("done", {
      outputWordCount: output.trim().split(/\s+/).length,
      remainingPhrases: outPhrases,
    });
  } catch (err) {
    send("error", { message: err.message });
  }

  res.end();
});

// Phrase detection only
app.post("/api/detect", (req, res) => {
  const { text } = req.body;
  res.json({ phrases: detectPhrases(text || "") });
});

const PORT = 3737;
app.listen(PORT, () => {
  console.log(`\n✍  Unbot Dashboard → http://localhost:${PORT}\n`);
});
