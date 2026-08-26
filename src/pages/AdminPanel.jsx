import { useState } from 'react';
import { Shield, PlusCircle, FileText, CheckCircle } from 'lucide-react';

export default function AdminPanel() {
  const [events, setEvents] = useState([
    { id: 1, title: 'The Brontë Sisters & Romanticism', date: '2026-08-29', capacity: 40, rsvps: 28 },
    { id: 2, title: 'National Poetry Writing Gala 2026', date: '2026-09-15', capacity: 100, rsvps: 64 },
  ]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [published, setPublished] = useState(false);

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!title || !date) return;
    const newEvent = {
      id: Date.now(),
      title,
      date,
      capacity: capacity || 30,
      rsvps: 0,
    };
    setEvents([newEvent, ...events]);
    setTitle('');
    setDate('');
    setCapacity('');
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-ela-dark text-white flex items-center justify-center">
          <Shield className="w-6 h-6 text-ela-amber" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-ela-orange tracking-widest uppercase">Executive Governance</span>
          <h1 className="font-serif font-bold text-3xl text-ela-dark">Top Board Admin Panel</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Event Card */}
        <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-orange-100 shadow-xs">
          <h2 className="font-serif font-bold text-lg text-ela-dark mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-ela-orange" />
            Publish Event
          </h2>

          {published && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Event published live!
            </div>
          )}

          <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-ela-dark block mb-1">Session Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fantasy Worldbuilding Meet"
                className="w-full p-3 rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange"
                required
              />
            </div>

            <div>
              <label className="font-bold text-ela-dark block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange"
                required
              />
            </div>

            <div>
              <label className="font-bold text-ela-dark block mb-1">Max Seat Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="35"
                className="w-full p-3 rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-ela-orange hover:bg-ela-tangerine text-white font-bold uppercase tracking-wider rounded-xl shadow-sm transition"
            >
              Post Session
            </button>
          </form>
        </div>

        {/* Event Management Table */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-orange-100 shadow-xs">
          <h2 className="font-serif font-bold text-lg text-ela-dark mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-ela-orange" />
            Active Sessions & RSVPs
          </h2>

          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-ela-dark text-sm">{ev.title}</h4>
                  <p className="text-xs text-ela-gray">{ev.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-ela-orange">{ev.rsvps} / {ev.capacity} RSVPs</span>
                  <div className="w-24 bg-orange-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-ela-orange h-full rounded-full"
                      style={{ width: `${(ev.rsvps / ev.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}