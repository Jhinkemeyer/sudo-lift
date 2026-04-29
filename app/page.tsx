"use client";
import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import LiftingForm from "@/components/LiftingForm";
import CardioForm from "@/components/CardioForm";
import { generateMarkdown, copyToClipboard } from "@/lib/utils";
import { ClipboardCopy, LogOut, Loader2 } from "lucide-react"; // Added Loader2

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [logs, setLogs] = useState<any[]>([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check if we just returned from a redirect
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error("Redirect login check failed:", error);
      } finally {
        // 2. Only after checking redirect do we listen for the persistent session
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false); // Authentication check is officially done
        });
        return unsubscribeAuth;
      }
    };

    const unsubscribePromise = initAuth();
    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/logs`),
      where("date", "==", today),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user, today]);

  const handleLogin = async () => {
    setLoading(true); // Show spinner while redirecting
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
    }
  };

  // 3. Show a loading spinner so we don't accidentally show the Login screen during the handshake
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 space-y-8 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
            [Sudo Lift]
          </h1>
          <p className="text-zinc-500 font-medium">
            Personal lifting and cardio journal.
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors shadow-lg"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
        <button
          onClick={() => auth.signOut()}
          className="text-zinc-400 hover:text-black"
        >
          <LogOut size={20} />
        </button>
      </header>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Link
          href="/plan"
          className="w-full bg-zinc-200 text-black text-center py-2 rounded-md font-bold text-xs uppercase tracking-wide hover:bg-zinc-300"
        >
          Routine
        </Link>
        <Link
          href="/history"
          className="w-full bg-zinc-100 text-zinc-600 border border-zinc-200 text-center py-2 rounded-md font-bold text-xs uppercase tracking-wide hover:bg-zinc-200 hover:text-black transition-colors"
        >
          History
        </Link>
      </div>
      <LiftingForm />
      <CardioForm />

      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Today's Summary</h2>
          <button
            onClick={() => copyToClipboard(generateMarkdown(today, logs))}
            className="flex items-center gap-2 text-xs font-bold uppercase bg-zinc-100 px-3 py-1.5 rounded-full hover:bg-zinc-200"
          >
            <ClipboardCopy size={14} /> Export MD
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-zinc-400 italic text-sm text-center py-8">
            No entries yet today.
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 border-l-2 border-black bg-white shadow-sm rounded-r-md"
              >
                <p className="font-bold text-sm">
                  {log.exercise || log.activity}
                </p>
                <p className="text-xs text-zinc-500 uppercase">
                  {log.type === "lifting"
                    ? `${log.sets}x${log.reps} @ ${log.weight}lbs`
                    : `${log.duration}min | ${log.distance}mi | ${log.heartRate}bpm`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
