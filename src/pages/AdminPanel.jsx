import { useState, useEffect } from 'react';
import {
  Shield, PlusCircle, Megaphone, BarChart2, Users2,
  CheckCircle, Loader2, X, Plus, Lock
} from 'lucide-react';
import { db } from '../firebase';
import {
  collection, addDoc, serverTimestamp, onSnapshot,
  query, where, doc, updateDoc, arrayUnion, getDocs
} from 'firebase/firestore';
import AdminRoster from '../components/AdminRoster';

/* ─── helpers ────────────────────────────────────────────────── */
const inputCls =
  'w-full p-3 text-xs rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange bg-white';
const labelCls = 'block text-xs font-bold text-ela-dark mb-1';

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 – Event & Poster Publisher
═══════════════════════════════════════════════════════════════ */
function TabEvents() {
  const empty = { title: '', type: 'upcoming', date: '', time: '', venue: '', imageUrl: '', body: '', winnerOrHighlights: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'events'), { ...form, createdAt: serverTimestamp() });
      setForm(empty);
      setToast('Event published to Firestore!');
    } catch (err) {
      console.error('Firestore Error in AdminPanel (addEvent):', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Event Title *</label>
            <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. The Brontë Circle Night" required />
          </div>

          <div>
            <label className={labelCls}>Event Type *</label>
            <select className={inputCls} value={form.type} onChange={set('type')}>
              <option value="upcoming">Upcoming Gathering</option>
              <option value="past">Past Chronicler Recap</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" className={inputCls} value={form.date} onChange={set('date')} required />
          </div>

          <div>
            <label className={labelCls}>Time</label>
            <input type="time" className={inputCls} value={form.time} onChange={set('time')} />
          </div>

          <div>
            <label className={labelCls}>Venue</label>
            <input className={inputCls} value={form.venue} onChange={set('venue')} placeholder="e.g. Heritage Library, Room 4" />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Poster / Image URL</label>
            <input className={inputCls} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Description / Recap Body</label>
            <textarea rows={3} className={inputCls} value={form.body} onChange={set('body')} placeholder="Session description or recap text…" />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Awards / Discussion Highlights</label>
            <input className={inputCls} value={form.winnerOrHighlights} onChange={set('winnerOrHighlights')} placeholder="e.g. Best Essay: 'Isolation' by Ryan K." />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl shadow-sm transition text-xs"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          {saving ? 'Publishing…' : 'Publish Event'}
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 – Announcement Broadcaster
═══════════════════════════════════════════════════════════════ */
function TabAnnouncements() {
  const empty = { title: '', date: '', body: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [posted, setPosted] = useState([]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'announcements'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setPosted(data);
      },
      (err) => console.error('Firestore Error in AdminPanel (announcements):', err)
    );
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'announcements'), { ...form, createdAt: serverTimestamp() });
      setForm(empty);
      setToast('Announcement broadcast to all members!');
    } catch (err) {
      console.error('Firestore Error in AdminPanel (addAnnouncement):', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 text-xs">
        <div>
          <label className={labelCls}>Announcement Title *</label>
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. Poetry Gala 2026 Registration Now Open" required />
        </div>
        <div>
          <label className={labelCls}>Date (display text)</label>
          <input className={inputCls} value={form.date} onChange={set('date')} placeholder="e.g. August 27, 2026" />
        </div>
        <div>
          <label className={labelCls}>Body / Message</label>
          <textarea rows={4} className={inputCls} value={form.body} onChange={set('body')} placeholder="Announcement details…" />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl shadow-sm transition text-xs"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
          {saving ? 'Broadcasting…' : 'Broadcast Announcement'}
        </button>
      </form>

      {posted.length > 0 && (
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider">Posted Announcements</h3>
          {posted.map((ann) => (
            <div key={ann.id} className="p-3 rounded-2xl bg-orange-50/40 border border-orange-100 space-y-1">
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-xs text-ela-dark">{ann.title}</span>
                <span className="text-[10px] text-ela-gray font-mono">{ann.date}</span>
              </div>
              {ann.body && <p className="text-[11px] text-ela-gray">{ann.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 – Poll Creator & Manager
═══════════════════════════════════════════════════════════════ */
function TabPolls() {
  const emptyForm = { title: '', description: '', type: 'theme', eventId: '', options: ['', ''] };
  const [form, setForm] = useState(emptyForm);
  const [activePolls, setActivePolls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'polls'), where('status', '==', 'active'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const polls = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        polls.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setActivePolls(polls);
      },
      (err) => console.error('Firestore Error in AdminPanel (polls):', err)
    );
    return () => unsub();
  }, []);

  const setOpt = (i, val) => setForm((f) => {
    const opts = [...f.options];
    opts[i] = val;
    return { ...f, options: opts };
  });

  const addOpt = () => setForm((f) => ({ ...f, options: [...f.options, ''] }));
  const removeOpt = (i) => setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanOpts = form.options.filter((o) => o.trim());
    if (!form.title || cleanOpts.length < 2) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'polls'), {
        title: form.title,
        description: form.description,
        type: form.type,
        eventId: form.eventId || null,
        options: cleanOpts.map((text) => ({ text, votes: 0 })),
        voterIds: [],
        status: 'active',
        createdAt: serverTimestamp()
      });
      setForm(emptyForm);
      setToast('Poll is now live!');
    } catch (err) {
      console.error('Firestore Error in AdminPanel (addPoll):', err);
    } finally {
      setSaving(false);
    }
  };

  const closePoll = async (pollId) => {
    setClosing(pollId);
    try {
      await updateDoc(doc(db, 'polls', pollId), { status: 'closed' });
    } catch (err) {
      console.error('Firestore Error in AdminPanel (closePoll):', err);
    } finally {
      setClosing('');
    }
  };

  return (
    <div className="space-y-8">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      {/* Create form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 text-xs">
        <div>
          <label className={labelCls}>Poll Title *</label>
          <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Next Circle Theme Vote" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Poll Type</label>
            <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="theme">Theme Poll</option>
              <option value="attendance">Attendance Poll</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Linked Event ID (optional)</label>
            <input className={inputCls} value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))} placeholder="Firestore event doc ID" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <input className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief context for members" />
        </div>

        <div>
          <label className={labelCls}>Options (min 2) *</label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className={`${inputCls} flex-1`}
                  value={opt}
                  onChange={(e) => setOpt(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => removeOpt(i)} className="p-1 text-ela-gray hover:text-red-500 transition">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOpt}
              className="flex items-center gap-1 text-ela-orange hover:text-ela-tangerine text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Option
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl shadow-sm transition text-xs"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
          {saving ? 'Creating…' : 'Launch Poll'}
        </button>
      </form>

      {/* Active polls manager */}
      {activePolls.length > 0 && (
        <div className="max-w-2xl space-y-3">
          <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider">Active Polls — Manage</h3>
          {activePolls.map((poll) => {
            const total = poll.options.reduce((acc, o) => acc + (o.votes || 0), 0);
            return (
              <div key={poll.id} className="p-4 rounded-2xl border border-orange-100 bg-orange-50/30 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-ela-orange uppercase tracking-wider">{poll.type}</span>
                    <h4 className="font-bold text-sm text-ela-dark">{poll.title}</h4>
                    <p className="text-[11px] text-ela-gray">{total} votes cast · {poll.voterIds?.length || 0} voters</p>
                  </div>
                  <button
                    onClick={() => closePoll(poll.id)}
                    disabled={closing === poll.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-ela-dark hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50 shrink-0"
                  >
                    {closing === poll.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3 text-ela-amber" />}
                    Close Poll
                  </button>
                </div>
                <div className="space-y-1">
                  {poll.options.map((opt, i) => {
                    const pct = total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-ela-dark">
                        <div className="flex-1 bg-orange-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-ela-orange h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-24 truncate font-medium">{opt.text}</span>
                        <span className="font-mono font-bold text-ela-gray w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 – Member Passport Manager
═══════════════════════════════════════════════════════════════ */
function TabMembers() {
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [badge, setBadge] = useState({ title: '', desc: '', icon: '' });
  const [eventId, setEventId] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const unsubM = onSnapshot(
      collection(db, 'members'),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
        setMembers(data);
      },
      (err) => console.error('Firestore Error in AdminPanel (members):', err)
    );

    const unsubE = onSnapshot(
      collection(db, 'events'),
      (snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error('Firestore Error in AdminPanel (eventsList):', err)
    );

    return () => { unsubM(); unsubE(); };
  }, []);

  const addBadge = async (e) => {
    e.preventDefault();
    if (!selected || !badge.title) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'members', selected.id), {
        badges: arrayUnion({ title: badge.title, desc: badge.desc, icon: badge.icon || '🎖️' })
      });
      setBadge({ title: '', desc: '', icon: '' });
      setToast(`Badge "${badge.title}" added to ${selected.displayName}!`);
    } catch (err) {
      console.error('Firestore Error in AdminPanel (addBadge):', err);
    } finally {
      setSaving(false);
    }
  };

  const logAttendance = async (e) => {
    e.preventDefault();
    if (!selected || !eventId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'members', selected.id), {
        attendedEvents: arrayUnion(eventId)
      });
      setEventId('');
      setToast(`Attendance logged for ${selected.displayName}!`);
    } catch (err) {
      console.error('Firestore Error in AdminPanel (logAttendance):', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      {/* Member selector */}
      <div className="max-w-md">
        <label className={labelCls}>Select Member</label>
        <select
          className={inputCls}
          value={selected?.id || ''}
          onChange={(e) => setSelected(members.find((m) => m.id === e.target.value) || null)}
          disabled={members.length === 0}
        >
          {members.length === 0 ? (
            <option value="">— No registered members found —</option>
          ) : (
            <option value="">— Choose a member —</option>
          )}
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.displayName || m.email || m.id}</option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {/* Badge form */}
          <form onSubmit={addBadge} className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 space-y-3 text-xs">
            <h3 className="font-serif font-bold text-sm text-ela-dark">Assign Badge to {selected.displayName}</h3>
            <div>
              <label className={labelCls}>Badge Title *</label>
              <input className={inputCls} value={badge.title} onChange={(e) => setBadge((b) => ({ ...b, title: e.target.value }))} placeholder="e.g. Poetry Gala Winner 2026" required />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input className={inputCls} value={badge.desc} onChange={(e) => setBadge((b) => ({ ...b, desc: e.target.value }))} placeholder="e.g. Won 1st place at the 2026 Poetry Gala" />
            </div>
            <div>
              <label className={labelCls}>Icon Emoji</label>
              <input className={inputCls} value={badge.icon} onChange={(e) => setBadge((b) => ({ ...b, icon: e.target.value }))} placeholder="🏆" maxLength={2} />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl text-xs transition"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Assign Badge
            </button>

            {/* Current badges */}
            {selected.badges?.length > 0 && (
              <div className="pt-2 space-y-1">
                <p className="font-bold text-ela-dark text-[11px] uppercase tracking-wider">Current Badges</p>
                {selected.badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-orange-100 text-xs">
                    <span>{b.icon || '🎖️'}</span>
                    <span className="font-bold text-ela-dark">{b.title}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Attendance form */}
          <form onSubmit={logAttendance} className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 space-y-3 text-xs">
            <h3 className="font-serif font-bold text-sm text-ela-dark">Log Attendance for {selected.displayName}</h3>
            <p className="text-[11px] text-ela-gray">Currently attended: {selected.attendedEvents?.length || 0} event(s)</p>
            <div>
              <label className={labelCls}>Select Event *</label>
              <select className={inputCls} value={eventId} onChange={(e) => setEventId(e.target.value)} required>
                <option value="">— Choose an event —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving || !eventId}
              className="flex items-center gap-2 px-4 py-2.5 bg-ela-dark hover:bg-black disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl text-xs transition"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users2 className="w-3.5 h-3.5 text-ela-amber" />}
              Log Attendance
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT ADMIN PANEL
═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'events', label: 'Event Publisher', icon: PlusCircle, Component: TabEvents },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, Component: TabAnnouncements },
  { id: 'polls', label: 'Poll Manager', icon: BarChart2, Component: TabPolls },
  { id: 'members', label: 'Member Passports', icon: Users2, Component: TabMembers },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('events');
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-ela-dark text-white flex items-center justify-center">
          <Shield className="w-6 h-6 text-ela-amber" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-ela-orange tracking-widest uppercase">Executive Governance</span>
          <h1 className="font-serif font-bold text-3xl text-ela-dark">Top Board Admin Panel</h1>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b border-orange-100 pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl border border-b-0 transition ${activeTab === id
              ? 'bg-white border-orange-100 text-ela-orange shadow-xs'
              : 'bg-orange-50/40 border-transparent text-ela-gray hover:text-ela-dark hover:bg-orange-50'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Roster always visible below */}
      <AdminRoster />
    </div>
  );
}