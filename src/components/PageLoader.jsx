import { BookOpen } from 'lucide-react';

/**
 * PageLoader — shown during initial Firestore data fetch on every route.
 * Usage: if (loading) return <PageLoader />;
 */
export default function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center flex-1 py-32 gap-6 text-center">
            {/* Pulsing logo ring */}
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-20 w-20 rounded-full bg-orange-200/60 animate-ping" />
                <div className="relative w-16 h-16 rounded-2xl bg-white border border-orange-100 shadow-lg flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-ela-orange animate-pulse" />
                </div>
            </div>

            {/* Warm orange spinner bar */}
            <div className="w-40 h-1 rounded-full bg-orange-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-ela-orange via-ela-tangerine to-ela-amber rounded-full animate-[slide_1.4s_ease-in-out_infinite]" />
            </div>

            <p className="text-xs font-bold text-ela-gray uppercase tracking-widest">
                Opening Association Records…
            </p>

            <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </div>
    );
}
