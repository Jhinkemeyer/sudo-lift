import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PlanPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center py-4 gap-4">
        <Link href="/" className="text-zinc-400 hover:text-black">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">The 51-Day Plan</h1>
      </header>

      <div className="space-y-6 text-zinc-800">
        <section className="p-4 bg-white border-l-4 border-black shadow-sm rounded-r-md">
          <h2 className="font-bold text-lg mb-2">
            Tuesday: Lower Body (Crunch)
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Warmup: 5-10 mins walk (incline)</li>
            <li>Leg Press: 3x10-12 (feet high)</li>
            <li>DB Romanian Deadlifts: 3x10-12</li>
            <li>Seated Leg Curls: 3x12</li>
            <li>Seated Calf Raises: 3x15</li>
            <li>Planks: 3x 30-45s</li>
          </ul>
        </section>

        <section className="p-4 bg-zinc-100 rounded-md">
          <h2 className="font-bold text-lg mb-2 text-zinc-600">Monday: Home</h2>
          <p className="text-sm text-zinc-600">
            iFit Cardio Recovery (45m) + Core (15m)
          </p>
        </section>

        <section className="p-4 bg-zinc-100 rounded-md">
          <h2 className="font-bold text-lg mb-2 text-zinc-600">
            Thursday: Upper Body (Crunch)
          </h2>
          <p className="text-sm text-zinc-600">Chest, Back, Arms Hypertrophy</p>
        </section>

        <section className="p-4 bg-zinc-100 rounded-md">
          <h2 className="font-bold text-lg mb-2 text-zinc-600">
            Friday: The Long Run (Home)
          </h2>
          <p className="text-sm text-zinc-600">
            iFit Endurance (60m) + KB/DB Conditioning (30m)
          </p>
        </section>
      </div>
    </main>
  );
}
