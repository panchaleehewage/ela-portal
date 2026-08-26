import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { Vote, CheckCircle2, History, Sparkles } from 'lucide-react';

export default function ThemePolls() {
  const { state } = useAuthContext();
  const [activePoll, setActivePoll] = useState(null);
  const [archivePolls, setArchivePolls] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = state.sub || state.username;

  useEffect(() => {
    // Listen to the active poll in real-time
    const pollRef = doc(db, 'polls', 'current_poll');
    const unsub = onSnapshot(pollRef, (snap) => {
      if (snap.exists()) {
        setActivePoll(snap.data());
      }
      setLoading(false);
    });

    // Fetch closed archive polls
    async function fetchArchives() {
      const q = query(collection(db, 'polls'), where('status', '==', 'archived'));
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setArchivePolls(docs);
    }
    fetchArchives();

    return () => unsub();
  }, []);

  const handleVote = async (optionIndex) => {
    if (!activePoll || hasVoted) return;
    const pollRef = doc(db, 'polls', 'current_poll');
    const updatedOptions = [...activePoll.options];
    updatedOptions[optionIndex].votes = (updatedOptions[optionIndex].votes || 0) + 1;

    await updateDoc(pollRef, {
      options: updatedOptions,
      voterIds: arrayUnion(userId)
    });
  };

  if (loading) return <div className="p-6 bg-white rounded-3xl animate-pulse text-xs">Loading poll...</div>;
  if (!activePoll) return null;

  const hasVoted = activePoll.voterIds?.includes(userId);
  const totalVotes = activePoll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-ela-dark">{activePoll.title}</h2>
            <p className="text-xs text-ela-gray">{activePoll.description || 'Cast your vote for the upcoming fortnight'}</p>
          </div>
        </div>

        <button
          onClick={() => setShowArchive(!showArchive)}
          className="flex items-center gap-1.5 text-xs font-semibold text-ela-gray hover:text-ela-orange transition"
        >
          <History className="w-4 h-4" />
          {showArchive ? 'Active Poll' : 'View Archive'}
        </button>
      </div>

      {!showArchive ? (
        <div className="space-y-3">
          {activePoll.options.map((opt, idx) => {
            const count = opt.votes || 0;
            const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

            return (
              <button
                key={idx}
                onClick={() => handleVote(idx)}
                disabled={hasVoted}
                className={`w-full text-left p-4 rounded-2xl border transition relative overflow-hidden ${
                  hasVoted
                    ? 'border-orange-100 bg-orange-50/20 cursor-default'
                    : 'border-orange-100 hover:border-ela-orange bg-white'
                }`}
              >
                {hasVoted && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-orange-100/60 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                )}
                <div className="relative flex justify-between items-center text-sm">
                  <span className="font-semibold text-ela-dark flex items-center gap-2">
                    {hasVoted && <CheckCircle2 className="w-4 h-4 text-ela-orange" />}
                    {opt.text}
                  </span>
                  {hasVoted && (
                    <span className="text-xs font-mono font-bold text-ela-gray">
                      {percentage}% ({count})
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="flex justify-between items-center pt-2 text-[11px] font-semibold text-ela-gray">
            <span>{hasVoted ? '✓ Vote submitted (locked)' : 'Select one theme to cast your vote'}</span>
            <span>{totalVotes} total votes</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider">Winning Themes from Past Fortnights</h3>
          {archivePolls.length === 0 ? (
            <p className="text-xs text-ela-gray italic">No past archives available yet.</p>
          ) : (
            archivePolls.map((arc) => (
              <div key={arc.id} className="p-4 rounded-2xl border border-orange-100/70 bg-orange-50/30 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-ela-orange uppercase">{arc.fortnightLabel}</span>
                  <h4 className="font-serif font-bold text-sm text-ela-dark">{arc.winnerTitle}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-ela-gray">{arc.totalVotes} votes</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}