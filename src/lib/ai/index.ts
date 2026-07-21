export interface TriageResult {
  categorySlug: string;
  urgency: "FLEXIBLE" | "WITHIN_48_HOURS" | "EMERGENCY";
  suggestedSubservice?: string;
  confidenceScore: number;
}

export interface ReviewSummaryResult {
  keyThemes: string[];
  summaryText: string;
  overallSentiment: "POSITIVE" | "MIXED" | "NEEDS_IMPROVEMENT";
}

export interface ProfileAssistantResult {
  bio: string;
  suggestedPriceRange: { min: number; max: number };
  tips: string[];
}

export interface AIProvider {
  triageRequest(text: string, imageUrl?: string): Promise<TriageResult>;
  summarizeReviews(reviews: Array<{ rating: number; comment?: string | null }>): Promise<ReviewSummaryResult>;
  generateProfileAssistant(input: { categoryName: string; experienceYears: number; rawBio?: string }): Promise<ProfileAssistantResult>;
}

// ─── Gemini API Implementation ───────────────────────────────────────────────

class GeminiAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  async triageRequest(text: string): Promise<TriageResult> {
    const prompt = `Analyze this home service request for Shivamogga, Karnataka: "${text}".
Return strict JSON: {"categorySlug": "plumbing"|"electrician"|"appliance-repair"|"cleaning"|"salon", "urgency": "EMERGENCY"|"WITHIN_48_HOURS"|"FLEXIBLE", "confidenceScore": 0.9}`;
    try {
      const raw = await this.callGemini(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback on error
    }
    return fallbackAI.triageRequest(text);
  }

  async summarizeReviews(reviews: Array<{ rating: number; comment?: string | null }>): Promise<ReviewSummaryResult> {
    const prompt = `Summarize these customer reviews for a service provider: ${JSON.stringify(reviews)}.
Return strict JSON: {"keyThemes": ["Punctual", "Clean work"], "summaryText": "Consistently rated 5 stars for quick electrical repairs.", "overallSentiment": "POSITIVE"}`;
    try {
      const raw = await this.callGemini(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback
    }
    return fallbackAI.summarizeReviews(reviews);
  }

  async generateProfileAssistant(input: { categoryName: string; experienceYears: number; rawBio?: string }): Promise<ProfileAssistantResult> {
    const prompt = `Generate a professional service provider profile bio and estimated Shivamogga price range (INR) for a ${input.experienceYears}-year experienced ${input.categoryName}. Raw notes: "${input.rawBio || ""}".
Return strict JSON: {"bio": "...", "suggestedPriceRange": {"min": 350, "max": 800}, "tips": ["Add work photos to boost trust"]}`;
    try {
      const raw = await this.callGemini(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback
    }
    return fallbackAI.generateProfileAssistant(input);
  }
}

// ─── Local Heuristic Fallback Implementation ─────────────────────────────────

class FallbackAIProvider implements AIProvider {
  async triageRequest(text: string): Promise<TriageResult> {
    const lower = text.toLowerCase();
    let categorySlug = "plumbing";
    let urgency: "FLEXIBLE" | "WITHIN_48_HOURS" | "EMERGENCY" = "FLEXIBLE";

    if (lower.includes("leak") || lower.includes("pipe") || lower.includes("tap") || lower.includes("water")) {
      categorySlug = "plumbing";
    } else if (lower.includes("wire") || lower.includes("shock") || lower.includes("switch") || lower.includes("power") || lower.includes("current")) {
      categorySlug = "electrician";
    } else if (lower.includes("fridge") || lower.includes("ac") || lower.includes("washing") || lower.includes("tv")) {
      categorySlug = "appliance-repair";
    } else if (lower.includes("clean") || lower.includes("sofa") || lower.includes("bathroom") || lower.includes("deep")) {
      categorySlug = "cleaning";
    } else if (lower.includes("hair") || lower.includes("facial") || lower.includes("massage") || lower.includes("makeup")) {
      categorySlug = "salon";
    }

    if (lower.includes("urgent") || lower.includes("immediately") || lower.includes("emergency") || lower.includes("burst")) {
      urgency = "EMERGENCY";
    } else if (lower.includes("today") || lower.includes("tomorrow")) {
      urgency = "WITHIN_48_HOURS";
    }

    return {
      categorySlug,
      urgency,
      confidenceScore: 0.85,
    };
  }

  async summarizeReviews(reviews: Array<{ rating: number; comment?: string | null }>): Promise<ReviewSummaryResult> {
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / total : 5;

    const keyThemes = [];
    if (avg >= 4.5) keyThemes.push("Punctual & Reliable", "High Technical Skill", "Clean Post-Service Cleanup");
    else if (avg >= 3.5) keyThemes.push("Fair Pricing", "Good Communication");
    else keyThemes.push("Mixed Feedback", "Requires Improvement");

    return {
      keyThemes,
      summaryText: `Based on ${total} verified customer review${total === 1 ? "" : "s"} with an average rating of ${avg.toFixed(1)} ★.`,
      overallSentiment: avg >= 4.5 ? "POSITIVE" : avg >= 3.5 ? "MIXED" : "NEEDS_IMPROVEMENT",
    };
  }

  async generateProfileAssistant(input: { categoryName: string; experienceYears: number; rawBio?: string }): Promise<ProfileAssistantResult> {
    const exp = input.experienceYears || 3;
    const cat = input.categoryName || "Home Services";
    const bio = input.rawBio && input.rawBio.length > 15
      ? `${input.rawBio.trim()} Dedicated ${cat} specialist with ${exp}+ years of verified hands-on experience serving Shivamogga households.`
      : `Verified ${cat} professional with ${exp}+ years of experience providing reliable, high-quality home service solutions in Shivamogga, Karnataka.`;

    return {
      bio,
      suggestedPriceRange: { min: 350, max: 750 },
      tips: [
        "Include 3+ clear work photos in your portfolio to increase lead acceptance by 40%.",
        "Maintain an online status during morning peak hours (8 AM – 11 AM) for instant lead offers.",
      ],
    };
  }
}

const fallbackAI = new FallbackAIProvider();

export function getAIProvider(): AIProvider {
  const key = process.env.GEMINI_API_KEY;
  if (key && key.trim().length > 0) {
    return new GeminiAIProvider(key.trim());
  }
  return fallbackAI;
}
