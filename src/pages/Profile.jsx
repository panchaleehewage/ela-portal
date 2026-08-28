import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { Award, BookCheck, PlusCircle, Star, Heart, Target, Sparkles, BookHeart, Tags } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function Profile() {
    const { state } = useAuthContext();
    const userId = state.sub || state.username || (state.email ? state.email.replace(/[@.]/g, '_') : null);
    const cleanName = state.displayName || state.username || (state.email ? state.email.split('@')[0] : 'Member');

    const [memberData, setMemberData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showLogModal, setShowLogModal] = useState(false);
    const [newBook, setNewBook] = useState({ title: '', author: '', genre: '', rating: 5 });

    const [newTag, setNewTag] = useState('');
    const [newWishlist, setNewWishlist] = useState('');
    const [goalEditing, setGoalEditing] = useState(false);
    const [goalValue, setGoalValue] = useState(12);

    useEffect(() => {
        if (!userId) return;
        const userRef = doc(db, 'members', userId);
        const unsub = onSnapshot(
            userRef,
            (snap) => {
                if (snap.exists()) {
                    setMemberData(snap.data());
                    setGoalValue(snap.data().readingGoal || 12);
                }
                setLoading(false);
            },
            (err) => {
                console.error('Firestore Error in Profile:', err);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [userId]);

    const handleLogBook = async (e) => {
        e.preventDefault();
        if (!newBook.title || !newBook.author) return;

        try {
            await updateDoc(doc(db, 'members', userId), {
                booksRead: arrayUnion({
                    ...newBook,
                    readDate: new Date().toISOString().split('T')[0]
                })
            });
            setNewBook({ title: '', author: '', genre: '', rating: 5 });
            setShowLogModal(false);
        } catch (err) {
            console.error('Error logging book:', err);
        }
    };

    const handleAddTag = async (e) => {
        e.preventDefault();
        if (!newTag.trim()) return;
        try {
            await updateDoc(doc(db, 'members', userId), {
                favoriteTags: arrayUnion(newTag.trim())
            });
            setNewTag('');
        } catch (err) {
            console.error('Error adding tag:', err);
        }
    };

    const handleRemoveTag = async (tag) => {
        try {
            await updateDoc(doc(db, 'members', userId), {
                favoriteTags: arrayRemove(tag)
            });
        } catch (err) {
            console.error('Error removing tag:', err);
        }
    };

    const handleSaveGoal = async () => {
        try {
            await updateDoc(doc(db, 'members', userId), {
                readingGoal: parseInt(goalValue, 10) || 12
            });
            setGoalEditing(false);
        } catch (err) {
            console.error('Error saving goal:', err);
        }
    };

    const handleAddWishlist = async (e) => {
        e.preventDefault();
        if (!newWishlist.trim()) return;
        try {
            await updateDoc(doc(db, 'members', userId), {
                wishlist: arrayUnion(newWishlist.trim())
            });
            setNewWishlist('');
        } catch (err) {
            console.error('Error adding to wishlist:', err);
        }
    };

    const handleRemoveWishlist = async (item) => {
        try {
            await updateDoc(doc(db, 'members', userId), {
                wishlist: arrayRemove(item)
            });
        } catch (err) {
            console.error('Error removing from wishlist:', err);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse space-y-6">
                <div className="h-48 bg-orange-50 rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-orange-50 rounded-3xl w-full"></div>
                    <div className="lg:col-span-2 h-64 bg-orange-50 rounded-3xl w-full"></div>
                </div>
            </div>
        );
    }

    if (!memberData) {
        return (
            <div className="max-w-xl mx-auto px-6 py-20 text-center">
                <div className="bg-white rounded-3xl p-10 border border-orange-100 shadow-xs">
                    <p className="text-lg font-serif font-bold text-ela-dark">Initialising your Profile…</p>
                    <p className="text-sm text-ela-gray mt-2">Setting up your Member Passport.</p>
                </div>
            </div>
        );
    }

    const { badges = [], booksRead = [], favoriteTags = [], wishlist = [], membershipStatus = 'Active 2026' } = memberData;
    const goal = memberData.readingGoal || 12;
    const progressPct = Math.min((booksRead.length / goal) * 100, 100);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-3xl p-8 sm:p-12 border border-orange-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-32 h-32 bg-white text-ela-orange rounded-[2rem] flex items-center justify-center font-serif text-5xl font-bold border border-orange-100 shadow-xs shrink-0 rotate-3">
                    {cleanName.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left flex-1 space-y-3">
                    <span className="px-3 py-1 bg-ela-orange text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                        {membershipStatus}
                    </span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ela-dark">{cleanName}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-ela-gray font-mono">
                        <span>ID: <span className="text-ela-dark">#ELA-{userId?.slice(0, 6)}</span></span>
                        <span>Email: <span className="text-ela-dark">{state.email || 'Verified via Asgardeo'}</span></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Reading Goal */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-5 h-5 text-ela-orange" />
                            <h3 className="font-serif font-bold text-lg text-ela-dark flex-1">Reading Goal</h3>
                            {goalEditing ? (
                                <button onClick={handleSaveGoal} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Save</button>
                            ) : (
                                <button onClick={() => setGoalEditing(true)} className="text-xs font-bold text-ela-orange bg-orange-50 px-2 py-1 rounded">Edit</button>
                            )}
                        </div>

                        {goalEditing ? (
                            <input type="number" min="1" value={goalValue} autoFocus onChange={(e) => setGoalValue(e.target.value)} className="w-full text-center text-xl font-bold p-2 border border-orange-200 rounded-xl mb-4 focus:outline-ela-orange" />
                        ) : (
                            <div className="flex items-end gap-1 mb-3">
                                <span className="text-4xl font-black font-serif text-ela-dark">{booksRead.length}</span>
                                <span className="text-lg font-bold text-ela-gray mb-1">/ {goal}</span>
                            </div>
                        )}

                        <div className="h-3 bg-orange-50 rounded-full overflow-hidden w-full border border-orange-100/50">
                            <div className="h-full bg-gradient-to-r from-ela-orange to-ela-amber transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
                        </div>
                        {progressPct >= 100 && <p className="text-[11px] font-bold text-emerald-600 mt-2">Goal Achieved! 🎉</p>}
                    </div>

                    {/* Favorite Tropes & Genres */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
                        <h3 className="font-serif font-bold text-lg text-ela-dark mb-4 flex items-center gap-3">
                            <Tags className="w-5 h-5 text-ela-orange" /> Literary Identity
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {favoriteTags.length === 0 ? (
                                <span className="text-xs text-ela-gray italic">No tags added yet.</span>
                            ) : (
                                favoriteTags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-ela-dark border border-orange-100 text-xs font-semibold rounded-lg">
                                        {tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="text-ela-gray hover:text-red-500 transition">&times;</button>
                                    </span>
                                ))
                            )}
                        </div>
                        <form onSubmit={handleAddTag} className="flex gap-2">
                            <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="e.g. Gothic Fiction" className="flex-1 p-2.5 text-xs rounded-xl border border-orange-100 focus:outline-ela-orange" required />
                            <button type="submit" className="px-4 bg-ela-orange text-white rounded-xl text-xs font-bold hover:bg-ela-tangerine">+</button>
                        </form>
                    </div>

                    {/* Literary Wishlist */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
                        <h3 className="font-serif font-bold text-lg text-ela-dark mb-4 flex items-center gap-3">
                            <BookHeart className="w-5 h-5 text-ela-orange" /> Reading Wishlist
                        </h3>
                        <ul className="space-y-2 mb-4">
                            {wishlist.length === 0 ? (
                                <span className="text-xs text-ela-gray italic">No suggestions yet.</span>
                            ) : (
                                wishlist.map((item, i) => (
                                    <li key={i} className="flex justify-between items-center text-xs p-2.5 bg-orange-50/50 border border-orange-100 rounded-xl">
                                        <span className="text-ela-dark font-medium">{item}</span>
                                        <button onClick={() => handleRemoveWishlist(item)} className="text-ela-gray hover:text-red-500 transition font-bold">&times;</button>
                                    </li>
                                ))
                            )}
                        </ul>
                        <form onSubmit={handleAddWishlist} className="flex gap-2">
                            <input type="text" value={newWishlist} onChange={(e) => setNewWishlist(e.target.value)} placeholder="Suggest a book..." className="flex-1 p-2.5 text-xs rounded-xl border border-orange-100 focus:outline-ela-orange" required />
                            <button type="submit" className="px-4 bg-ela-dark text-white rounded-xl text-xs font-bold shadow-sm">+</button>
                        </form>
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Passport / Books Read */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif font-bold text-xl text-ela-dark flex items-center gap-3">
                                <BookCheck className="w-6 h-6 text-ela-orange" /> Books Read with ELA
                            </h3>
                            <button
                                onClick={() => setShowLogModal(!showLogModal)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-ela-orange text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:bg-ela-tangerine transition"
                            >
                                <PlusCircle className="w-4 h-4" /> Log Book
                            </button>
                        </div>

                        {showLogModal && (
                            <form onSubmit={handleLogBook} className="p-5 mb-6 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-4">
                                <h4 className="text-sm font-bold text-ela-dark">Log a Finished Read</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" placeholder="Title" required value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} className="p-3 text-sm rounded-xl border border-orange-100 focus:outline-ela-orange" />
                                    <input type="text" placeholder="Author" required value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} className="p-3 text-sm rounded-xl border border-orange-100 focus:outline-ela-orange" />
                                    <input type="text" placeholder="Genre" value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value })} className="p-3 text-sm rounded-xl border border-orange-100 focus:outline-ela-orange" />
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-ela-gray uppercase tracking-wider">Personal Rating</label>
                                        <select value={newBook.rating} onChange={e => setNewBook({ ...newBook, rating: Number(e.target.value) })} className="w-full p-2.5 text-sm rounded-xl border border-orange-100 focus:outline-ela-orange">
                                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowLogModal(false)} className="px-4 py-2 text-xs text-ela-gray font-bold hover:bg-orange-100 rounded-xl transition">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-ela-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition hover:bg-black">Submit Log</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {booksRead.length === 0 ? (
                                <div className="py-10 text-center border-2 border-dashed border-orange-100 rounded-2xl bg-orange-50/40">
                                    <p className="text-sm font-semibold text-ela-dark">No books recorded yet.</p>
                                    <p className="text-xs text-ela-gray mt-1">Use the Log Book button to add your first read.</p>
                                </div>
                            ) : (
                                [...booksRead].reverse().map((book, i) => (
                                    <div key={i} className="p-4 rounded-2xl border border-orange-100 bg-white hover:border-ela-orange transition group flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-xs">
                                        <div>
                                            <h4 className="font-bold text-ela-dark text-base">{book.title}</h4>
                                            <p className="text-sm text-ela-gray font-medium">{book.author}</p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                                            <div className="flex items-center gap-0.5 text-ela-amber">
                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                    <Star key={idx} className={`w-3.5 h-3.5 ${idx < (book.rating || 5) ? 'fill-current' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {book.genre && (
                                                    <span className="px-2.5 py-0.5 rounded-md bg-orange-50 text-ela-orange font-bold text-[10px] uppercase tracking-wider hidden sm:block">
                                                        {book.genre}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-ela-gray font-mono">{book.readDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Badges Earned */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
                        <h3 className="font-serif font-bold text-xl text-ela-dark flex items-center gap-3 mb-6">
                            <Award className="w-6 h-6 text-ela-orange" /> Earned Association Badges
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {badges.length === 0 ? (
                                <div className="col-span-full py-8 text-center border-2 border-dashed border-orange-100 rounded-2xl bg-orange-50/40">
                                    <p className="text-sm font-semibold text-ela-dark">No badges assigned yet.</p>
                                    <p className="text-xs text-ela-gray mt-1">Participate in ELA events to earn badges.</p>
                                </div>
                            ) : (
                                badges.map((badge, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/50 to-white border border-orange-100 flex flex-col items-start gap-2 shadow-xs group hover:border-ela-orange transition">
                                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-3xl flex items-center justify-center border border-orange-100 shadow-sm group-hover:scale-110 transition shrink-0">
                                            {badge.icon || '🎖️'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-ela-dark">{badge.title}</h4>
                                            <p className="text-[11px] text-ela-gray leading-tight mt-0.5">{badge.desc}</p>
                                        </div>
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
