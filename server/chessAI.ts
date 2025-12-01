import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

// LLM Provider Clients
// OpenAI client for GPT models
const openaiClient = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Anthropic client for Claude models
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google Gemini client
const geminiClient = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

// xAI Grok client (uses OpenAI SDK with different base URL)
const xaiClient = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

// DeepSeek client (OpenAI-compatible API)
const deepseekClient = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY || "placeholder",
});

// Kimi/Moonshot client (OpenAI-compatible API)
const kimiClient = new OpenAI({
  baseURL: "https://api.moonshot.cn/v1",
  apiKey: process.env.KIMI_API_KEY || "placeholder",
});

// Model mappings
const MODEL_CONFIG: Record<string, { provider: string; model: string }> = {
  'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
  // the newest OpenAI model is "gpt-5" which was released August 7, 2025
  'gpt-5': { provider: 'openai', model: 'gpt-5' },
  'gemini-2.5-pro': { provider: 'gemini', model: 'gemini-2.5-pro' },
  'claude-3.5-sonnet': { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  'grok-4': { provider: 'xai', model: 'grok-2-1212' },
  'kimi-k2': { provider: 'kimi', model: 'moonshot-v1-8k' },
  'deepseek-v3': { provider: 'deepseek', model: 'deepseek-chat' },
};

const CHESS_SYSTEM_PROMPT = `You are a chess grandmaster AI. Analyze the current chess position and suggest the best move.

IMPORTANT RULES:
1. You MUST respond with ONLY a valid chess move in UCI format (e.g., "e2e4", "g1f3", "e7e8q" for promotion)
2. The move MUST be from the list of legal moves provided
3. Do NOT include any explanation, just the move
4. Consider piece development, king safety, and tactical opportunities
5. Play aggressively but soundly

Respond with exactly one move in UCI format, nothing else.`;

function buildChessPrompt(fen: string, legalMoves: string[], moveHistory: string[]): string {
  const historyStr = moveHistory.length > 0 
    ? `\nMove history: ${moveHistory.join(', ')}` 
    : '\nThis is the opening move.';
  
  return `Current position (FEN): ${fen}
${historyStr}

Legal moves available: ${legalMoves.join(', ')}

Your move (UCI format only):`;
}

async function getOpenAIMove(model: string, fen: string, legalMoves: string[], moveHistory: string[]): Promise<string> {
  const prompt = buildChessPrompt(fen, legalMoves, moveHistory);
  
  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model,
    messages: [
      { role: "system", content: CHESS_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
  };
  
  // gpt-5 doesn't support temperature parameter
  if (model !== 'gpt-5') {
    params.temperature = 0.3;
  }
  
  const response = await openaiClient.chat.completions.create(params);
  return response.choices[0].message.content?.trim() || '';
}

async function getAnthropicMove(model: string, fen: string, legalMoves: string[], moveHistory: string[]): Promise<string> {
  const prompt = buildChessPrompt(fen, legalMoves, moveHistory);
  
  const response = await anthropicClient.messages.create({
    model,
    max_tokens: 50,
    system: CHESS_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });
  
  const content = response.content[0];
  if (content.type === 'text') {
    return content.text.trim();
  }
  return '';
}

async function getGeminiMove(model: string, fen: string, legalMoves: string[], moveHistory: string[]): Promise<string> {
  const prompt = `${CHESS_SYSTEM_PROMPT}\n\n${buildChessPrompt(fen, legalMoves, moveHistory)}`;
  
  const response = await geminiClient.models.generateContent({
    model,
    contents: prompt,
  });
  
  return response.text?.trim() || '';
}

async function getXAIMove(model: string, fen: string, legalMoves: string[], moveHistory: string[]): Promise<string> {
  const prompt = buildChessPrompt(fen, legalMoves, moveHistory);
  
  const response = await xaiClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: CHESS_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
  });
  
  return response.choices[0].message.content?.trim() || '';
}

async function getDeepSeekMove(model: string, fen: string, legalMoves: string[], moveHistory: string[]): Promise<string> {
  const prompt = buildChessPrompt(fen, legalMoves, moveHistory);
  
  try {
    const response = await deepseekClient.chat.completions.create({
      model,
      messages: [
        { role: "system", content: CHESS_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });
    
    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    // Fallback to random move if API not available
    console.log('DeepSeek API not available, using random move');
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
}

async function getKimiMove(model: string, fen: string, legalMoves: string[], moveHistory: string[]): Promise<string> {
  const prompt = buildChessPrompt(fen, legalMoves, moveHistory);
  
  try {
    const response = await kimiClient.chat.completions.create({
      model,
      messages: [
        { role: "system", content: CHESS_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });
    
    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    // Fallback to random move if API not available
    console.log('Kimi API not available, using random move');
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
}

function parseAndValidateMove(response: string, legalMoves: string[]): string | null {
  // Clean the response - remove any extra text, quotes, etc.
  let move = response.toLowerCase().trim();
  
  // Remove common prefixes/suffixes
  move = move.replace(/^(move:|my move is|i play|i choose)\s*/i, '');
  move = move.replace(/['"]/g, '');
  move = move.split(/\s+/)[0]; // Take first word only
  
  // Check if it's in the legal moves list
  if (legalMoves.includes(move)) {
    return move;
  }
  
  // Try to find a matching move (case insensitive)
  const matchingMove = legalMoves.find(m => m.toLowerCase() === move);
  if (matchingMove) {
    return matchingMove;
  }
  
  // If move not found, try to extract just the coordinates
  const uciPattern = /([a-h][1-8])([a-h][1-8])([qrbn])?/;
  const match = response.toLowerCase().match(uciPattern);
  if (match) {
    const extractedMove = match[0];
    if (legalMoves.includes(extractedMove)) {
      return extractedMove;
    }
  }
  
  return null;
}

export async function getChessMove(
  playerId: string,
  fen: string,
  legalMoves: string[],
  moveHistory: string[]
): Promise<{ move: string; error?: string }> {
  const config = MODEL_CONFIG[playerId];
  
  if (!config) {
    return { move: '', error: `Unknown player: ${playerId}` };
  }
  
  try {
    let response: string;
    
    switch (config.provider) {
      case 'openai':
        response = await getOpenAIMove(config.model, fen, legalMoves, moveHistory);
        break;
      case 'anthropic':
        response = await getAnthropicMove(config.model, fen, legalMoves, moveHistory);
        break;
      case 'gemini':
        response = await getGeminiMove(config.model, fen, legalMoves, moveHistory);
        break;
      case 'xai':
        response = await getXAIMove(config.model, fen, legalMoves, moveHistory);
        break;
      case 'deepseek':
        response = await getDeepSeekMove(config.model, fen, legalMoves, moveHistory);
        break;
      case 'kimi':
        response = await getKimiMove(config.model, fen, legalMoves, moveHistory);
        break;
      default:
        return { move: '', error: `Unknown provider: ${config.provider}` };
    }
    
    console.log(`[${playerId}] Raw response: "${response}"`);
    
    const validMove = parseAndValidateMove(response, legalMoves);
    
    if (validMove) {
      return { move: validMove };
    }
    
    // If LLM returned invalid move, pick a random legal move as fallback
    console.log(`[${playerId}] Invalid move "${response}", using random fallback`);
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { move: randomMove };
    
  } catch (error) {
    console.error(`[${playerId}] Error getting move:`, error);
    
    // Fallback to random move on error
    if (legalMoves.length > 0) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return { move: randomMove, error: `API error, used random move` };
    }
    
    return { move: '', error: `Failed to get move: ${error}` };
  }
}
