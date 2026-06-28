import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Booking, Operator, TripItinerary, PivotOption, PivotHistoryEntry } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI client initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running in premium fallback generator mode.");
}

// In-memory Database representing PostgreSQL state for the hackathon
let operators: Operator[] = [
  {
    id: "op-1",
    name: "Vikram Kadam",
    tourCompany: "Sahyadri Rangers Pune",
    trustScore: 82,
    verified: true,
    completedTours: 142,
    safetyAuditsCount: 12,
  },
  {
    id: "op-2",
    name: "Ananya Deshmukh",
    tourCompany: "Western Ghats Trekkers",
    trustScore: 94,
    verified: true,
    completedTours: 218,
    safetyAuditsCount: 18,
  },
  {
    id: "op-3",
    name: "Rahul Patil",
    tourCompany: "Sahyadri Explorers Ltd",
    trustScore: 68,
    verified: false,
    completedTours: 48,
    safetyAuditsCount: 3,
  }
];

let itineraries: TripItinerary[] = [
  {
    id: "it-1",
    originalTrekName: "Rajmachi Fort Monsoon Trek",
    region: "Lonavala / Khandala",
    originalDifficulty: "CHALLENGING",
    weatherDependencyStatus: "HIGH",
    originalDurationHours: 8,
    originalMaxAltitudeFeet: 2710,
    description: "Classic Sahyadri monsoon trek scaling two twin forts Shrivardhan and Manaranjan. Gorgeous, but has extreme flash-flood risk on waterfalls and landslide vulnerabilities on steep clay paths during torrential cloudbursts."
  },
  {
    id: "it-2",
    originalTrekName: "Harishchandragad Kokankada Trek",
    region: "Malshej Ghat",
    originalDifficulty: "EXTREME",
    weatherDependencyStatus: "HIGH",
    originalDurationHours: 14,
    originalMaxAltitudeFeet: 4670,
    description: "A highly challenging summit trek to the magnificent circular vertical cliff Kokankada. Under extreme rains, winds reach up to 80km/h and visibility drops to 2 meters with rapid fog accumulation."
  },
  {
    id: "it-3",
    originalTrekName: "Devkund Waterfall Valley Expedition",
    region: "Bhira, Patnus",
    originalDifficulty: "MODERATE",
    weatherDependencyStatus: "HIGH",
    originalDurationHours: 6,
    originalMaxAltitudeFeet: 1200,
    description: "Dense forest walk leading to a breathtaking pool. Extremely vulnerable to sudden cloudbursts in the Tamhini Ghat catchment area, creating life-threatening flash water rises in minutes."
  }
];

