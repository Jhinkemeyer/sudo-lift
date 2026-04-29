"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Default to yesterday's date, or today, depending on how you want it
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Logs when Date or User changes
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const q = query(
          collection(db, `users/${user.uid}/logs`),
          where("date", "==", selectedDate),
        );

        const querySnapshot = await getDocs(q);
        const fetchedLogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        // Sort lifting first, then cardio (optional, just keeps it neat)
        fetchedLogs.sort((a, b) => a.type.localeCompare(b.type));
        setLogs(fetchedLogs);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [selectedDate, user]);

  return (
    <main className="max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center py-4 gap-4">
        <Link href="/" className="text-zinc-400 hover:text-black">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Log History</h1>
      </header>

      {/* Date Selector */}
      <section className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-4 shadow-sm">
        <Calendar className="text-zinc-400" size={20} />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-transparent outline-none font-medium text-zinc-800"
        />
      </section>

      {/* Results Display */}
      <section className="space-y-4">
        {loading ? (
          <p className="text-center text-zinc-400 py-8 italic text-sm">
            Loading logs...
          </p>
        ) : logs.length === 0 ? (
          <p className="text-center text-zinc-400 py-8 italic text-sm">
            No entries found for {selectedDate}.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-zinc-50 border border-zinc-100 rounded-md"
            >
              {log.type === "lifting" ? (
                <>
                  <div className="font-semibold text-zinc-800">
                    {log.exercise}
                  </div>
                  <div className="text-sm text-zinc-600">
                    {log.sets} sets × {log.reps} reps @ {log.weight}
                  </div>
                  {log.notes && (
                    <div className="text-xs text-zinc-500 mt-1 italic">
                      "{log.notes}"
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-semibold text-zinc-800">
                    {log.activity}
                  </div>
                  <div className="text-sm text-zinc-600">
                    {log.mins} mins | {log.miles} mi | Avg HR: {log.hr}
                  </div>
                  {log.notes && (
                    <div className="text-xs text-zinc-500 mt-1 italic">
                      "{log.notes}"
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
