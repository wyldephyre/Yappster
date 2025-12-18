#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { compress, detectMode, type PromptMode } from './prompt-compressor.js';
import { enhanceWithLLM, checkOllamaHealth } from './ollama-client.js';

const server = new Server(
  {
    name: 'yappster',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'compress',
        description: 'Compress a verbose description into a token-efficient prompt for Factory Droid. Strips filler words, applies shorthand, and formats for clarity.',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Your rambling description or feature request',
            },
            mode: {
              type: 'string',
              enum: ['new-project', 'in-project'],
              description: 'Prompt mode: new-project for scaffolding, in-project for tasks (auto-detected if not specified)',
            },
            useLLM: {
              type: 'boolean',
              description: 'Use Qwen 2.5 via Ollama for enhanced compression (default: true if available)',
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'status',
        description: 'Check Yappster status and Ollama availability',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'compress') {
    const input = args?.input as string;
    const mode = (args?.mode as PromptMode) || detectMode(input);
    const useLLM = args?.useLLM !== false;

    // First do local compression
    const localResult = compress(input, mode);
    
    // Try LLM enhancement if requested
    let finalPrompt = localResult.compressed;
    let llmUsed = false;
    
    if (useLLM) {
      const ollamaAvailable = await checkOllamaHealth();
      if (ollamaAvailable) {
        const llmResult = await enhanceWithLLM(input, mode);
        if (llmResult) {
          finalPrompt = llmResult;
          llmUsed = true;
        }
      }
    }

    const tokenEstimate = Math.ceil(finalPrompt.length / 4);
    const tokenSavings = Math.ceil(input.length / 4) - tokenEstimate;

    return {
      content: [
        {
          type: 'text',
          text: `**Compressed Prompt:**\n\`\`\`\n${finalPrompt}\n\`\`\`\n\n📊 **Stats:**\n- Tokens: ~${tokenEstimate} (saved ~${tokenSavings})\n- Mode: ${mode}\n- LLM: ${llmUsed ? 'Qwen 2.5' : 'local only'}`,
        },
      ],
    };
  }

  if (name === 'status') {
    const ollamaOk = await checkOllamaHealth();
    return {
      content: [
        {
          type: 'text',
          text: `🐕 **Yappster Status**\n- Server: ✅ Running\n- Ollama: ${ollamaOk ? '✅ Connected (Qwen 2.5)' : '❌ Not available'}\n- Modes: new-project, in-project`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Yappster MCP server running on stdio');
}

main().catch(console.error);

