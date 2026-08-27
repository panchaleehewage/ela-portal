import { useEffect, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Calendar, Bell } from 'lucide-react';
import { db } from '../firebase';
import {
  doc, getDoc, setDoc, collection, query, where,
  onSnapshot, orderBy
} from 'firebase/firestore';
import ThemePolls from '../components/ThemePolls';
import LiteraryPassport from '../components/LiteraryPassport';

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
  const userId = state.sub || state.username;

  const [memberData, setMemberData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Member Initialization
    const initMember = async () => {
      const memberRef = doc(db, 'members', userId);
      const snap = await getDoc(memberRef);
      if (!snap.exists()) {
        const newMember = {
          userId,
          displayName: state.displayName || state.username || '',
          email: state.email || '',
          membershipStatus: 'Active 2026',
          badges: [],
          booksRead: [],
          attendedEvents: []
        };
        await setDoc(memberRef, newMember);
        setMemberData(newMember);
      } else {
        setMemberData(snap.data());
      }
    };
    initMember();

    // Subscribe to upcoming events
    const eventsQ = query(
      collection(db, 'events'),
      where('type', '==', 'upcoming')
    );
    const unsubEvents = onSnapshot(eventsQ, (snapshot) => {
      const eventsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setUpcomingEvents(eventsData);
    });

    // Subscribe to announcements
    const annQ = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );
    const unsubAnn = onSnapshot(annQ, (snapshot) => {
      setAnnouncements(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubEvents();
      unsubAnn();
    };
  }, [userId]);

  const nearestEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const cleanName = getCleanName(state);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
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
            {nearestEvent
              ? <>Next Fortnightly Circle: <span className="font-semibold underline">{nearestEvent.title} — {nearestEvent.date} at {nearestEvent.time} ({nearestEvent.venue})</span></>
              : 'No upcoming circles scheduled yet'
            }
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-xs uppercase font-semibold tracking-wider text-white/80 block">Membership Status</span>
          <span className="font-serif font-bold text-lg text-white">{memberData?.membershipStatus || 'Loading…'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: main content */}
        <div className="lg:col-span-2 space-y-8">
          <ThemePolls />
          <LiteraryPassport />

          {/* Upcoming Events */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-ela-dark">Upcoming ELA Sessions</h2>
                <p className="text-xs text-ela-gray">Live calendar of upcoming club gatherings</p>
              </div>
            </div>

            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-ela-gray italic">No upcoming sessions right now.</p>
              ) : (
                upcomingEvents.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-2xl border border-orange-100/80 hover:bg-orange-50/30 transition flex flex-col sm:flex-row gap-4 items-start">
                    {ev.imageUrl && (
                      <div className="w-full sm:w-32 h-32 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-sm bg-orange-100 border border-orange-200">
                        <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-ela-orange uppercase tracking-wider">{ev.venue}</span>
                      <h3 className="font-bold text-ela-dark text-base leading-tight mt-0.5">{ev.title}</h3>
                      <p className="text-xs text-ela-dark font-semibold mt-1">{ev.date}{ev.time ? ` • ${ev.time}` : ''}</p>
                      {ev.body && <p className="text-xs text-ela-gray mt-1">{ev.body}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Member Card */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-xs text-center">
            <div className="w-20 h-20 bg-orange-100 text-ela-orange rounded-full flex items-center justify-center font-serif text-3xl font-bold mx-auto mb-4 border-2 border-ela-orange/20">
              {cleanName.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-serif font-bold text-lg text-ela-dark">{cleanName}</h3>
            <p className="text-xs text-ela-gray mb-4">{state.email || 'Verified via Asgardeo'}</p>

            <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ela-gray">Member ID:</span>
                <span className="font-mono font-semibold">#ELA-{userId?.slice(0, 6) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ela-gray">Sessions Attended:</span>
                <span className="font-semibold text-ela-dark">{memberData?.attendedEvents?.length || 0} Sessions</span>
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
                <p className="text-[11px] text-ela-gray">Latest announcements from the board</p>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-ela-gray italic">No announcements yet.</p>
              ) : (
                announcements.slice(0, 5).map((ann) => (
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