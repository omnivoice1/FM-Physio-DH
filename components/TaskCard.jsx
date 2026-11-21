'use client';
import { usePatient } from '@/components/Shell';

const prPill = { urgent: 'p-coral', high: 'p-amber', normal: 'p-blue', low: 'p-grey' };

export default function TaskCard({ t }) {
  const { open } = usePatient();
  const yest = t.created_at ? Math.floor((Date.now() - new Date(t.created_at).getTime()) / 86400000) : 0;
  const clickable = !!t.contact_id;
  return (
    <button className={`tcard${t.priority === 'urgent' ? ' urgent' : ''}`}
      onClick={() => clickable && open({ id: t.contact_id, name: t.patient_name || 'Patient', why: t.reason || t.title })}
      style={{ cursor: clickable ? 'pointer' : 'default' }}>
      <div className="ct">
        <span className={`pill ${prPill[t.priority] || 'p-grey'}`}>{t.priority}</span>
        {t.sla_status === 'breached' && <span className="pill p-coral">SLA breached</span>}
        <span className="pill p-grey">{t.task_type_label || t.task_type}</span>
      </div>
      <div className="pn">{t.patient_name || '—'}</div>
      {(t.title || t.reason) && <div className="why">{t.title || t.reason}</div>}
      <div className="foot">
        {yest >= 1 && <span className="timer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>pending {yest}d</span>}
      </div>
    </button>
  );
}