let bookings: Booking[] = [
  {
    id: "bk-1",
    userId: "usr-101",
    userName: "Aditya Sharma",
    operatorId: "op-1",
    operatorName: "Sahyadri Rangers Pune",
    originalItineraryId: "it-1",
    originalItineraryName: "Rajmachi Fort Monsoon Trek",
    bookingDate: "2026-06-28",
    status: "PIVOT_PROPOSED",
    currentItineraryDetails: "Scheduled to trek 16km scaling Rajmachi peaks with waterfall crossings.",
    weatherStatus: "HEAVY_STORM",
    selectedPivotIndex: null,
    pivotOptions: [
      {
        id: "pvt-lon-1",
        title: "Karla & Bhaja Caves Exploration",
        description: "Explore ancient 2nd-century BC Buddhist rock-cut caves, entirely dry and protected. Includes a guided history walkthrough and shelter from monsoon cloudbursts.",
        activityType: "Indoor",
        duration: "5 Hours",
        difficulty: "EASY",
        safetyRating: "99% (Fully Sheltered)",
        location: "Karla Hills, Lonavala",
        costImpact: "REFUND_DIFFERENCE",
        price: "₹1,200"
      },
      {
        id: "pvt-lon-2",
        title: "Tungarli Lake Safe-Zone Camping",
        description: "Move from landslide-prone peaks to a secure sheltered valley lakeside glamping. Includes windproof, waterproof structures and traditional rain shelters.",
        activityType: "Sheltered",
        duration: "6 Hours",
        difficulty: "EASY",
        safetyRating: "98% (Secure Valley)",
        location: "Tungarli Lake, Lonavala",
        costImpact: "SLIGHT_UPGRADE_FREE",
        price: "₹1,500"
      },
      {
        id: "pvt-lon-3",
        title: "Bedse Caves & Local Village Lunch",
        description: "Low altitude safe hike with zero landslide risk. Experience real heritage caves followed by a warm authentic wood-fired rustic organic meal.",
        activityType: "Culinary & Heritage",
        duration: "4 Hours",
        difficulty: "EASY",
        safetyRating: "99% (Low Altitude)",
        location: "Bedse, Lonavala",
        costImpact: "NO_EXTRA_COST",
        price: "₹900"
      }
    ],
    pivotHistory: [
      {
        timestamp: new Date().toISOString(),
        triggerEvent: "MONSOON_WARNING_LEVEL_3",
        reason: "Heavy orange rainfall alert from IMD for Pune district (180mm forecast). Elevated risk of landslides near Shrivardhan Fort trail.",
        offeredPivotsCount: 3,
        acceptedPivotTitle: null
      }
    ]
  },
  {
    id: "bk-2",
    userId: "usr-102",
    userName: "Priya Nair",
    operatorId: "op-2",
    operatorName: "Western Ghats Trekkers",
    originalItineraryId: "it-2",
    originalItineraryName: "Harishchandragad Kokankada Trek",
    bookingDate: "2026-06-29",
    status: "CONFIRMED",
    currentItineraryDetails: "Scale the challenging Khireshwar route up to the historical Kokankada suspension view.",
    weatherStatus: "LIGHT_RAIN",
    selectedPivotIndex: null,
    pivotOptions: [],
    pivotHistory: []
  },
  {
    id: "bk-3",
    userId: "usr-103",
    userName: "Amit Gupte",
    operatorId: "op-3",
    operatorName: "Sahyadri Explorers Ltd",
    originalItineraryId: "it-3",
    originalItineraryName: "Devkund Waterfall Valley Expedition",
    bookingDate: "2026-06-30",
    status: "CONFIRMED",
    currentItineraryDetails: "Deep forest stream wading trek up to the massive 300ft plunge plunge pool.",
    weatherStatus: "SUNNY",
    selectedPivotIndex: null,
    pivotOptions: [],
    pivotHistory: []
  }
];

