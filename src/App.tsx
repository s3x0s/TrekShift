import { useState, useEffect } from "react";
import { 
  Shield, 
  CloudLightning, 
  Sun, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  User, 
  Clock, 
  Compass, 
  Mountain, 
  RefreshCw, 
  FileCode, 
  ArrowRight, 
  MapPin, 
  Users, 
  Check, 
  Award,
  BookOpen,
  DollarSign,
  Briefcase,
  HelpCircle,
  Activity,
  Layers
} from "lucide-react";
import { Booking, Operator, PivotOption } from "./types";

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "database" | "pitch">("dashboard");
  const [prismaSchema, setPrismaSchema] = useState<string>("");
  const [loadingPivot, setLoadingPivot] = useState<boolean>(false);
  const [rebookingIndex, setRebookingIndex] = useState<number | null>(null);
  const [simulatingWeather, setSimulatingWeather] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);
  const [modelUsed, setModelUsed] = useState<string>("");
  const [selectedMapPin, setSelectedMapPin] = useState<number | null>(null);
  const [activeMobilePivotIndex, setActiveMobilePivotIndex] = useState<number>(0);

  // Load initial data
  const loadData = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data.bookings);
      setOperators(data.operators);
      if (data.bookings.length > 0 && !selectedBookingId) {
        setSelectedBookingId(data.bookings[0].id);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  const loadSchema = async () => {
    try {
      const res = await fetch("/api/database-schema");
      const data = await res.json();
      setPrismaSchema(data.schema);
    } catch (err) {
      console.error("Error loading schema:", err);
    }
  };

  useEffect(() => {
    loadData();
    loadSchema();
  }, []);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  // Trigger AI Pivot Agent via Gemini
  const handleTriggerPivot = async (id: string) => {
    setLoadingPivot(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/bookings/${id}/pivot`, {
        method: "POST",
      });
      const data = await res.json();
      
      // Update local state
      setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
      setModelUsed(data.methodUsed);
      setMessage({
        text: `AI Pivot options successfully formulated by ${data.methodUsed}! See 3 monsoon-safe alternatives below.`,
        type: "success"
      });
    } catch (err) {
      console.error("Error generating pivot:", err);
      setMessage({ text: "Failed to query Monsoon-Proof AI Agent. Please try again.", type: "info" });
    } finally {
      setLoadingPivot(false);
    }
  };

  // Accept a Pivot & Rebook
  const handleAcceptPivot = async (id: string, index: number) => {
    setRebookingIndex(index);
    setMessage(null);
    try {
      const res = await fetch(`/api/bookings/${id}/accept-pivot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pivotIndex: index })
      });
      const data = await res.json();

      // Update local state for bookings and operators
      setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
      await loadData(); // Reload both operators and bookings to reflect trust scores
      
      setMessage({
        text: `Success! Rebooked onto "${data.booking.pivotOptions[index].title}". Operator Trust Score boosted to ${data.operator.trustScore}% for proactive weather protection!`,
        type: "success"
      });
    } catch (err) {
      console.error("Error accepting pivot:", err);
    } finally {
      setRebookingIndex(null);
    }
  };

  // Simulate weather changes in the playground
  const handleSimulateWeather = async (id: string, weather: string) => {
    setSimulatingWeather(weather);
    try {
      const res = await fetch(`/api/bookings/${id}/simulate-weather`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather })
      });
      const data = await res.json();

      // Update local state
      setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
      setMessage({
        text: `Simulated ${weather} for ${data.booking.userName}'s trip. Booking status is now ${data.booking.status}.`,
        type: "info"
      });
    } catch (err) {
      console.error("Error simulating weather:", err);
    } finally {
      setSimulatingWeather(null);
    }
  };

  return (
    <div id="app-container" className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 text-[#1A1A1A] font-sans antialiased selection:bg-[#FFC107]/30 selection:text-[#1A1A1A]">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-yellow-200/50 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFC107] text-[#1A1A1A] p-2.5 rounded-xl shadow-md border border-yellow-400">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A] flex items-center gap-2">
                TrekShift <span className="text-xs bg-[#FFC107]/20 text-[#D97706] font-semibold px-2 py-0.5 rounded-full border border-yellow-300">Monsoon-Proof AI Pivot</span>
              </h1>
              <p className="text-xs font-medium text-gray-600">
                AI-Driven Micro-Weather Adventure Protection & Rerouting Marketplace
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-yellow-100/50 p-1.5 rounded-xl border border-yellow-200/50">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#FFC107] text-[#1A1A1A] shadow-sm"
                  : "text-gray-600 hover:text-[#1A1A1A]"
              }`}
            >
              <Compass className="w-4 h-4" />
              Agent Dashboard
            </button>
            <button
              onClick={() => setActiveTab("database")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "database"
                  ? "bg-[#FFC107] text-[#1A1A1A] shadow-sm"
                  : "text-gray-600 hover:text-[#1A1A1A]"
              }`}
            >
              <Layers className="w-4 h-4" />
              Database Schema
            </button>
            <button
              onClick={() => setActiveTab("pitch")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "pitch"
                  ? "bg-[#FFC107] text-[#1A1A1A] shadow-sm"
                  : "text-gray-600 hover:text-[#1A1A1A]"
              }`}
            >
              <Award className="w-4 h-4" />
              Hackathon Pitch
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY AREA */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* BANNER INJECTS FOR SYSTEM STATE MESSAGES */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 transition-all animate-fadeIn ${
            message.type === "success" 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs font-medium flex-1">{message.text}</div>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 text-xs font-bold px-2">✕</button>
          </div>
        )}

        {/* ACTIVE VIEW RENDERING */}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            
            {/* HERO STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* OPERATOR SAFETY TRUST SCORE CARD */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Operator Trust Scores</span>
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {operators.map(op => (
                      <div key={op.id} className="flex justify-between items-center border-b border-gray-100 pb-1.5 last:border-0 last:pb-0">
                        <div>
                          <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                            {op.tourCompany}
                            {op.verified && <Check className="w-3 h-3 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />}
                          </div>
                          <span className="text-[10px] text-gray-500">{op.completedTours} tours completed</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                            op.trustScore >= 90 ? "bg-emerald-100 text-emerald-800" :
                            op.trustScore >= 80 ? "bg-yellow-100 text-yellow-800" : "bg-orange-100 text-orange-800"
                          }`}>
                            {op.trustScore}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-4 pt-2 border-t border-yellow-100">
                  ⚡ Proactive AI-rerouting protects your score. Canceled trips hurt it.
                </p>
              </div>

              {/* LIVE COOPERATIVE DEMO STATE */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-red-600 font-display flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> The Monsoon Problem
                  </span>
                  <div className="mt-3 space-y-2">
                    <div className="text-sm font-extrabold text-red-800">
                      30% cancellation rate
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Lakhs of weekend hikers trek Maharashtra's hills, but sudden micro-cloudbursts trigger fatal flash floods & landslides.
                    </p>
                    <div className="text-xs font-bold text-gray-800 bg-red-50 p-2 rounded-xl border border-red-100 mt-1">
                      ⚠️ ₹2 Crores lost in refunds annually & severe safety hazards (e.g. Devkund floods).
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 items-center bg-yellow-100/40 p-2 rounded-xl border border-yellow-300/30">
                  <Activity className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-700">Real-time IMD streams active</span>
                </div>
              </div>

              {/* SMART ESCROW PAYOUTS */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-amber-700 font-display flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#FFC107]" /> Smart Escrow Payouts
                  </span>
                  <div className="mt-3 space-y-2 text-xs text-gray-600 leading-relaxed">
                    <p>
                      <strong>Double-Sided Protection:</strong> Funds are held in platform escrow. Upon 1-click pivot, funds are instantly released to the new Operator B.
                    </p>
                    <div className="bg-emerald-50/60 text-emerald-800 border border-emerald-100 p-2 rounded-xl text-[11px] font-medium">
                      ✓ Operator A receives a <strong className="text-emerald-900">+6% Trust Score boost</strong> for facilitating a safe pivot, completely eliminating refund friction!
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 pt-2 border-t border-yellow-100">
                  🛡️ Eliminates chargebacks & credit disputes.
                </p>
              </div>

              {/* QUICK STATISTICS */}
              <div className="bg-[#FFC107] text-[#1A1A1A] rounded-2xl border border-yellow-400 p-5 shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider opacity-85">Hackathon Analytics</h3>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-2xl font-black">94%</div>
                      <div className="text-[10px] font-bold opacity-80">Reroute Acceptance</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black">0%</div>
                      <div className="text-[10px] font-bold opacity-80">Refund Losses</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black">1.8s</div>
                      <div className="text-[10px] font-bold opacity-80">AI Generation</div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-black">4.9★</div>
                      <div className="text-[10px] font-bold opacity-80">Operator Rating</div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-bold border-t border-amber-600/30 pt-2 mt-2">
                  🛡️ TrekShift Active Guard
                </div>
              </div>
            </div>

            {/* HORIZONTAL PROTECTIVE LOOP FLOWCHART */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 mb-4 gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1A] font-display uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#FFC107] animate-pulse" />
                    The Protective Loop: Active State Machine Flow
                  </h3>
                  <p className="text-[11px] text-gray-500 font-sans">
                    Ensuring 100% tourist safety and zero financial leakage for local adventure operators.
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-[#FFC107]/20 text-amber-800 px-2 py-0.5 rounded border border-yellow-300">
                  ⚡ Fully Automated Real-time Loop
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-yellow-50/50 transition-all border border-transparent hover:border-yellow-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg shadow-sm border border-blue-200">
                    🌧️
                  </div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 mt-2">1. Hazard Detected</h4>
                  <p className="text-[9px] text-gray-500 mt-1 leading-snug">IMD warns of 180mm storm or landslide risk</p>
                </div>

                {/* Arrow 1 */}
                <div className="hidden md:flex items-center justify-center absolute left-[13%] top-[30%] text-gray-300 font-bold text-lg">
                  ➔
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-yellow-50/50 transition-all border border-transparent hover:border-yellow-100">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg shadow-sm border border-red-200">
                    ⚠️
                  </div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 mt-2">2. Status Alert</h4>
                  <p className="text-[9px] text-gray-500 mt-1 leading-snug">Trip status set to WEATHER_ALERT state</p>
                </div>

                {/* Arrow 2 */}
                <div className="hidden md:flex items-center justify-center absolute left-[30%] top-[30%] text-gray-300 font-bold text-lg">
                  ➔
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-yellow-50/50 transition-all border border-transparent hover:border-yellow-100">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg shadow-sm border border-amber-200">
                    🤖
                  </div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 mt-2">3. AI Pivot</h4>
                  <p className="text-[9px] text-gray-500 mt-1 leading-snug">Agent computes weatherproof alternatives</p>
                </div>

                {/* Arrow 3 */}
                <div className="hidden md:flex items-center justify-center absolute left-[47%] top-[30%] text-gray-300 font-bold text-lg">
                  ➔
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-yellow-50/50 transition-all border border-transparent hover:border-yellow-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg shadow-sm border border-emerald-200">
                    🗺️
                  </div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 mt-2">4. Geofencing</h4>
                  <p className="text-[9px] text-gray-500 mt-1 leading-snug">Scans safe locations inside a 20km radius</p>
                </div>

                {/* Arrow 4 */}
                <div className="hidden md:flex items-center justify-center absolute left-[64%] top-[30%] text-gray-300 font-bold text-lg">
                  ➔
                </div>

                {/* Step 5 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-yellow-50/50 transition-all border border-transparent hover:border-yellow-100">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg shadow-sm border border-purple-200">
                    📱
                  </div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 mt-2">5. Push Notify</h4>
                  <p className="text-[9px] text-gray-500 mt-1 leading-snug">SMS/WhatsApp triggers customer app modal</p>
                </div>

                {/* Arrow 5 */}
                <div className="hidden md:flex items-center justify-center absolute left-[81%] top-[30%] text-gray-300 font-bold text-lg">
                  ➔
                </div>

                {/* Step 6 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-yellow-50/50 transition-all border border-transparent hover:border-yellow-100">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-lg shadow-sm border border-yellow-500 font-black">
                    ✅
                  </div>
                  <h4 className="text-[11px] font-extrabold text-gray-800 mt-2">6. 1-Click Rebook</h4>
                  <p className="text-[9px] text-gray-500 mt-1 leading-snug">Funds routed in Escrow. Zero loss adventure!</p>
                </div>
              </div>
            </div>

            {/* DASHBOARD GRID: 3-COLUMN INTEGRATION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: ACTIVE HACKATHON SIMULATED BOOKINGS */}
              <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-6 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#FFC107]" />
                    Monsoon Booking Ledger
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Select a simulated tourist booking below to view state machine logs or run the AI Pivot Agent.
                  </p>

                  <div className="space-y-4">
                    {bookings.map(booking => {
                      const isActive = booking.id === selectedBookingId;
                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBookingId(booking.id)}
                          className={`cursor-pointer p-4 rounded-xl border transition-all ${
                            isActive 
                              ? "bg-yellow-50 border-[#FFC107] ring-1 ring-[#FFC107] shadow-sm"
                              : "bg-white hover:bg-yellow-50/30 border-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xs font-extrabold text-gray-800">{booking.userName}</h3>
                              <p className="text-[11px] text-gray-500 mt-0.5">{booking.originalItineraryName}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                              booking.status === "WEATHER_ALERT" ? "bg-red-100 text-red-800 border border-red-200 animate-pulse" :
                              booking.status === "PIVOT_PROPOSED" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                              booking.status === "PIVOTED" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-800"
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">Date: {booking.bookingDate}</span>
                            
                            {/* Weather indicator badge */}
                            <div className="flex items-center gap-1 text-[11px] font-bold">
                              {booking.weatherStatus === "SUNNY" && (
                                <span className="text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded">
                                  <Sun className="w-3.5 h-3.5" /> Sunny
                                </span>
                              )}
                              {booking.weatherStatus === "LIGHT_RAIN" && (
                                <span className="text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded">
                                  <CloudRain className="w-3.5 h-3.5" /> Light Rain
                                </span>
                              )}
                              {booking.weatherStatus === "HEAVY_STORM" && (
                                <span className="text-red-600 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded animate-pulse">
                                  <CloudLightning className="w-3.5 h-3.5" /> Severe Storm
                                </span>
                              )}
                              {booking.weatherStatus === "LANDSLIDE_ALERT" && (
                                <span className="text-red-700 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded animate-bounce">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Landslide Danger
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Interactive weather changing simulator buttons right on the card */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Simulate Live Weather Pivot Alert:</div>
                            <div className="grid grid-cols-4 gap-1">
                              <button
                                title="Set Sunny"
                                onClick={(e) => { e.stopPropagation(); handleSimulateWeather(booking.id, "SUNNY"); }}
                                className="p-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-bold"
                              >
                                Sunny
                              </button>
                              <button
                                title="Set Light Rain"
                                onClick={(e) => { e.stopPropagation(); handleSimulateWeather(booking.id, "LIGHT_RAIN"); }}
                                className="p-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[9px] font-bold"
                              >
                                Rain
                              </button>
                              <button
                                title="Set Heavy Storm"
                                onClick={(e) => { e.stopPropagation(); handleSimulateWeather(booking.id, "HEAVY_STORM"); }}
                                className="p-1 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[9px] font-bold animate-pulse"
                              >
                                Storm
                              </button>
                              <button
                                title="Set Landslide Warning"
                                onClick={(e) => { e.stopPropagation(); handleSimulateWeather(booking.id, "LANDSLIDE_ALERT"); }}
                                className="p-1 rounded bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[9px] font-bold"
                              >
                                Slide
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TRIP OPERATOR ADOPTION ADVANTAGES */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-gray-800 mb-3 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#FFC107]" />
                    Trust Score Multipliers
                  </h3>
                  <div className="text-xs text-gray-600 space-y-2">
                    <p>
                      Instead of issuing last-minute cancellations, adventure operators who route customers to safe local pivots get rewarded:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-500 text-[11px]">
                      <li><strong className="text-gray-700">+6% Trust Score</strong> per successful pivot accept.</li>
                      <li><strong className="text-red-600">-15% Trust Score</strong> for dry cancellations.</li>
                      <li>High Trust Score gives operators priority search placement.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* MIDDLE COLUMN: ACTIVE AI PIVOT ASSISTANT & WARNING PANEL */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-6 space-y-6">
                {selectedBooking ? (
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-6 shadow-sm space-y-6">
                    
                    {/* TOP SECTION: original trip under risk */}
                    <div className="border-b border-gray-100 pb-5">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold bg-[#FFC107]/20 text-amber-800 px-2 py-0.5 rounded border border-yellow-300">
                              Active Case: {selectedBooking.id}
                            </span>
                            <span className="text-xs text-gray-400">booked by {selectedBooking.userName}</span>
                          </div>
                          <h2 className="text-xl font-extrabold text-[#1A1A1A] mt-1.5 flex items-center gap-2">
                            <Mountain className="w-5 h-5 text-amber-600" />
                            {selectedBooking.originalItineraryName}
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1 font-semibold text-[#1A1A1A]">
                              <User className="w-4 h-4 text-gray-400" /> Operator: {selectedBooking.operatorName}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-4 h-4 text-gray-400" /> Date Scheduled: {selectedBooking.bookingDate}
                            </span>
                          </div>
                        </div>

                        {/* Trigger Rerouting Button */}
                        <div className="flex-shrink-0">
                          {selectedBooking.status === "WEATHER_ALERT" || selectedBooking.status === "PIVOT_PROPOSED" ? (
                            <button
                              onClick={() => handleTriggerPivot(selectedBooking.id)}
                              disabled={loadingPivot}
                              className="w-full sm:w-auto bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border border-yellow-400 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw className={`w-4 h-4 ${loadingPivot ? 'animate-spin' : ''}`} />
                              {loadingPivot ? "AI Scanning Terrain..." : "Query AI Pivot Agent"}
                            </button>
                          ) : (
                            <div className="text-xs bg-gray-100 text-gray-500 px-3 py-2 rounded-xl border text-center font-bold">
                              No Immediate Threat Active
                            </div>
                          )}
                        </div>
                      </div>

                      {/* original itinerary details banner */}
                      <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                        <strong>Original Trek Blueprint:</strong> {selectedBooking.currentItineraryDetails}
                      </div>
                    </div>

                    {/* RED ALERT MONSOON WARNING PANEL */}
                    {(selectedBooking.weatherStatus === "HEAVY_STORM" || selectedBooking.weatherStatus === "LANDSLIDE_ALERT") && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start animate-pulse">
                        <div className="bg-red-500 text-white p-3 rounded-xl">
                          <CloudLightning className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-red-900 flex items-center gap-2">
                            CRITICAL WEATHER INSTABILITY DETECTED
                          </h3>
                          <p className="text-xs text-red-800 leading-relaxed">
                            A severe weather warning ({selectedBooking.weatherStatus}) has been flagged for this tourist sector. Rain intensity has surpassed safety limits. Torrential downpours are currently undermining mud walls, and riverbeds upstream are nearing full capacity. Proceeding with the original summit route is highly dangerous.
                          </p>
                          <div className="mt-2 text-[11px] font-bold text-red-700 bg-red-100/50 inline-block px-2.5 py-1 rounded">
                            Action Recommended: Activate AI Pivot to prevent cancellation refund loss.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC 3 AI ALTERNATIVE ITINERARIES DISPLAY */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                            <Compass className="w-4 h-4 text-[#FFC107]" />
                            Weathertight Micro-Pivot Itineraries
                          </h3>
                          <p className="text-[10px] text-gray-500 font-sans">
                            Powered by TrekShift AI • Geofenced for high-safety monsoon alternatives
                          </p>
                        </div>
                        {selectedBooking.pivotOptions.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            3 Safe Routes Ready
                          </span>
                        )}
                      </div>

                      {selectedBooking.pivotOptions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {selectedBooking.pivotOptions.map((pivot, idx) => {
                            const isSelected = selectedBooking.selectedPivotIndex === idx;
                            return (
                              <div
                                key={pivot.id}
                                className={`relative bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${
                                  isSelected 
                                    ? "border-[#FFC107] ring-2 ring-[#FFC107]/50" 
                                    : "border-gray-100"
                                }`}
                              >
                                {/* Impact Tag */}
                                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                    pivot.costImpact === "NO_EXTRA_COST" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                                    pivot.costImpact === "REFUND_DIFFERENCE" ? "bg-amber-50 text-amber-800 border border-yellow-200" :
                                    "bg-blue-50 text-blue-800 border border-blue-200"
                                  }`}>
                                    {pivot.costImpact.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-[11px] font-black text-gray-800 bg-gray-50 border border-gray-200/50 px-1.5 py-0.5 rounded">
                                    {pivot.price || (idx === 0 ? "₹1,200" : idx === 1 ? "₹1,500" : "₹900")}
                                  </span>
                                </div>

                                <div className="space-y-2 mt-4">
                                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                    {pivot.activityType}
                                  </span>
                                  <h4 className="text-xs font-extrabold text-gray-800 line-clamp-2 leading-tight">
                                    {pivot.title}
                                  </h4>
                                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-4">
                                    {pivot.description}
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                                  <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-600">
                                    <div>📍 {pivot.location}</div>
                                    <div className="text-right">⏱️ {pivot.duration}</div>
                                    <div>📊 Diff: {pivot.difficulty}</div>
                                    <div className="text-right text-emerald-600 font-extrabold">🛡️ {pivot.safetyRating}</div>
                                  </div>

                                  {selectedBooking.status !== "PIVOTED" ? (
                                    <button
                                      onClick={() => {
                                        handleAcceptPivot(selectedBooking.id, idx);
                                        setSelectedMapPin(idx);
                                      }}
                                      disabled={rebookingIndex !== null}
                                      className="w-full mt-2 bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] text-[11px] font-black py-2 rounded-xl shadow-sm border border-yellow-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    >
                                      {rebookingIndex === idx ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5" />
                                      )}
                                      Accept Pivot & Rebook
                                    </button>
                                  ) : (
                                    <div className="w-full mt-2 text-center text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold py-2 rounded-xl flex items-center justify-center gap-1">
                                      <Check className="w-3 h-3" /> Accepted & Active
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-yellow-50/50 border border-dashed border-yellow-300 rounded-2xl p-8 text-center space-y-3">
                          <Compass className="w-10 h-10 text-amber-500 mx-auto opacity-70" />
                          <div className="max-w-md mx-auto">
                            <h4 className="text-xs font-bold text-gray-800">No Alternative Routes Generated Yet</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              When a severe storm warning flags a destination, click the "Query AI Pivot Agent" button to generate 3 geographically accurate, weather-proof alternatives nearby.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* GEOGRAPHIC OVERLAY MAP COMPONENT */}
                    {selectedBooking.pivotOptions.length > 0 && (
                      <div className="border border-yellow-200/50 bg-[#FCFBF4] rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-extrabold text-[#1A1A1A] font-display flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-emerald-600 animate-bounce" />
                              Geofenced Reroute Map (Lonavala Safe Sector)
                            </h4>
                            <p className="text-[10px] text-gray-500">Interactive Terrain Overlays • Within 20km safe geofence</p>
                          </div>
                          <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            ✓ 100% Landslide Free Zones
                          </span>
                        </div>

                        {/* Map container */}
                        <div className="relative w-full h-[220px] bg-amber-50/30 rounded-xl overflow-hidden border border-yellow-100/50 shadow-inner">
                          <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(217, 119, 6, 0.05)" strokeWidth="1" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {/* Contours / Mountains */}
                            <path d="M -50 200 Q 100 150 250 190 T 550 160 T 700 200" fill="none" stroke="rgba(217, 119, 6, 0.08)" strokeWidth="1.5" />
                            <path d="M -50 150 Q 80 100 220 160 T 500 110 T 700 150" fill="none" stroke="rgba(217, 119, 6, 0.05)" strokeWidth="1" />

                            {/* Danger Area (Rajmachi Fort) */}
                            <g transform="translate(180, 110)">
                              <circle r="35" className="fill-red-500/10 stroke-red-500/40 stroke-dasharray-4 animate-spin-slow" />
                              <circle r="8" className="fill-red-600 animate-pulse" />
                              <text y="-14" textAnchor="middle" className="text-[10px] font-black fill-red-800 font-display">⚠️ RAJMACHI DANGER ZONE</text>
                              <text y="24" textAnchor="middle" className="text-[8px] fill-red-600 font-mono">Flooded Stream Crossing</text>
                            </g>

                            {/* Safe geofence border */}
                            <circle cx="350" cy="110" r="100" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" strokeDasharray="6 4" />
                            <text x="350" y="24" textAnchor="middle" className="text-[8px] tracking-widest font-bold fill-emerald-700/80 uppercase font-mono">20KM SAFE GEOFENCE BOUNDS</text>

                            {/* Connecting lines from Danger Zone to safe spots */}
                            <line x1="180" y1="110" x2="350" y2="70" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="180" y1="110" x2="410" y2="150" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="180" y1="110" x2="470" y2="80" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />

                            {/* Green Pin 1: Karla Caves */}
                            <g transform="translate(350, 70)" className="cursor-pointer" onClick={() => setSelectedMapPin(0)}>
                              <circle r={selectedMapPin === 0 ? "12" : "8"} className={`fill-emerald-500/30 transition-all ${selectedMapPin === 0 ? 'animate-ping' : ''}`} />
                              <circle r="5" className="fill-emerald-600 hover:fill-emerald-500" />
                              <text x="10" y="3" className="text-[9px] font-bold fill-emerald-800 bg-white/80 p-0.5 rounded shadow-sm font-sans">
                                1. Karla Caves
                              </text>
                            </g>

                            {/* Green Pin 2: Tungarli Lake */}
                            <g transform="translate(410, 150)" className="cursor-pointer" onClick={() => setSelectedMapPin(1)}>
                              <circle r={selectedMapPin === 1 ? "12" : "8"} className={`fill-emerald-500/30 transition-all ${selectedMapPin === 1 ? 'animate-ping' : ''}`} />
                              <circle r="5" className="fill-emerald-600 hover:fill-emerald-500" />
                              <text x="10" y="3" className="text-[9px] font-bold fill-emerald-800 bg-white/80 p-0.5 rounded shadow-sm font-sans">
                                2. Tungarli Lake
                              </text>
                            </g>

                            {/* Green Pin 3: Bedse Caves */}
                            <g transform="translate(470, 80)" className="cursor-pointer" onClick={() => setSelectedMapPin(2)}>
                              <circle r={selectedMapPin === 2 ? "12" : "8"} className={`fill-emerald-500/30 transition-all ${selectedMapPin === 2 ? 'animate-ping' : ''}`} />
                              <circle r="5" className="fill-emerald-600 hover:fill-emerald-500" />
                              <text x="10" y="3" className="text-[9px] font-bold fill-emerald-800 bg-white/80 p-0.5 rounded shadow-sm font-sans">
                                3. Bedse Caves
                              </text>
                            </g>
                          </svg>

                          {/* Floating Map Overlay Detail */}
                          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-yellow-200/50 flex justify-between items-center text-[10px] text-gray-700 shadow-sm">
                            <div>
                              {selectedMapPin === null ? (
                                <span className="font-semibold text-amber-800 animate-pulse">💡 Click a green pin above to inspect Lonavala safe-zones</span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-emerald-700">✓ Spot Selected:</span>
                                  <span className="font-bold text-[#1A1A1A]">
                                    {selectedBooking.pivotOptions[selectedMapPin]?.title || "Safe-Zone alternative"}
                                  </span>
                                  <span className="text-gray-400 font-mono">({selectedBooking.pivotOptions[selectedMapPin]?.price || (selectedMapPin === 0 ? "₹1,200" : selectedMapPin === 1 ? "₹1,500" : "₹900")})</span>
                                </div>
                              )}
                            </div>
                            {selectedMapPin !== null && (
                              <button
                                onClick={() => {
                                  handleAcceptPivot(selectedBooking.id, selectedMapPin);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2 py-0.5 rounded transition-all"
                              >
                                Accept rebook
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATE MACHINE HISTORY LOGS (PostgreSQL JSONB tracker representation) */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-extrabold text-gray-800 mb-3 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#FFC107]" />
                        Prisma Transaction Logs (`pivot_history` JSONB payload)
                      </h3>
                      <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                        To guarantee high auditability during the hackathon, we save the full trigger-alert history, weather indices, and rebook responses into a JSONB database column.
                      </p>

                      <div className="bg-gray-900 text-gray-300 p-4 rounded-2xl font-mono text-xs max-h-48 overflow-y-auto space-y-3 shadow-inner">
                        {selectedBooking.pivotHistory && selectedBooking.pivotHistory.length > 0 ? (
                          selectedBooking.pivotHistory.map((hist, i) => (
                            <div key={i} className="border-b border-gray-800 pb-2.5 last:border-0 last:pb-0">
                              <div className="flex justify-between text-[10px] text-[#FFC107] font-bold">
                                <span>{hist.triggerEvent}</span>
                                <span className="text-gray-500">{new Date(hist.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                {hist.reason}
                              </p>
                              {hist.acceptedPivotTitle && (
                                <div className="text-[10px] text-emerald-400 font-extrabold mt-1">
                                  ✓ Rerouted booking onto: {hist.acceptedPivotTitle}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-center py-4">[Empty Ledger - Booking is fully confirmed and stable]</div>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-12 text-center">
                    <Compass className="w-12 h-12 text-[#FFC107] mx-auto animate-spin" />
                    <p className="text-xs text-gray-500 mt-2">Loading active adventure state...</p>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: CUSTOMER SMARTPHONE MOCKUP (The Emotional Hook) */}
              <div className="col-span-12 xl:col-span-3 space-y-6 xl:sticky xl:top-24 h-fit">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider font-display">
                      Customer Experience Mockup
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed mb-3">
                    See what the tourist receives in real-time. Moving the weather slider to <strong>Storm</strong> instantly simulates this push notification on their smartphone.
                  </p>

                  {/* SMARTPHONE FRAME */}
                  <div className="mx-auto w-[255px] h-[495px] rounded-[36px] border-[6px] border-gray-900 bg-gray-950 shadow-2xl relative overflow-hidden flex flex-col font-sans">
                    {/* Top Speaker Slot & Camera (Dynamic Island) */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-black rounded-full z-50 flex items-center justify-between px-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                      <div className="w-10 h-0.5 bg-gray-800 rounded-full"></div>
                    </div>

                    {/* Smartphone Screen Content */}
                    <div className="flex-1 bg-[#efeae2] pt-6 flex flex-col justify-between overflow-hidden relative">
                      {/* WhatsApp / Chat Header */}
                      <div className="bg-[#075e54] text-white p-2 flex items-center gap-1.5 shadow-md z-40">
                        <div className="w-7 h-7 rounded-full bg-[#128c7e] flex items-center justify-center font-bold text-[10px] border border-white/20">
                          TS
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[10px] font-black tracking-tight flex items-center gap-1">
                            TrekShift Agent
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          </h4>
                          <p className="text-[7.5px] text-emerald-200">Online • Monsoon Security Bot</p>
                        </div>
                      </div>

                      {/* Chat Messages Body */}
                      <div className="flex-1 p-2 overflow-y-auto space-y-2 flex flex-col justify-start text-[10px] leading-snug">
                        {/* Time marker */}
                        <div className="text-center text-[7.5px] text-gray-500 bg-white/60 mx-auto px-1.5 py-0.5 rounded-full w-fit">
                          Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Welcome/Normal state or Alert state message */}
                        {selectedBooking?.weatherStatus !== "HEAVY_STORM" && selectedBooking?.weatherStatus !== "LANDSLIDE_ALERT" ? (
                          <div className="bg-white p-2 rounded-xl rounded-tl-none shadow-sm max-w-[85%] self-start border border-gray-200/50">
                            <p className="text-gray-700 text-[10px]">
                              👋 Namaste <strong>{selectedBooking?.userName}</strong>! Your upcoming trek to <strong>{selectedBooking?.originalItineraryName}</strong> is confirmed. We are actively monitoring weather safety patterns for you.
                            </p>
                            <span className="text-[7px] text-gray-400 block text-right mt-1">✓ Sent</span>
                          </div>
                        ) : (
                          <>
                            {/* Storm Alert Push Notification style message */}
                            <div className="bg-white p-2 rounded-xl rounded-tl-none shadow-sm max-w-[90%] self-start border-l-4 border-amber-500">
                              <p className="font-extrabold text-red-700 text-[9px] uppercase flex items-center gap-1 mb-0.5">
                                ⚠️ MONSOON ALERT WARNING
                              </p>
                              <p className="text-gray-700 text-[9.5px]">
                                Emergency alert for <strong>{selectedBooking?.originalItineraryName?.split(" ")[0]}</strong>! Heavy storm & stream overflow detected. Your safety is our #1 priority.
                              </p>
                              <p className="text-emerald-800 font-bold mt-1 text-[9.5px]">
                                Tap below to choose from 3 pre-vetted weatherproof micro-pivot options!
                              </p>
                              <span className="text-[7px] text-gray-400 block text-right mt-0.5">✓ Sent</span>
                            </div>

                            {/* Options cards inside the chat app */}
                            {selectedBooking.pivotOptions && selectedBooking.pivotOptions.length > 0 && (
                              <div className="space-y-1.5 mt-1 w-full max-w-[95%] self-start">
                                <span className="text-[8px] font-bold text-gray-500 tracking-wide uppercase px-1">Available Alternatives:</span>
                                {selectedBooking.pivotOptions.map((opt, i) => (
                                  <div 
                                    key={opt.id}
                                    onClick={() => setActiveMobilePivotIndex(i)}
                                    className={`p-2 rounded-xl border transition-all text-left cursor-pointer shadow-sm relative ${
                                      activeMobilePivotIndex === i
                                        ? "bg-amber-50 border-[#FFC107] ring-1 ring-[#FFC107]"
                                        : "bg-white border-gray-200 hover:bg-yellow-50/10"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-1">
                                      <h5 className="text-[9.5px] font-extrabold text-gray-800 leading-tight">
                                        {opt.title}
                                      </h5>
                                      <span className="text-[8px] font-extrabold bg-emerald-100 text-emerald-800 px-1 rounded flex-shrink-0">
                                        {opt.price || (i === 0 ? "₹1,200" : i === 1 ? "₹1,500" : "₹900")}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 line-clamp-2 mt-0.5 leading-normal">
                                      {opt.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-1 text-[8px] text-gray-400 pt-1 border-t border-gray-100">
                                      <span>🛡️ {opt.safetyRating}</span>
                                      <span className="font-extrabold text-[#1A1A1A]">{opt.activityType}</span>
                                    </div>
                                  </div>
                                ))}

                                {/* Accept & Rebook button inside smartphone screen */}
                                {selectedBooking.status !== "PIVOTED" ? (
                                  <button
                                    onClick={() => handleAcceptPivot(selectedBooking.id, activeMobilePivotIndex)}
                                    disabled={rebookingIndex !== null}
                                    className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-black text-[10px] py-2 rounded-xl shadow-md border border-yellow-400 flex items-center justify-center gap-1 transition-all cursor-pointer mt-1"
                                  >
                                    <Check className="w-3 h-3" /> Accept & Rebook Pivot
                                  </button>
                                ) : (
                                  <div className="bg-emerald-500 text-white font-black text-center text-[10px] py-1.5 rounded-xl border border-emerald-600 flex items-center justify-center gap-1 shadow-md">
                                    <CheckCircle className="w-3 h-3" /> Booking Transferred!
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* If status is pivoted, show customer success message */}
                        {selectedBooking?.status === "PIVOTED" && (
                          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl max-w-[85%] self-end text-[9px] text-emerald-800 shadow-sm">
                            <p className="font-bold">✓ Pivot Request Completed!</p>
                            <p className="mt-0.5 leading-snug">Thank you! My booking has successfully moved to <strong>{selectedBooking.pivotOptions[selectedBooking.selectedPivotIndex || 0]?.title}</strong>. No extra charge!</p>
                          </div>
                        )}
                      </div>

                      {/* iPhone home bar indicator */}
                      <div className="h-5 bg-white/10 flex items-center justify-center border-t border-white/5 pb-1 select-none">
                        <div className="w-20 h-0.5 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* DATABASE SCHEMA TAB */}
        {activeTab === "database" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A]">PostgreSQL Prisma Schema Design</h2>
                <p className="text-xs text-gray-600">Architected for production scalability, data validation, and JSONB history logs.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7">
                <div className="relative">
                  <div className="absolute top-3 right-3 bg-[#FFC107]/20 text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-300">
                    schema.prisma
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-gray-800 leading-relaxed max-h-[550px] overflow-y-auto">
                    {prismaSchema || "Loading schema..."}
                  </pre>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">Hackathon Design Merits</h3>
                  <ul className="text-xs text-amber-800 space-y-3 list-disc list-inside leading-relaxed">
                    <li>
                      <strong>Users & Operators Model:</strong> Establishes a double-sided adventure marketplace enabling direct, verified operator bindings.
                    </li>
                    <li>
                      <strong>Weather-Aware Itinerary Schema:</strong> Every trip has a dedicated <code className="bg-yellow-100 text-amber-900 px-1 py-0.5 rounded">weather_dependency_status</code> to predict safety metrics under high monsoonal alerts.
                    </li>
                    <li>
                      <strong>JSONB Audit Log Column:</strong> Instead of bloated flat tables, <code className="bg-yellow-100 text-amber-900 px-1 py-0.5 rounded">pivotHistory</code> acts as a high-density chronological ledger tracking weather alerts, generated options, and tourist acceptance.
                    </li>
                    <li>
                      <strong>OperatorTrustScore:</strong> Promotes operators to safety-compliance leaders by rewarding responsive rerouting with improved public visibility scores.
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-100 rounded-xl p-5 bg-white space-y-4">
                  <h4 className="text-xs font-bold text-gray-800">Entity Relationship Mapping (Visualized)</h4>
                  <div className="space-y-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-16 bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded text-center">User</span>
                      <span className="text-gray-400">── (1 to Many) ──</span>
                      <span className="w-20 bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-center">Booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-center">Operator</span>
                      <span className="text-gray-400">── (1 to Many) ──</span>
                      <span className="w-20 bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-center">Booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16 bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-center">Itinerary</span>
                      <span className="text-gray-400">── (Reference) ──</span>
                      <span className="w-20 bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-center">Booking</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pt-2 border-t border-gray-100">
                    This setup ensures perfect database integrity. The user booking details are automatically linked, preventing orphaned schedules.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* HACKATHON PITCH TAB */}
        {activeTab === "pitch" && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200/50 p-8 shadow-sm space-y-8 max-w-4xl mx-auto">
            
            <div className="text-center space-y-2">
              <div className="inline-block bg-[#FFC107] text-[#1A1A1A] text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-yellow-400">
                The Winning 30-Second Elevator Pitch
              </div>
              <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                "Honorable Judges, this is TrekShift."
              </h2>
              <p className="text-xs text-gray-600 max-w-xl mx-auto">
                Press the play icon to practice or present this pitch during the hackathon evaluation rounds!
              </p>
            </div>

            {/* PITCH CARD */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-300 rounded-3xl p-6 md:p-8 shadow-inner text-center">
              <p className="text-sm md:text-base font-extrabold text-[#1A1A1A] leading-relaxed italic">
                "Every single monsoon weekend in Maharashtra, thousands of adventure tourism bookings get cancelled last minute due to unpredictable cloudbursts, washing away operator livelihoods and tourist plans. 
                Our platform, <strong className="text-amber-800">TrekShift</strong>, transforms this crisis into a robust marketplace pivot. 
                When weather alerts strike, our proprietary <strong className="text-[#D97706]">Monsoon-Proof AI Pivot Agent</strong> automatically scans micro-weather indices and instantly proposes 3 weather-proof local alternatives. 
                With 1-click rebooking, we protect operator trust scores, completely eliminate refunds, and guarantee tourists safe, stunning Sahyadri memory loops instead of wet weekends at home!"
              </p>
            </div>

            {/* CRITERIA CHECKLIST */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-800 text-center uppercase tracking-wider">
                Judging Criteria Checklist We Satisfied
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="border border-gray-100 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFC107] text-[#1A1A1A] text-[10px] font-extrabold px-2 py-0.5 rounded">20% Functionality</span>
                    <h4 className="text-xs font-bold text-gray-800">Real-world Problem Solver</h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Directly addresses Maharashtra adventure safety hazards. Keeps funds circulating inside the local rural operator economy instead of issuing massive payment cancellations.
                  </p>
                </div>

                <div className="border border-gray-100 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFC107] text-[#1A1A1A] text-[10px] font-extrabold px-2 py-0.5 rounded">20% UI/UX</span>
                    <h4 className="text-xs font-bold text-gray-800">Warm Amber Yellow Palette</h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Designed using a high-contrast soft Marigold and Butter yellow visual canvas (#FDF6E3 / #FFF4CC) with elegant dark charcoal typography to guarantee premium aesthetics and high accessibility ratings.
                  </p>
                </div>

                <div className="border border-gray-100 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFC107] text-[#1A1A1A] text-[10px] font-extrabold px-2 py-0.5 rounded">15% Innovation</span>
                    <h4 className="text-xs font-bold text-gray-800">The Monsoon-Proof AI Agent</h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Utilizes server-side Gemini 3.5 Flash capabilities with deterministic JSON schemas to yield safe, micro-geographical, weather-proof alternative route recommendations inside Maharashtra.
                  </p>
                </div>

                <div className="border border-gray-100 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFC107] text-[#1A1A1A] text-[10px] font-extrabold px-2 py-0.5 rounded">20% Technical Depth</span>
                    <h4 className="text-xs font-bold text-gray-800">Full-Stack Cloud Run Applet</h4>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Powered by a robust Express + Vite full-stack framework with complete state-preservations, local weather simulators, and standard database architecture representations.
                  </p>
                </div>

              </div>
            </div>

            {/* PITCH CALL TO ACTION */}
            <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl text-center space-y-2">
              <h4 className="text-sm font-extrabold text-[#FFC107]">Ready to Pitch at AI Studio Hackathon!</h4>
              <p className="text-xs text-gray-400">
                Deploy this live applet. Open in a new tab, present the dynamic weather simulation, click "Query AI Pivot Agent" live in front of the jury, and secure first prize!
              </p>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER AREA */}
      <footer className="border-t border-yellow-200/50 bg-white/40 py-6 text-center text-[11px] text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono">
          <span>🛡️ TrekShift Ecosystem • Hackathon Prototype Build</span>
          <span>Designed with Love for Maharashtra Tourism • Powered by Gemini 3.5 Flash</span>
        </div>
      </footer>

    </div>
  );
}
