import { useState } from 'react';
import { Download, Users, UserCheck } from 'lucide-react';

export default function AdminRoster() {
  const [members] = useState([
    { id: 'ELA-01', name: 'Amaya Fernando', email: 'amaya@ela.org', role: 'President (Executive)', rsvps: 8 },
    { id: 'ELA-02', name: 'Kasun Silva', email: 'kasun@ela.org', role: 'VP Education', rsvps: 7 },
    { id: 'ELA-03', name: 'Dulani Perera', email: 'dulani@ela.org', role: 'Director PR & Creatives', rsvps: 6 },
    { id: 'ELA-04', name: 'Sahan Wickrama', email: 'sahan@gmail.com', role: 'Member', rsvps: 3 },
  ]);

  const exportCSV = () => {
    const headers = "Member ID,Name,Email,Role,Total RSVPs\n";
    const rows = members.map((m) => `"${m.id}","${m.name}","${m.email}","${m.role}","${m.rsvps}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ELA_Attendance_Roster_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-orange-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-ela-orange flex items-center justify-center border border-orange-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-ela-dark">Board & Member Roster</h2>
            <p className="text-xs text-ela-gray">Manage hierarchy and export official attendance reports</p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-ela-dark hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs"
        >
          <Download className="w-4 h-4 text-ela-amber" />
          Export CSV Roster
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-orange-100 text-ela-gray uppercase tracking-wider text-[10px]">
              <th className="pb-3 font-bold">ID</th>
              <th className="pb-3 font-bold">Member Name</th>
              <th className="pb-3 font-bold">Role Hierarchy</th>
              <th className="pb-3 font-bold text-right">RSVPs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-50">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-orange-50/20">
                <td className="py-3 font-mono font-semibold text-ela-orange">{m.id}</td>
                <td className="py-3">
                  <p className="font-bold text-ela-dark">{m.name}</p>
                  <p className="text-[11px] text-ela-gray">{m.email}</p>
                </td>
                <td className="py-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100/60 text-ela-dark font-semibold text-[10px]">
                    {m.role}
                  </span>
                </td>
                <td className="py-3 font-mono font-bold text-right text-ela-dark">{m.rsvps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}