// Fallback high-quality alternative generators in Maharashtra
const getFallbackPivots = (trekName: string, region: string): PivotOption[] => {
  if (trekName.includes("Rajmachi") || region.includes("Lonavala")) {
    return [
      {
        id: "pvt-lon-1",
        title: "Karla and Bhaja Caves Sheltered Archeological Tour",
        description: "Pivot 35km from the landslide-prone Rajmachi peak. Explore ancient 2nd-century BC Buddhist rock-cut caves entirely dry and protected. Includes a guided history walkthrough and shelter from monsoon cloudbursts.",
        activityType: "Indoor Historical Caves Exploration",
        duration: "5 Hours",
        difficulty: "EASY",
        safetyRating: "99% (Fully Sheltered)",
        location: "Karla Hills, Lonavala",
        costImpact: "REFUND_DIFFERENCE"
      },
      {
        id: "pvt-lon-2",
        title: "Wax Museum & Sheltered Wet-Weather Heritage Pavilion Tour",
        description: "Indoor family-friendly tour focusing on Lonavala's heritage structures and miniature displays. Totally isolated from lightning and mudslide hazards.",
        activityType: "Indoor Heritage & Cultural Tour",
        duration: "4 Hours",
        difficulty: "EASY",
        safetyRating: "100% (Indoor safe-zone)",
        location: "Lonavala Town",
        costImpact: "REFUND_DIFFERENCE"
      },
      {
        id: "pvt-lon-3",
        title: "Sheltered Tamhini Valley Culinary and Farm Experience",
        description: "Move from open ridges to a highly secure wooden agro-tourism valley estate. Taste authentic wood-fired Maharashtrian cuisine (Pithla Bhakri), listen to the rain under structurally engineered rain shelters, and experience safe local farming.",
        activityType: "Sheltered Culinary & Agro-Tourism",
        duration: "6 Hours",
        difficulty: "EASY",
        safetyRating: "98% (Secure Estate)",
        location: "Mulshi Foothills",
        costImpact: "NO_EXTRA_COST"
      }
    ];
  } else if (trekName.includes("Harishchandragad") || region.includes("Malshej")) {
    return [
      {
        id: "pvt-h-1",
        title: "Sheltered Malshej Ghat MTDC Resort & Monsoon-View Point Safely",
        description: "Avoid dangerous winds on Kokankada (80km/h). Relocate to the certified state-safe MTDC premium sheltered gazebos overlooking Malshej valley. Enclosed dining, local soup tasting, and a low-altitude heritage indoor tour.",
        activityType: "Indoor Valley View & Gastronomy",
        duration: "6 Hours",
        difficulty: "EASY",
        safetyRating: "98% (Certified Safe Structure)",
        location: "Malshej Ghat Resort",
        costImpact: "NO_EXTRA_COST"
      },
      {
        id: "pvt-h-2",
        title: "Naneghat Ancient Stone Toll House & Caves Exploration",
        description: "Climb through the highly shielded ancient pass. Seek safe shelter inside dry, spacious rock-cut chambers used by merchants since Satavahana Dynasty. High stability structure, zero mudslide hazards.",
        activityType: "Rock Shelter Cave Exploration",
        duration: "7 Hours",
        difficulty: "MODERATE",
        safetyRating: "95% (Natural Rock Shelter)",
        location: "Junnar Region",
        costImpact: "REFUND_DIFFERENCE"
      },
      {
        id: "pvt-h-3",
        title: "Junnar Vineyard and Agro-Tourism Experience",
        description: "Swap extreme high altitude ridges for a peaceful, sheltered luxury vineyard tour in Junnar plain. Safe indoor wine tasting, local farm walks under durable canopy shelters, and safety from high-velocity ridge winds.",
        activityType: "Sheltered Luxury Wine & Farm Walk",
        duration: "5 Hours",
        difficulty: "EASY",
        safetyRating: "99% (All Indoor/Sheltered)",
        location: "Junnar",
        costImpact: "SLIGHT_UPGRADE_FREE"
      }
    ];
  } else {
    // Devkund Waterfall options
    return [
      {
        id: "pvt-d-1",
        title: "Historical Pali Ballaleshwar temple and Sheltered Fort Tour",
        description: "Pivot away from life-threatening Devkund flash floods. Enjoy a highly sheltered spiritual and archaeological tour of Ballaleshwar Ganpati Temple (Pali) with stone-carved rain awnings, and safe strolls around historical village museum.",
        activityType: "Sheltered Heritage Walk",
        duration: "4 Hours",
        difficulty: "EASY",
        safetyRating: "99% (Urban Sheltered)",
        location: "Pali Town",
        costImpact: "REFUND_DIFFERENCE"
      },
      {
        id: "pvt-d-2",
        title: "Kundalika River Sheltered Homestay & Authentic Kokani Lunch",
        description: "Cozy riverside stay in premium reinforced brick chalets. Watch the rains safely from glass balconies, enjoy live local koli/konkan style cooking class inside, safe away from the high mountain torrents.",
        activityType: "Indoor Luxury Homestay & Gastronomy",
        duration: "8 Hours",
        difficulty: "EASY",
        safetyRating: "99% (Reinforced Chalet)",
        location: "Kolad",
        costImpact: "SLIGHT_UPGRADE_FREE"
      },
      {
        id: "pvt-d-3",
        title: "Kolad Indoor Pottery Workshop & Local Arts Exploration",
        description: "Undergo an active workshop with professional local clay pottery masters. Cozy village setting inside fully-roofed dry pavilions, far away from wild waterfall gorges.",
        activityType: "Indoor Craft Workshop",
        duration: "4 Hours",
        difficulty: "EASY",
        safetyRating: "100% (Indoor Safe-Zone)",
        location: "Kolad Village",
        costImpact: "NO_EXTRA_COST"
      }
    ];
  }
};

// --- API ENDPOINTS ---

