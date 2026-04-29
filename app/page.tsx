"use client";
import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import Link from "next/link";
import LiftingForm from "@/components/LiftingForm";
import CardioForm from "@/components/CardioForm";
import { generateMarkdown, copyToClipboard } from "@/lib/utils";
import { ClipboardCopy, LogOut, Loader2, Trash2, Menu } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false); // Prevents hydration errors with DND

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    setIsMounted(true);
    const initAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) setUser(result.user);
      } catch (error) {
        console.error("Redirect login check failed:", error);
      } finally {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
        return unsubscribeAuth;
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `users/${user.uid}/logs`),
      where("date", "==", today),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];
      // Sort locally by the new orderIndex to avoid Firebase composite index errors
      fetchedLogs.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      setLogs(fetchedLogs);
    });
    return () => unsubscribe();
  }, [user, today]);

  const handleDelete = async (logId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this log?")) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/logs`, logId));
      } catch (error) {
        console.error("Error deleting log:", error);
      }
    }
  };

  // --- NEW: Drag and Drop Handler ---
  const handleDragEnd = async (result: any) => {
    if (!result.destination || !user) return;

    // 1. Reorder locally for instant UI update
    const items = Array.from(logs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLogs(items);

    // 2. Batch update the new order indexes to Firebase silently
    try {
      const batch = writeBatch(db);
      items.forEach((item, index) => {
        const docRef = doc(db, `users/${user.uid}/logs`, item.id);
        batch.update(docRef, { orderIndex: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error saving new order:", error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
    }
  };

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
            [Sudo-Lift]
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
      <header className="flex justify-between items-center py-4 mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight !text-white">
          [Sudo-Lift]
        </h1>
        <button
          onClick={() => auth.signOut()}
          className="text-zinc-400 hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut size={22} />
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
          <h2 className="text-lg font-semibold text-white">Today's Summary</h2>
          <button
            onClick={() => copyToClipboard(generateMarkdown(today, logs))}
            className="flex items-center gap-2 text-xs font-bold uppercase bg-zinc-100 px-3 py-1.5 rounded-full hover:bg-zinc-200 text-zinc-900"
          >
            <ClipboardCopy size={14} /> Export MD
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-zinc-400 italic text-sm text-center py-8">
            No entries yet today.
          </p>
        ) : isMounted ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="logs-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {logs.map((log, index) => (
                    <Draggable key={log.id} draggableId={log.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-3 border-l-2 border-black bg-white shadow-sm rounded-r-md flex justify-between items-center"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="text-zinc-300 hover:text-zinc-500 touch-none pt-1 cursor-grab active:cursor-grabbing"
                            >
                              <Menu size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-zinc-900">
                                {log.exercise || log.activity}
                              </p>
                              <p className="text-xs text-zinc-500 uppercase">
                                {log.type === "lifting"
                                  ? `${log.sets}x${log.reps} @ ${log.weight}${
                                      log.weight?.includes(",") ||
                                      log.weight?.toUpperCase().includes("BW")
                                        ? ""
                                        : "lbs"
                                    }`
                                  : `${log.duration}min | ${log.distance}mi | ${log.heartRate}bpm`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                            title="Delete Log"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : null}
      </section>
    </main>
  );
}
