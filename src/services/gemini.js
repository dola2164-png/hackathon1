// Gemini 2.0 Flash service for AI-powered air quality analysis
// Get your key at: https://aistudio.google.com/

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function buildPrompt(cityData) {
  return `You are an expert urban air quality analyst specializing in Indian cities. 
Analyse the following real-time air quality data and return a detailed JSON response.

City: ${cityData.city}, ${cityData.state}
Current AQI: ${cityData.aqi}
PM2.5: ${cityData.pm25} μg/m³
PM10: ${cityData.pm10} μg/m³
Wind Speed: ${cityData.wind?.speed || 10} km/h from ${cityData.wind?.direction || "N"}
Data Source: ${cityData.isFallback ? "Estimated" : "Live sensor"}

Return ONLY a JSON object with exactly these fields — no preamble, no markdown, no explanation:

{
  "sources": [
    {"category": "Vehicle Emissions", "percentage": 0, "reason": "..."},
    {"category": "Industrial", "percentage": 0, "reason": "..."},
    {"category": "Construction Dust", "percentage": 0, "reason": "..."},
    {"category": "Crop Burning", "percentage": 0, "reason": "..."},
    {"category": "Domestic", "percentage": 0, "reason": "..."}
  ],
  "forecast_24h": "One sentence describing expected AQI trend in next 24 hours",
  "actions": [
    {"priority": 1, "action": "Specific enforcement action for authorities", "impact": "Expected impact"},
    {"priority": 2, "action": "Second priority action", "impact": "Expected impact"},
    {"priority": 3, "action": "Third priority action", "impact": "Expected impact"}
  ],
  "health_risk": "One sentence health risk summary for residents",
  "advisory_en": "2-sentence citizen advisory in plain English",
  "advisory_hi": "2-sentence citizen advisory in Hindi (Devanagari script)"
}

Rules:
- Percentages in "sources" must sum to exactly 100
- Actions must be specific, actionable enforcement measures — not generic advice
- Advisory must be practical guidance for the specific AQI level
- Hindi advisory must be in proper Devanagari script, not transliteration`;
}

export async function analyseCity(cityData) {
  const cacheKey = `analysis-${cityData.city}-${Math.floor(cityData.aqi / 10)}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("[Gemini] No API key found, returning mock analysis");
    return getMockAnalysis(cityData);
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(cityData) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3, // Lower = more consistent JSON
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini");

    // Strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);

    CACHE.set(cacheKey, { data: analysis, timestamp: Date.now() });
    return analysis;
  } catch (err) {
    console.error("[Gemini] API error:", err.message);
    return getMockAnalysis(cityData);
  }
}

// Realistic mock for demo/no-key mode
function getMockAnalysis(cityData) {
  const aqi = cityData.aqi;
  const isHigh = aqi > 150;

  return {
    sources: [
      {
        category: "Vehicle Emissions",
        percentage: 38,
        reason: `High traffic density in ${cityData.city} contributes significantly to NOx and PM2.5`,
      },
      {
        category: "Industrial",
        percentage: 28,
        reason: "Manufacturing zones and power plants upwind of monitoring stations",
      },
      {
        category: "Construction Dust",
        percentage: 18,
        reason: "Ongoing metro and road construction projects generating PM10",
      },
      {
        category: "Crop Burning",
        percentage: 10,
        reason: "Seasonal agricultural burning in surrounding regions",
      },
      {
        category: "Domestic",
        percentage: 6,
        reason: "Household cooking and heating using solid fuels",
      },
    ],
    forecast_24h: isHigh
      ? "AQI expected to remain elevated through evening peak hours, slight improvement post-midnight with wind shift."
      : "Conditions expected to improve gradually over the next 24 hours as sea breeze strengthens.",
    actions: [
      {
        priority: 1,
        action: "Deploy 50% odd-even vehicle restrictions on arterial roads during 8–11 AM and 5–9 PM",
        impact: "Estimated 15–20% reduction in PM2.5 within 48 hours",
      },
      {
        priority: 2,
        action: "Suspend non-essential construction activity and mandate water sprinklers at all active sites",
        impact: "Reduce PM10 by 12% within 24 hours",
      },
      {
        priority: 3,
        action: "Issue alerts to 15 industrial units in western zone to reduce output by 30%",
        impact: "Lower NOx and SO2 by 8% over 72 hours",
      },
    ],
    health_risk: isHigh
      ? "Prolonged outdoor exposure poses serious risk to children, elderly, and those with respiratory conditions."
      : "Sensitive individuals should limit extended outdoor activity during peak traffic hours.",
    advisory_en: isHigh
      ? "Air quality is currently poor. Avoid outdoor exercise and keep windows closed. Use N95 masks if you must go outside."
      : "Air quality is moderate. Sensitive groups should reduce prolonged outdoor exertion and monitor symptoms.",
    advisory_hi: isHigh
      ? "वायु गुणवत्ता अभी खराब है। बाहर व्यायाम न करें और खिड़कियाँ बंद रखें। बाहर जाते समय N95 मास्क पहनें।"
      : "वायु गुणवत्ता मध्यम है। संवेदनशील व्यक्ति लंबे समय तक बाहरी गतिविधि कम करें और लक्षणों पर ध्यान दें।",
  };
}
