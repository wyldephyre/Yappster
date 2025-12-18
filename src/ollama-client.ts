// Ollama client for Qwen 2.5 integration
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

const SYSTEM_PROMPT = `You are Yappster, a prompt compression assistant. Your job is to take rambling, verbose descriptions and compress them into minimal, token-efficient prompts for an AI coding assistant.

Rules:
- Strip ALL filler words (please, could you, I want, basically, actually)
- Use shorthand (3/10min not "3 per 10 minutes")
- Omit things AI can infer from context
- One clear action per prompt
- Be direct and imperative

For in-project tasks, output format:
[action] [what] [where]. [constraint if critical]

Example input: "Hey can you please add a feature where users can only request 3 songs every 10 minutes? I don't want people spamming the queue. Make sure it returns a proper error message."
Example output: "Add rate limit: 3 songs/10min per user. Return 429 + retry-after."

For new projects, output format:
[Name]: [one-liner]. Tech: [stack]. Features: [bullets]. Data: [schema hints]. Order: [phases].

Respond ONLY with the compressed prompt, nothing else.`;

export async function enhanceWithLLM(input: string, mode: 'new-project' | 'in-project'): Promise<string> {
  try {
    const response = await ollama.chat({
      model: 'qwen2.5:latest',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Mode: ${mode}\n\nCompress this:\n${input}` }
      ],
      options: {
        temperature: 0.3,
        num_predict: 200
      }
    });
    
    return response.message.content.trim();
  } catch (error) {
    // Fallback if Ollama isn't available
    console.error('Ollama unavailable, using local compression:', error);
    return '';
  }
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}

