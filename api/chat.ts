import { GoogleGenAI } from '@google/genai';

export const config = {
  maxDuration: 60,
};

function buildGeminiContents(
  history: Array<{ role: string; text?: string; content?: string }>,
  currentMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const turns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  const rawTurns = [
    ...history.map((h) => ({
      role: h.role === 'assistant' || h.role === 'model' ? ('model' as const) : ('user' as const),
      text: String(h.text || h.content || '').trim(),
    })).filter((t) => t.text.length > 0),
    { role: 'user' as const, text: currentMessage.trim() },
  ];

  for (const t of rawTurns) {
    if (turns.length === 0) {
      if (t.role === 'model') {
        turns.push({ role: 'user', parts: [{ text: 'Hello' }] });
      }
      turns.push({ role: t.role, parts: [{ text: t.text }] });
    } else {
      const prev = turns[turns.length - 1];
      if (prev.role === t.role) {
        prev.parts[0].text += `\n\n${t.text}`;
      } else {
        turns.push({ role: t.role, parts: [{ text: t.text }] });
      }
    }
  }

  return turns;
}

export default async function handler(req: any, res: any) {
  // CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      message,
      history = [],
      credentials = [],
      memories = [],
      mode = 'chat',
      searchResults = [],
    } = req.body || {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Missing or invalid message string.' });
      return;
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server environment.' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const hasCredentials = Array.isArray(credentials) && credentials.length > 0;
    let userContext = hasCredentials
      ? credentials
          .map((c: any) => `- ${c.name} (Issuer: ${c.issuer}, Type: ${c.type}, Purpose: "${c.purpose || ''}")`)
          .join('\n')
      : '';

    const hasMemories = Array.isArray(memories) && memories.length > 0;
    let memoryContext = hasMemories
      ? memories.map((m: any) => `• [${(m.category || 'fact').toUpperCase()}]: ${m.fact}`).join('\n')
      : '';

    if (Array.isArray(searchResults) && searchResults.length > 0) {
      userContext += `\n\nLive Real-Time Web Search Grounding:\n` +
        searchResults.map((r: any) => `• Title: "${r.title}"\n  Snippet: ${r.snippet}\n  URL: ${r.url}`).join('\n\n');
    }

    const systemPrompt = `You are Kred, the AI agent inside Kred — a sovereign credential intelligence and document synthesis platform. Users work with you to verify credentials, ask questions, synthesize documents (CVs, study plans, flashcards, slide decks, receipts), and create step-by-step task roadmaps to learn or accomplish goals.

When asked to teach something or create a task / roadmap (e.g. "teach me about X", "create a task for X", "step by step guide for X"):
Always output a complete, structured Step-by-Step Task Roadmap in Markdown:
# Task Roadmap: Teach Me [Topic]
*Step-by-Step Learning & Execution To-Do List*

## Step 1: [Step Title]
**Duration:** [Estimated Time e.g. 20 mins]
**Difficulty:** [Beginner / Intermediate / Advanced]
**Overview:** [Brief explanation of what this step accomplishes]
- [ ] [Sub-task item 1]
- [ ] [Sub-task item 2]
**Key Points:** [Key takeaway concept]
**Tips:** [Pro tip]

## Step 2: [Step Title]
...

Active Long-Term User Memories:
${memoryContext || '(No long-term memories recorded yet.)'}

${hasCredentials ? `User Vault Stored Credentials:\n${userContext}` : ''}`;

    const contents = buildGeminiContents(Array.isArray(history) ? history.slice(-30) : [], message);

    const modelCandidate = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

    const response = await ai.models.generateContent({
      model: modelCandidate,
      contents,
      config: {
        temperature: mode === 'agent' ? 0.2 : 0.7,
        systemInstruction: systemPrompt,
      },
    });

    const aiText = response.text || '';
    res.status(200).json({
      text: aiText,
      sources: Array.isArray(searchResults) && searchResults.length > 0 ? ['DuckDuckGo Web Search'] : ['Kred AI Engine'],
      provider: `gemini (${modelCandidate})`,
      mode,
    });
  } catch (err: any) {
    console.error('Vercel api/chat error:', err);
    res.status(500).json({ error: err?.message || 'Server error processing request.' });
  }
}
