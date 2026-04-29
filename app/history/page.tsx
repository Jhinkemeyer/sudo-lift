// src/app/history/page.tsx
"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Calendar, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Default to today's local date
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const [selectedDate, setSelectedDate] = useState(today);

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

  // 3. Delete Function
  const handleDelete = async (logId: string) => {
    if (!user) return;

    if (
      window.confirm("Are you sure you want to delete this historical log?")
    ) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/logs`, logId));
        // Instantly remove it from the screen by filtering it out of the current state
        setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
      } catch (error) {
        console.error("Error deleting log:", error);
      }
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center py-4 gap-4">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Log History
        </h1>
      </header>

      {/* Date Selector */}
      <section className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-4 shadow-sm">
        <Calendar className="text-zinc-400" size={20} />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-transparent outline-none font-medium text-zinc-900"
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
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 border-l-2 border-black bg-white shadow-sm rounded-r-md flex justify-between items-start"
              >
                <div className="flex-1">
                  {log.type === "lifting" ? (
                    <>
                      <div className="font-bold text-sm text-zinc-900">
                        {log.exercise}
                      </div>
                      <div className="text-xs text-zinc-500 uppercase mt-0.5">
                        {log.sets} sets × {log.reps} reps @ {log.weight}lbs
                      </div>
                      {log.notes && (
                        <div className="text-xs text-zinc-500 mt-1 italic">
                          "{log.notes}"
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-sm text-zinc-900">
                        {log.activity}
                      </div>
                      <div className="text-xs text-zinc-500 uppercase mt-0.5">
                        {log.duration || log.mins} mins |{" "}
                        {log.distance || log.miles} mi | Avg HR:{" "}
                        {log.heartRate || log.hr}
                      </div>
                      {log.notes && (
                        <div className="text-xs text-zinc-500 mt-1 italic">
                          "{log.notes}"
                        </div>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="text-zinc-300 hover:text-red-500 transition-colors p-1 ml-3"
                  title="Delete Log"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
