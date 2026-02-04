import Link from 'next/link';
import { UtensilsCrossed, Shield, ArrowRight, Zap, Globe, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary selection:text-white">
      {/* Header / Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black text-primary tracking-tighter italic uppercase">
            BEFOODIE
          </div>
          <div className="flex gap-4">
            <Link href="/platform/login" className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Admin Login
            </Link>
            <Link href="/platform/create-restaurant" className="px-5 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-primary hover:text-white transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-8 animate-fade-in">
            <Zap size={12} className="fill-primary" /> Multi-Tenant POS SaaS
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] uppercase italic">
            REVOLUTIONIZE YOUR <br />
            <span className="text-primary">DINING EXPERIENCE</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            A high-performance, real-time QR ordering system for modern restaurants.
            Zero downloads. Zero friction. Total control.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link
              href="/platform/create-restaurant"
              className="group bg-primary hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-2xl shadow-red-950/20"
            >
              LAUNCH YOUR RESTAURANT
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/platform/login"
              className="bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all border border-white/10"
            >
              MANAGE DASHBOARD
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all text-left">
              <div className="p-3 bg-blue-500/20 text-blue-400 w-fit rounded-xl mb-4">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Scale</h3>
              <p className="text-gray-500 text-sm">Deploy unique subdomains and customized menus in seconds for any restaurant size.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all text-left">
              <div className="p-3 bg-purple-500/20 text-purple-400 w-fit rounded-xl mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Pulse</h3>
              <p className="text-gray-500 text-sm">Websocket-powered kitchen views ensure orders appear instantly without refresh.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all text-left">
              <div className="p-3 bg-green-500/20 text-green-400 w-fit rounded-xl mb-4">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Tenant Security</h3>
              <p className="text-gray-500 text-sm">Deep-scoped auth ensures total data isolation and secure administration.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">
          BeFoodie Digital Infrastructure © 2026
        </div>
        <div className="mt-4 flex justify-center gap-8">
          <Link href="/demo" className="text-[10px] font-bold text-gray-700 hover:text-white transition-colors uppercase tracking-widest">
            Try Demo
          </Link>
        </div>
      </footer>
    </div>
  );
}
