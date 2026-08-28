import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, onSnapshot, collection, query, where } from 'firebase/firestore';
import { Vote, CheckCircle2, History, Sparkles } from 'lucide-react';

export default function Polls() {
    const { state } = useAuthContext();
    const [activePolls, setActivePolls] = useState([]);
    const [archivePolls, setArchivePolls] = useState([]);
    const [showArchive, setShowArchive] = useState(false);
    const [loading, setLoading] = useState(true);

    const userId = state.sub || state.username || (state.email ? state.email.replace(/[@.]/g, '_') : null);

    useEffect(() => {
        // Listen to all active polls
        const activeQ = query(collection(db, 'polls'), where('status', '==', 'active'));
        const unsubActive = onSnapshot(
            activeQ,
            (snap) => {
                const polls = [];
                snap.forEach((d) => polls.push({ id: d.id, ...d.data() }));
                polls.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setActivePolls(polls);
                setLoading(false);
            },
            (err) => {
                console.error('Firestore Error in Polls (active):', err);
                setLoading(false);
            }
        );

        // Fetch closed archive polls
        const closedQ = query(collection(db, 'polls'), where('status', '==', 'closed'));
        const unsubClosed = onSnapshot(
            closedQ,
            (snap) => {
                const archives = [];
                snap.forEach((d) => archives.push({ id: d.id, ...d.data() }));
                setArchivePolls(archives);
            },
            (err) => console.error('Firestore Error in Polls (closed):', err)
        );

        return () => {
            unsubActive();
            unsubClosed();
        };
    }, []);

    const handleVote = async (poll, optionIndex) => {
        const hasVoted = poll.voterIds?.includes(userId);
        if (!poll || hasVoted) return;

        const pollRef = doc(db, 'polls', poll.id);
        const updatedOptions = [...poll.options];
        updatedOptions[optionIndex].votes = (updatedOptions[optionIndex].votes || 0) + 1;

        try {
            await updateDoc(pollRef, {
                options: updatedOptions,
                voterIds: arrayUnion(userId)
            });
        } catch (err) {
            console.error('Firestore Error in Polls (vote):', err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ela-dark mb-2">Polling Station</h1>
                    <p className="text-sm text-ela-gray">Vote on upcoming themes, check attendance, and view past results.</p>
                </div>
                <button
                    onClick={() => setShowArchive(!showArchive)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 border ${showArchive ? 'bg-ela-dark text-white border-ela-dark shadow-sm' : 'bg-white text-ela-gray hover:text-ela-orange border-orange-100 hover:border-ela-orange shadow-xs'
                        }`}
                >
                    <History className="w-4 h-4" />
                    {showArchive ? 'Back to Active Polls' : 'View Polling Archive'}
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-orange-100 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-orange-100 pb-6 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
                        <Vote className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-serif font-bold text-xl text-ela-dark">{showArchive ? 'Archived Results' : 'Active Polls'}</h2>
                        <p className="text-xs text-ela-gray">{showArchive ? 'Review community decisions from the past' : 'Cast your vote before these close'}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-24 bg-orange-50 rounded-2xl w-full"></div>
                        <div className="h-24 bg-orange-50 rounded-2xl w-full"></div>
                    </div>
                ) : !showArchive ? (
                    <div className="space-y-8">
                        {activePolls.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-center border-2 border-dashed border-orange-100 rounded-3xl bg-orange-50/30">
                                <div className="w-12 h-12 rounded-full bg-white border border-orange-100 flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-6 h-6 text-ela-orange" />
                                </div>
                                <p className="text-base font-semibold text-ela-dark mt-2">No active polls at the moment.</p>
                                <p className="text-sm text-ela-gray">Stay tuned for the next fortnight's polling session!</p>
                            </div>
                        ) : (
                            activePolls.map((poll) => {
                                const hasVoted = poll.voterIds?.includes(userId);
                                const totalVotes = poll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);

                                return (
                                    <div key={poll.id} className="space-y-4 bg-gradient-to-br from-orange-50/40 to-white p-6 sm:p-8 rounded-3xl border border-orange-100/60 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-ela-dark text-lg sm:text-xl">{poll.title}</h3>
                                                <span className="px-3 py-1 bg-white border border-orange-100 rounded-lg text-[10px] font-bold text-ela-orange uppercase tracking-wider">
                                                    {poll.type === 'attendance' ? 'Attendance' : 'Theme Vote'}
                                                </span>
                                            </div>
                                            {poll.description && <p className="text-sm text-ela-gray mb-6">{poll.description}</p>}

                                            <div className="space-y-3">
                                                {poll.options.map((opt, idx) => {
                                                    const count = opt.votes || 0;
                                                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleVote(poll, idx)}
                                                            disabled={hasVoted}
                                                            className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${hasVoted
                                                                ? percentage === Math.max(...poll.options.map((o) => totalVotes > 0 ? Math.round(((o.votes || 0) / totalVotes) * 100) : 0))
                                                                    ? 'border-ela-orange bg-orange-50/50 cursor-default'
                                                                    : 'border-orange-100/60 bg-white/50 cursor-default grayscale-[30%]'
                                                                : 'border-orange-100 hover:border-ela-orange bg-white shadow-sm hover:shadow-md'
                                                                }`}
                                                        >
                                                            {hasVoted && (
                                                                <div
                                                                    className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${percentage === Math.max(...poll.options.map((o) => totalVotes > 0 ? Math.round(((o.votes || 0) / totalVotes) * 100) : 0)) ? 'bg-orange-100' : 'bg-orange-50/80'}`}
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            )}
                                                            <div className="relative flex justify-between items-center z-10">
                                                                <span className={`font-semibold flex items-center gap-3 text-sm sm:text-base ${hasVoted ? 'text-ela-dark' : 'text-ela-dark group-hover:text-ela-orange transition-colors'}`}>
                                                                    {hasVoted ? (
                                                                        <CheckCircle2 className={`w-5 h-5 ${opt.votes > 0 ? 'text-ela-orange' : 'text-ela-gray/50'}`} />
                                                                    ) : (
                                                                        <div className="w-5 h-5 rounded-full border-2 border-orange-100 group-hover:border-ela-orange transition-colors" />
                                                                    )}
                                                                    {opt.text}
                                                                </span>
                                                                {hasVoted && (
                                                                    <span className="font-mono font-bold text-ela-dark bg-white/80 px-2 py-0.5 rounded text-sm sm:text-base shadow-xs backdrop-blur-sm">
                                                                        {percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-orange-100/50 text-xs font-semibold text-ela-gray">
                                                <span className="flex items-center gap-2">
                                                    {hasVoted ? (
                                                        <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Vote recorded successfully</>
                                                    ) : (
                                                        'Select an option to cast your vote'
                                                    )}
                                                </span>
                                                <span className="bg-orange-50 px-2.5 py-1 rounded-md text-ela-dark">{totalVotes} Total Votes</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {archivePolls.length === 0 ? (
                            <p className="text-sm text-ela-gray italic col-span-full text-center py-8">No archived polls available yet.</p>
                        ) : (
                            archivePolls.map((arc) => {
                                const totalVotes = arc.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);
                                const winner = [...arc.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];

                                return (
                                    <div key={arc.id} className="p-6 rounded-3xl border border-orange-100/70 bg-orange-50/30 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-serif font-bold text-lg text-ela-dark mb-4">{arc.title}</h4>
                                            <div className="space-y-2 mb-6">
                                                {arc.options.map((opt, i) => {
                                                    const pct = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                                                    return (
                                                        <div key={i} className="flex justify-between items-center text-xs text-ela-dark">
                                                            <span className="truncate w-1/2">{opt.text}</span>
                                                            <div className="flex-1 mx-3 h-1.5 bg-white rounded-full overflow-hidden border border-orange-100/50">
                                                                <div className="h-full bg-ela-orange rounded-full" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="font-mono font-bold w-10 text-right">{pct}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
                                            <span className="text-ela-gray">Winner: <span className="font-bold text-ela-orange">{winner?.text || 'N/A'}</span></span>
                                            <span className="font-mono font-bold text-ela-dark">{totalVotes} votes</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
