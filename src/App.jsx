import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import {
  BookOpen,
  LogIn,
  LogOut,
  Shield,
  LayoutDashboard,
  Vote,
  Camera,
  User,
  Sparkles,
  Mic,
  BookMarked,
  FileText,
  GraduationCap
} from 'lucide-react';

import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Polls from './pages/Polls';
import Profile from './pages/Profile';
import CheckIn from './pages/CheckIn';
import AdminPanel from './pages/AdminPanel';

/* ── Navigation ───────────────────────────────────────────────── */
function Navigation() {
  const { state, signIn, signOut } = useAuthContext();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 px-6 sm:px-10 py-3.5 flex justify-between items-center shadow-xs">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-orange-100 flex items-center justify-center p-1 shadow-xs overflow-hidden">
          <img
            src="/ela-logo.png"
            alt="ELA Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'block';
              }
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
      </Link>

      <nav className="flex items-center gap-3 sm:gap-5 text-xs font-bold uppercase tracking-wider">
        {/* Events & Gallery — always visible */}
        <Link
          to="/events"
          className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden md:inline">Events &amp; Gallery</span>
        </Link>

        {state?.isAuthenticated && (
          <>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            <Link
              to="/polls"
              className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
            >
              <Vote className="w-4 h-4" />
              <span className="hidden md:inline">Theme Polls</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Literary Passport</span>
            </Link>

            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
            >
              <Shield className="w-4 h-4 text-ela-amber" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          </>
        )}

        {state?.isAuthenticated ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="flex items-center gap-1.5 px-4 py-2.5 text-white bg-ela-orange hover:bg-ela-tangerine rounded-xl shadow-xs shadow-orange-500/20 transition cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
}

/* ── Homepage ─────────────────────────────────────────────────── */
const HERO_IMG = 'https://plus.unsplash.com/premium_photo-1668197658521-1d5f97d60bcc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVhZGluZyUyMGNpcmNsZXxlbnwwfHwwfHx8MA%3D%3D';

const initiatives = [
  {
    icon: BookOpen,
    title: 'Thematic Book Circles',
    desc: 'Fortnightly and monthly student book clubs fostering deep discussions across classic and contemporary genres.',
    img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
  },
  {
    icon: Mic,
    title: 'Drop the Mic Gala',
    desc: "NSBM's favourite open-mic gala celebrating student singers, stand-up comedians, poets, and musicians.",
    img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=600&auto=format&fit=crop',
  },
  {
    icon: FileText,
    title: 'EVERGREEN Annual Magazine',
    desc: "ELA's prestigious annual publication capturing student prose, poetry, creative artwork, and alumni spotlights.",
    img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600&auto=format&fit=crop',
  },
  {
    icon: GraduationCap,
    title: 'Academic & Presentation Workshops',
    desc: 'Flagship sessions including Academic Referencing and Presentation Skills workshops designed for undergraduate excellence.',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
  },
];

function Home() {
  const { state, signIn } = useAuthContext();

  return (
    <main className="flex-1 w-full">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* Left — copy */}
        <div className="space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 text-ela-orange text-xs font-bold uppercase tracking-widest border border-orange-200/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            Faculty of Business · NSBM Green University
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-ela-dark leading-tight">
            Where Stories Breathe &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ela-orange via-ela-tangerine to-ela-amber">
              Words Come Alive.
            </span>
          </h2>

          {/* Body */}
          <p className="text-ela-gray text-base leading-relaxed max-w-lg">
            Established in 2019, the English Literary Association (ELA) is a university-wide creative
            home comprising over 250 undergraduates. Operating under the Faculty of Business, ELA
            unites passionate readers, writers, poets, and performing artists.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            {state?.isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-ela-orange hover:bg-ela-tangerine text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all text-center"
              >
                Go to Member Dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-8 py-4 bg-ela-orange hover:bg-ela-tangerine text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                Sign In with ELA Account
              </button>
            )}
            <Link
              to="/events"
              className="px-8 py-4 bg-white hover:bg-orange-50 text-ela-dark border border-orange-100 font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xs transition-all text-center"
            >
              Browse the Archive
            </Link>
          </div>
        </div>

        {/* Right — hero image card */}
        <div className="relative hidden lg:flex items-center justify-center">
          {/* Decorative glow */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-ela-orange/20 via-ela-amber/10 to-transparent blur-3xl -z-10" />
          {/* Card */}
          <div className="relative w-full rounded-[2rem] overflow-hidden border-2 border-ela-amber/40 shadow-2xl shadow-orange-500/15">
            <img
              src={HERO_IMG}
              alt="ELA library atmosphere"
              className="w-full h-[420px] object-cover"
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {/* Floating quote */}
            <div className="absolute bottom-5 left-5 right-5">
              <div className="backdrop-blur-md bg-white/15 border border-white/25 rounded-2xl px-5 py-3.5">
                <p className="font-serif text-white font-bold text-lg leading-snug italic">
                  "Where Words Find Their Voice"
                </p>
                <p className="text-white/70 text-xs mt-1 font-semibold tracking-widest uppercase">
                  English Literary Association · Est. 2019
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Initiatives Grid ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ela-dark">Our Core Initiatives</h2>
          <p className="text-sm text-ela-gray max-w-xl mx-auto">
            Four pillars that define the ELA experience for every member.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {initiatives.map(({ icon: Icon, title, desc, img }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl border border-orange-100 shadow-xs hover:border-ela-orange hover:shadow-md hover:shadow-orange-500/10 transition-all overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="h-44 w-full overflow-hidden">
                <img
                  src={img}
                  alt={title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </div>
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-ela-orange flex items-center justify-center mb-3 group-hover:bg-ela-orange group-hover:text-white transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-ela-dark mb-1 leading-tight">{title}</h3>
                <p className="text-xs text-ela-gray leading-relaxed flex-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ── App ──────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-ela-cream text-ela-dark">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/polls"
            element={
              <ProtectedRoute>
                <Polls />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkin"
            element={
              <ProtectedRoute>
                <CheckIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}