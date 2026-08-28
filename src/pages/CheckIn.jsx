import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { CheckCircle2, AlertCircle, Loader2, LogIn, CalendarCheck } from 'lucide-react';

export default function CheckIn() {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('eventId');
    const { state, signIn } = useAuthContext();
    const navigate = useNavigate();

    const [status, setStatus] = useState('idle'); // idle, loading, success, error, invalid
    const [eventData, setEventData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const userId = state.sub || state.username || (state.email ? state.email.replace(/[@.]/g, '_') : null);

    useEffect(() => {
        if (!eventId) {
            setStatus('invalid');
            return;
        }

        const verifyAndCheckIn = async () => {
            try {
                setStatus('loading');

                // 1. Fetch Event Document
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);

                if (!eventSnap.exists()) {
                    setStatus('invalid');
                    setErrorMsg('The event you are trying to check into does not exist.');
                    return;
                }

                setEventData(eventSnap.data());

                // Stop here if user is not logged in. They need to click Sign In.
                if (!state.isAuthenticated || !userId) {
                    setStatus('idle');
                    return;
                }

                // 2. Ensure member document exists before writing arrayUnion
                const memRef = doc(db, 'members', userId);
                const memSnap = await getDoc(memRef);
                if (!memSnap.exists()) {
                    // Provision their account right now
                    await setDoc(memRef, {
                        userId,
                        displayName: state.displayName || state.username || (state.email ? state.email.split('@')[0] : 'Member'),
                        email: state.email || '',
                        membershipStatus: 'Active 2026',
                        badges: [],
                        booksRead: [],
                        attendedEvents: [],
                        createdAt: new Date(),
                    });
                }

                // 3. Perform check-in writes
                await Promise.all([
                    updateDoc(eventRef, {
                        attendees: arrayUnion(userId)
                    }),
                    updateDoc(memRef, {
                        attendedEvents: arrayUnion({ eventId, title: eventData.title, date: eventData.date || new Date().toISOString() })
                    })
                ]);

                setStatus('success');
            } catch (err) {
                console.error('Check-in error:', err);
                setStatus('error');
                setErrorMsg('We encountered a problem confirming your attendance. Please try again.');
            }
        };

        verifyAndCheckIn();
    }, [eventId, state.isAuthenticated, userId]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-ela-cream">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-500/10 text-center relative overflow-hidden">
                {/* Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ela-orange to-ela-amber" />

                {status === 'invalid' && (
                    <div className="space-y-4 py-4">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-serif font-bold text-ela-dark">Invalid Code</h2>
                        <p className="text-sm text-ela-gray">{errorMsg || 'This check-in link is missing a valid event ID.'}</p>
                        <button
                            onClick={() => navigate('/events')}
                            className="mt-4 px-6 py-2.5 bg-orange-50 text-ela-dark font-bold text-xs uppercase tracking-wider rounded-xl transition hover:bg-orange-100"
                        >
                            Back to Events
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="space-y-6 py-8 flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-ela-orange animate-spin mx-auto" />
                        <div>
                            <h2 className="text-lg font-serif font-bold text-ela-dark">Verifying Attendance…</h2>
                            <p className="text-xs text-ela-gray mt-1">Please wait while we log your passport.</p>
                        </div>
                    </div>
                )}

                {status === 'idle' && !state.isAuthenticated && eventData && (
                    <div className="space-y-6 py-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto shadow-sm">
                            <CalendarCheck className="w-8 h-8 text-ela-orange" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-ela-orange uppercase tracking-wider mb-2">Check-in for</p>
                            <h2 className="text-2xl font-serif font-bold text-ela-dark leading-tight">{eventData.title}</h2>
                            <p className="text-sm text-ela-gray mt-2">{eventData.date} • {eventData.venue}</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-left">
                            <p className="text-xs font-semibold text-blue-900 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                You must sign in to your ELA Portal account to confirm attendance.
                            </p>
                        </div>

                        <button
                            onClick={() => signIn()}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-ela-orange text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 hover:bg-ela-tangerine transition"
                        >
                            <LogIn className="w-5 h-5" /> Sign In to Check In
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 py-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-ela-dark">Attendance Verified!</h2>
                            <p className="text-sm text-ela-gray mt-2 px-4">
                                You've successfully checked in for <span className="font-bold text-ela-dark">{eventData?.title}</span>. It has been added to your Literary Passport.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full mt-4 px-6 py-3.5 bg-ela-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition hover:bg-black"
                        >
                            View Member Passport
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 py-4">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-2xl font-serif font-bold text-ela-dark">Check-in Failed</h2>
                        <p className="text-sm text-ela-gray">{errorMsg}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2.5 bg-orange-50 text-ela-dark font-bold text-xs uppercase tracking-wider rounded-xl transition hover:bg-orange-100"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
