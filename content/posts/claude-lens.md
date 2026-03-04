---
title: Claude Lens- The Missing Control Tower for Claude Code Agent Teams
date: 2026-03-03
tags:
  - agents
  - claude
coverImage: /images/claude-lens/cover.png
excerpt: Claude Lens turns your `~/.claude/` directory into a sleek, real-time observability dashboard for Claude Code's multi-agent system.
draft: false
---
You spin up a team of agents, watch them scatter into the depths of your codebase, tasks start flowing, tokens start burning—and you're left staring at a scrolling terminal wondering:

*What is actually happening?*
*How much is this costing me?*
*Did that task even finish, or is the agent hallucinating in an infinite loop?*

Welcome to the chaos of multi-agent development.

Enter **Claude Lens**.

It's a native desktop app that turns your `~/.claude/` directory into a sleek, real-time observability dashboard.
![Claude Lens](/images/claude-lens/card-view-dark.png) Think of it as the GUI that Claude Code's multi-agent system desperately needed but never shipped with.

I built it because I needed it. If you're a power user of Claude Code, you're going to need it too.

---
## The Problem: Flying Blind in a Swarm

Claude Code's agent team feature is basically magic. You can spawn a lead agent, watch it recruit teammates, assign them tasks, and coordinate a massive refactor while you sip your coffee.

But once that swarm is unleashed, your visibility is reduced to:

- A terminal output scrolling past faster than you can read.
- Manually `cat`-ing JSON files in `~/.claude/tasks/` like a caveman.
- Having absolutely no idea what your token spend is until the API bill arrives.
- Zero way to comfortably browse past conversations without spelunking through `.jsonl` files.

For a single-agent session, you can manage. For a team of 4–6 agents operating in parallel? It's unmanageable.

Claude Lens gives you a single, glorious pane of glass over **everything**: teams, tasks, agents, costs, conversations, analytics, and system health. And it's all updated in real-time.

---
## What Claude Lens Actually Does

### Real-Time Team Monitoring (Choose Your Fighter)

The Teams view is the heart of Claude Lens, and we've got three distinct layouts based on how your brain works:

- **Card View**: A clean, responsive grid of team cards. Progress bars, agent counts, task lists, and cost breakdowns at a single glance.
- **Graph View**: This is the eye candy. Built on React Flow, it renders your entire team topology as an interactive, animated node graph. Violet edges for team-agent links, animated blue pulses for in-progress tasks, and dashed orange for blocking dependencies. Zoom, pan, and click to inspect. It's the ultimate way to untangle complex dependency chains.
- **Split View**: The pragmatist's layout. Graph on the left, juicy details and task lists on the right.

![Card View](/images/claude-lens/card-view.png)

![Graph View](/images/claude-lens/graph-view.png)

![Split View](/images/claude-lens/split-view.png)

### Cost Tracking That Actually Works

I built this first because I was tired of guessing my token spend.

Claude Lens scans every JSONL conversation file, intelligently deduplicates messages (because Claude Code's streaming writes can massively overcount if you aren't careful), and calculates your exact USD cost using current Anthropic pricing across the Opus, Sonnet, and Haiku model families.

Costs are aggregated per team, per project, and per session. No more surprise bills. Just cold, hard numbers.

### Analytics Dashboard

Want to know your AI habits? The Analytics view brings four tabs of pure insight:
- **Usage Overview**: A 30-day stacked bar chart of input/output tokens and daily cost.
- **Activity Heatmap**: A GitHub-style contribution calendar. Spot your heaviest AI usage days instantly.
- **Model Comparison**: Are you really getting your money's worth out of Opus? Find out here.
- **Activity Feed**: An audit log of all assistant turns.

![Analytics Overview](/images/claude-lens/analytics-overview.png)

![Activity Heatmap](/images/claude-lens/activity-heatmap.png)

![Model Comparison](/images/claude-lens/analytics-models.png)

![Activity Feed](/images/claude-lens/analytics-activity-feed.png)

### The Ultimate Conversation Browser

Ever needed to re-read what an agent said during a session three days ago? Good luck parsing raw JSONL.

With Claude Lens, you get a beautiful, collapsible project tree. The conversation thread renders perfectly, complete with user/assistant bubbles, expandable tool-use blocks, and inline token counts.

Oh, and there's **Full-Text Search**. Debounced, lightning-fast search across every single session file on your disk with highlighted snippets. Click a result and jump straight to that moment in the conversation.

![Conversation Browser](/images/claude-lens/conversation-browser.png)

![Search View](/images/claude-lens/search-view.png)

### Settings, Hooks, & MCP Servers—Without the JSON

We put a stunning GUI over `~/.claude/settings.json`:

- **General**: Tweak effort levels and bypass permissions with a simple dropdown. No text editor required.
- **Hooks (with a Test Runner!)**: This is the killer feature. Not only can you manage your Pre/Post tool use hooks, but there's an **inline test runner**. Click play, and it runs your hook live, showing stdout/stderr and exit codes. No more switching to a terminal to debug your Slack webhooks!
- **MCP Servers**: Add and manage your servers with a clean form.
- **Profiles & Templates**: Snapshot your settings or save your favorite 5-agent team topology as a template for your next project.

![Settings General](/images/claude-lens/settings-general.png)

![Settings Hooks](/images/claude-lens/settings-hooks.png)

![Settings MCP](/images/claude-lens/settings-mcp.png)

![Settings Notifications](/images/claude-lens/settings-notifications.png)

### Notifications & Budget Limits (A.K.A. The "Save My Wallet" Feature)

Get native OS notifications when tasks finish or teams are created—even if the app is chilling in the background.

More importantly, set **Budget Limits**. Drop in a daily USD limit, and Claude Lens will hit you with a soft warning at your threshold, and a hard alert when you hit the cap. Don't let a rogue autonomous agent drain your API credits overnight.

![Command Palette](/images/claude-lens/command-palette.png)

### System Under the Hood

Claude Lens includes a live process table to easily kill rogue `claude` sessions, Auth monitoring to warn you before your token expires, and Telemetry viewing.

![System Processes](/images/claude-lens/system-view.png)

![System Auth](/images/claude-lens/system-auth.png)

---

## How It Works Under the Hood

Claude Lens is a pure **read-mostly companion** to Claude Code. It never interferes with your running agents.

A lightweight Node.js main process watches the filesystem (`chokidar`), handles the heavy JSONL scanning and deduplication, and pushes updates via IPC to the React frontend. No polling, just instant reactive goodness.

**The Stack:**

- **Runtime**: Electron 40
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Viz**: Recharts 3 & @xyflow/react (React Flow) v12

---

## Quick Start

Ready to take control of your agents?

```bash
gh repo clone shansin/claude-lens
cd claude-lens
npm install
npm run dev
```

That's literally it. As long as you've used Claude Code before, the app will instantly read from `~/.claude/` and your dashboard will spring to life with your data.

For a production build (macOS `.dmg`, Windows NSIS, Linux AppImage):

```bash
npm run build
```

---

## Is This For You?

If you run multi-agent Claude Code teams, care about your API costs, or just want a civilized way to browse past conversations and tweak settings without manually editing JSON files... then yes.

Stop flying blind. Get the observability layer that turns *"I think my agents are working"* into *"I know exactly what every agent is doing, what it costs, and what happened."*

*Claude Lens is open source under the ISC license. Contributions are more than welcome.*