// 1. Get database schema details for Prisma Schema visualization
app.get("/api/database-schema", (req, res) => {
  const prismaSchema = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  phone     String
  bookings  Booking[]
}

model Operator {
  id                 String    @id @default(uuid())
  name               String
  tourCompany        String
  trustScore         Int       @default(80) // Computed dynamically based on pivot adoption
  verified           Boolean   @default(false)
  completedTours     Int       @default(0)
  safetyAuditsCount  Int       @default(0)
  bookings           Booking[]
}

model TripItinerary {
  id                        String    @id @default(uuid())
  originalTrekName          String
  region                    String
  originalDifficulty        String    // EASY, MODERATE, CHALLENGING, EXTREME
  weather_dependency_status String    // LOW, MEDIUM, HIGH
  originalDurationHours     Int
  originalMaxAltitudeFeet   Int
  description               String
}

model Booking {
  id                   String    @id @default(uuid())
  userId               String
  user                 User      @relation(fields: [userId], references: [id])
  operatorId           String
  operator             Operator  @relation(fields: [operatorId], references: [id])
  originalItineraryId  String
  originalItineraryName String
  bookingDate          String
  status               String    // CONFIRMED, WEATHER_ALERT, PIVOT_PROPOSED, PIVOTED, CANCELLED
  currentItinerary     String    // Current details
  weatherStatus        String    // SUNNY, LIGHT_RAIN, HEAVY_STORM, LANDSLIDE_ALERT
  pivotOptions         Json?     // List of offered alternatives
  pivotHistory         Json      // Log of triggers and acceptances (JSONB)
}`;

  res.json({ schema: prismaSchema });
});

// 2. Get bookings list
app.get("/api/bookings", (req, res) => {
  res.json({ bookings, operators });
});

// 3. Simulate Weather Alert
app.post("/api/bookings/:id/simulate-weather", (req, res) => {
  const { id } = req.params;
  const { weather } = req.body; // e.g. "HEAVY_STORM" or "LANDSLIDE_ALERT" or "SUNNY"

  const bookingIndex = bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const booking = bookings[bookingIndex];
  booking.weatherStatus = weather;

  if (weather === "HEAVY_STORM" || weather === "LANDSLIDE_ALERT") {
    booking.status = "PIVOT_PROPOSED";
    booking.selectedPivotIndex = null;
    booking.pivotOptions = getFallbackPivots(booking.originalItineraryName, booking.originalItineraryName);
    
    // Ensure price is set on pivot options
    booking.pivotOptions = booking.pivotOptions.map((opt, idx) => ({
      ...opt,
      price: opt.price || (idx === 0 ? "₹1,200" : idx === 1 ? "₹1,500" : "₹900")
    }));

    // Add weather warning history
    booking.pivotHistory.unshift({
      timestamp: new Date().toISOString(),
      triggerEvent: `SIMULATED_${weather}`,
      reason: `High risk weather detected: ${weather}. Proactive TrekShift auto-rerouting triggered with 3 weathertight pivots.`,
      offeredPivotsCount: booking.pivotOptions.length,
      acceptedPivotTitle: null
    });
  } else if (weather === "LIGHT_RAIN") {
    booking.status = "WEATHER_ALERT";
    booking.pivotOptions = [];
    booking.selectedPivotIndex = null;
    booking.pivotHistory.unshift({
      timestamp: new Date().toISOString(),
      triggerEvent: "SIMULATED_LIGHT_RAIN",
      reason: "Light precipitation. Booking placed on watch alert.",
      offeredPivotsCount: 0,
      acceptedPivotTitle: null
    });
  } else {
    booking.status = "CONFIRMED";
    booking.pivotOptions = [];
    booking.selectedPivotIndex = null;
    booking.pivotHistory.unshift({
      timestamp: new Date().toISOString(),
      triggerEvent: "SIMULATED_SUNNY",
      reason: "Clear blue skies. Trip operating under normal confirmed parameters.",
      offeredPivotsCount: 0,
      acceptedPivotTitle: null
    });
  }

  res.json({ message: "Weather simulated successfully", booking });
});

// 4. Generate AI Pivots via Gemini
app.post("/api/bookings/:id/pivot", async (req, res) => {
  const { id } = req.params;
  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const originalItineraryName = booking.originalItineraryName;
  const originalDetails = booking.currentItineraryDetails;
  const weatherStatus = booking.weatherStatus;

  // Let's create a solid prompt
  const systemPrompt = `You are the core of TrekShift: the Monsoon-Proof AI Pivot Agent.
Your task is to take an endangered adventure trek in Maharashtra during the monsoon, and generate 3 alternative, highly secure, weather-proof itineraries in the SAME general region (within 30-50km max), allowing tourists to pivot seamlessly.

CRITICAL RULES:
1. Every alternative must be safe, low-altitude, sheltered, or indoor (e.g. historical caves, sheltered heritage sites, secure luxury agrotourism, indoor workshops, sheltered gastronomy/fort shelters). No high-altitude exposed ridges, active deep water waterfalls, or landslide-vulnerable peaks.
2. The alternative options MUST be geographically accurate and real spots in Maharashtra (near Lonavala, Junnar, Tamhini, Malshej, Kolad, Pali, Pune).
3. Keep the alternatives highly attractive but with a 95%+ weather-proof safety rating.
4. Output exactly 3 distinct options.

Format the response as a valid JSON array of objects conforming to the provided structure. Do not output markdown, codeblocks, or extra text. Output ONLY the raw JSON array.`;

  const prompt = `Original endangered adventure: "${originalItineraryName}"
Original activity details: "${originalDetails}"
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

  let pivotOptions: PivotOption[] = [];
  let methodUsed = "Premium Fallback Generator";

  if (ai) {
    try {
      console.log(`Calling Gemini Model gemini-3.5-flash to pivot trek: ${originalItineraryName}...`);
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
                costImpact: { type: Type.STRING, description: "Must be NO_EXTRA_COST, REFUND_DIFFERENCE, or SLIGHT_UPGRADE_FREE" }
              },
              required: ["title", "description", "activityType", "duration", "difficulty", "safetyRating", "location", "costImpact"]
            }
          }
        }
      });

      const text = response.text?.trim() || "";
      if (text) {
        pivotOptions = JSON.parse(text);
        methodUsed = "Gemini 3.5 Flash Live API";
        console.log("Pivots generated by Gemini successful.");
      }
    } catch (err) {
      console.error("Gemini pivot generation failed, routing to local generator:", err);
    }
  }

  // Fallback if Gemini failed or is not configured
  if (!pivotOptions || pivotOptions.length === 0) {
    pivotOptions = getFallbackPivots(originalItineraryName, originalItineraryName);
  }

  // Apply to booking
  booking.pivotOptions = pivotOptions;
  booking.status = "PIVOT_PROPOSED";

  // Record generation event in history
  booking.pivotHistory.unshift({
    timestamp: new Date().toISOString(),
    triggerEvent: `PIVOTS_GENERATED_${methodUsed.toUpperCase()}`,
    reason: `Successfully formulated 3 micro-geographical, weatherproof alternatives utilizing ${methodUsed}.`,
    offeredPivotsCount: pivotOptions.length,
    acceptedPivotTitle: null
  });

  res.json({ booking, methodUsed });
});

