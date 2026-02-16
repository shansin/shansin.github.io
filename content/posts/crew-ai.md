---
title: "From Toy Debates to Full-Scale Engineering Team: A Journey Through CrewAI"
date: 2025-12-31
tags:
  - local-ai
  - agents
coverImage: /images/crew-ai/crew-ai.png
draft: false
---

Building AI agents can feel like herding cats—unpredictable and messy. But what if you could organize them into a structured, efficient workforce?

I recently discovered [CrewAI](https://www.crewai.com/open-source) through this [Udemy course](https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/). In this post, I'll walk through the progression from simple conversations to a fully autonomous software engineering team—all running locally on my GPUs.

If you want to dive straight into the code, you can find it [here](https://github.com/shansin/crewai-agents).

Let's break down this journey of increasing complexity.

---

## Level 1: The Basics (The Debate Team)

**Theme: Pure Interaction** | **[Code](https://github.com/shansin/crewai-agents/tree/main/debate)**

The journey begins with the **Debate** project—the "Hello World" of agent orchestration.

Here, we have three simple agents: two `Debaters` and a `Judge`. The complexity is minimal, but the concept is powerful: **Role-Playing**.

- **The Setup**: One agent proposes an argument, and the other judges it.
- **Why it matters**: It proves that with just a few lines of YAML configuration, you can create distinct personalities. No complex prompt engineering variables required—just `role`, `goal`, and `backstory`.

```yaml
# config/agents.yaml

debater:
  role: A compelling debater
  goal: Present a clear argument...

judge:
  role: Decide the winner...
```

*Simplicity Check*: No tools, no memory, just pure LLM-to-LLM interaction.

**Results:**

```yaml
Topic: There needs to be strict laws to regulate LLMs.
Proposer: gpt-oss:20b
Opponent: deepseek-r1:8b
Judge: llama3.1:8b
```

DeepSeek takes the win. Here is Llama's verdict:

```text
Final Output: After carefully reviewing the arguments presented by both sides, I have come to the conclusion that the motion "There needs to be strict laws to regulate LLMs" is more convincing.

The proponents of strict regulation present a comprehensive and well-reasoned argument that highlights the numerous risks associated with unregulated LLMs. They convincingly argue that without legal oversight, malicious actors can exploit these systems to manipulate elections, incite violence, or spread pandemics of falsehoods. Furthermore, they emphasize the importance of protecting individual privacy rights by mandating transparent data sourcing, anonymization standards, and user consent.

The opponents' argument, on the other hand, relies heavily on the potential for restrictive regulations to stifle innovation and hinder technological progress. However, I believe that this argument is less compelling due to its vagueness and lack of concrete evidence. The opponents argue that the rapid evolution of LLMs outpaces legislative efforts, rendering strict laws quickly outdated. While this may be true, it does not necessarily follow that strict laws are inherently counterproductive.

In contrast, the proponents provide a detailed analysis of specific risks and propose targeted solutions to address them through legislation. They emphasize the importance of balancing innovation with protection of human rights, democratic integrity, and societal well-being. I am convinced by their argument that strict laws can create a predictable, safe, and equitable environment in which LLMs can deliver their transformative benefits without becoming sources of harm.

Furthermore, I believe that the proponents' emphasis on transparency and accountability through mandatory disclosure requirements is essential for building public trust and ensuring that end-users can scrutinize AI recommendations before accepting them. This approach aligns with the principles of democratic governance and human rights, which should be the foundation of any regulatory framework governing LLMs.

In conclusion, based on the arguments presented, I am convinced that strict laws to regulate LLMs are necessary to safeguard society, ensure accountability, and preserve democratic values. The potential benefits of regulation far outweigh the perceived risks and limitations associated with restrictive legislation.
```

---

## Level 2: Safe Code Execution (The Coder)

**Theme: Agency with Guardrails** | **[Code](https://github.com/shansin/crewai-agents/tree/main/coder)**

Next, we graduate to the **Coder** project. This is where things get real. An agent that just talks is fun; an agent that *does* things is useful.

Giving an AI unrestricted access to your terminal is terrifying. CrewAI solves this with a simple feature:

- **The Feature**: `code_execution_mode="safe"`.
- **How it works**: The `Coder` agent can write and execute Python code, but the codebase configures it to run inside a **Docker container**.

```python
# coder/crew.py

agent = Agent(
role="coder",
allow_code_execution=True,
code_execution_mode="safe", # Dockerized safety!
llm="ollama_chat/deepseek-r1:8b"
)
```

**Key Lesson**: You can run powerful coding agents (like `deepseek-r1`) locally without risking your host machine.

---

## Level 3: Connecting to the World (The Financial Researcher)

**Theme: Tool Use** | **[Code](https://github.com/shansin/crewai-agents/tree/main/financial_researcher)**

The **Financial Researcher** project introduces **Tools**.

A smart agent is useless if it's cut off from the world. This crew is composed of a `Researcher` and an `Analyst`.

- **The Leap**: The Researcher isn't just hallucinating facts anymore; it's equipped with `SerperDevTool` for live Google searches. No more "I'm sorry, my knowledge cutoff is 2021."
- **The Workflow**:
    1. **Researcher** searches the web for real-time data.
    2. **Analyst** synthesizes that raw data into a markdown report.

This demonstrates the classic "Research & Write" pattern, perfect for automating daily briefings.

---

## Level 4: Memory & Structure (The Stock Picker)

**Theme: Advanced Cognition** | **[Code](https://github.com/shansin/crewai-agents/tree/main/stock_picker)**

Now we enter the big leagues with the **Stock Picker**. This project introduces two advanced concepts: **Memory** and **Structured Outputs**.

1. **Memory (RAG)**: This crew remembers. It uses `LongTermMemory` (SQLite) to store insights across runs and `ShortTermMemory` (RAG) to maintain context. It uses local embeddings (`nomic-embed-text`) to keep everything private.
2. **Structured Output**: Instead of a wall of text, agents return Pydantic objects.

```python
# stock_picker/crew.py

class TrendingCompany(BaseModel):
name: str
ticker: str
reason: str

@task(output_pydantic=TrendingCompanyList)
def find_trending_companies(self): ...
```

**Why this is huge**: You can reliably pipe the output into a database or API because the structure is guaranteed.

---

## Level 5: The Enterprise (Engineering Team)

**Theme: Orchestration & Delegation** | **[Code](https://github.com/shansin/crewai-agents/tree/main/engineering_team)**

Finally, the **Engineering Team**. This is the pinnacle of the experiment.

It simulates a full software development lifecycle with specialized roles: `Lead`, `Backend Engineer`, `Frontend Engineer`, and `QA`.

- **Context & Dependency**: Tasks are chained. The `Backend Engineer` doesn't start until the `Lead` finishes the design. `QA` waits for the code.
- **Multi-Model Intelligence**: I assign different models to different brains:
    - `gpt-oss:20b` for high-level design and leadership.
    - `qwen3-coder:30b` for the heavy lifting of coding.

```yaml
backend_engineer:
output_file: output/{module_name}

frontend_engineer:
output_file: output/app.py
```

**The Result**: A crew that takes an idea and outputs a fully tested, functional application with frontend and backend, saved directly to disk.

**Requirements:**
```
A simple account management system for a trading simulation platform.
The system should allow users to create an account, deposit funds, and withdraw funds.
The system should allow users to record that they have bought or sold shares, providing a quantity.
The system should calculate the total value of the user's portfolio, and the profit or loss from the initial deposit.
The system should be able to report the holdings of the user at any point in time.
The system should be able to report the profit or loss of the user at any point in time.
The system should be able to list the transactions that the user has made over time.
The system should prevent the user from withdrawing funds that would leave them with a negative balance, or
from buying more shares than they can afford, or selling shares that they don't have.
The system has access to a function get_share_price(symbol) which returns the current price of a share, and includes a test implementation that returns fixed prices for AAPL, TSLA, GOOGL.
```

**Design [here](https://github.com/shansin/crewai-agents/tree/main/engineering_team/output/accounts.py_design.md)**

**Final Output:**
**Account Management**
![CrewAI](/images/crew-ai/1.png)

**Trading**
![CrewAI](/images/crew-ai/2.png)

**Portfolio & Transactions**
![CrewAI](/images/crew-ai/3.png)

---

## Conclusion: The Local Advantage

What ties all these projects together? **Local Dominance.**

Every agent here runs on local hardware using Ollama. Whether it's the 8B parameter model for the debater or the 30B coding specialist for the engineer, the power is entirely in my hands.

This codebase proves that you don't need to choose between simplicity and power. With CrewAI, you can start with a debate and end with a software empire. (Or at least a very productive localhost.)

---