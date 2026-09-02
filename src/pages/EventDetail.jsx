import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, MapPin, ArrowLeft, Image as ImageIcon, Sparkles, Award } from 'lucide-react';
import PageLoader from '../components/PageLoader';

export default function EventDetail() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const snap = await getDoc(doc(db, 'events', id));
                if (snap.exists()) {
                    setEvent({ id: snap.id, ...snap.data() });
                }
            } catch (err) {
                console.error('Error fetching event details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return <PageLoader />;

    if (!event) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <Link to="/events" className="inline-flex items-center gap-2 text-xs font-bold text-ela-gray hover:text-ela-orange mb-6 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Hub
                </Link>
                <div className="p-10 bg-white rounded-3xl border border-orange-100 shadow-sm text-center">
                    <Sparkles className="w-10 h-10 text-ela-orange/50 mx-auto mb-4" />
                    <h2 className="text-xl font-serif font-bold text-ela-dark mb-2">Event Not Found</h2>
                    <p className="text-sm text-ela-gray mb-6">This event might have been removed or the link is invalid.</p>
                </div>
            </div>
        );
    }

    // Handle both legacy string imageUrl and new array imageUrls
    const images = [];
    if (event.imageUrls && Array.isArray(event.imageUrls)) {
        images.push(...event.imageUrls.filter(Boolean));
    } else if (event.imageUrl) {
        images.push(event.imageUrl);
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 sm:py-12 space-y-8">
            <Link
                to={event.type === 'past' ? '/chronicler' : '/events'}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ela-gray hover:text-ela-orange transition"
            >
                <ArrowLeft className="w-4 h-4" /> Back to {event.type === 'past' ? 'Archive' : 'Events'}
            </Link>

            <div className="bg-white rounded-3xl border border-orange-100 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="p-8 sm:p-12 border-b border-orange-100 bg-gradient-to-br from-orange-50/50 to-white">
                    <div className="flex gap-2 items-center mb-6">
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${event.type === 'past' ? 'bg-ela-dark text-white border-ela-dark' : 'bg-ela-orange text-white border-ela-orange'}`}>
                            {event.type === 'past' ? 'Archived Recap' : 'Upcoming Session'}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-serif font-black text-ela-dark tracking-tight leading-tight mb-6">
                        {event.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-ela-gray">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-ela-orange" /> {event.date || 'TBA'}
                        </div>
                        {event.time && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-ela-orange" /> {event.time}
                            </div>
                        )}
                        {event.venue && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-ela-orange" /> {event.venue}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-12 space-y-10">
                    {images.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-ela-orange" /> Gallery
                            </h3>
                            {/* Responsive masonry-style grid — full images, no cropping */}
                            <div className={`grid gap-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl overflow-hidden border border-orange-100 bg-orange-50/40 flex items-center justify-center"
                                    >
                                        <img
                                            src={img.trim()}
                                            alt={`${event.title} gallery ${i + 1}`}
                                            className="w-full max-h-[480px] object-contain rounded-2xl"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {event.body && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider">Details</h3>
                            <div className="prose prose-sm sm:prose-base prose-orange max-w-none text-ela-dark/80 whitespace-pre-wrap leading-relaxed">
                                {event.body}
                            </div>
                        </div>
                    )}

                    {event.winnerOrHighlights && (
                        <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
                            <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider flex items-center gap-2">
                                <Award className="w-4 h-4 text-ela-orange" /> Highlights &amp; Awards
                            </h3>
                            <p className="text-sm text-ela-dark/80 font-medium italic">
                                "{event.winnerOrHighlights}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
