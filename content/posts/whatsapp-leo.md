---
title: "Leo: My Zero-Cost, Privacy-First AI Assistant on WhatsApp"
date: 2026-02-22
tags:
  - local-ai
  - assistant
  - privacy
  - agents
coverImage: /images/whatsapp-leo/leo.webp
excerpt: "A fully local AI assistant inside WhatsApp, handling queries, calendar, email, and fitness tracking with zero API costs and complete data privacy."
draft: false
---

$0/month. Runs on your hardware. Lives in WhatsApp.

That's Leo. An AI assistant I built that handles queries, searches the web, manages your calendar, reads your email, tracks your fitness, and delivers a personalized briefing every morning. All from the app you're probably already using to text family and friends.

@[youtube](_m7avpUflfs){width: 45%, aspect-ratio: 9/16}

[Github](https://github.com/shansin/whatsapp-leo)

## Why I Built This

WhatsApp is already on everyone's phone. It's the most popular messaging app on the planet, and I was already using it to stay connected with family and friends. The question was: what if it could also manage my digital life?

I wanted four things:

- **Privacy first**: My data never leaves my machine
- **Control**: I own the logic for workflows, system prompts, and model choice
- **Zero recurring cost**: No API subscriptions, no token metering
- **Learn by building**: A real project to deepen my understanding of local LLMs and agents

Leo is the result.

## What Leo Can Do

### Intelligent Conversations

Leo handles the full range of AI assistant tasks: answering questions, brainstorming, deep research, explaining concepts. Each conversation maintains its own memory via SQLite-backed sessions, so Leo remembers what you discussed earlier.

### Web Search

Need current information? Leo connects to Brave Search for real-time data. Ask about news, look up facts, research any topic.

```
What's the latest supreme court ruling on Tariffs?

Do a deep research and summarize if Tariffs are good or bad for US economy
```

### Google Workspace Integration

Leo becomes a productivity layer across your entire Google account:

| Service             | Capabilities                                       |
| ------------------- | -------------------------------------------------- |
| **Google Calendar** | View events, create meetings, find free time slots |
| **Gmail**           | Search threads, draft and send emails              |
| **Google Docs**     | Create, read, find, update documents               |
| **Google Drive**    | Search files, create folders, download content     |
| **Google Sheets**   | Read data, get ranges                              |
| **Google Slides**   | Read presentations                                 |

```
@leo, am I free this Sat 5pm? if so add 2 hr block for Tom's bday
```

### Health & Fitness

Leo connects to Garmin Connect to pull your fitness data: sleep patterns, training schedule, workout history, performance trends. This feeds directly into your morning briefings.

### One-Time Reminders

Use natural language:

```
#remindme in 30 minutes to call mom
#remindme tomorrow at 9am to check emails
#remindme at 12pm Feb 25, 2026 to complete taxes
```

Leo parses your request and messages you at the right time.

### Recurring Reminders

Build habits:

```
#reminder add "9pm Sun to Thu" Review and adjust tomorrow's calendar
#reminder add "12:30 pm Thursdays" Readup Weekly Review Doc
#reminder help
#reminder list
#reminder remove <id>
```

### Scheduled Briefings

This is the feature I use most. You define a prompt and a schedule; Leo runs it and delivers the results to your WhatsApp:

```
#briefing add "Morning Brief" "6:00am everyday" Get today's scheduled training from Garmin, today's calendar events, and unread emails summary

#briefing add "Evening Brief" "5:00pm everyday" Get unread emails summary and top 2 news from today

#briefing help
#briefing list
#briefing remove <id>
```

Wake up to a personalized digest built from your actual calendar, email, and fitness data.

### Hooks: Bridge to External Programs

Leo can route messages to any program on your machine through bidirectional named pipes. Each hook creates two FIFOs: one for sending messages to the program, one for receiving responses back.

Trigger with `#hook-name message` or `@hook-name message`. I have hooks for `claude` and `codex`, so I can type `#claude explain quantum computing` in WhatsApp and get a Claude response routed right back into the chat.

This turns Leo into a message router that can bridge WhatsApp to virtually anything running on your machine.

### Test Mode

Leo includes a local Gradio UI at `http://127.0.0.1:7860` that bypasses the WhatsApp bridge entirely. It has a model selector to hot-swap Ollama models at runtime and a live system log panel. All background schedulers still run, so you can iterate on prompts without needing your phone.

---

## Why Zero Cost Actually Works

| Component                  | Cost                            |
| -------------------------- | ------------------------------- |
| LLM (Ollama + local model) | $0                              |
| WhatsApp messaging         | $0 (uses WhatsApp Web protocol) |
| Brave Search (free tier)   | $0                              |
| Google APIs                | Free                            |
| Garmin data access         | Free                            |
| Hosting                    | $0 (runs locally)               |
| **Total**                  | **$0/month**                    |

Electricity is the only real cost. My estimates put it well under $10/year:

- The service draws ~60W at idle
- Inference spikes 100-300W for a few seconds on the 5070 Ti
- The 5060 Ti is slower but even more efficient

The key insight: modern open-source LLMs are good enough for most assistant tasks. Models like GLM-4.7-Flash, gpt-oss:20b, and deepseek-r1:8b run on consumer hardware and deliver strong results without per-token costs.

You already own the hardware. Make it work for you.

---

## The Privacy Advantage

Leo runs entirely on your local machine:

- **Local LLM**: Powered by Ollama. Inference happens on your GPUs.
- **Local storage**: Messages, reminders, and sessions live in SQLite databases on your device.
- **No cloud dependency**: Your conversations never travel to external servers beyond WhatsApp.
- **Your credentials, your machine**: Google, WhatsApp, and Garmin tokens stay on your hardware.

---

## Technical Architecture

@[excalidraw](public/images/whatsapp-leo/arch.excalidraw)

The system splits into two processes that communicate over Unix domain sockets (paths configurable via `INSTANCE_GUID`), which allows multiple Leo instances on the same machine. The Go bridge handles the WhatsApp protocol; the Python server handles AI reasoning. Neither exposes a network port.

### Go WhatsApp Bridge (`whatsapp-mcp/whatsapp-bridge/`)

- Built on `whatsmeow`, a Go library implementing WhatsApp's multi-device protocol
- Heavily modified for performance and to support all Leo use cases
- Handles authentication via QR code scanning
- Manages message storage in SQLite
- Processes media: images, videos, audio, documents
- Includes a custom Ogg Opus parser for voice message duration detection

### Python Agent Server (`agent/`)

- Uses OpenAI Agents SDK for orchestration
- Connects to Ollama via OpenAI-compatible API (`http://localhost:11434/v1`)
- Agent factory with LRU cache (max 20 agents, 30-minute TTL) for multi-conversation support
- Natural language time parsing for reminders via an LLM agent
- Cron-based scheduling for briefings and recurring reminders

### MCP Servers

Three servers launched as child processes using stdio-based MCP:

- `brave-search-mcp`: Web search
- `workspace-mcp`: Google Workspace (Docs, Calendar, Gmail, Drive, Sheets, Slides)
- `garmin-mcp`: Fitness and health data

All three communicate with the agent server over stdin/stdout, not HTTP.

### Operating Modes

1. **Dedicated Number Mode** (`IS_DEDICATED_NUMBER=true`): Responds to all DMs and group mentions. Good for a dedicated Leo phone number.
2. **Mention Mode**: Only responds when explicitly mentioned (`@leo` or `#leo`). Works with your existing WhatsApp account.

### Access Control

- **Privileged whitelist** (`ALLOWED_SENDERS`): Only listed phone numbers get Google Workspace, Garmin, reminders, and briefings access. Non-privileged users can still chat and search the web.
- Unix domain sockets for inter-process communication; no exposed network ports.
- Thread-local SQLite connections to avoid concurrency issues.
- Environment-based configuration for all sensitive credentials.

---

## Interesting Technical Details

### Natural Language Time Parsing

Instead of rigid regex patterns, the reminder system uses an LLM agent to parse times. It handles:

- "in 30 minutes"
- "tomorrow at 9am"
- "at 5pm Feb 14, 2026"
- "next Monday morning"

### Cron-Based Scheduling

Briefings and recurring reminders use `croniter` for flexible scheduling:

| Input | Cron Expression |
|-------|-----------------|
| "9am everyday" | `0 9 * * *` |
| "Monday 8am" | `0 8 * * 1` |
| "5pm friday" | `0 17 * * 5` |

### WhatsApp LID Resolution

WhatsApp uses LID (Linked ID) for privacy, a format that can't be used for sending messages. The Go bridge automatically resolves LID to actual phone numbers for outbound messages.

### Performance Optimizations

- **Agent caching**: LRU eviction prevents memory bloat from idle conversations
- **Pre-built MCP parameters**: Avoids per-message object creation overhead
- **Shared environment copy**: Avoids copying 100+ environment variables per request
- **Singleton OpenAI client**: Reused across all messages

---

## Getting Started

Built on Ubuntu with NVIDIA GPUs, but it should work the same on Mac and WSL.

**Prerequisites:** Python >= 3.13, [uv](https://docs.astral.sh/uv/), Go, [Ollama](https://ollama.com), and Node.js/npm.

1. Clone the repository
2. Install Ollama and pull a model: `ollama pull glm-4.7-flash`
3. Copy `.env_example` to `.env` and fill in your Brave Search API key, allowed senders, and other settings
4. Run the services: `./start_services.sh`
5. Scan the QR code to connect WhatsApp
6. Start messaging Leo

Want to try it without a phone? Run in test mode:

```bash
IS_TEST_MODE=true ./start_services.sh
```

Then open `http://127.0.0.1:7860` for the Gradio UI.

---

## What's Next

- **Long-term memory**: Remember preferences, recall past conversations
- **Multi-modal capabilities**: Image analysis, document understanding
- **Voice improvements**: Better TTS/STT for seamless voice conversations
- **RAG on personal data**: Index and search through your own documents
- **Family/shared mode**: Multiple users with separate contexts

---

## The Bottom Line

- **Own, don't rent**: Your hardware, your model, your rules
- **Privacy by design**: Data never leaves your machine
- **Zero marginal cost**: Chat all day, run 50 briefings. Nothing extra.
- **Meet users where they are**: WhatsApp is already in everyone's pocket

You don't have to choose between convenience and privacy. With Leo, you get both.

---

*Leo is open source. Your assistant, your data, your control.*
*This post was updated on 2/28/2026*
