import { sb } from '@/lib/sb';

export const dynamic = 'force-dynamic';

export default async function Team() {
  const [physios, appts] = await Promise.all([
    sb('practicehub_practitioners?select=practitioner_id,name&active=eq.true'),
    sb('appointments?select=practitioner_id,status&limit=2000'),
  ]);
  const nameById = Object.fromEntries(physios.map((p) => [p.practitioner_id, p.name]));
  const agg = {};
  for (const a of appts) { if (!a.practitioner_id) continue; const r = agg[a.practitioner_id] ||= { a: 0, c: 0, m: 0, p: 0, done: 0 }; r.a++; if (a.status === 'cancelled') r.c++; if (a.status === 'missed') r.m++; if (a.status === 'pending') r.p++; if (a.status === 'processed') r.done++; }
  const rows = Object.entries(agg).map(([pid, r]) => ({ name: nameById[pid] || `#${pid}`, ...r })).sort((x, y) => y.a - x.a);
  return (
    <>
      <div className="panel">
        <div className="phead"><div><h2>Physio performance</h2><p className="hint">Appointment volume, attendance and processing — from PracticeHub</p></div></div>
        <table><thead><tr><th>Physio</th><th className="n">Appts</th><th className="n">Attended</th><th className="n">Cancelled</th><th className="n">DNA</th><th className="n">Unprocessed</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.name}><td>{r.name}</td><td className="n">{r.a}</td><td className="n">{r.done}</td><td className="n">{r.c}</td><td className="n" style={{ color: r.m >= 8 ? 'var(--coral)' : undefined }}>{r.m}</td><td className="n" style={{ color: 'var(--amber)' }}>{r.p}</td></tr>)}</tbody></table>
      </div>
      <div className="panel mt">
        <div className="phead"><div><h2>Packages</h2><p className="hint">Phase 1 / Phase 2 package sales and balances</p></div></div>
        <p className="mut" style={{ fontSize: 13 }}>Package data isn&apos;t written to Supabase yet (the <code>physio_package_sale</code> journey metric reads 0). This panel lights up automatically once the package pipeline starts writing — no dashboard change needed.</p>
      </div>
    </>
  );
}
