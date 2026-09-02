import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Link } from 'react-router-dom';
import { Calendar, CalendarCheck, Clock, MapPin, ArrowRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import PageLoader from '../components/PageLoader';

export default function Events() {
    const { state } = useAuthContext();
    const userId =
        state.sub ||
        state.username ||
        (state.email ? state.email.replace(/[@.]/g, '_') : null);

    const [activeTab, setActiveTab] = useState('upcoming');
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [attendedEvents, setAttendedEvents] = useState([]);
    const [loadingUpcoming, setLoadingUpcoming] = useState(true);
    const [loadingAttended, setLoadingAttended] = useState(true);

    // Fetch upcoming events
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
            (err) => {
                console.error('Firestore Error (upcoming events):', err);
                setLoadingUpcoming(false);
            }
        );
        return () => unsub();
    }, []);

    // Fetch attended events based on member document
    useEffect(() => {
        if (!userId) return;
        const fetchAttended = async () => {
            try {
                const memSnap = await getDoc(doc(db, 'members', userId));
                if (!memSnap.exists()) {
                    setLoadingAttended(false);
                    return;
                }
                const memberData = memSnap.data();
                const attendedIds = (memberData.attendedEvents || []).map(entry => typeof entry === 'string' ? entry : entry.eventId);

                if (attendedIds.length === 0) {
                    setAttendedEvents([]);
                    setLoadingAttended(false);
                    return;
                }

                // We could fetch them individually or listen to all past and filter
                // For simplicity and to keep realtime updates, we'll listen to all events
                // and filter in memory since Firebase has 'in' limits (max 30).
                const unsub = onSnapshot(
                    collection(db, 'events'),
                    (snap) => {
                        const allEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        const filtered = allEvents.filter(ev => attendedIds.includes(ev.id));
                        filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first
                        setAttendedEvents(filtered);
                        setLoadingAttended(false);
                    },
                    (err) => {
                        console.error('Firestore Error (attended events):', err);
                        setLoadingAttended(false);
                    }
                );
                return () => unsub();
            } catch (err) {
                console.error('Firestore Error (fetchAttended):', err);
                setLoadingAttended(false);
            }
        };
        fetchAttended();
    }, [userId]);

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
            <div>
                <h1 className="font-serif text-3xl font-bold text-ela-dark mb-2">Gathering Hub</h1>
                <p className="text-sm text-ela-gray">Discover upcoming circles and review the sessions you have attended.</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-orange-50/50 p-1.5 rounded-2xl border border-orange-100 max-w-sm">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'upcoming' ? 'bg-white text-ela-orange shadow-sm border border-orange-100/50' : 'text-ela-gray hover:text-ela-dark'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('attended')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'attended' ? 'bg-white text-ela-orange shadow-sm border border-orange-100/50' : 'text-ela-gray hover:text-ela-dark'
                        }`}
                >
                    <CalendarCheck className="w-4 h-4" />
                    Attended
                </button>
            </div>

            {/* Tab Panels */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
                {/* Upcoming */}
                {activeTab === 'upcoming' && (
                    <div className="space-y-6">
                        <h2 className="font-serif text-xl font-bold text-ela-dark">Upcoming ELA Sessions</h2>
                        {loadingUpcoming ? (
                            <PageLoader />
                        ) : upcomingEvents.length === 0 ? (
                            <div className="p-8 text-center bg-orange-50/30 rounded-2xl border border-orange-100 border-dashed">
                                <Calendar className="w-8 h-8 text-ela-orange/50 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-ela-dark">No upcoming sessions right now.</p>
                                <p className="text-xs text-ela-gray mt-1">Keep an eye out for our next scheduled meetup!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upcomingEvents.map((ev) => (
                                    <div key={ev.id} className="group relative overflow-hidden rounded-2xl border border-orange-100 hover:border-ela-orange hover:shadow-lg hover:shadow-orange-500/10 transition-all bg-white flex flex-col h-full">
                                        {(ev.imageUrls?.[0] || ev.imageUrl) && (
                                            <div className="w-full bg-orange-50/40 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={ev.imageUrls?.[0] || ev.imageUrl}
                                                    alt={ev.title}
                                                    className="w-full max-h-[320px] object-contain group-hover:scale-[1.02] transition duration-500"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <span className="text-[10px] font-bold text-ela-orange uppercase tracking-wider mb-2">{ev.venue}</span>
                                            <h3 className="font-bold text-lg text-ela-dark leading-tight mb-2">{ev.title}</h3>
                                            <div className="flex items-center gap-4 text-xs font-semibold text-ela-gray mb-4">
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {ev.date}</span>
                                                {ev.time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {ev.time}</span>}
                                            </div>
                                            {ev.body && <p className="text-xs text-ela-gray line-clamp-2 mb-6 flex-1">{ev.body}</p>}
                                            <Link to={`/events/${ev.id}`} className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-orange-50 hover:bg-ela-orange text-ela-orange hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition">
                                                View Details <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Attended */}
                {activeTab === 'attended' && (
                    <div className="space-y-6">
                        <h2 className="font-serif text-xl font-bold text-ela-dark">My Attended Sessions</h2>
                        {loadingAttended ? (
                            <PageLoader />
                        ) : attendedEvents.length === 0 ? (
                            <div className="p-8 text-center bg-orange-50/30 rounded-2xl border border-orange-100 border-dashed">
                                <CalendarCheck className="w-8 h-8 text-ela-orange/50 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-ela-dark">No attended sessions recorded.</p>
                                <p className="text-xs text-ela-gray mt-1">Make sure to scan the QR code at your next ELA gathering!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {attendedEvents.map((ev) => (
                                    <Link key={ev.id} to={`/events/${ev.id}`} className="block p-4 rounded-2xl border border-orange-100 bg-orange-50/20 hover:bg-orange-50 hover:border-ela-orange transition-all">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-ela-dark text-base">{ev.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-ela-gray mt-1">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ev.date}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.venue}</span>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm self-start sm:self-auto">
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
