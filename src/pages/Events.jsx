import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Link } from 'react-router-dom';
import {
    Calendar, CalendarCheck, Clock, MapPin,
    ArrowRight, Camera, Award, ImageOff
} from 'lucide-react';
import { db } from '../firebase';
import {
    collection, query, where, orderBy,
    onSnapshot, doc, getDoc
} from 'firebase/firestore';
import PageLoader from '../components/PageLoader';

/* ── shared tab button style ── */
const tabCls = (active) =>
    `flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${active
        ? 'bg-white text-ela-orange shadow-sm border border-orange-100/50'
        : 'text-ela-gray hover:text-ela-dark'
    }`;

export default function Events() {
    const { state } = useAuthContext();
    const userId =
        state?.sub ||
        state?.username ||
        (state?.email ? state.email.replace(/[@.]/g, '_') : null);

    const isAuth = state?.isAuthenticated;

    const [activeTab, setActiveTab] = useState('upcoming');

    /* ── upcoming ── */
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loadingUpcoming, setLoadingUpcoming] = useState(true);

    /* ── past / chronicler ── */
    const [pastEvents, setPastEvents] = useState([]);
    const [loadingPast, setLoadingPast] = useState(true);

    /* ── attended ── */
    const [attendedEvents, setAttendedEvents] = useState([]);
    const [loadingAttended, setLoadingAttended] = useState(true);

    /* fetch upcoming */
    useEffect(() => {
        const q = query(collection(db, 'events'), where('type', '==', 'upcoming'));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setUpcomingEvents(data);
                setLoadingUpcoming(false);
            },
            () => setLoadingUpcoming(false)
        );
        return () => unsub();
    }, []);

    /* fetch past events (public — no auth needed) */
    useEffect(() => {
        const q = query(
            collection(db, 'events'),
            where('type', '==', 'past'),
            orderBy('date', 'desc')
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setPastEvents(data);
                setLoadingPast(false);
            },
            () => setLoadingPast(false)
        );
        return () => unsub();
    }, []);

    /* fetch attended (auth only) */
    useEffect(() => {
        if (!userId) { setLoadingAttended(false); return; }
        const fetchAttended = async () => {
            try {
                const memSnap = await getDoc(doc(db, 'members', userId));
                if (!memSnap.exists()) { setLoadingAttended(false); return; }
                const attendedIds = (memSnap.data().attendedEvents || []).map((e) =>
                    typeof e === 'string' ? e : e.eventId
                );
                if (attendedIds.length === 0) { setAttendedEvents([]); setLoadingAttended(false); return; }
                const unsub = onSnapshot(
                    collection(db, 'events'),
                    (snap) => {
                        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                        const filtered = all
                            .filter((ev) => attendedIds.includes(ev.id))
                            .sort((a, b) => new Date(b.date) - new Date(a.date));
                        setAttendedEvents(filtered);
                        setLoadingAttended(false);
                    },
                    () => setLoadingAttended(false)
                );
                return () => unsub();
            } catch { setLoadingAttended(false); }
        };
        fetchAttended();
    }, [userId]);

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-10 space-y-8">
            {/* Page header */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-ela-dark mb-1">Events &amp; Gallery</h1>
                <p className="text-sm text-ela-gray">Upcoming gatherings, past chronicles, and your attendance record.</p>
            </div>

            {/* Tab bar — always same width */}
            <div className="flex bg-orange-50/50 p-1.5 rounded-2xl border border-orange-100 w-full">
                <button onClick={() => setActiveTab('upcoming')} className={tabCls(activeTab === 'upcoming')}>
                    <Calendar className="w-4 h-4" /> Upcoming
                </button>
                <button onClick={() => setActiveTab('past')} className={tabCls(activeTab === 'past')}>
                    <Camera className="w-4 h-4" /> The Chronicler
                </button>
                {isAuth && (
                    <button onClick={() => setActiveTab('attended')} className={tabCls(activeTab === 'attended')}>
                        <CalendarCheck className="w-4 h-4" /> My Sessions
                    </button>
                )}
            </div>

            {/* Tab panels — fixed outer wrapper prevents layout shift */}
            <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs min-h-[300px]">

                {/* ── TAB 1: Upcoming ── */}
                {activeTab === 'upcoming' && (
                    <div className="space-y-6">
                        <h2 className="font-serif text-xl font-bold text-ela-dark">Upcoming ELA Sessions</h2>
                        {loadingUpcoming ? (
                            <PageLoader />
                        ) : upcomingEvents.length === 0 ? (
                            <div className="p-8 text-center bg-orange-50/30 rounded-2xl border border-dashed border-orange-100">
                                <Calendar className="w-8 h-8 text-ela-orange/50 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-ela-dark">No upcoming sessions right now.</p>
                                <p className="text-xs text-ela-gray mt-1">Keep an eye out for our next scheduled meetup!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcomingEvents.map((ev) => (
                                    <div key={ev.id} className="group relative overflow-hidden rounded-2xl border border-orange-100 hover:border-ela-orange hover:shadow-lg hover:shadow-orange-500/10 transition-all bg-white flex flex-col">
                                        {(ev.imageUrls?.[0] || ev.imageUrl) && (
                                            <div className="w-full bg-orange-50/40 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={ev.imageUrls?.[0] || ev.imageUrl}
                                                    alt={ev.title}
                                                    className="w-full max-h-[300px] object-contain group-hover:scale-[1.02] transition duration-500"
                                                    onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            {ev.venue && <span className="text-[10px] font-bold text-ela-orange uppercase tracking-wider mb-2">{ev.venue}</span>}
                                            <h3 className="font-bold text-lg text-ela-dark leading-tight mb-2">{ev.title}</h3>
                                            <div className="flex items-center gap-4 text-xs font-semibold text-ela-gray mb-4">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {ev.date}</span>
                                                {ev.time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {ev.time}</span>}
                                            </div>
                                            {ev.body && <p className="text-xs text-ela-gray line-clamp-2 mb-6 flex-1">{ev.body}</p>}
                                            <Link
                                                to={`/events/${ev.id}`}
                                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-orange-50 hover:bg-ela-orange text-ela-orange hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
                                            >
                                                View Details <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 2: Chronicler (Past) — public ── */}
                {activeTab === 'past' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="font-serif text-xl font-bold text-ela-dark">The Chronicler</h2>
                            <p className="text-xs text-ela-gray mt-1">A photographic archive of past ELA gatherings &amp; book circles.</p>
                        </div>
                        {loadingPast ? (
                            <PageLoader />
                        ) : pastEvents.length === 0 ? (
                            <div className="p-8 text-center bg-orange-50/30 rounded-2xl border border-dashed border-orange-100">
                                <Camera className="w-8 h-8 text-ela-orange/50 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-ela-dark">No past events logged yet.</p>
                                <p className="text-xs text-ela-gray mt-1">Session recaps will appear here once admins publish them.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pastEvents.map((event) => {
                                    const firstImage =
                                        (event.imageUrls && event.imageUrls[0]) || event.imageUrl || null;
                                    return (
                                        <Link
                                            key={event.id}
                                            to={`/events/${event.id}`}
                                            className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-xs flex flex-col hover:border-ela-orange hover:shadow-lg hover:shadow-orange-500/10 transition-all group"
                                        >
                                            <div className="w-full bg-orange-50/40 flex items-center justify-center overflow-hidden">
                                                {firstImage ? (
                                                    <img
                                                        src={firstImage}
                                                        alt={event.title}
                                                        className="w-full max-h-[280px] object-contain group-hover:scale-[1.02] transition duration-500"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-28 flex items-center justify-center text-orange-200">
                                                        <ImageOff className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 space-y-3 flex-1 flex flex-col">
                                                <div className="flex items-center justify-between text-xs text-ela-gray">
                                                    <span className="flex items-center gap-1.5 font-semibold text-ela-orange">
                                                        <Calendar className="w-3.5 h-3.5" /> {event.date}
                                                    </span>
                                                    {event.venue && (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-bold text-ela-dark uppercase tracking-wider">
                                                            {event.venue}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-serif font-bold text-lg text-ela-dark group-hover:text-ela-orange transition leading-tight">
                                                    {event.title}
                                                </h3>
                                                {event.body && (
                                                    <p className="text-xs text-ela-gray leading-relaxed flex-1 line-clamp-3">{event.body}</p>
                                                )}
                                                {event.winnerOrHighlights && (
                                                    <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 flex items-center gap-2 text-ela-dark mt-auto">
                                                        <Award className="w-3.5 h-3.5 text-ela-orange shrink-0" />
                                                        <span className="text-xs font-medium line-clamp-1">{event.winnerOrHighlights}</span>
                                                    </div>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-ela-orange mt-1">
                                                    Read Full Recap <ArrowRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 3: My Attended Sessions (auth only) ── */}
                {activeTab === 'attended' && (
                    <div className="space-y-6">
                        <h2 className="font-serif text-xl font-bold text-ela-dark">My Attended Sessions</h2>
                        {!isAuth ? (
                            <div className="p-8 text-center bg-orange-50/30 rounded-2xl border border-dashed border-orange-100">
                                <p className="text-sm font-semibold text-ela-dark">Sign in to see your attendance history.</p>
                            </div>
                        ) : loadingAttended ? (
                            <PageLoader />
                        ) : attendedEvents.length === 0 ? (
                            <div className="p-8 text-center bg-orange-50/30 rounded-2xl border border-dashed border-orange-100">
                                <CalendarCheck className="w-8 h-8 text-ela-orange/50 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-ela-dark">No attended sessions recorded.</p>
                                <p className="text-xs text-ela-gray mt-1">Scan the QR code at your next ELA gathering!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {attendedEvents.map((ev) => (
                                    <Link
                                        key={ev.id}
                                        to={`/events/${ev.id}`}
                                        className="block p-4 rounded-2xl border border-orange-100 bg-orange-50/20 hover:bg-orange-50 hover:border-ela-orange transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-ela-dark text-base">{ev.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-ela-gray mt-1">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ev.date}</span>
                                                    {ev.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.venue}</span>}
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm self-start sm:self-auto shrink-0">
                                                <CalendarCheck className="w-3.5 h-3.5" /> Verified
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
