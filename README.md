# Yappster 🐕

Token-efficient prompt generator MCP server for Cursor IDE.

## Quick Start

```bash
npm install
npm run build
```

## Register with Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "yappster": {
      "command": "node",
      "args": ["D:/App Development/Yappster/dist/index.js"]
    }
  }
}
```

## Usage

In Cursor chat:
```
@yappster compress "Hey can you please add a feature where users can only request 3 songs every 10 minutes?"
```

Returns:
```
Add rate limit: 3 songs/10min per user. Return 429 + retry-after.
```

## Optional: Ollama Setup

For enhanced compression with Qwen 2.5:
```bash
ollama pull qwen2.5
ollama serve
```

Works without Ollama using local compression rules.

