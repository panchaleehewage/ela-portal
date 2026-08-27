import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Download, Users, Loader2 } from 'lucide-react';

export default function AdminRoster() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'members'),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
        setMembers(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore Error in AdminRoster:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const exportCSV = () => {
    const headers = 'ID,Name,Email,Status,Badges Count,Events Attended\n';
    const rows = members.map((m) => [
      `"#ELA-${(m.userId || m.id || '').slice(0, 6)}"`,
      `"${m.displayName || ''}"`,
      `"${m.email || ''}"`,
      `"${m.membershipStatus || 'Active'}"`,
      `"${m.badges?.length || 0}"`,
      `"${m.attendedEvents?.length || 0}"`
    ].join(',')).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ELA_Attendance_Roster_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-orange-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-ela-dark">Member Roster</h2>
            <p className="text-xs text-ela-gray">Live directory from Firestore — export official attendance reports</p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          disabled={loading || members.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-ela-dark hover:bg-black disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs"
        >
          <Download className="w-4 h-4 text-ela-amber" />
          Export CSV Roster
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-ela-gray py-4">
          <Loader2 className="w-4 h-4 animate-spin text-ela-orange" />
          Loading member roster…
        </div>
      ) : members.length === 0 ? (
        <p className="text-xs text-ela-gray italic">No registered members yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-orange-100 text-ela-gray uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">ID</th>
                <th className="pb-3 font-bold">Member</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Badges</th>
                <th className="pb-3 font-bold text-right">Attended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-orange-50/20">
                  <td className="py-3 font-mono font-semibold text-ela-orange">
                    #ELA-{(m.userId || m.id || '').slice(0, 6)}
                  </td>
                  <td className="py-3">
                    <p className="font-bold text-ela-dark">{m.displayName || '—'}</p>
                    <p className="text-[11px] text-ela-gray">{m.email}</p>
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100/60 text-ela-dark font-semibold text-[10px]">
                      {m.membershipStatus || 'Active'}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-right text-ela-dark">
                    {m.badges?.length || 0}
                  </td>
                  <td className="py-3 font-mono font-bold text-right text-ela-dark">
                    {m.attendedEvents?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}