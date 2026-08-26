import { useAuthContext } from '@asgardeo/auth-react';
import { Award, BookCheck, Sparkles, Star } from 'lucide-react';

export default function LiteraryPassport() {
  const { state } = useAuthContext();

  const memberBadges = [
    { title: 'Classicist', desc: 'Attended 3+ Victorian & Romanticism sessions', icon: '🏛️' },
    { title: 'Poetry Gala 2026', desc: 'Official participant in annual writing gala', icon: '🖋️' },
    { title: 'Avid Critic', desc: 'Cast votes in 5 consecutive fortnights', icon: '⭐' }
  ];

  const booksRead = [
    { title: 'Wuthering Heights', author: 'Emily Brontë', genre: 'Gothic Romance' },
    { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', genre: 'Victorian Aestheticism' },
    { title: 'Never Let Me Go', author: 'Kazuo Ishiguro', genre: 'Dystopian Fiction' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {memberBadges.map((badge, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100 flex items-start gap-3">
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <h4 className="font-bold text-xs text-ela-dark">{badge.title}</h4>
                <p className="text-[11px] text-ela-gray leading-tight mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Club Books Read */}
      <div>
        <h3 className="text-xs font-bold text-ela-dark uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BookCheck className="w-4 h-4 text-ela-orange" />
          Books Read with ELA
        </h3>
        <div className="space-y-2">
          {booksRead.map((book, i) => (
            <div key={i} className="p-3 rounded-xl border border-orange-100/80 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-ela-dark">{book.title}</span>
                <span className="text-ela-gray ml-2">— {book.author}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-ela-orange font-semibold text-[10px]">
                {book.genre}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}