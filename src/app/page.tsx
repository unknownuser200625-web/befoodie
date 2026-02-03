import Link from 'next/link';
import { UtensilsCrossed, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
          BROASTIFY
        </h1>
        <p className="text-gray-400 text-lg">Midnight Premium Ordering System</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          href="/menu/1"
          className="group relative overflow-hidden bg-[#1e1e1e] border border-white/5 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(211,47,47,0.2)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <UtensilsCrossed size={120} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <UtensilsCrossed className="text-primary" />
            Guest Menu
          </h2>
          <p className="text-gray-400 text-sm mb-6">Simulation for Table #1</p>
          <span className="inline-block bg-white text-black font-bold px-6 py-2 rounded-full text-sm group-hover:bg-primary group-hover:text-white transition-colors">
            Scan & Order
          </span>
        </Link>

        <Link
          href="/admin"
          className="group relative overflow-hidden bg-[#1e1e1e] border border-white/5 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <Shield size={120} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="text-blue-500" />
            Kitchen Admin
          </h2>
          <p className="text-gray-400 text-sm mb-6">Live Order Command Center</p>
          <span className="inline-block bg-white/10 text-white font-bold px-6 py-2 rounded-full text-sm group-hover:bg-blue-600 transition-colors">
            Access Dashboard
          </span>
        </Link>
      </div>
    </div>
  );
}
