import { sb, sbCount } from '@/lib/sb';
import { Icon } from '@/components/ui';
import TaskCard from '@/components/TaskCard';

export const dynamic = 'force-dynamic';
const OPS = '(api_outage,other,technical_failure)';
const RANK = { urgent: 0, high: 1, normal: 2, low: 3 };
const sel = 'id,contact_id,task_type,task_type_label,title,reason,priority,sla_status,due_at,created_at,first_response_at,patient_name';

export default async function Tasks() {
  const [open, resolved, openCount, urgent, breached, completed] = await Promise.all([
    sb(`dashboard_task_board?status=eq.open&task_type=not.in.${OPS}&select=${sel}&limit=120`),
    sb(`dashboard_task_board?status=eq.completed&task_type=not.in.${OPS}&select=${sel}&order=updated_at.desc&limit=12`).catch(() => []),
    sbCount(`tasks?select=id&status=eq.open&task_type=not.in.${OPS}`),
    sbCount(`tasks?select=id&status=eq.open&priority=eq.urgent&task_type=not.in.${OPS}`),
    sbCount(`dashboard_task_board?select=id&status=eq.open&sla_status=eq.breached&task_type=not.in.${OPS}`),
    sbCount(`tasks?select=id&status=eq.completed&task_type=not.in.${OPS}`),
  ]);

  const sorted = [...open].sort((a, b) => (RANK[a.priority] ?? 9) - (RANK[b.priority] ?? 9)
    || (a.sla_status === 'breached' ? -1 : 1) - (b.sla_status === 'breached' ? -1 : 1)
    || new Date(a.created_at) - new Date(b.created_at));
  const incoming = sorted.filter((t) => !t.first_response_at);
  const progress = sorted.filter((t) => t.first_response_at);

  const Col = ({ color, title, items, count }) => (
    <div className="col">
      <div className="col-h"><span className="dot" style={{ background: color }} /><h3>{title}</h3><span className="c">{count ?? items.length}</span></div>
      <div className="col-body">
        {items.length ? items.map((t) => <TaskCard key={t.id} t={t} />) : <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>Nothing here</div>}
      </div>
    </div>
  );

  const Stat = ({ ic, cls, v, l, color }) => (
    <div className="tstat"><div className={`ic ${cls}`}><Icon name={ic} /></div><div><div className="v" style={color ? { color } : null}>{v}</div><div className="l">{l}</div></div></div>
  );

  return (
    <>
      <div className="timebar">
        <Stat ic="board" cls="i-peri" v={openCount} l="Open tasks" />
        <Stat ic="clock" cls="i-coral" v={urgent} l="Urgent" color="var(--coral)" />
        <Stat ic="alert" cls="i-amber" v={breached} l="SLA breached" color="var(--amber)" />
        <Stat ic="check" cls="i-mint" v={completed} l="Completed" color="var(--mint)" />
      </div>
      <div className="phead" style={{ padding: '0 2px 14px' }}>
        <div><h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Today&apos;s queue</h2>
          <p className="hint" style={{ marginTop: 4 }}>Ranked by urgency, then SLA, then age. Click a card to open the patient. Timer-graded resolve (on-time / late) wires in once task write-back is enabled.</p></div>
      </div>
      <div className="board">
        <Col color="var(--blue)" title="Incoming" items={incoming.slice(0, 40)} />
        <Col color="var(--amber)" title="In progress" items={progress.slice(0, 40)} />
        <Col color="var(--mint)" title="Resolved today" items={resolved} />
      </div>
    </>
  );
}
