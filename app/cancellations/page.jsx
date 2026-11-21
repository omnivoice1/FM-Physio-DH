import { sb, sbCount } from '@/lib/sb';
import { Kpi } from '@/components/ui';
import { PatientButton } from '@/components/Shell';

export const dynamic = 'force-dynamic';

export default async function Cancellations() {
  const [attended, cancelled, missed, pending, feed, physios, appts] = await Promise.all([
    sb('dashboard_journey_metrics?metric_key=eq.attended&select=all_time_count').then((r) => r[0]?.all_time_count ?? 0),
    sbCount('appointments?select=id&status=eq.cancelled'),
    sbCount('appointments?select=id&status=eq.missed'),
    sbCount('appointments?select=id&status=eq.pending'),
    sb('dashboard_appointment_feed?status=in.(cancelled,missed)&select=contact_id,patient_name,status,starts_at,practitioner,cancel_reason&order=starts_at.desc&limit=20'),
    sb('practicehub_practitioners?select=practitioner_id,name&active=eq.true'),
    sb('appointments?select=practitioner_id,status&limit=2000'),
  ]);

  const nameById = Object.fromEntries(physios.map((p) => [p.practitioner_id, p.name]));
  const agg = {};
  for (const a of appts) { if (!a.practitioner_id) continue; const r = agg[a.practitioner_id] ||= { a: 0, c: 0, m: 0, p: 0 }; r.a++; if (a.status === 'cancelled') r.c++; if (a.status === 'missed') r.m++; if (a.status === 'pending') r.p++; }
  const rows = Object.entries(agg).map(([pid, r]) => ({ name: nameById[pid] || `#${pid}`, ...r })).sort((x, y) => y.a - x.a);

  return (
    <>
      <div className="grid k4">
        <Kpi icon="check" iconClass="i-mint" value={attended} label="Attended" sub="this period" />
        <Kpi icon="x" iconClass="i-amber" value={cancelled} label="Cancellations" />
        <Kpi icon="x" iconClass="i-coral" value={missed} label="DNAs (no-show)" alert />
        <Kpi icon="clock" iconClass="i-blue" value={pending} label="Unprocessed" alert sub="blocks tracking" />
      </div>
      <div className="grid k2 mt">
        <div className="panel">
          <div className="phead"><div><h2>By physio</h2><p className="hint">Appointments, cancels, DNAs, unprocessed</p></div></div>
          <table><thead><tr><th>Physio</th><th className="n">Appts</th><th className="n">Cancelled</th><th className="n">DNA</th><th className="n">Unprocessed</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.name}><td>{r.name}</td><td className="n">{r.a}</td><td className="n">{r.c}</td><td className="n" style={{ color: r.m >= 8 ? 'var(--coral)' : undefined }}>{r.m}</td><td className="n" style={{ color: 'var(--amber)' }}>{r.p}</td></tr>)}</tbody></table>
        </div>
        <div className="panel">
          <div className="phead"><div><h2>Recent cancellations &amp; DNAs</h2><p className="hint">Click a patient to open their record</p></div></div>
          <table><tbody>
            {feed.map((f, i) => (
              <tr key={i}>
                <td>{f.contact_id ? <PatientButton id={f.contact_id} name={f.patient_name || 'Patient'} sub={f.practitioner || ''} /> : (f.patient_name || '—')}</td>
                <td><span className={`pill ${f.status === 'missed' ? 'p-coral' : 'p-amber'}`}>{f.status === 'missed' ? 'DNA' : 'Cancelled'}</span></td>
                <td className="n sub2">{f.starts_at ? new Date(f.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </>
  );
}
