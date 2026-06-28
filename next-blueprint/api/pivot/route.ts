import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { originalItineraryName, currentItineraryDetails, weatherStatus } = await request.json();

    const systemPrompt = `You are the core of TrekShift: the Monsoon-Proof AI Pivot Agent.
Your task is to take an endangered adventure trek in Maharashtra during the monsoon, and generate 3 alternative, highly secure, weather-proof itineraries in the SAME general region (within 30-50km max), allowing tourists to pivot seamlessly.

CRITICAL RULES:
1. Every alternative must be safe, low-altitude, sheltered, or indoor (e.g. historical caves, sheltered heritage sites, secure luxury agrotourism, indoor workshops, sheltered gastronomy/fort shelters). No high-altitude exposed ridges, active deep water waterfalls, or landslide-vulnerable peaks.
2. The alternative options MUST be geographically accurate and real spots in Maharashtra (near Lonavala, Junnar, Tamhini, Malshej, Kolad, Pali, Pune).
3. Keep the alternatives highly attractive but with a 95%+ weather-proof safety rating.
4. Output exactly 3 distinct options.`;

    const prompt = `Original endangered adventure: "${originalItineraryName}"
Original activity details: "${currentItineraryDetails}"
Current hazardous weather: "${weatherStatus}"

Generate 3 safe, thrilling but weatherproof monsoon pivots. Each object must have fields:
- title (String): Name of weatherproof pivot
- description (String): Detailed description of why it is safe for monsoon and how it keeps the spirit of Maharashtra culture or secure adventure alive
- activityType (String): Indoor / Sheltered Cave Exploration / Agro-tourism / Culinary / Spa
- duration (String): e.g. "4 Hours", "5 Hours"
- difficulty (String): "EASY" or "MODERATE"
- safetyRating (String): percentage with safety details e.g. "99% (All Indoors)", "98% (Sheltered Estate)"
- location (String): Local Maharashtra village/town name
- costImpact (String): One of "NO_EXTRA_COST", "REFUND_DIFFERENCE", "SLIGHT_UPGRADE_FREE"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              activityType: { type: Type.STRING },
              duration: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              safetyRating: { type: Type.STRING },
              location: { type: Type.STRING },
              costImpact: { type: Type.STRING }
            },
            required: ["title", "description", "activityType", "duration", "difficulty", "safetyRating", "location", "costImpact"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const pivotOptions = JSON.parse(text);

    return NextResponse.json({ pivotOptions });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate AI pivots" }, { status: 500 });
  }
}
