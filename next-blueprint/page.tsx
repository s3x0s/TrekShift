"use client";

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
  Check, 
  Award,
  BookOpen,
  Users,
  Activity,
  Layers
} from "lucide-react";

interface Booking {
  id: string;
  userName: string;
  originalItineraryName: string;
  bookingDate: string;
  status: string;
  currentItineraryDetails: string;
  weatherStatus: string;
  selectedPivotIndex: number | null;
  pivotOptions: PivotOption[];
  pivotHistory: any[];
}

interface PivotOption {
  id: string;
  title: string;
  description: string;
  activityType: string;
  duration: string;
  difficulty: string;
  safetyRating: string;
  location: string;
  costImpact: string;
}

export default function YellowThemeDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [loadingPivot, setLoadingPivot] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial simulated hackathon bookings
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings);
        if (data.bookings.length > 0) {
          setSelectedBookingId(data.bookings[0].id);
        }
      });
  }, []);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  const handleTriggerPivot = async (id: string) => {
    setLoadingPivot(true);
    try {
      const res = await fetch(`/api/bookings/${id}/pivot`, { method: "POST" });
      const data = await res.json();
      setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
      setMessage("AI Pivot options successfully formulated! See 3 monsoon-safe alternatives.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPivot(false);
    }
  };

  const handleAcceptPivot = async (id: string, index: number) => {
    try {
      const res = await fetch(`/api/bookings/${id}/accept-pivot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pivotIndex: index })
      });
      const data = await res.json();
      setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
      setMessage(`Success! Rebooked onto "${data.booking.pivotOptions[index].title}".`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 text-[#1A1A1A] font-sans antialiased">
      <header className="bg-white/80 backdrop-blur-md border-b border-yellow-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFC107] text-[#1A1A1A] p-2 rounded-xl shadow-md border border-yellow-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">TrekShift</h1>
              <p className="text-xs text-gray-600">Monsoon-Proof AI Pivot Agent</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {message && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Ledger List */}
          <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200 p-6 shadow-sm">
            <h2 className="text-sm font-extrabold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FFC107]" /> Adventure Ledger
            </h2>
            <div className="space-y-3">
              {bookings.map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    b.id === selectedBookingId ? "bg-yellow-50 border-[#FFC107]" : "bg-white border-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold">{b.userName}</h3>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">{b.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{b.originalItineraryName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pivot Action Console */}
          <div className="lg:col-span-8 bg-white/90 backdrop-blur-md rounded-2xl border border-yellow-200 p-6 shadow-sm space-y-6">
            {selectedBooking ? (
              <>
                <div className="flex justify-between items-start border-b border-gray-100 pb-5">
                  <div>
                    <h2 className="text-lg font-black flex items-center gap-2 text-[#1A1A1A]">
                      <Mountain className="w-5 h-5 text-amber-600" />
                      {selectedBooking.originalItineraryName}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Current Plan: {selectedBooking.currentItineraryDetails}</p>
                  </div>
                  <button
                    onClick={() => handleTriggerPivot(selectedBooking.id)}
                    disabled={loadingPivot}
                    className="bg-[#FFC107] hover:bg-[#FFB300] text-[#1A1A1A] font-bold text-xs px-4 py-2.5 rounded-xl border border-yellow-400 shadow flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPivot ? 'animate-spin' : ''}`} />
                    {loadingPivot ? "Computing..." : "Query AI Pivot Agent"}
                  </button>
                </div>

                {/* Weather Warn Panel */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                  <CloudLightning className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-900 uppercase">Monsoon Instability Alert</h4>
                    <p className="text-[11px] text-red-800 leading-relaxed mt-1">
                      IMD warning flagged. River catchment bounds overflowing. Avoid high peaks immediately.
                    </p>
                  </div>
                </div>

                {/* Alternating Options */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Proposed Reroutes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBooking.pivotOptions.map((opt, i) => (
                      <div key={opt.id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-extrabold uppercase">{opt.activityType}</span>
                          <h4 className="text-xs font-bold text-gray-800">{opt.title}</h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{opt.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                          <div className="text-[10px] text-gray-600">⏱️ {opt.duration} | 🛡️ {opt.safetyRating}</div>
                          {selectedBooking.status !== "PIVOTED" ? (
                            <button
                              onClick={() => handleAcceptPivot(selectedBooking.id, i)}
                              className="w-full bg-[#FFC107] text-[#1A1A1A] font-black text-[10px] py-1.5 rounded-lg border border-yellow-400 shadow-sm"
                            >
                              Accept Pivot & Rebook
                            </button>
                          ) : (
                            <div className="text-center text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold py-1.5 rounded-lg">✓ Accepted</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500">Select a ledger trip to monitor.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
