import { sb } from '@/lib/sb';
import { PatientButton } from '@/components/Shell';

export const dynamic = 'force-dynamic';

export default async function Enquiries() {
  const feed = await sb("dashboard_interaction_feed?outcome=in.(appointment_requested,appointment_booked,callback_required,enquiry_resolved,unknown_enquiry)&select=contact_id,patient_name,channel,outcome,summary,started_at&order=started_at.desc&limit=20").catch(() => []);
  return (
    <>
      <div className="panel">
        <div className="phead"><div><h2>Enquiries &amp; leads</h2><p className="hint">New-patient enquiries from voice and chat. Source attribution (Meta / Google) and conversion metrics light up once the journey pipeline writes them.</p></div></div>
        <table><thead><tr><th>Patient</th><th>Channel</th><th>Outcome</th><th className="n">When</th></tr></thead>
          <tbody>
            {feed.map((f, i) => (
              <tr key={i}>
                <td>{f.contact_id ? <PatientButton id={f.contact_id} name={f.patient_name || 'Enquiry'} sub={(f.summary || '').slice(0, 64)} /> : (f.patient_name || 'Enquiry')}</td>
                <td className="sub2">{f.channel}</td>
                <td><span className="pill p-grey">{(f.outcome || '').replace(/_/g, ' ')}</span></td>
                <td className="n sub2">{f.started_at ? new Date(f.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
              </tr>
            ))}
            {!feed.length && <tr><td colSpan={4} className="mut">No enquiries on file yet.</td></tr>}
          </tbody></table>
      </div>
    </>
  );
}