// 5. Accept Pivot & Rebook
app.post("/api/bookings/:id/accept-pivot", (req, res) => {
  const { id } = req.params;
  const { pivotIndex } = req.body; // index of accepted pivot

  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (pivotIndex === undefined || pivotIndex < 0 || pivotIndex >= booking.pivotOptions.length) {
    return res.status(400).json({ error: "Invalid pivot index" });
  }

  const selectedPivot = booking.pivotOptions[pivotIndex];
  booking.selectedPivotIndex = pivotIndex;
  booking.status = "PIVOTED";
  booking.currentItineraryDetails = `[REROUTED SAFE MONSOON PLAN] ${selectedPivot.title} located at ${selectedPivot.location}. Activity Type: ${selectedPivot.activityType}. Duration: ${selectedPivot.duration}. Safety assurance: ${selectedPivot.safetyRating}.`;

  // Dynamic Operator Trust Score Logic:
  // Because the operator offered a seamless, beautiful weatherproof pivot instead of a last-minute cancellation,
  // we increase their OperatorTrustScore by 5 points (capped at 100).
  const operator = operators.find(op => op.id === booking.operatorId);
  let oldScore = 80;
  if (operator) {
    oldScore = operator.trustScore;
    operator.trustScore = Math.min(100, operator.trustScore + 6);
    operator.completedTours += 1;
  }

  // Update history
  booking.pivotHistory.unshift({
    timestamp: new Date().toISOString(),
    triggerEvent: "PIVOT_ACCEPTED_BY_TOURIST",
    reason: `User accepted alternative rebooking option: "${selectedPivot.title}". Proactive booking rerouted at zero surcharge. Operator Trust Score increased from ${oldScore}% to ${operator?.trustScore}%.`,
    offeredPivotsCount: booking.pivotOptions.length,
    acceptedPivotTitle: selectedPivot.title
  });

  res.json({ booking, operator, message: "Pivot successfully booked!" });
});


// --- SERVING VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TrekShift Full-Stack Backend running at http://localhost:${PORT}`);
  });
}

startServer();
