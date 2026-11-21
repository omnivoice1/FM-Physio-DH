import { sb, sbCount } from '@/lib/sb';
import { Kpi } from '@/components/ui';
import { PatientButton } from '@/components/Shell';

export const dynamic = 'force-dynamic';
const pillFor = (o) => /complaint|refund|clinical|escalation/i.test(o || '') ? 'p-coral' : /book/i.test(o || '') ? 'p-mint' : /callback|handoff|handover/i.test(o || '') ? 'p-amber' : 'p-grey';

export default async function Ai() {
  const [total, booked, handoff, disconnected, feed] = await Promise.all([
    sbCount('interactions?select=id'),
    sbCount('interactions?select=id&outcome=eq.appointment_booked'),
    sbCount('interactions?select=id&outcome=eq.human_handoff'),
    sbCount('interactions?select=id&outcome=eq.caller_disconnected'),
    sb('dashboard_interaction_feed?select=contact_id,patient_name,channel,outcome,summary,started_at&order=started_at.desc&limit=14'),
  ]);
  return (
    <>
      <div className="grid k4">
        <Kpi icon="chat" iconClass="i-peri" value={total} label="Calls & chats" sub="voice + web" />
        <Kpi icon="cal" iconClass="i-mint" value={booked} label="Booked by AI" sub="appointments" />
        <Kpi icon="users" iconClass="i-amber" value={handoff} label="Handed to human" />
        <Kpi icon="x" iconClass="i-coral" value={disconnected} label="Disconnected" alert sub="largest outcome" />
      </div>
      <div className="panel mt">
        <div className="phead"><div><h2>Recent conversations</h2><p className="hint">Click a patient for the full record — transcript &amp; recording live on each call</p></div></div>
        <table><tbody>
          {feed.map((f, i) => (
            <tr key={i}>
              <td>{f.contact_id ? <PatientButton id={f.contact_id} name={f.patient_name || 'Caller'} sub={(f.summary || '').slice(0, 70)} /> : (f.patient_name || 'Caller')}</td>
              <td className="sub2">{f.channel}</td>
              <td style={{ textAlign: 'right' }}>{f.outcome && <span className={`pill ${pillFor(f.outcome)}`}>{f.outcome.replace(/_/g, ' ')}</span>}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </>
  );
}
