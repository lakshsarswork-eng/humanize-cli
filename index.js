#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── ANSI colors (no deps) ───────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
};

const AI_PHRASES = [
  "in today's fast-paced world",
  "it's important to note",
  "it is important to note",
  "in conclusion",
  "furthermore",
  "moreover",
  "it is worth mentioning",
  "it's worth mentioning",
  "needless to say",
  "without further ado",
  "in this article we will",
  "in this article, we will",
  "delve into",
  "leverage",
  "comprehensive guide",
  "dive into",
  "in summary",
  "to summarize",
  "as we can see",
  "it goes without saying",
  "at the end of the day",
  "game changer",
  "paradigm shift",
  "holistic approach",
  "going forward",
  "in the realm of",
  "stands out",
  "pivotal",
  "crucial",
  "multifaceted",
  "ever-evolving",
  "cutting-edge",
  "revolutionize",
  "transformative",
  "seamlessly",
  "in order to",
  "utilize",
  "robust",
  "commendable",
  "invaluable",
];

const HUMANIZE_PROMPT = `You are an expert blog editor who rewrites AI-generated content to sound like a real human wrote it.

STRICT RULES — follow every single one:

1. SENTENCE VARIETY — Mix very short sentences (3-6 words) with longer ones (20-30 words). Never three consecutive sentences of similar length.

2. BANNED PHRASES — Never use any of these: "In today's fast-paced world", "It's important to note", "In conclusion", "Furthermore", "Moreover", "It is worth mentioning", "Needless to say", "Without further ado", "In this article we will explore", "Delve into", "Leverage", "Comprehensive guide", "Dive into", "Seamlessly", "Robust", "Revolutionize", "Transformative", "Cutting-edge", "Pivotal", "Multifaceted", "Game changer", "Paradigm shift".

3. CONTRACTIONS & CASUAL TONE — Use: you're, it's, don't, isn't, can't, won't. Ask rhetorical questions. Say "we think" or "our view" occasionally.

4. INDIA-SPECIFIC GROUNDING — Always include real Indian context where relevant: broker names (Zerodha, Groww, Angel One, Upstox), SEBI regulations, INR amounts (₹500 not "$5"), Indian tax brackets, real company names (Reliance Industries, HDFC Bank, Infosys, TCS), NSE/BSE, Sensex/Nifty.

5. IMPERFECT TRANSITIONS — Don't always transition smoothly. Start new thoughts abruptly. Use "But here's the thing:" or "One more thing:" instead of "Furthermore" or "Additionally".

6. OPINION & ANALYSIS — Add 2-3 sentences of genuine opinion. Use: "We'd argue that...", "Most people miss this:", "Honestly,", "Hot take:".

7. PARAGRAPH LENGTH VARIETY — Mix 1-sentence paragraphs with 4-5 sentence ones. Never all the same length.

8. SPECIFIC NUMBERS — Use precise numbers (₹12,450 not ₹12,000), specific dates, real examples. Avoid round numbers.

9. FAQ SECTION — If the input has or mentions FAQs, rewrite them using questions Indians actually ask in plain language.

10. ENDING — End with a specific actionable recommendation. Never summarize what was just said.

OUTPUT: Return only the rewritten content. No meta-commentary, no "Here is the rewritten version:", just the article itself.`;

