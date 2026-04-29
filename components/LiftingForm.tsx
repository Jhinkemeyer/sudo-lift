// src/components/LiftingForm.tsx
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function LiftingForm() {
  const [formData, setFormData] = useState({
    exercise: "",
    sets: "",
    reps: "",
    weight: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    await addDoc(collection(db, `users/${auth.currentUser.uid}/logs`), {
      ...formData,
      type: "lifting",
      date: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    });
    setFormData({ exercise: "", sets: "", reps: "", weight: "", notes: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200"
    >
      <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">
        Log Lifting
      </h3>
      <input
        type="text"
        placeholder="Exercise Name (e.g. Bench Press)"
        className="w-full p-2 bg-white border border-zinc-200 rounded-md outline-none focus:ring-1 focus:ring-black"
        value={formData.exercise}
        onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
        required
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Sets"
          className="p-2 border border-zinc-200 rounded-md outline-none focus:ring-1 focus:ring-black w-full"
          value={formData.sets}
          onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
        />
        <input
          type="text"
          placeholder="Reps (e.g. 10, 30s)"
          className="p-2 border border-zinc-200 rounded-md outline-none focus:ring-1 focus:ring-black w-full text-sm"
          value={formData.reps}
          onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
        />
        <input
          type="text"
          placeholder="Weight (e.g. 120, BW)"
          className="p-2 border border-zinc-200 rounded-md outline-none focus:ring-1 focus:ring-black w-full text-sm"
          value={formData.weight}
          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
        />
      </div>
      <textarea
        placeholder="Session notes (energy, feel...)"
        className="w-full p-2 border border-zinc-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-black"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-zinc-800 transition-colors"
      >
        Save Set
      </button>
    </form>
  );
}
