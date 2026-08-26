import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { Quote, Heart, Send } from 'lucide-react';

export default function QuoteBoard() {
  const [quotes, setQuotes] = useState([]);
  const [quoteText, setQuoteText] = useState('');
  const [sourceBook, setSourceBook] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'quotes'), orderBy('likes', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setQuotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    await addDoc(collection(db, 'quotes'), {
      text: quoteText.trim(),
      source: sourceBook.trim() || 'Anonymous Reader',
      likes: 0,
      createdAt: new Date()
    });

    setQuoteText('');
    setSourceBook('');
  };

  const handleLike = async (id) => {
    const quoteRef = doc(db, 'quotes', id);
    await updateDoc(quoteRef, { likes: increment(1) });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
          <Quote className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-lg text-ela-dark">Quote of the Fortnight</h2>
          <p className="text-xs text-ela-gray">Submit anonymous literary lines & vote on your favorites</p>
        </div>
      </div>

      <form onSubmit={handleSubmitQuote} className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-3">
        <textarea
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          placeholder="“Whatever our souls are made of, his and mine are the same.”"
          className="w-full p-3 rounded-xl border border-orange-100 text-xs focus:outline-none focus:border-ela-orange bg-white resize-none"
          rows={2}
          required
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={sourceBook}
            onChange={(e) => setSourceBook(e.target.value)}
            placeholder="Book title or author (optional)"
            className="flex-1 p-2.5 rounded-xl border border-orange-100 text-xs bg-white focus:outline-none focus:border-ela-orange"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-ela-orange hover:bg-ela-tangerine text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Post Line
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {quotes.map((q) => (
          <div key={q.id} className="p-4 rounded-2xl border border-orange-100 flex justify-between items-start gap-4">
            <div>
              <p className="font-serif italic text-ela-dark text-sm leading-relaxed">“{q.text}”</p>
              <p className="text-[11px] text-ela-gray mt-1 font-sans">— {q.source}</p>
            </div>
            <button
              onClick={() => handleLike(q.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-ela-orange text-xs font-bold transition"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              {q.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}