function detectAIPhrases(text) {
  const lower = text.toLowerCase();
  return AI_PHRASES.filter((phrase) => lower.includes(phrase.toLowerCase()));
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readInput(filePath) {
  if (filePath) {
    if (!fs.existsSync(filePath)) {
      console.error(`${c.red}Error: File not found — ${filePath}${c.reset}`);
      process.exit(1);
    }
    return fs.readFileSync(filePath, "utf8");
  }

  // stdin
  if (process.stdin.isTTY) {
    console.error(
      `${c.yellow}Usage:${c.reset}  humanize <file.txt>\n        humanize -o output.txt <file.txt>\n        echo "text" | humanize`
    );
    process.exit(1);
  }

  return fs.readFileSync("/dev/stdin", "utf8");
}

function printBanner() {
  console.log(
    `\n${c.bold}${c.cyan}╔══════════════════════════════════════╗${c.reset}`
  );
  console.log(
    `${c.bold}${c.cyan}║      ✍  BLOG HUMANIZER  v1.0         ║${c.reset}`
  );
  console.log(
    `${c.bold}${c.cyan}╚══════════════════════════════════════╝${c.reset}\n`
  );
}

function printStats(label, text, phrases) {
  const wc = wordCount(text);
  const chars = text.length;
  console.log(`${c.bold}${label}${c.reset}`);
  console.log(`  Words  : ${c.white}${wc}${c.reset}`);
  console.log(`  Chars  : ${c.white}${chars}${c.reset}`);
  if (phrases && phrases.length > 0) {
    console.log(
      `  AI phrases found: ${c.red}${phrases.length}${c.reset} — ${c.dim}${phrases.slice(0, 3).join(", ")}${phrases.length > 3 ? ` +${phrases.length - 3} more` : ""}${c.reset}`
    );
  } else if (phrases) {
    console.log(`  AI phrases: ${c.green}none detected${c.reset}`);
  }
  console.log();
}

async function main() {
  const args = process.argv.slice(2);

  // Parse flags
  let outputFile = null;
  let inputFile = null;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-o" || args[i] === "--output") && args[i + 1]) {
      outputFile = args[++i];
    } else if (args[i] === "--help" || args[i] === "-h") {
      console.log(`
${c.bold}humanize${c.reset} — Rewrite AI blog content to sound human

${c.bold}Usage:${c.reset}
  humanize <file.txt>                    # humanize a file
  humanize -o output.txt <file.txt>      # save to file
  echo "text" | humanize                 # pipe text in
  humanize -o out.txt -                  # pipe + save

${c.bold}Options:${c.reset}
  -o, --output <file>   Save output to file
  -h, --help            Show this help
      `);
      process.exit(0);
    } else if (args[i] !== "-") {
      inputFile = args[i];
    }
  }

  printBanner();

  const inputText = readInput(inputFile);

  if (!inputText.trim()) {
    console.error(`${c.red}Error: Input is empty.${c.reset}`);
    process.exit(1);
  }

  // Pre-scan
  const foundPhrases = detectAIPhrases(inputText);
  printStats(`${c.bold}INPUT${c.reset}`, inputText, foundPhrases);

  // Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      `${c.red}Error: ANTHROPIC_API_KEY environment variable not set.${c.reset}`
    );
    console.error(
      `${c.dim}Set it with: export ANTHROPIC_API_KEY=sk-ant-...${c.reset}`
    );
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log(`${c.bold}${c.green}HUMANIZED OUTPUT${c.reset}`);
  console.log(`${c.dim}${"─".repeat(42)}${c.reset}\n`);

  let outputText = "";

  // Stream the response
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: HUMANIZE_PROMPT,
    messages: [
      {
        role: "user",
        content: `Rewrite this article to sound human:\n\n${inputText}`,
      },
    ],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      const text = chunk.delta.text;
      process.stdout.write(text);
      outputText += text;
    }
  }

  console.log(`\n\n${c.dim}${"─".repeat(42)}${c.reset}`);

  // Post-scan
  const outputPhrases = detectAIPhrases(outputText);
  const inWords = wordCount(inputText);
  const outWords = wordCount(outputText);
  const diff = outWords - inWords;

  console.log(`\n${c.bold}STATS${c.reset}`);
  console.log(
    `  Input  : ${c.white}${inWords} words${c.reset}  →  Output: ${c.white}${outWords} words${c.reset}  (${diff >= 0 ? "+" : ""}${diff})`
  );

  if (outputPhrases.length === 0) {
    console.log(
      `  Result : ${c.green}${c.bold}✓ No AI phrases detected in output${c.reset}`
    );
  } else {
    console.log(
      `  Result : ${c.yellow}⚠ ${outputPhrases.length} AI phrase(s) still present — ${outputPhrases.join(", ")}${c.reset}`
    );
  }

  // Save to file if requested
  if (outputFile) {
    fs.writeFileSync(outputFile, outputText, "utf8");
    console.log(`  Saved  : ${c.cyan}${path.resolve(outputFile)}${c.reset}`);
  }

  console.log();
}

main().catch((err) => {
  console.error(`\n${c.red}Error: ${err.message}${c.reset}`);
  process.exit(1);
});
