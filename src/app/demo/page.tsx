import Link from 'next/link';
import { UtensilsCrossed, Shield, ArrowLeft } from 'lucide-react';

export default function DemoLauncherPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 italic uppercase">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-black text-xs tracking-widest">
                <ArrowLeft size={16} /> BACK TO PLATFORM
            </Link>

            <div className="text-center mb-16">
                <div className="text-primary text-[10px] font-black tracking-[0.4em] mb-4">PLAYGROUND</div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter italic">
                    DEMO <span className="text-primary">ENVIRONMENT</span>
                </h1>
                <p className="text-gray-500 text-sm font-bold tracking-widest leading-loose max-w-md mx-auto">
                    Experience both sides of BeFoodie: The seamless guest ordering journey and the powerful kitchen command center.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Link
                    href="/r/demo/menu/1"
                    className="group relative overflow-hidden bg-[#181818] border border-white/5 rounded-3xl p-10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_50px_rgba(211,47,47,0.15)]"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <UtensilsCrossed size={160} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
                            <UtensilsCrossed size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 italic">GUEST VIEW</h2>
                        <p className="text-gray-500 text-xs font-bold mb-8 tracking-widest">Scan, Order, Eat. Try the frictionless menu experience for Table #1.</p>
                        <span className="inline-flex items-center gap-2 bg-primary text-white font-black px-8 py-3 rounded-full text-xs group-hover:bg-red-700 transition-colors">
                            OPEN MENU
                        </span>
                    </div>
                </Link>

                <Link
                    href="/r/demo/admin"
                    className="group relative overflow-hidden bg-[#181818] border border-white/5 rounded-3xl p-10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Shield size={160} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6">
                            <Shield size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 italic">ADMIN HUB</h2>
                        <p className="text-gray-500 text-xs font-bold mb-8 tracking-widest">Global command center. Manage orders, products, and real-time kitchen flow.</p>
                        <span className="inline-flex items-center gap-2 bg-blue-600 text-white font-black px-8 py-3 rounded-full text-xs group-hover:bg-blue-700 transition-colors">
                            ENTER DASHBOARD
                        </span>
                    </div>
                </Link>
            </div>

            <div className="mt-20 text-[10px] font-black text-gray-800 uppercase tracking-[0.6em]">
                DEMO SANDBOX | NO DATA PERSISTED PERMANENTLY
            </div>
        </div>
    );
}
