import { sb, sbCount } from '@/lib/sb';
import { Kpi, Bars, Donut, Icon } from '@/components/ui';
import { PatientButton } from '@/components/Shell';

export const dynamic = 'force-dynamic';

const OPS = '(api_outage,other,technical_failure)';

async function metric(key) {
  const [m] = await sb(`dashboard_journey_metrics?metric_key=eq.${key}&select=all_time_count&limit=1`).catch(() => []);
  return m?.all_time_count ?? 0;
}

export default async function Overview() {
  const [patients, openTasks, interactions, attended, pending, missed, cancelled, doneT, cancT, physios, appts, recent] = await Promise.all([
    sbCount('contacts?select=id'),
    sbCount(`tasks?select=id&status=eq.open&task_type=not.in.${OPS}`),
    sbCount('interactions?select=id'),
    metric('attended'),
    sbCount('appointments?select=id&status=eq.pending'),
    sbCount('appointments?select=id&status=eq.missed'),
    sbCount('appointments?select=id&status=eq.cancelled'),
    sbCount(`tasks?select=id&status=eq.completed&task_type=not.in.${OPS}`),
    sbCount(`tasks?select=id&status=eq.cancelled&task_type=not.in.${OPS}`),
    sb('practicehub_practitioners?select=practitioner_id,name&active=eq.true'),
    sb('appointments?select=practitioner_id&limit=2000'),
    sb('dashboard_patient_summary?select=id,first_name,last_name,open_task_count,interaction_count,last_activity_at&order=last_activity_at.desc.nullslast&limit=8'),
  ]);

  const nameById = Object.fromEntries(physios.map((p) => [p.practitioner_id, p.name]));
  const counts = {};
  for (const a of appts) if (a.practitioner_id) counts[a.practitioner_id] = (counts[a.practitioner_id] || 0) + 1;
  const palette = ['#8b86e8', '#6f93ea', '#ef9bbe', '#44c08a', '#e3a94e'];
  const bars = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([pid, v], i) => ({ label: (nameById[pid] || `#${pid}`).split(' ')[0], v, color: palette[i % palette.length] }));

  return (
    <>
      <div className="grid k4">
        <Kpi href="/team" icon="users" iconClass="i-peri" value={patients} label="Total patients" sub="in CRM" />
        <Kpi href="/cancellations" icon="check" iconClass="i-mint" value={attended} label="Attended" sub="this period" />
        <Kpi href="/tasks" icon="board" iconClass="i-blue" value={openTasks} label="Open tasks" sub="patient-facing" />
        <Kpi href="/ai" icon="chat" iconClass="i-pink" value={interactions} label="AI interactions" sub="voice + web" />
      </div>

      <div className="grid k2 mt">
        <div className="panel">
          <div className="phead"><div><h2>Appointments by physio</h2><p className="hint">All appointments this period</p></div></div>
          <Bars rows={bars} />
        </div>
        <div className="panel">
          <div className="phead"><div><h2>Task status</h2><p className="hint">Patient-facing tasks</p></div></div>
          <Donut segments={[
            { label: 'Open', v: openTasks, color: '#6f93ea' },
            { label: 'Completed', v: doneT, color: '#44c08a' },
            { label: 'Cancelled', v: cancT, color: '#ef9bbe' },
          ]} />
        </div>
      </div>

      <div className="grid k2 mt">
        <div className="panel">
          <div className="phead"><div><h2>This week&apos;s priorities</h2><p className="hint">From live data</p></div></div>
          <div className="prio"><div className="ic i-coral"><Icon name="alert" w={17} /></div><div><b>{pending} appointments unprocessed</b> in PracticeHub — blocks DNA, revenue &amp; package tracking.</div></div>
          <div className="prio"><div className="ic i-amber"><Icon name="x" w={17} /></div><div><b>{cancelled} cancellations &amp; {missed} no-shows</b> this period to review and rebook.</div></div>
          <div className="prio"><div className="ic i-blue"><Icon name="chat" w={17} /></div><div><b>{interactions} AI interactions</b> handled across voice and web.</div></div>
          <div className="prio"><div className="ic i-mint"><Icon name="check" w={17} /></div><div><b>{attended} appointments attended</b> — attendance is healthy.</div></div>
        </div>
        <div className="panel">
          <div className="phead"><div><h2>Recent patients</h2><p className="hint">Click to open the full record</p></div></div>
          <table><tbody>
            {recent.map((p) => {
              const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || `Patient #${p.id}`;
              return <tr key={p.id}>
                <td><PatientButton id={p.id} name={name} sub={`${p.interaction_count || 0} interactions · ${p.open_task_count || 0} open`} /></td>
                <td className="n sub2">{p.last_activity_at ? new Date(p.last_activity_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
              </tr>;
            })}
          </tbody></table>
        </div>
      </div>
    </>
  );
}
