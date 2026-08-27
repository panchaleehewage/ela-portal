import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Award, BookCheck, PlusCircle } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

export default function LiteraryPassport() {
  const { state } = useAuthContext();
  const userId = state.sub || state.username;

  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: '' });

  useEffect(() => {
    if (!userId) return;
    const userRef = doc(db, 'members', userId);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setMemberData(snap.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const handleLogBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    const userRef = doc(db, 'members', userId);
    await updateDoc(userRef, {
      booksRead: arrayUnion({
        ...newBook,
        readDate: new Date().toISOString().split('T')[0]
      })
    });
    setNewBook({ title: '', author: '', genre: '' });
    setShowLogModal(false);
  };

  if (loading) return <div className="p-6 bg-white rounded-3xl animate-pulse text-xs border border-orange-100 shadow-xs">Loading Passport...</div>;
  if (!memberData) return null;

  const memberBadges = memberData.badges || [];
  const booksRead = memberData.booksRead || [];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs space-y-6 text-ela-dark">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-lg text-ela-dark">Member Literary Passport</h2>
          <p className="text-xs text-ela-gray">Your recorded club milestones and reading journey</p>
        </div>
      </div>

      {/* Badges Earned */}
      <div>
        <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider mb-3">Earned Association Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {memberBadges.length === 0 ? (
            <p className="text-xs text-ela-gray italic col-span-full">No badges earned yet. Participate in events!</p>
          ) : (
            memberBadges.map((badge, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100 flex items-start gap-3">
                <span className="text-2xl">{badge.icon || '🎖️'}</span>
                <div>
                  <h4 className="font-bold text-xs text-ela-dark">{badge.title}</h4>
                  <p className="text-[11px] text-ela-gray leading-tight mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Club Books Read */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider flex items-center gap-1.5">
            <BookCheck className="w-4 h-4 text-ela-orange" />
            Books Read with ELA
          </h3>
          <button
            onClick={() => setShowLogModal(!showLogModal)}
            className="flex items-center gap-1 text-[11px] font-bold text-ela-orange hover:text-ela-tangerine bg-orange-50 px-2 py-1 rounded-full uppercase tracking-wider transition border border-orange-100"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Log Book
          </button>
        </div>

        {showLogModal && (
          <form onSubmit={handleLogBook} className="p-4 mb-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
            <h4 className="text-xs font-bold text-ela-dark">Log a Finished Read</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Title" required value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} className="p-2 text-xs rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange" />
              <input type="text" placeholder="Author" required value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} className="p-2 text-xs rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange" />
              <input type="text" placeholder="Genre" value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value })} className="p-2 text-xs rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange sm:col-span-2" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowLogModal(false)} className="px-3 py-1.5 text-xs text-ela-gray font-semibold hover:bg-orange-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-3 py-1.5 bg-ela-orange text-white text-xs font-bold uppercase rounded-lg shadow-sm hover:bg-ela-tangerine transition">Submit Log</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {booksRead.length === 0 ? (
            <p className="text-xs text-ela-gray italic">No books logged yet.</p>
          ) : (
            booksRead.map((book, i) => (
              <div key={i} className="p-3 rounded-xl border border-orange-100/80 hover:bg-orange-50/30 transition flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-2 sm:gap-0">
                <div>
                  <span className="font-bold text-ela-dark">{book.title}</span>
                  <span className="text-ela-gray sm:ml-2 block sm:inline">— {book.author}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="text-[10px] text-ela-gray italic">{book.readDate}</span>
                  {book.genre && (
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-ela-orange font-semibold text-[10px]">
                      {book.genre}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}