import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CardioForm() {
  const [formData, setFormData] = useState({
    activity: "",
    duration: "",
    distance: "",
    heartRate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    await addDoc(collection(db, `users/${auth.currentUser.uid}/logs`), {
      ...formData,
      type: "cardio",
      date: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    });
    setFormData({
      activity: "",
      duration: "",
      distance: "",
      heartRate: "",
      notes: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200 mt-4"
    >
      <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">
        Log Cardio
      </h3>
      <input
        placeholder="Activity (e.g. Walk, Jog)"
        className="w-full p-2 bg-white border border-zinc-200 rounded-md outline-none focus:ring-1 focus:ring-black"
        value={formData.activity}
        onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
        required
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          placeholder="Mins"
          className="p-2 border border-zinc-200 rounded-md"
          value={formData.duration}
          onChange={(e) =>
            setFormData({ ...formData, duration: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Miles"
          className="p-2 border border-zinc-200 rounded-md"
          value={formData.distance}
          onChange={(e) =>
            setFormData({ ...formData, distance: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Avg HR"
          className="p-2 border border-zinc-200 rounded-md"
          value={formData.heartRate}
          onChange={(e) =>
            setFormData({ ...formData, heartRate: e.target.value })
          }
        />
      </div>
      <textarea
        placeholder="Session notes..."
        className="w-full p-2 border border-zinc-200 rounded-md text-sm"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
      <button
        type="submit"
        className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-zinc-800 transition-colors"
      >
        Save Cardio
      </button>
    </form>
  );
}
