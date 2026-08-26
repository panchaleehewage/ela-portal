import { Feather, Camera, Calendar, Award } from 'lucide-react';

export default function Chronicler() {
  const pastEvents = [
    {
      title: "Romanticism & Gothic Night 2026",
      date: "August 10, 2026",
      summary: "Over 40 members gathered in the Heritage Library to discuss Mary Shelley and the psychological depths of Frankenstein.",
      winner: "Best Discussion Essay: 'The Monstrosity of Isolation' by Ryan K."
    },
    {
      title: "Annual Flash Fiction Championship",
      date: "July 22, 2026",
      summary: "Participants produced 500-word stories within a strict 60-minute window on the theme 'Echoes in the Corridor'.",
      winner: "First Place: 'The Clockmaker's Whisper' by Sarah M."
    }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pastEvents.map((event, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs text-ela-gray">
              <span className="flex items-center gap-1.5 font-semibold text-ela-orange">
                <Calendar className="w-4 h-4" />
                {event.date}
              </span>
            </div>

            <h3 className="font-serif font-bold text-xl text-ela-dark">{event.title}</h3>
            <p className="text-xs text-ela-gray leading-relaxed">{event.summary}</p>

            <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs flex items-center gap-2.5 text-ela-dark">
              <Award className="w-4 h-4 text-ela-orange shrink-0" />
              <span className="font-medium">{event.winner}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}