import { Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="w-full bg-[#0a0a0a] border-t border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                        BE<span className="text-primary">FOODIE</span>
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em]">Next-Gen SaaS For Restaurants</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-400 text-sm font-bold">
                        Powered by <span className="text-white italic">BeFoodie</span>
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-500 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">Pricing</a>
                        <a href="#" className="text-gray-500 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">About</a>
                        <a href="#" className="text-gray-500 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest">Contact</a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-white text-xs font-black uppercase italic">Handcrafted with Passion</p>
                        <p className="text-gray-600 text-[10px] uppercase font-bold mt-1">© 2026 BeFoodie HQ</p>
                    </div>
                    <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer">
                        <Github size={18} />
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <div className="h-px w-20 bg-primary/20 mx-auto mb-6" />
                <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">Built for Scale • Designed for Speed • Made for You</p>
            </div>
        </footer>
    );
}
