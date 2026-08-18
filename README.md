# ✍ Unbot

**Un-bot your AI-generated blog content before Google catches it.**

Paste any article. Unbot finds every AI phrase ("Furthermore", "Delve into", "In today's fast-paced world"), then streams a rewritten version using Claude — with varied sentence lengths, India-specific grounding, and real opinions baked in.

## The problem

AI-written blogs get flagged by Google's spam detector and AdSense reviewers. The patterns are obvious — smooth transitions everywhere, round numbers, em dashes, "comprehensive guide". One flag = ranking penalty or AdSense rejection.

Fixing them manually takes 20–30 minutes per article. Unbot does it in 30 seconds.

## Usage

### Web Dashboard

```bash
git clone https://github.com/lakshsarswork-eng/humanize-cli
cd humanize-cli
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

Open `http://localhost:3737` — paste text, watch it rewrite in real-time.

### CLI

```bash
node index.js article.txt
node index.js article.txt -o output.txt
echo "Furthermore, it is important to note..." | node index.js
```

## What it does

**Before** — AI-written:
> In today's fast-paced world, it is important to note that mutual funds provide a comprehensive guide to diversification. Furthermore, they leverage your savings effectively...

**After** — Human:
> Mutual funds are genuinely one of the better ways to diversify without overthinking it. You don't need ₹1 lakh to start — Zerodha's Coin platform lets you do SIPs from ₹500. But here's the thing most people miss: expense ratios kill long-term returns faster than market dips do...

## Features

- Detects 40+ AI phrases before and after rewriting
- Streams output word-by-word — no waiting
- India-specific rewriting — real broker names, INR amounts, SEBI context
- Stats panel — word count diff, phrases in vs out
- Web dashboard + CLI both included
- Copy output with one click

## Rules baked in

| Rule | What it does |
|------|-------------|
| Sentence variety | Mixes 3-word and 25-word sentences |
| Banned phrases | 40+ AI phrases blocked at system level |
| Contractions | Forces you're, it's, don't, won't |
| India grounding | Zerodha, Groww, ₹ amounts, SEBI, NSE/BSE |
| Opinion injection | Adds "We'd argue...", "Hot take:", "Honestly," |
| Imperfect transitions | "But here's the thing:" not "Furthermore" |
| Specific numbers | ₹12,450 not ₹12,000 |

## Built with

- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-node) — Claude API with streaming
- Express — lightweight web server
- Vanilla JS — zero frontend dependencies

## License

MIT
