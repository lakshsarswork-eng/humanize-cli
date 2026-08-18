# ✍ humanize-cli

Rewrite AI-generated blog content to sound human — before Google catches it.

Paste any article. It finds every AI phrase ("Furthermore", "Delve into", "In today's fast-paced world"), then streams a rewritten version using Claude API — with varied sentence lengths, India-specific grounding, and real opinions baked in.

![demo](https://i.imgur.com/placeholder.png)

## The problem

AI-written blogs get flagged by Google's spam detector and AdSense reviewers. The patterns are obvious — em dashes, round numbers, "comprehensive guide", smooth transitions everywhere. One flag = ranking penalty or AdSense rejection.

Fixing them manually takes 20–30 minutes per article. This does it in 30 seconds.

## Install

```bash
git clone https://github.com/lakshsarswork-eng/humanize-cli
cd humanize-cli
npm install
```

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

```bash
# Humanize a file, print to terminal
node index.js article.txt

# Save output to file
node index.js article.txt -o output.txt

# Pipe text in
echo "Furthermore, it is important to note..." | node index.js

# Install globally
npm link
humanize article.txt -o clean.txt
```

## What it does

**Before** — AI-written:
> In today's fast-paced world, it is important to note that mutual funds provide a comprehensive guide to diversification. Furthermore, they leverage your savings effectively...

**After** — Human:
> Mutual funds are genuinely one of the better ways to diversify without overthinking it. You don't need ₹1 lakh to start — Zerodha's Coin platform lets you do SIPs from ₹500. But here's the thing most people miss: expense ratios kill long-term returns faster than market dips do...

## Features

- Detects 40+ AI phrases before processing
- Streams output word-by-word (no waiting)
- India-specific rewriting — real broker names, INR amounts, SEBI context
- Bans AI clichés at the prompt level
- Shows word count diff + post-scan after rewrite
- Saves to file with `-o` flag

## Rules baked in

| Rule | What it does |
|------|-------------|
| Sentence variety | Mixes 3-word and 25-word sentences |
| Banned phrases | 40+ AI phrases blocked at system prompt |
| Contractions | Forces you're, it's, don't, won't |
| India grounding | Zerodha, Groww, ₹ amounts, SEBI, NSE/BSE |
| Opinion injection | Adds "We'd argue...", "Hot take:", "Honestly," |
| Imperfect transitions | "But here's the thing:" not "Furthermore" |
| Specific numbers | ₹12,450 not ₹12,000 |

## Built with

- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-node) — Claude API streaming
- Node.js — zero heavy dependencies

## License

MIT
