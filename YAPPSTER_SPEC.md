# Yappster

A prompt engineering MCP server that generates token-efficient prompts for Factory Droid (Claude in Cursor IDE).

## Core Goal

Help solopreneurs with cognitive challenges (ADHD, TBI, PTSD) save money and mental energy by:
1. Listening to rambling, unstructured descriptions
2. Asking clarifying questions when needed
3. Generating minimal, precise prompts that reduce token usage
4. Integrating directly into Cursor via MCP protocol

## Architecture

```
You (in Cursor) → @yappster "rambling description"
                      ↓
              Letta MCP Server (hosted)
                      ↓
              Qwen 2.5 (local via Ollama)
                      ↓
              Structured prompt returned to Cursor
                      ↓
              Execute with Factory Droid
```

## Tech Stack

- **MCP Server**: Letta (app.letta.com) for hosting + memory
- **LLM**: Qwen 2.5 via Ollama (local) — upgrade to Llama 3.1 70B later
- **Optional Web UI**: Vercel (React + Vite) for viewing/editing saved prompts
- **Storage**: Letta's built-in memory for learning user patterns

## Prompt Modes

### 1. New Project Prompt
Output format:
```
[Name]: [one-liner]. Tech: [stack]. Features: [bullets]. Data: [schema hints]. Order: [phases].
```

### 2. In-Project Task Prompt
Output format:
```
[action] [what] [where]. [constraint if critical]
```

## Token Efficiency Rules (Yappster enforces these)

- Strip filler words (please, could you, I want)
- Omit defaults AI assumes (match style, don't break things)
- Use shorthand (3/10min not "3 per 10 minutes")
- Skip context AI can infer (open files, package.json)
- One ask per prompt

## Features

### MVP
- MCP server endpoint Cursor can call
- Two prompt modes (new project / in-project task)
- Form-based input → structured output
- Token count estimate
- Copy-to-clipboard

### Phase 2
- Letta memory integration (learns your patterns over time)
- Saved prompt templates
- Web dashboard (Vercel)

### Phase 3
- Voice input option
- Auto-detect prompt type from context
- Suggest improvements before finalizing

## MCP Integration

Register in Cursor settings (`~/.cursor/mcp.json`):
```json
{
  "servers": {
    "yappster": {
      "url": "http://localhost:8080",
      "description": "Token-efficient prompt generator"
    }
  }
}
```

Invoke in chat:
```
@yappster add rate limiting to song requests, like 3 per 10 minutes per user
```

Returns:
```
Add 429 rate limit 3/10min per viewer → requests.js
```

## Example Transformations

### Verbose Input
"Hey can you please add a feature where users can only request 3 songs every 10 minutes? I don't want people spamming the queue. Make sure it returns a proper error message."

### Yappster Output
```
Add rate limit: 3 songs/10min per viewer → requests.js. Return 429 + retry-after.
```

---

## Implementation Order

1. Set up Letta MCP server scaffold
2. Connect to local Qwen 2.5 via Ollama
3. Build prompt compression logic
4. Register with Cursor
5. Add memory/learning (Phase 2)
6. Optional web UI (Phase 3)

