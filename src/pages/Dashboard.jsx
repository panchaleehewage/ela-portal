import { useEffect, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Bell,
  Vote,
  User,
  QrCode,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  BookOpen,
  Award,
  CheckCircle2
} from 'lucide-react';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import PageLoader from '../components/PageLoader';

function getCleanName(state) {
  if (state.displayName) return state.displayName;
  if (state.email) {
    const local = state.email.split('@')[0];
    return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, ' ');
  }
  return state.username || 'Member';
}

export default function Dashboard() {
  const { state } = useAuthContext();
  const userId =
    state.sub ||
    state.username ||
    (state.email ? state.email.replace(/[@.]/g, '_') : null);

  const [memberData, setMemberData] = useState(null);
  const [memberLoading, setMemberLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activePoll, setActivePoll] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Member Profile Fetch & Auto-Bootstrap
    const memberRef = doc(db, 'members', userId);
    const unsubMember = onSnapshot(
      memberRef,
      async (snap) => {
        if (!snap.exists()) {
          const newMember = {
            userId,
            displayName: state.displayName || getCleanName(state),
            email: state.email || '',
            membershipStatus: 'Active 2026',
            badges: [],
            booksRead: [],
            attendedEvents: [],
            readingGoal: 10,
            createdAt: new Date(),
          };
          await setDoc(memberRef, newMember);
          setMemberData(newMember);
        } else {
          setMemberData(snap.data());
        }
        setMemberLoading(false);
      },
      (err) => {
        console.error('Firestore Error in Dashboard (member):', err);
        setMemberLoading(false);
      }
    );

    // Stream Upcoming Events
    const eventsQ = query(collection(db, 'events'), where('type', '==', 'upcoming'));
    const unsubEvents = onSnapshot(
      eventsQ,
      (snapshot) => {
        const eventsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setUpcomingEvents(eventsData);
      },
      (err) => console.error('Firestore Error in Dashboard (events):', err)
    );

    // Stream Active Polls
    const pollsQ = query(collection(db, 'polls'), where('status', '==', 'active'));
    const unsubPolls = onSnapshot(
      pollsQ,
      (snapshot) => {
        if (!snapshot.empty) {
          const firstPoll = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setActivePoll(firstPoll);
        } else {
          setActivePoll(null);
        }
      },
      (err) => console.error('Firestore Error in Dashboard (polls):', err)
    );

    // Stream Announcements
    const unsubAnn = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const getMs = (v) => (v?.toMillis ? v.toMillis() : new Date(v || 0).getTime());
          return getMs(b.createdAt) - getMs(a.createdAt);
        });
        setAnnouncements(data);
      },
      (err) => console.error('Firestore Error in Dashboard (announcements):', err)
    );

    return () => {
      unsubMember();
      unsubEvents();
      unsubPolls();
      unsubAnn();
    };
  }, [userId, state]);

  const nearestEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const cleanName = getCleanName(state);
  const hasVotedActivePoll = activePoll?.voterIds?.includes(userId);
  const booksReadCount = memberData?.booksRead?.length || 0;
  const readingGoal = memberData?.readingGoal || 10;
  const goalProgress = Math.min(Math.round((booksReadCount / readingGoal) * 100), 100);

  if (memberLoading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ela-orange via-ela-tangerine to-ela-amber rounded-3xl p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
            Member Hub
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-3 mb-1">
            Welcome, {cleanName}!
          </h1>
          <p className="text-white/90 text-sm">
            {nearestEvent ? (
              <>
                <span className="font-semibold">Next Gathering:</span> {nearestEvent.title}
                {nearestEvent.date ? ` · ${nearestEvent.date}` : ''}
                {nearestEvent.venue ? ` · ${nearestEvent.venue}` : ''}
              </>
            ) : (
              'No upcoming circles scheduled yet. Check back soon!'
            )}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-xs uppercase font-semibold tracking-wider text-white/80 block">
            Membership Status
          </span>
          <span className="font-serif font-bold text-lg text-white">
            {memberData?.membershipStatus || 'Active 2026'}
          </span>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Nearest Circle, Live Poll Teaser & 4 Balanced Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nearest Gathering Spotlight Card */}
          {nearestEvent && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ela-orange bg-orange-50 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" /> Next Upcoming Circle
                </span>
                <Link
                  to={`/events/${nearestEvent.id}`}
                  className="text-xs font-bold text-ela-orange hover:text-ela-tangerine flex items-center gap-1"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <h2 className="font-serif font-bold text-xl text-ela-dark mb-2">
                {nearestEvent.title}
              </h2>
              {nearestEvent.body && (
                <p className="text-xs text-ela-gray line-clamp-2 leading-relaxed mb-4">
                  {nearestEvent.body}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-ela-dark font-medium pt-3 border-t border-orange-50">
                <span className="flex items-center gap-1.5 text-ela-gray">
                  <CalendarDays className="w-4 h-4 text-ela-orange" />
                  {nearestEvent.date}
                </span>
                {nearestEvent.time && (
                  <span className="flex items-center gap-1.5 text-ela-gray">
                    <Clock className="w-4 h-4 text-ela-orange" />
                    {nearestEvent.time}
                  </span>
                )}
                {nearestEvent.venue && (
                  <span className="flex items-center gap-1.5 text-ela-gray">
                    <MapPin className="w-4 h-4 text-ela-orange" />
                    {nearestEvent.venue}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Active Poll Live Snapshot */}
          {activePoll && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
                    <Vote className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-ela-dark">
                      {activePoll.title}
                    </h3>
                    <p className="text-[11px] text-ela-gray">
                      {hasVotedActivePoll ? '✓ You have cast your vote for this poll' : 'Direct Member Vote Active'}
                    </p>
                  </div>
                </div>
                <Link
                  to="/polls"
                  className="text-xs font-bold text-ela-orange hover:text-ela-tangerine flex items-center gap-1"
                >
                  Go to Polls <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {hasVotedActivePoll ? (
                <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 text-xs flex items-center gap-2 text-ela-dark">
                  <CheckCircle2 className="w-4 h-4 text-ela-orange shrink-0" />
                  <span>Your vote has been counted! Head over to the Polling Station to view live percentages.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100 text-xs">
                  <span className="text-ela-gray font-medium">Have your say in the next theme!</span>
                  <Link
                    to="/polls"
                    className="px-4 py-1.5 bg-ela-orange hover:bg-ela-tangerine text-white font-bold text-xs rounded-xl transition"
                  >
                    Cast Vote
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 4 Balanced Quick Action Cards (2x2 Grid) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-orange-100 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-ela-dark mb-1">Explore & Engage</h2>
            <p className="text-xs text-ela-gray mb-5">Quick access to all club stations</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Link
                to="/events"
                className="group p-4 rounded-2xl bg-orange-50/40 hover:bg-orange-50/80 border border-orange-100 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-ela-orange flex items-center justify-center border border-orange-100 shadow-xs">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-ela-dark">Gathering Hub</h3>
                    <p className="text-[11px] text-ela-gray">Sessions & Chronicler Gallery</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ela-gray group-hover:text-ela-orange transition" />
              </Link>

              <Link
                to="/polls"
                className="group p-4 rounded-2xl bg-orange-50/40 hover:bg-orange-50/80 border border-orange-100 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-ela-orange flex items-center justify-center border border-orange-100 shadow-xs">
                    <Vote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-ela-dark">Polling Station</h3>
                    <p className="text-[11px] text-ela-gray">Vote themes & archive results</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ela-gray group-hover:text-ela-orange transition" />
              </Link>

              <Link
                to="/profile"
                className="group p-4 rounded-2xl bg-orange-50/40 hover:bg-orange-50/80 border border-orange-100 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-ela-orange flex items-center justify-center border border-orange-100 shadow-xs">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-ela-dark">Member Passport</h3>
                    <p className="text-[11px] text-ela-gray">Badges & reading list</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ela-gray group-hover:text-ela-orange transition" />
              </Link>

              <Link
                to="/checkin"
                className="group p-4 rounded-2xl bg-orange-50/40 hover:bg-orange-50/80 border border-orange-100 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-ela-orange flex items-center justify-center border border-orange-100 shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-ela-dark">Self Check-In</h3>
                    <p className="text-[11px] text-ela-gray">Scan meeting QR code</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ela-gray group-hover:text-ela-orange transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Profile Summary, Reading Goal & Noticeboard */}
        <div className="space-y-6">
          {/* Member Card with Reading Progress */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-ela-orange rounded-full flex items-center justify-center font-serif text-2xl font-bold mx-auto border-2 border-ela-orange/20">
              {cleanName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ela-dark">{cleanName}</h3>
              <p className="text-xs text-ela-gray">{state.email || 'Verified via Asgardeo'}</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-left text-xs pt-2">
              <div className="p-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-[10px] text-ela-gray uppercase font-bold block">Attended</span>
                <span className="font-serif font-bold text-sm text-ela-dark">
                  {memberData?.attendedEvents?.length || 0} Meets
                </span>
              </div>
              <div className="p-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
                <span className="text-[10px] text-ela-gray uppercase font-bold block">Badges</span>
                <span className="font-serif font-bold text-sm text-ela-dark">
                  {memberData?.badges?.length || 0} Earned
                </span>
              </div>
            </div>

            {/* Reading Goal Progress Bar */}
            <div className="p-3 bg-orange-50/30 rounded-2xl border border-orange-100 text-left text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-ela-dark flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-ela-orange" /> 2026 Reading Goal
                </span>
                <span className="font-mono font-bold text-ela-orange">
                  {booksReadCount} / {readingGoal}
                </span>
              </div>
              <div className="w-full bg-orange-100/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-ela-orange h-full rounded-full transition-all duration-500"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Announcements Noticeboard */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-ela-dark">Club Noticeboard</h2>
                <p className="text-[11px] text-ela-gray">Latest notices from Executive Board</p>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-orange-100 rounded-2xl">
                  <p className="text-xs text-ela-gray font-medium">No announcements posted yet.</p>
                  <p className="text-[11px] text-ela-gray/70 mt-1">Check back soon!</p>
                </div>
              ) : (
                announcements.slice(0, 4).map((ann) => (
                  <div key={ann.id} className="p-3 rounded-2xl bg-orange-50/40 border border-orange-100 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs text-ela-dark leading-tight">{ann.title}</h4>
                      <span className="text-[10px] text-ela-gray font-mono shrink-0">{ann.date}</span>
                    </div>
                    {ann.body && <p className="text-[11px] text-ela-gray leading-snug">{ann.body}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}