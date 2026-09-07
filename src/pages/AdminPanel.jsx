import { useState, useEffect } from 'react';
import {
  Shield, PlusCircle, Megaphone, BarChart2, Users2,
  CheckCircle, Loader2, X, Plus, Lock, BookOpen,
  Trash2, Pencil, AlertTriangle, UploadCloud
} from 'lucide-react';
import { db } from '../firebase';
import {
  collection, addDoc, serverTimestamp, onSnapshot,
  query, where, doc, updateDoc, arrayUnion, getDocs, deleteDoc
} from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import AdminRoster from '../components/AdminRoster';

/* ─── helpers ─────────────────────────────────────────────────── */
const inputCls = 'w-full p-3 text-xs rounded-xl border border-orange-100 focus:outline-none focus:border-ela-orange bg-white';
const labelCls = 'block text-xs font-bold text-ela-dark mb-1';

/** Convert FileList to Base64 data-URL strings */
const readFilesAsBase64 = (files) =>
  Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );

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

function ConfirmDeleteBtn({ label = 'Delete', onConfirm, busy }) {
  const [pending, setPending] = useState(false);
  if (pending) {
    return (
      <span className="flex items-center gap-1">
        <button onClick={() => setPending(false)} className="px-2 py-1 text-[10px] font-bold text-ela-gray bg-orange-50 rounded-lg hover:bg-orange-100">Cancel</button>
        <button onClick={() => { setPending(false); onConfirm(); }} disabled={busy} className="px-2 py-1 text-[10px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-1">
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />} Confirm
        </button>
      </span>
    );
  }
  return (
    <button onClick={() => setPending(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-lg transition">
      <Trash2 className="w-3 h-3" /> {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 – Event Publisher + CRUD
═══════════════════════════════════════════════════════════════ */
function TabEvents() {
  const empty = { title: '', type: 'upcoming', date: '', time: '', venue: '', imageUrls: '', body: '', winnerOrHighlights: '' };
  const [form, setForm] = useState(empty);
  const [uploadedImages, setUploadedImages] = useState([]); // base64 from device
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [deleting, setDeleting] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllEvents(data);
    });
    return () => unsub();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const base64s = await readFilesAsBase64(files);
      setUploadedImages((prev) => [...prev, ...base64s]);
    } catch (err) {
      console.error('Image read error:', err);
    }
    // Reset the input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const removeUploadedImage = (idx) =>
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));

  const startEdit = (ev) => {
    setEditId(ev.id);
    setUploadedImages([]);
    setForm({
      title: ev.title || '',
      type: ev.type || 'upcoming',
      date: ev.date || '',
      time: ev.time || '',
      venue: ev.venue || '',
      imageUrls: Array.isArray(ev.imageUrls) ? ev.imageUrls.join(', ') : (ev.imageUrl || ''),
      body: ev.body || '',
      winnerOrHighlights: ev.winnerOrHighlights || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); setUploadedImages([]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setSaving(true);
    // Combine typed URLs and uploaded base64 images
    const urlImages = form.imageUrls.trim()
      ? form.imageUrls.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean)
      : [];
    const allImages = [...urlImages, ...uploadedImages];
    try {
      const { imageUrls, ...rest } = form;
      if (editId) {
        await updateDoc(doc(db, 'events', editId), { ...rest, imageUrls: allImages });
        setToast('Event updated successfully!');
      } else {
        await addDoc(collection(db, 'events'), { ...rest, imageUrls: allImages, createdAt: serverTimestamp() });
        setToast('Event published to Firestore!');
      }
      setForm(empty);
      setUploadedImages([]);
      setEditId(null);
    } catch (err) {
      console.error('Firestore Error (events):', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'events', id));
      setToast('Event deleted.');
    } catch (err) {
      console.error('Firestore Error (deleteEvent):', err);
    } finally {
      setDeleting('');
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      {/* Form */}
      <div className="bg-orange-50/40 border border-orange-100 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-ela-dark">{editId ? '✏️ Edit Event' : 'Publish New Event'}</h3>
          {editId && <button onClick={cancelEdit} className="text-xs font-bold text-ela-gray hover:text-red-500 transition flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel Edit</button>}
        </div>
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
              <label className={labelCls}>Event Images</label>
              {/* URL input */}
              <textarea rows={2} className={inputCls} value={form.imageUrls} onChange={set('imageUrls')} placeholder="Paste image URLs (comma-separated)…" />
              {/* File upload */}
              <label className="mt-2 flex items-center gap-2 cursor-pointer w-fit px-3 py-2 bg-orange-50 border border-orange-200 border-dashed rounded-xl hover:bg-orange-100 transition">
                <UploadCloud className="w-4 h-4 text-ela-orange" />
                <span className="text-xs font-bold text-ela-orange">Upload from Device</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              {/* Preview uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {uploadedImages.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-orange-200">
                      <img src={src} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full text-[9px] flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? <Pencil className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {saving ? 'Saving…' : editId ? 'Save Changes' : 'Publish Event'}
          </button>
        </form>
      </div>

      {/* All Events CRUD List */}
      {allEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-ela-dark">All Events</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allEvents.map((ev) => (
              <div key={ev.id} className="p-4 bg-white border border-orange-100 rounded-2xl shadow-xs space-y-3">
                <div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded mr-2 ${ev.type === 'upcoming' ? 'bg-ela-orange/10 text-ela-orange' : 'bg-ela-dark/10 text-ela-dark'}`}>{ev.type}</span>
                  <h4 className="font-bold text-sm text-ela-dark mt-1 leading-tight">{ev.title}</h4>
                  <p className="text-[11px] text-ela-gray mt-0.5">{ev.date} {ev.venue ? `• ${ev.venue}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => startEdit(ev)} className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-ela-orange text-[10px] font-bold uppercase tracking-wider rounded-lg transition">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <ConfirmDeleteBtn onConfirm={() => handleDelete(ev.id)} busy={deleting === ev.id} />
                  {ev.type === 'upcoming' && (
                    <button onClick={() => setQrModal(ev.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition ml-auto">
                      QR Code
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setQrModal(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-orange-50 text-ela-dark hover:bg-orange-100 transition">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-ela-dark mb-1">Check In</h2>
              <p className="text-xs font-bold text-ela-gray uppercase tracking-wider mb-6">Scan with your camera</p>
              <div className="bg-white p-4 rounded-3xl border-4 border-orange-100 inline-block shadow-lg mx-auto">
                <QRCodeSVG value={`${window.location.origin}/checkin?eventId=${qrModal}`} size={220} level="H" fgColor="#1C1E21" includeMargin={false} />
              </div>
              <p className="text-[10px] text-ela-gray font-mono mt-6 truncate bg-orange-50 py-1.5 px-3 rounded-lg border border-orange-100/50">
                {window.location.origin}/checkin?eventId={qrModal}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 – Announcement Broadcaster + CRUD
═══════════════════════════════════════════════════════════════ */
function TabAnnouncements() {
  const empty = { title: '', date: '', body: '' };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [deleting, setDeleting] = useState('');
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
      (err) => console.error('Firestore Error (announcements):', err)
    );
    return () => unsub();
  }, []);

  const startEdit = (ann) => {
    setEditId(ann.id);
    setForm({ title: ann.title || '', date: ann.date || '', body: ann.body || '' });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'announcements', editId), { title: form.title, date: form.date, body: form.body });
        setToast('Announcement updated!');
      } else {
        await addDoc(collection(db, 'announcements'), { ...form, createdAt: serverTimestamp() });
        setToast('Announcement broadcast to all members!');
      }
      setForm(empty);
      setEditId(null);
    } catch (err) {
      console.error('Firestore Error (announcements):', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'announcements', id));
      setToast('Announcement deleted.');
    } catch (err) {
      console.error('Firestore Error (deleteAnn):', err);
    } finally {
      setDeleting('');
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-ela-dark">{editId ? '✏️ Edit Announcement' : 'New Announcement'}</h3>
          {editId && <button type="button" onClick={cancelEdit} className="text-xs font-bold text-ela-gray hover:text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel</button>}
        </div>
        <div>
          <label className={labelCls}>Title *</label>
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. Poetry Gala 2026 Registration Now Open" required />
        </div>
        <div>
          <label className={labelCls}>Date (display text)</label>
          <input className={inputCls} value={form.date} onChange={set('date')} placeholder="e.g. September 2, 2026" />
        </div>
        <div>
          <label className={labelCls}>Body / Message</label>
          <textarea rows={4} className={inputCls} value={form.body} onChange={set('body')} placeholder="Announcement details…" />
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl shadow-sm transition text-xs">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
          {saving ? 'Saving…' : editId ? 'Save Changes' : 'Broadcast Announcement'}
        </button>
      </form>

      {posted.length > 0 && (
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider">Posted Announcements</h3>
          {posted.map((ann) => (
            <div key={ann.id} className={`p-3 rounded-2xl border space-y-1 ${editId === ann.id ? 'border-ela-orange bg-orange-50/30' : 'border-orange-100 bg-orange-50/40'}`}>
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-xs text-ela-dark">{ann.title}</span>
                <span className="text-[10px] text-ela-gray font-mono">{ann.date}</span>
              </div>
              {ann.body && <p className="text-[11px] text-ela-gray">{ann.body}</p>}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => startEdit(ann)} className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-ela-orange text-[10px] font-bold rounded-lg transition">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <ConfirmDeleteBtn onConfirm={() => handleDelete(ann.id)} busy={deleting === ann.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 – Poll Creator & Manager (with Delete)
═══════════════════════════════════════════════════════════════ */
function TabPolls() {
  const emptyForm = { title: '', description: '', type: 'theme', eventId: '', options: ['', ''] };
  const [form, setForm] = useState(emptyForm);
  const [activePolls, setActivePolls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState('');
  const [deleting, setDeleting] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'polls'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      const polls = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      polls.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setActivePolls(polls);
    }, (err) => console.error('Firestore Error (polls):', err));
    return () => unsub();
  }, []);

  const setOpt = (i, val) => setForm((f) => { const opts = [...f.options]; opts[i] = val; return { ...f, options: opts }; });
  const addOpt = () => setForm((f) => ({ ...f, options: [...f.options, ''] }));
  const removeOpt = (i) => setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanOpts = form.options.filter((o) => o.trim());
    if (!form.title || cleanOpts.length < 2) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'polls'), {
        title: form.title, description: form.description, type: form.type,
        eventId: form.eventId || null,
        options: cleanOpts.map((text) => ({ text, votes: 0 })),
        voterIds: [], status: 'active', createdAt: serverTimestamp()
      });
      setForm(emptyForm);
      setToast('Poll is now live!');
    } catch (err) {
      console.error('Firestore Error (addPoll):', err);
    } finally {
      setSaving(false);
    }
  };

  const closePoll = async (pollId) => {
    setClosing(pollId);
    try {
      await updateDoc(doc(db, 'polls', pollId), { status: 'closed' });
    } catch (err) {
      console.error('Firestore Error (closePoll):', err);
    } finally { setClosing(''); }
  };

  const deletePoll = async (pollId) => {
    setDeleting(pollId);
    try {
      await deleteDoc(doc(db, 'polls', pollId));
      setToast('Poll deleted.');
    } catch (err) {
      console.error('Firestore Error (deletePoll):', err);
    } finally { setDeleting(''); }
  };

  return (
    <div className="space-y-8">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

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
                <input className={`${inputCls} flex-1`} value={opt} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => removeOpt(i)} className="p-1 text-ela-gray hover:text-red-500 transition"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOpt} className="flex items-center gap-1 text-ela-orange hover:text-ela-tangerine text-xs font-bold transition">
              <Plus className="w-3.5 h-3.5" /> Add Option
            </button>
          </div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl shadow-sm transition text-xs">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
          {saving ? 'Creating…' : 'Launch Poll'}
        </button>
      </form>

      {activePolls.length > 0 && (
        <div className="max-w-2xl space-y-3">
          <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider">Active Polls — Manage</h3>
          {activePolls.map((poll) => {
            const total = poll.options.reduce((acc, o) => acc + (o.votes || 0), 0);
            return (
              <div key={poll.id} className="p-4 rounded-2xl border border-orange-100 bg-orange-50/30 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-ela-orange uppercase tracking-wider">{poll.type}</span>
                    <h4 className="font-bold text-sm text-ela-dark">{poll.title}</h4>
                    <p className="text-[11px] text-ela-gray">{total} votes · {poll.voterIds?.length || 0} voters</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => closePoll(poll.id)} disabled={closing === poll.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-ela-dark hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-50">
                      {closing === poll.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3 text-ela-amber" />} Close
                    </button>
                    <ConfirmDeleteBtn onConfirm={() => deletePoll(poll.id)} busy={deleting === poll.id} />
                  </div>
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
   TAB 4 – Curated Books Catalogue
═══════════════════════════════════════════════════════════════ */
function TabBooks() {
  const empty = { title: '', author: '', genre: '', yearDiscussed: '', coverUrl: '' };
  const [form, setForm] = useState(empty);
  const [uploadedCover, setUploadedCover] = useState(''); // base64 from device
  const [editId, setEditId] = useState(null);
  const [books, setBooks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [toast, setToast] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const [base64] = await readFilesAsBase64([file]);
      setUploadedCover(base64);
    } catch (err) {
      console.error('Cover upload error:', err);
    }
    e.target.value = '';
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'club_books'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      setBooks(data);
    }, (err) => console.error('Firestore Error (club_books):', err));
    return () => unsub();
  }, []);

  const startEdit = (book) => {
    setEditId(book.id);
    setUploadedCover('');
    setForm({ title: book.title || '', author: book.author || '', genre: book.genre || '', yearDiscussed: book.yearDiscussed || '', coverUrl: book.coverUrl || '' });
  };

  const cancelEdit = () => { setEditId(null); setForm(empty); setUploadedCover(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    // Prefer uploaded base64 over typed URL
    const finalCoverUrl = uploadedCover || form.coverUrl;
    try {
      if (editId) {
        await updateDoc(doc(db, 'club_books', editId), { ...form, coverUrl: finalCoverUrl });
        setToast('Book updated!');
      } else {
        await addDoc(collection(db, 'club_books'), { ...form, coverUrl: finalCoverUrl, addedAt: serverTimestamp() });
        setToast('Book added to ELA catalogue!');
      }
      setForm(empty);
      setUploadedCover('');
      setEditId(null);
    } catch (err) {
      console.error('Firestore Error (club_books save):', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'club_books', id));
      setToast('Book removed from catalogue.');
    } catch (err) {
      console.error('Firestore Error (deleteBook):', err);
    } finally {
      setDeleting('');
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      {/* Form */}
      <div className="bg-orange-50/40 border border-orange-100 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-ela-dark">{editId ? '✏️ Edit Book' : 'Add to ELA Reading List'}</h3>
          {editId && <button onClick={cancelEdit} className="text-xs font-bold text-ela-gray hover:text-red-500 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel</button>}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className={labelCls}>Book Title *</label>
            <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. Frankenstein" required />
          </div>
          <div>
            <label className={labelCls}>Author</label>
            <input className={inputCls} value={form.author} onChange={set('author')} placeholder="e.g. Mary Shelley" />
          </div>
          <div>
            <label className={labelCls}>Genre</label>
            <input className={inputCls} value={form.genre} onChange={set('genre')} placeholder="e.g. Gothic Fiction" />
          </div>
          <div>
            <label className={labelCls}>Year Discussed</label>
            <input className={inputCls} value={form.yearDiscussed} onChange={set('yearDiscussed')} placeholder="e.g. 2024" />
          </div>
          <div>
            <label className={labelCls}>Cover Image</label>
            <input className={inputCls} value={form.coverUrl} onChange={set('coverUrl')} placeholder="Paste image URL or upload below" />
            <label className="mt-2 flex items-center gap-2 cursor-pointer w-fit px-3 py-2 bg-orange-50 border border-orange-200 border-dashed rounded-xl hover:bg-orange-100 transition">
              <UploadCloud className="w-4 h-4 text-ela-orange" />
              <span className="text-xs font-bold text-ela-orange">Upload Cover from Device</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
            {/* Cover preview */}
            {(uploadedCover || form.coverUrl) && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={uploadedCover || form.coverUrl}
                  alt="cover preview"
                  className="w-12 h-16 object-contain rounded-lg border border-orange-200 bg-orange-50"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {uploadedCover && (
                  <button type="button" onClick={() => setUploadedCover('')} className="text-[11px] font-bold text-red-500 hover:underline">Remove upload</button>
                )}
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl shadow-sm transition text-xs">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? <Pencil className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add to Catalogue'}
            </button>
          </div>
        </form>
      </div>

      {/* Books list */}
      {books.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-ela-dark">ELA Official Reading List ({books.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.map((b) => (
              <div key={b.id} className={`p-4 bg-white border rounded-2xl shadow-xs flex gap-4 items-start ${editId === b.id ? 'border-ela-orange' : 'border-orange-100'}`}>
                {b.coverUrl && (
                  <img src={b.coverUrl} alt={b.title} className="w-12 h-16 object-contain rounded-lg border border-orange-100 shrink-0 bg-orange-50" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-ela-dark leading-tight truncate">{b.title}</h4>
                  <p className="text-xs text-ela-gray">{b.author}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {b.genre && <span className="px-2 py-0.5 rounded bg-orange-50 text-[10px] font-bold text-ela-orange">{b.genre}</span>}
                    {b.yearDiscussed && <span className="px-2 py-0.5 rounded bg-ela-dark/5 text-[10px] font-bold text-ela-dark">{b.yearDiscussed}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => startEdit(b)} className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-ela-orange text-[10px] font-bold rounded-lg transition">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <ConfirmDeleteBtn onConfirm={() => handleDelete(b.id)} busy={deleting === b.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-orange-100 rounded-3xl">
          <BookOpen className="w-10 h-10 text-orange-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-ela-dark">No books in the catalogue yet.</p>
          <p className="text-xs text-ela-gray mt-1">Add the first title above to build ELA's official reading list.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5 – Member Passports + Manual Attendance Override
═══════════════════════════════════════════════════════════════ */
function TabMembers() {
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [badge, setBadge] = useState({ title: '', desc: '', icon: '' });
  const [eventId, setEventId] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    const unsubM = onSnapshot(collection(db, 'members'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
      setMembers(data);
    }, (err) => console.error('Firestore Error (members):', err));

    const unsubE = onSnapshot(collection(db, 'events'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(data);
    }, (err) => console.error('Firestore Error (eventsList):', err));

    return () => { unsubM(); unsubE(); };
  }, []);

  const filteredMembers = members.filter((m) =>
    !memberSearch || (m.displayName || m.email || '').toLowerCase().includes(memberSearch.toLowerCase())
  );

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
      console.error('Firestore Error (addBadge):', err);
    } finally {
      setSaving(false);
    }
  };

  const logAttendance = async (e) => {
    e.preventDefault();
    if (!selected || !eventId) return;
    setSaving(true);
    try {
      // Update member's attendedEvents AND event's attendees for parity with QR check-in
      await Promise.all([
        updateDoc(doc(db, 'members', selected.id), { attendedEvents: arrayUnion(eventId) }),
        updateDoc(doc(db, 'events', eventId), { attendees: arrayUnion(selected.id) }),
      ]);
      setEventId('');
      setToast(`Attendance override logged for ${selected.displayName}!`);
    } catch (err) {
      console.error('Firestore Error (logAttendance):', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      {/* Member search + select */}
      <div className="max-w-md space-y-2">
        <label className={labelCls}>Search & Select Member</label>
        <input
          className={inputCls}
          value={memberSearch}
          onChange={(e) => { setMemberSearch(e.target.value); setSelected(null); }}
          placeholder="Type name or email…"
        />
        {memberSearch && filteredMembers.length > 0 && (
          <div className="border border-orange-100 rounded-xl bg-white shadow-sm divide-y divide-orange-50 max-h-48 overflow-y-auto">
            {filteredMembers.map((m) => (
              <button key={m.id} type="button" onClick={() => { setSelected(m); setMemberSearch(m.displayName || m.email || m.id); }}
                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-orange-50 transition ${selected?.id === m.id ? 'bg-orange-50 font-bold text-ela-orange' : 'text-ela-dark'}`}>
                <span className="font-bold">{m.displayName || '—'}</span>
                {m.email && <span className="text-ela-gray ml-2">{m.email}</span>}
              </button>
            ))}
          </div>
        )}
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
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-ela-orange hover:bg-ela-tangerine disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl text-xs transition">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Assign Badge
            </button>
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

          {/* Manual Attendance Override */}
          <form onSubmit={logAttendance} className="bg-orange-50/40 p-5 rounded-2xl border border-orange-100 space-y-3 text-xs">
            <div>
              <h3 className="font-serif font-bold text-sm text-ela-dark">Manual Attendance Override</h3>
              <p className="text-[11px] text-ela-gray mt-1 leading-relaxed">
                Use this to manually mark attendance for members with dead batteries or connection issues during meetings.
              </p>
            </div>
            <p className="text-[11px] text-ela-gray">Currently attended: <span className="font-bold text-ela-dark">{selected.attendedEvents?.length || 0} event(s)</span></p>
            <div>
              <label className={labelCls}>Select Event *</label>
              <select className={inputCls} value={eventId} onChange={(e) => setEventId(e.target.value)} required>
                <option value="">— Choose an event —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving || !eventId} className="flex items-center gap-2 px-4 py-2.5 bg-ela-dark hover:bg-black disabled:opacity-50 text-white font-bold uppercase tracking-wider rounded-xl text-xs transition">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users2 className="w-3.5 h-3.5 text-ela-amber" />}
              Override Attendance
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
  { id: 'books', label: 'Curated Books', icon: BookOpen, Component: TabBooks },
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