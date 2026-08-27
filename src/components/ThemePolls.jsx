import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, onSnapshot, collection, query, where } from 'firebase/firestore';
import { Vote, CheckCircle2, History, Sparkles } from 'lucide-react';

export default function ThemePolls() {
  const { state } = useAuthContext();
  const [activePolls, setActivePolls] = useState([]);
  const [archivePolls, setArchivePolls] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = state.sub || state.username;

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
        console.error('Firestore Error in ThemePolls (active):', err);
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
      (err) => console.error('Firestore Error in ThemePolls (closed):', err)
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
      console.error('Firestore Error in ThemePolls (vote):', err);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded-3xl animate-pulse text-xs">Loading polls...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-ela-dark">Community Polls</h2>
            <p className="text-xs text-ela-gray">Vote on upcoming themes and confirm attendance</p>
          </div>
        </div>

        <button
          onClick={() => setShowArchive(!showArchive)}
          className="flex items-center gap-1.5 text-xs font-semibold text-ela-gray hover:text-ela-orange transition"
        >
          <History className="w-4 h-4" />
          {showArchive ? 'Active Polls' : 'View Archive'}
        </button>
      </div>

      {!showArchive ? (
        <div className="space-y-6">
          {activePolls.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-ela-orange" />
              </div>
              <p className="text-sm font-semibold text-ela-dark">No active theme polls at the moment.</p>
              <p className="text-xs text-ela-gray">Stay tuned for the next fortnight!</p>
            </div>
          ) : (
            activePolls.map((poll) => {
              const hasVoted = poll.voterIds?.includes(userId);
              const totalVotes = poll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);

              return (
                <div key={poll.id} className="space-y-3 bg-orange-50/20 p-4 rounded-2xl border border-orange-100/60">
                  <h3 className="font-bold text-ela-dark text-sm">{poll.title}</h3>
                  {poll.description && <p className="text-xs text-ela-gray">{poll.description}</p>}

                  <div className="space-y-2 mt-3">
                    {poll.options.map((opt, idx) => {
                      const count = opt.votes || 0;
                      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleVote(poll, idx)}
                          disabled={hasVoted}
                          className={`w-full text-left p-3 rounded-xl border transition relative overflow-hidden ${hasVoted
                            ? 'border-orange-100 bg-orange-50/40 cursor-default'
                            : 'border-orange-100 hover:border-ela-orange bg-white shadow-sm'
                            }`}
                        >
                          {hasVoted && (
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-orange-100/60 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                          <div className="relative flex justify-between items-center text-xs">
                            <span className="font-semibold text-ela-dark flex items-center gap-2">
                              {hasVoted && <CheckCircle2 className="w-3.5 h-3.5 text-ela-orange" />}
                              {opt.text}
                            </span>
                            {hasVoted && (
                              <span className="font-mono font-bold text-ela-gray">
                                {percentage}% ({count})
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-2 text-[10px] font-semibold text-ela-gray">
                    <span>{hasVoted ? '✓ Vote submitted (locked)' : 'Select one option to cast your vote'}</span>
                    <span>{totalVotes} total votes</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider">Past Polls</h3>
          {archivePolls.length === 0 ? (
            <p className="text-xs text-ela-gray italic">No archived polls available yet.</p>
          ) : (
            archivePolls.map((arc) => {
              const totalVotes = arc.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);
              const winner = [...arc.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];

              return (
                <div key={arc.id} className="p-4 rounded-2xl border border-orange-100/70 bg-orange-50/30 space-y-1">
                  <h4 className="font-serif font-bold text-sm text-ela-dark">{arc.title}</h4>
                  <div className="flex justify-between items-center text-xs text-ela-gray">
                    <span>Winner: <span className="font-semibold text-ela-orange">{winner?.text || 'N/A'}</span></span>
                    <span className="font-mono font-bold">{totalVotes} votes</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}