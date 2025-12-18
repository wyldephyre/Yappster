// Prompt compression logic for Yappster

const FILLER_WORDS = [
  'please', 'could you', 'can you', 'i want', 'i need', 'i would like',
  'hey', 'hi', 'hello', 'thanks', 'thank you', 'basically', 'actually',
  'just', 'really', 'very', 'maybe', 'perhaps', 'kind of', 'sort of',
  'like', 'you know', 'i think', 'i guess', 'i suppose', 'if possible',
  'would be great', 'would be nice', 'it would be', 'make sure'
];

const SHORTHAND_MAP: Record<string, string> = {
  'per minute': '/min',
  'per hour': '/hr',
  'per day': '/day',
  'per second': '/sec',
  'per user': '/user',
  'per viewer': '/viewer',
  'minutes': 'min',
  'seconds': 'sec',
  'hours': 'hr',
  'error message': 'error',
  'proper error': 'error',
  'every': '/',
};

export type PromptMode = 'new-project' | 'in-project';

export interface CompressedPrompt {
  original: string;
  compressed: string;
  mode: PromptMode;
  tokenEstimate: number;
}

function stripFillerWords(text: string): string {
  let result = text.toLowerCase();
  for (const filler of FILLER_WORDS) {
    result = result.replace(new RegExp(`\\b${filler}\\b`, 'gi'), '');
  }
  return result.replace(/\s+/g, ' ').trim();
}

function applyShorthand(text: string): string {
  let result = text;
  for (const [long, short] of Object.entries(SHORTHAND_MAP)) {
    result = result.replace(new RegExp(long, 'gi'), short);
  }
  // Convert "X per Y minutes" → "X/Ymin"
  result = result.replace(/(\d+)\s*\/\s*(\d+)\s*min/gi, '$1/$2min');
  return result;
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}

export function detectMode(input: string): PromptMode {
  const newProjectIndicators = [
    'new project', 'create app', 'build app', 'new app', 'start project',
    'from scratch', 'tech stack', 'architecture', 'scaffold'
  ];
  const lower = input.toLowerCase();
  return newProjectIndicators.some(ind => lower.includes(ind)) ? 'new-project' : 'in-project';
}

export function compressNewProject(input: string): string {
  // Extract key components for new project format
  // [Name]: [one-liner]. Tech: [stack]. Features: [bullets]. Data: [schema hints]. Order: [phases].
  const cleaned = stripFillerWords(input);
  return applyShorthand(cleaned);
}

export function compressInProject(input: string): string {
  // Format: [action] [what] [where]. [constraint if critical]
  let cleaned = stripFillerWords(input);
  cleaned = applyShorthand(cleaned);
  
  // Extract action verb
  const actionVerbs = ['add', 'fix', 'update', 'remove', 'delete', 'change', 'modify', 'implement', 'create', 'refactor'];
  let action = '';
  for (const verb of actionVerbs) {
    if (cleaned.includes(verb)) {
      action = verb;
      break;
    }
  }
  
  // Capitalize first letter and clean up
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

export function compress(input: string, mode?: PromptMode): CompressedPrompt {
  const detectedMode = mode || detectMode(input);
  const compressed = detectedMode === 'new-project' 
    ? compressNewProject(input) 
    : compressInProject(input);
  
  return {
    original: input,
    compressed,
    mode: detectedMode,
    tokenEstimate: estimateTokens(compressed)
  };
}

