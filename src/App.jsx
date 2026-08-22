import React from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { BookOpen, LogIn, LogOut, Sparkles, Feather, Calendar } from 'lucide-react';

export default function App() {
  const { state, signIn, signOut } = useAuthContext();

  return (
    <div className="min-h-screen flex flex-col bg-ela-cream text-ela-dark selection:bg-ela-amber selection:text-ela-dark">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 sm:px-12 py-3.5 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          {/* Logo container */}
          <div className="w-10 h-10 rounded-xl bg-white border border-orange-100 flex items-center justify-center p-1 shadow-xs overflow-hidden">
            <img 
              src="/ela-logo.png" 
              alt="ELA Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'block';
              }}
            />
            <BookOpen className="w-5 h-5 text-ela-orange hidden" />
          </div>
          <div>
            <h1 className="font-serif font-black text-lg tracking-tight text-ela-dark leading-none">
              ELA <span className="text-ela-orange">PORTAL</span>
            </h1>
            <p className="text-[10px] tracking-widest uppercase font-semibold text-ela-gray mt-0.5">
              English Literary Association
            </p>
          </div>
        </div>

        <div>
          {state.isAuthenticated ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-ela-orange hover:bg-ela-tangerine active:scale-98 rounded-xl shadow-sm shadow-orange-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In / Join ELA
            </button>
          )}
        </div>
      </header>

      {/* Main Hero View */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        {state.isLoading ? (
          <div className="flex items-center gap-3 text-ela-gray font-medium text-sm">
            <div className="w-2 h-2 rounded-full bg-ela-orange animate-ping" />
            Connecting to Asgardeo...
          </div>
        ) : state.isAuthenticated ? (
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-orange-950/5 border border-orange-100 max-w-lg w-full text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-ela-orange flex items-center justify-center font-bold font-serif text-xl border border-orange-100">
                {state.username ? state.username.charAt(0).toUpperCase() : 'E'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-orange-100 text-ela-orange rounded-full">
                  Authenticated Member
                </span>
                <h2 className="text-xl font-serif font-bold text-ela-dark mt-1">
                  {state.displayName || state.username || 'Literary Member'}
                </h2>
                <p className="text-xs text-ela-gray">{state.email || 'Verified via WSO2 Asgardeo'}</p>
              </div>
            </div>

            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/60 mb-6 text-xs text-ela-dark/80 space-y-2">
              <p className="font-semibold text-ela-dark">Session Claims:</p>
              <div className="font-mono text-[11px] bg-white p-3 rounded-lg border border-orange-100 max-h-36 overflow-y-auto">
                <pre>{JSON.stringify(state, null, 2)}</pre>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider text-white bg-ela-dark hover:bg-black rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 text-ela-orange text-xs font-bold uppercase tracking-widest mb-6 border border-orange-200/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              The Literary Community
            </div>

            <h2 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-ela-dark mb-6 leading-tight">
              Where Stories Breathe & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ela-orange via-ela-tangerine to-ela-amber">
                Words Come Alive.
              </span>
            </h2>

            <p className="text-ela-gray text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-normal">
              Join the English Literary Association. Participate in fortnightly thematic book circles, cast your vote on upcoming reads, enter creative writing competitions, and connect with fellow readers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => signIn()}
                className="px-8 py-4 bg-ela-orange hover:bg-ela-tangerine active:scale-98 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all"
              >
                Join the Association
              </button>
              <a
                href="#learn-more"
                className="px-8 py-4 bg-white hover:bg-orange-50 text-ela-dark font-bold text-sm uppercase tracking-wider rounded-2xl border border-orange-100 transition-all text-center"
              >
                Explore Events
              </a>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 text-left w-full">
              <div className="p-5 bg-white rounded-2xl border border-orange-100 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-ela-orange flex items-center justify-center mb-3">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-ela-dark mb-1">Fortnightly Book Circles</h3>
                <p className="text-xs text-ela-gray">Themed discussions ranging from Gothic classics to contemporary fiction.</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-orange-100 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-ela-orange flex items-center justify-center mb-3">
                  <Feather className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-ela-dark mb-1">Writing Competitions</h3>
                <p className="text-xs text-ela-gray">Annual prose and poetry galas with editorial feedback and prizes.</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-orange-100 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-ela-orange flex items-center justify-center mb-3">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-ela-dark mb-1">Interactive Polls</h3>
                <p className="text-xs text-ela-gray">Direct member voting for the next fortnight's book theme and activities.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}