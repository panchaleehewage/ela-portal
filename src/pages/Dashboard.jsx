import { useAuthContext } from '@asgardeo/auth-react';
import { Calendar } from 'lucide-react';
import ThemePolls from '../components/ThemePolls';
import LiteraryPassport from '../components/LiteraryPassport';
import QuoteBoard from '../components/QuoteBoard';

export default function Dashboard() {
  const { state } = useAuthContext();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ela-orange via-ela-tangerine to-ela-amber rounded-3xl p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
            Member Hub
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-3 mb-1">
            Welcome, {state.displayName || state.username}!
          </h1>
          <p className="text-white/90 text-sm">
            Next Fortnightly Circle: <span className="font-semibold underline">Saturday at 4:00 PM (Library Hall B)</span>
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 text-center">
          <span className="text-xs uppercase font-semibold tracking-wider text-white/80 block">Membership Status</span>
          <span className="font-serif font-bold text-lg text-white">Active 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Polls, Passport & Upcoming Gatherings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Firestore Theme Poll */}
          <ThemePolls />

          {/* Literary Passport (Badges & Reading Journey) */}
          <LiteraryPassport />

          {/* Upcoming Gatherings */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ela-dark">Upcoming ELA Sessions</h2>
                <p className="text-xs text-ela-gray">RSVP for upcoming club gatherings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-orange-100/80 hover:bg-orange-50/30 transition flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-ela-orange uppercase tracking-wider">Book Club #14</span>
                  <h3 className="font-bold text-ela-dark text-base">The Brontë Sisters & Romanticism</h3>
                  <p className="text-xs text-ela-gray mt-0.5">Aug 29, 2026 • 4:00 PM • Library Hall B</p>
                </div>
                <button className="px-4 py-2 bg-ela-dark hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition">
                  RSVP
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-orange-100/80 hover:bg-orange-50/30 transition flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Annual Gala</span>
                  <h3 className="font-bold text-ela-dark text-base">National Poetry Writing Gala 2026</h3>
                  <p className="text-xs text-ela-gray mt-0.5">Sep 15, 2026 • Submissions Open</p>
                </div>
                <button className="px-4 py-2 bg-ela-orange hover:bg-ela-tangerine text-white text-xs font-bold uppercase tracking-wider rounded-xl transition">
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Profile Badge & Anonymous Quote Board */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-xs text-center">
            <div className="w-20 h-20 bg-orange-100 text-ela-orange rounded-full flex items-center justify-center font-serif text-3xl font-bold mx-auto mb-4 border-2 border-ela-orange/20">
              {state.username ? state.username.charAt(0).toUpperCase() : 'M'}
            </div>
            <h3 className="font-serif font-bold text-lg text-ela-dark">{state.displayName || state.username}</h3>
            <p className="text-xs text-ela-gray mb-4">{state.email || 'Verified via Asgardeo'}</p>

            <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ela-gray">Member ID:</span>
                <span className="font-mono font-semibold">#ELA-2026-{state.username?.slice(0, 4) || '99'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ela-gray">Total RSVPs:</span>
                <span className="font-semibold text-ela-dark">3 Sessions</span>
              </div>
            </div>
          </div>

          {/* Anonymous Quote of the Fortnight */}
          <QuoteBoard />
        </div>
      </div>
    </div>
  );
}