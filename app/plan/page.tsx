"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Settings2, CalendarDays } from "lucide-react";

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function PlanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allRoutines, setAllRoutines] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"today" | "week">("today");

  // Get today's string (e.g., "Tuesday")
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser),
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRoutines = async () => {
      if (!user) return;
      try {
        // Fetch the whole week at once (it's only 7 tiny documents max)
        const querySnapshot = await getDocs(
          collection(db, `users/${user.uid}/routines`),
        );
        const fetchedData: Record<string, any[]> = {};

        querySnapshot.forEach((doc) => {
          if (doc.data().exercises?.length > 0) {
            fetchedData[doc.id] = doc.data().exercises;
          }
        });

        setAllRoutines(fetchedData);
      } catch (error) {
        console.error("Error fetching routines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [user]);

  const todayRoutine = allRoutines[todayName];

  return (
    <main className="max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-black">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Routine</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === "today" ? "week" : "today")}
            className="text-zinc-400 hover:text-black bg-zinc-100 p-2 rounded-full transition-colors"
            title="Toggle Week View"
          >
            <CalendarDays size={20} />
          </button>
          <Link
            href="/plan/builder"
            className="text-zinc-400 hover:text-black bg-zinc-100 p-2 rounded-full transition-colors"
          >
            <Settings2 size={20} />
          </Link>
        </div>
      </header>

      {/* TODAY VIEW */}
      {viewMode === "today" && (
        <section className="p-4 bg-white border-l-4 border-black shadow-sm rounded-r-md">
          <h2 className="font-bold text-xl mb-4 text-zinc-900">{todayName}</h2>

          {loading ? (
            <p className="text-sm text-zinc-400 italic">Loading routine...</p>
          ) : todayRoutine ? (
            <ul className="space-y-3">
              {todayRoutine.map((ex, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center border-b border-zinc-100 pb-2 last:border-0"
                >
                  <span className="font-medium text-zinc-800">{ex.name}</span>
                  <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                    {ex.sets} {ex.sets && ex.reps ? "×" : ""} {ex.reps}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-zinc-500 text-sm">
                No routine scheduled for {todayName}.
              </p>
              <Link
                href="/plan/builder"
                className="inline-block text-xs font-bold uppercase tracking-wide bg-zinc-200 text-black px-4 py-2 rounded-md hover:bg-zinc-300"
              >
                Create Routine
              </Link>
            </div>
          )}
        </section>
      )}

      {/* WEEK VIEW */}
      {viewMode === "week" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-600 mb-2">
            The Week Ahead
          </h2>
          {DAYS_ORDER.map((day) => {
            const dayRoutine = allRoutines[day];
            if (!dayRoutine) return null; // Don't show empty days in the week preview

            return (
              <section
                key={day}
                className={`p-4 rounded-md ${day === todayName ? "bg-white border-l-4 border-black shadow-sm" : "bg-zinc-100"}`}
              >
                <h3
                  className={`font-bold text-md mb-2 ${day === todayName ? "text-black" : "text-zinc-500"}`}
                >
                  {day}
                </h3>
                <ul className="space-y-1">
                  {dayRoutine.map((ex, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-zinc-700">{ex.name}</span>
                      <span className="text-zinc-500">
                        {ex.sets}
                        {ex.sets && ex.reps ? "x" : ""}
                        {ex.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {Object.keys(allRoutines).length === 0 && !loading && (
            <p className="text-zinc-400 italic text-center py-4">
              Your week is currently empty.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
