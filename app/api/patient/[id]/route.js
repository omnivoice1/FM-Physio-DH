import { sb, signedUrl, readTextObject, refToPath } from '@/lib/sb';

function bucket(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (d < 1) return 'Today';
  if (d < 2) return 'Yesterday';
  if (d < 7) return `${Math.floor(d)} days ago`;
  if (d < 31) return `${Math.floor(d / 7)} week${d < 14 ? '' : 's'} ago`;
  if (d < 365) return `${Math.floor(d / 30)} month${d < 60 ? '' : 's'} ago`;
  return new Date(iso).getFullYear() + '';
}
function parseTranscript(txt) {
  if (!txt) return [];
  const turns = [];
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*(Agent|Assistant|User|Caller|Patient)\s*:\s*(.*)$/i);
    if (m) turns.push({ r: /agent|assistant/i.test(m[1]) ? 'agent' : 'user', c: m[2] });
    else if (turns.length && line.trim()) turns[turns.length - 1].c += ' ' + line.trim();
  }
  return turns;
}
const timeFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dur = (s) => (s ? `${Math.floor(s / 60)}m ${s % 60}s` : null);

export async function GET(req, { params }) {
  const { id } = await params;
  try {
    const [c] = await sb(`contacts?id=eq.${id}&select=id,first_name,last_name,email,phone_e164&limit=1`);
    if (!c) return Response.json({ error: 'not found' }, { status: 404 });
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown patient';

    const [summary] = await sb(`dashboard_patient_summary?id=eq.${id}&select=interaction_count,appointment_count,open_task_count&limit=1`).catch(() => []);
    const chips = [
      ['Appointments', summary?.appointment_count ?? '—'],
      ['Interactions', summary?.interaction_count ?? '—'],
      ['Open tasks', summary?.open_task_count ?? '—'],
    ];

    // interactions with recordings
    const ix = await sb(`interactions?contact_id=eq.${id}&recording_reference=not.is.null&select=id,provider_interaction_id,recording_reference,transcript_reference,outcome,summary,ai_reason,started_at&order=started_at.desc&limit=12`).catch(() => []);
    const ids = ix.map((r) => r.id);
    let callsById = {};
    if (ids.length) {
      const calls = await sb(`calls?interaction_id=in.(${ids.join(',')})&select=interaction_id,duration_seconds,from_number_masked`).catch(() => []);
      for (const cl of calls) callsById[cl.interaction_id] = cl;
    }
    const recordings = [];
    for (const r of ix) {
      const call = callsById[r.id] || {};
      const audio = r.recording_reference ? await signedUrl(refToPath(r.recording_reference), 3600) : null;
      const txt = r.transcript_reference ? await readTextObject(refToPath(r.transcript_reference)) : null;
      recordings.push({
        date: timeFmt(r.started_at),
        dur: dur(call.duration_seconds),
        from: call.from_number_masked || null,
        agent: 'Retell assistant',
        outcome: r.outcome || null,
        summary: r.summary || r.ai_reason || null,
        audio,
        turns: parseTranscript(txt),
        transcript: txt && !parseTranscript(txt).length ? txt : null,
      });
    }

    // timeline from patient_timeline
    const tl = await sb(`patient_timeline?contact_id=eq.${id}&select=occurred_at,event_type,details&order=occurred_at.desc&limit=40`).catch(() => []);
    const groups = [];
    const byWhen = {};
    for (const e of tl) {
      const w = bucket(e.occurred_at);
      if (!byWhen[w]) { byWhen[w] = { when: w, items: [] }; groups.push(byWhen[w]); }
      byWhen[w].items.push({
        type: e.event_type,
        title: titleFor(e),
        sub: subFor(e),
      });
    }

    return Response.json({ name, phone: c.phone_e164 || null, email: c.email || null, chips, recordings, timeline: groups });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

function titleFor(e) {
  const d = e.details || {};
  if (e.event_type === 'appointment') return `Appointment — ${d.status || 'scheduled'}`;
  if (e.event_type === 'interaction') return `${(d.channel || 'Voice')} ${d.direction || ''}`.trim() + (d.outcome ? ` · ${d.outcome}` : '');
  if (e.event_type === 'task') return d.title || d.task_type || 'Task';
  if (e.event_type === 'sequence_event') return `Sequence · ${d.stage || d.event_type || 'step'}`;
  return e.event_type;
}
function subFor(e) {
  const d = e.details || {};
  if (e.event_type === 'appointment') return d.practitioner_id ? `Practitioner #${d.practitioner_id}` : '';
  if (e.event_type === 'task') return d.reason || d.priority || '';
  return '';
}
