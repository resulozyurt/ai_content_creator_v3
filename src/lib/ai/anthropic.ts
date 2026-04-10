import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ResearchContext {
  keyword: string;
  contentType: string;
  writingGoal: string;
  contentDepth: string;
  serpData: any;
}

/**
 * Orchestrates the Claude 3 model to generate a structured, SEO-optimized
 * article outline based on real-time SERP data.
 */
export async function generateArticleOutline(context: ResearchContext) {
  const { keyword, contentType, writingGoal, contentDepth, serpData } = context;

  // Extract competitor titles to feed to Claude for context
  const competitorTitles = serpData.organicResults.map((res: any) => res.title).join("\n- ");
  const userQuestions = serpData.relatedQuestions.join("\n- ");

  const systemPrompt = `
    You are an elite SEO strategist and Senior Content Architect. 
    Your objective is to generate a comprehensive, highly-structured article outline.
    
    Target Keyword: "${keyword}"
    Content Format: ${contentType}
    Writing Perspective: ${writingGoal}
    Target Audience Depth: ${contentDepth}

    COMPETITOR HEADINGS CURRENTLY RANKING:
    - ${competitorTitles}

    QUESTIONS THE AUDIENCE IS ASKING:
    - ${userQuestions}

    INSTRUCTIONS:
    Analyze the competitor headings and user questions. Build an outline that is better, more comprehensive, and directly answers user intent.
    Do NOT write the article. ONLY provide the outline structure.
    
    You MUST respond STRICTLY in the following JSON format, with no markdown formatting or extra text outside the JSON block:
    {
      "intent": [
        { "type": "string (e.g., Informational)", "confidence": number (0-100), "desc": "string" }
      ],
      "keywords": [
        { "term": "string", "difficulty": "Low|Medium|High" }
      ],
      "outline": [
        { "id": "string (unique)", "type": "h2" or "h3", "text": "string", "selected": true }
      ]
    }
  `;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 4096, 
      temperature: 0.1, // Lowered further to enforce stricter formatting
      system: "You are a machine that outputs ONLY raw JSON. No markdown formatting, no conversational text. Your output must start with '{' and end with '}'.",
      messages: [
        {
          role: "user",
          content: systemPrompt,
        },
      ],
    });

    const textResponse = msg.content[0].type === 'text' ? msg.content[0].text : '';
    
    // 1. Locate the JSON block
    const startIndex = textResponse.indexOf('{');
    const endIndex = textResponse.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Failed to locate a valid JSON object in the AI response.");
    }
    
    let cleanJsonString = textResponse.substring(startIndex, endIndex + 1);

    // 2. Aggressive JSON Cleaning & Repair Strategy
    // Sometimes LLMs trail off or miss a final bracket. This attempts basic structural repair.
    try {
      return JSON.parse(cleanJsonString);
    } catch (initialParseError) {
      console.warn("Initial JSON parse failed, attempting structural repair...");
      
      // Attempt 1: Fix trailing commas (common LLM mistake)
      cleanJsonString = cleanJsonString.replace(/,\s*([\]}])/g, '$1');
      
      // Attempt 2: If it unexpectedly ended, try appending closing brackets
      if (!cleanJsonString.endsWith("}")) {
          cleanJsonString += "]}"; // Assuming it cut off inside the outline array
      }

      // Final attempt to parse
      return JSON.parse(cleanJsonString);
    }

  } catch (error) {
    console.error("Anthropic Outline Generation Error:", error);
    throw new Error("Failed to generate content architecture via AI. The model produced invalid syntax.");
  }
}