"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function BuilderPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser),
    );
    return () => unsubscribe();
  }, []);

  // Fetch existing routine when day changes
  useEffect(() => {
    const loadRoutine = async () => {
      if (!user) return;
      const docRef = doc(db, `users/${user.uid}/routines`, selectedDay);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().exercises) {
        setExercises(docSnap.data().exercises);
      } else {
        setExercises([{ name: "", sets: "", reps: "" }]); // Reset if empty
      }
    };
    loadRoutine();
    setSaveMessage(""); // Clear old messages
  }, [selectedDay, user]);

  const updateExercise = (index: number, field: string, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const addExercise = () =>
    setExercises([...exercises, { name: "", sets: "", reps: "" }]);

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Clean out empty rows before saving
      const cleanedExercises = exercises.filter((ex) => ex.name.trim() !== "");
      await setDoc(doc(db, `users/${user.uid}/routines`, selectedDay), {
        exercises: cleanedExercises,
        updatedAt: new Date().toISOString(),
      });
      setSaveMessage("Routine saved!");
    } catch (error) {
      console.error("Error saving routine:", error);
      setSaveMessage("Error saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link href="/plan" className="text-zinc-400 hover:text-black">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Builder</h1>
        </div>
      </header>

      {/* Day Selector */}
      <select
        className="w-full p-3 bg-white border border-zinc-200 rounded-md font-bold text-lg outline-none focus:ring-1 focus:ring-black"
        value={selectedDay}
        onChange={(e) => setSelectedDay(e.target.value)}
      >
        {DAYS.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>

      {/* Exercise Rows */}
      <div className="space-y-4">
        {exercises.map((ex, index) => (
          <div
            key={index}
            className="flex gap-2 items-start bg-zinc-50 p-3 border border-zinc-100 rounded-md"
          >
            <div className="flex-1 space-y-2">
              <input
                placeholder="Exercise (e.g. Leg Press)"
                value={ex.name}
                onChange={(e) => updateExercise(index, "name", e.target.value)}
                className="w-full p-2 text-sm border border-zinc-200 rounded-md outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Sets"
                  value={ex.sets}
                  onChange={(e) =>
                    updateExercise(index, "sets", e.target.value)
                  }
                  className="w-full p-2 text-sm border border-zinc-200 rounded-md outline-none"
                />
                <input
                  placeholder="Reps/Time"
                  value={ex.reps}
                  onChange={(e) =>
                    updateExercise(index, "reps", e.target.value)
                  }
                  className="w-full p-2 text-sm border border-zinc-200 rounded-md outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => removeExercise(index)}
              className="p-2 text-zinc-400 hover:text-red-500 mt-1"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addExercise}
        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-zinc-300 text-zinc-500 rounded-md hover:border-black hover:text-black transition-colors font-medium"
      >
        <Plus size={18} /> Add Exercise
      </button>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-md font-bold uppercase tracking-wide hover:bg-zinc-800 disabled:bg-zinc-400"
      >
        {loading ? "Saving..." : `Save ${selectedDay} Routine`}
      </button>

      {saveMessage && (
        <p className="text-center text-sm font-medium text-green-600">
          {saveMessage}
        </p>
      )}
    </main>
  );
}
