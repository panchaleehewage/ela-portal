import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Camera, Calendar, Award, ImageOff } from 'lucide-react';

export default function Chronicler() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('type', '==', 'past'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPastEvents(events);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-ela-orange text-white flex items-center justify-center">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-ela-orange tracking-widest uppercase">The Archive</span>
          <h1 className="font-serif font-bold text-3xl text-ela-dark">The Chronicler: Past Events & Gallery</h1>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-orange-100 shadow-xs animate-pulse space-y-3">
              <div className="w-full h-40 bg-orange-50 rounded-2xl" />
              <div className="h-4 bg-orange-50 rounded w-1/3" />
              <div className="h-5 bg-orange-50 rounded w-3/4" />
              <div className="h-3 bg-orange-50 rounded w-full" />
            </div>
          ))}
        </div>
      ) : pastEvents.length === 0 ? (
        <div className="text-center py-16 text-ela-gray space-y-2">
          <Camera className="w-10 h-10 mx-auto text-orange-200" />
          <p className="text-sm font-semibold">No past events logged yet.</p>
          <p className="text-xs">Session recaps will appear here once admins publish them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-xs flex flex-col">
              {event.imageUrl ? (
                <div className="w-full h-48 bg-orange-50 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full hidden items-center justify-center bg-orange-50 text-orange-300">
                    <ImageOff className="w-8 h-8" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-orange-50 flex items-center justify-center text-orange-200">
                  <ImageOff className="w-8 h-8" />
                </div>
              )}

              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-ela-gray">
                  <span className="flex items-center gap-1.5 font-semibold text-ela-orange">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </span>
                  {event.venue && (
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-bold text-ela-dark uppercase tracking-wider">
                      {event.venue}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-xl text-ela-dark">{event.title}</h3>

                {event.body && (
                  <p className="text-xs text-ela-gray leading-relaxed flex-1">{event.body}</p>
                )}

                {event.winnerOrHighlights && (
                  <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-center gap-2.5 text-ela-dark mt-auto">
                    <Award className="w-4 h-4 text-ela-orange shrink-0" />
                    <span className="text-xs font-medium">{event.winnerOrHighlights}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}