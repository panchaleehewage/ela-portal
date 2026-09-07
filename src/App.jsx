import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import {
  BookOpen,
  LogIn,
  LogOut,
  Shield,
  LayoutDashboard,
  Calendar,
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

      <nav className="flex items-center gap-3 sm:gap-6 text-xs font-bold uppercase tracking-wider">
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
              to="/events"
              className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Events</span>
            </Link>

            <Link
              to="/polls"
              className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
            >
              <Vote className="w-4 h-4" />
              <span className="hidden md:inline">Polls</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-1.5 text-ela-dark hover:text-ela-orange transition"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Passport</span>
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

function Home() {
  const { state, signIn } = useAuthContext();

  const initiatives = [
    {
      icon: BookOpen,
      title: 'Thematic Book Circles',
      desc: 'Fortnightly and monthly student book clubs fostering deep discussions across classic and contemporary genres.',
    },
    {
      icon: Mic,
      title: 'Drop the Mic',
      desc: "NSBM's favourite open-mic gala celebrating student singers, stand-up comedians, poets, and musicians.",
    },
    {
      icon: FileText,
      title: 'EVERGREEN Magazine',
      desc: "ELA's prestigious annual publication capturing student prose, poetry, creative artwork, and alumni spotlights.",
    },
    {
      icon: GraduationCap,
      title: 'Skill & Academic Workshops',
      desc: 'Flagship sessions including Academic Referencing and Presentation Skills workshops designed for undergraduate excellence.',
    },
  ];

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto w-full">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 text-ela-orange text-xs font-bold uppercase tracking-widest mb-6 border border-orange-200/60 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        The Creative &amp; Literary Platform of NSBM Green University
      </div>

      <h2 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-ela-dark mb-6 leading-tight">
        Where Stories Breathe &amp; <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-ela-orange via-ela-tangerine to-ela-amber">
          Words Come Alive.
        </span>
      </h2>

      <p className="text-ela-gray text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
        Established in 2019, the English Literary Association (ELA) is a university-wide creative home
        comprising over 250 undergraduates across all faculties. Operating under the Faculty of Business
        without being restricted to a single specialization, ELA unites passionate readers, writers,
        poets, and performing artists.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
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
          to="/chronicler"
          className="px-8 py-4 bg-white hover:bg-orange-50 text-ela-dark border border-orange-100 font-bold text-sm uppercase tracking-wider rounded-2xl shadow-xs transition-all text-center"
        >
          Browse the Archive
        </Link>
      </div>

      {/* Core Initiatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left w-full">
        {initiatives.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-5 bg-white rounded-2xl border border-orange-100 shadow-xs hover:border-ela-orange hover:shadow-md transition-all group">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-ela-orange flex items-center justify-center mb-3 group-hover:bg-ela-orange group-hover:text-white transition-colors">
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-ela-dark mb-1">{title}</h3>
            <p className="text-xs text-ela-gray leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-ela-cream text-ela-dark">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route
            path="/events/:id"
            element={<EventDetail />}
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