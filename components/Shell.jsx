'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV, ICONS, SECTION_SUBTITLE } from '@/lib/nav';

const Ctx = createContext(null);
export const usePatient = () => useContext(Ctx);
const initials = (n) => (n || '?').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
const Svg = ({ d, cls }) => <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" dangerouslySetInnerHTML={{ __html: d }} />;

export function PatientButton({ id, name, why, sub, children }) {
  const { open } = usePatient();
  return (
    <button className="pname" onClick={() => open({ id, name, why })}>
      <span className="av">{initials(name)}</span>
      <span>{children || name}{sub ? <div className="sub2">{sub}</div> : null}</span>
    </button>
  );
}

export default function Shell({ children }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [patient, setPatient] = useState(null); // {id,name,why}
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wins, setWins] = useState([]); // floating transcript windows
  const zRef = useRef(70);

  const open = useCallback((p) => { setPatient(p); }, []);
  const close = () => { setPatient(null); setDetail(null); };

  // deep link: /?patient=<id> opens that record (shareable links)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('patient');
    if (id) setPatient({ id });
  }, []);

  useEffect(() => {
    if (!patient) return;
    setLoading(true); setDetail(null);
    fetch(`/api/patient/${patient.id}`)
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetail({ error: true }))
      .finally(() => setLoading(false));
  }, [patient]);

  const title = NAV.find((n) => n.href === path)?.label || 'Overview';
  const sub = SECTION_SUBTITLE[path] || '';

  return (
    <Ctx.Provider value={{ open }}>
      <div className={`app${collapsed ? ' collapsed' : ''}`}>
        <aside className="side">
          <div className="logo"><div className="mk">FM</div><div className="tx">FM Physio<small>OmniVoice Ops</small></div></div>
          {NAV.map((n, i) =>
            n.group ? <div className="navgroup" key={`g${i}`}>{n.group}</div> : (
              <Link key={n.href} href={n.href} className={`nav${path === n.href ? ' active' : ''}`}>
                <Svg d={ICONS[n.icon]} /><span className="tx">{n.label}</span>
              </Link>
            )
          )}
        </aside>

        <div className="main">
          <div className="topbar">
            <button className="burger" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle menu">
              <Svg d='<path d="M3 6h18M3 12h18M3 18h18"/>' />
            </button>
            <div><h1>{title}</h1><div className="sub">{sub}</div></div>
            <div className="spacer" />
            <div className="search"><Svg d='<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>' /><input placeholder="Search patients, tasks…" /></div>
            <div className="me"><div className="av">SG</div><div className="nm">Stuart Goldfinch<small>● Online</small></div></div>
          </div>
          <div className="wrap">{children}</div>
        </div>
      </div>

      {/* slide-over */}
      <div className={`scrim${patient ? ' on' : ''}`} onClick={close} />
      <aside className={`slide${patient ? ' on' : ''}`}>
        {patient && (
          <>
            <div className="slide-head">
              <button className="x" onClick={close}><Svg d='<path d="M18 6 6 18M6 6l12 12"/>' /></button>
              <div className="top">
                <div className="pav">{initials(detail?.name || patient.name)}</div>
                <div>
                  <h2>{detail?.name || patient.name}</h2>
                  <div className="meta">
                    {detail?.phone && <span className="ph"><Svg d={ICONS.phone} />{detail.phone}</span>}
                    {detail?.email && <span>{detail.email}</span>}
                    {detail?.physio && <span>Physio: {detail.physio}</span>}
                  </div>
                </div>
              </div>
              {(patient.why || detail?.why) && (
                <div className="why-box"><div className="label">Why this patient is here</div><p>{patient.why || detail?.why}</p></div>
              )}
              {detail?.chips && (
                <div className="slide-chips">
                  {detail.chips.map((c, i) => <div className="schip" key={i}><div className="label">{c[0]}</div><div className="v">{c[1]}</div></div>)}
                </div>
              )}
            </div>
            <div className="slide-body">
              {loading && <div className="spin" />}
              {detail?.error && <p className="mut">Could not load this patient.</p>}
              {detail && !detail.error && <PatientBody detail={detail} openWin={(rec) => {
                const id = Date.now() + Math.random();
                const z = ++zRef.current;
                setWins((w) => [...w, { id, rec, z, x: 140 + (w.length * 30) % 150, y: 96 + (w.length * 30) % 150 }]);
              }} />}
            </div>
          </>
        )}
      </aside>

      {wins.map((w) => (
        <FloatWin key={w.id} win={w}
          onClose={() => setWins((ws) => ws.filter((x) => x.id !== w.id))}
          onFocus={() => { const z = ++zRef.current; setWins((ws) => ws.map((x) => x.id === w.id ? { ...x, z } : x)); }} />
      ))}
    </Ctx.Provider>
  );
}

function PatientBody({ detail, openWin }) {
  return (
    <>
      <div className="sec-t">Call recordings<div className="ln" /></div>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '-4px 0 12px' }}>
        Matched to this patient by Retell call ID · shown only here, on the record.
      </p>
      {(!detail.recordings || detail.recordings.length === 0) && <p className="mut" style={{ marginTop: -4 }}>No call recordings on file.</p>}
      {detail.recordings?.map((r, i) => (
        <div className="rec-row" key={i}>
          <div className="rec-ic"><Svg d={ICONS.play} /></div>
          <div className="rec-meta">
            <div className="rec-t">{r.date}{r.dur ? ` · ${r.dur}` : ''}</div>
            <div className="rec-s">{r.agent || 'Voice assistant'}{r.from ? ` · from ${r.from}` : ''}{r.outcome ? ` · ${r.outcome}` : ''}</div>
          </div>
          <button className="btn btn-g" onClick={() => openWin(r)}>View</button>
        </div>
      ))}

      <div className="sec-t">Activity timeline<div className="ln" /></div>
      {detail.timeline?.map((g, i) => (
        <div key={i}>
          <div className="tl-when">{g.when}</div>
          {g.items.map((it, j) => (
            <div className="tl-item" key={j}>
              <div className={`tl-ic ${TLCLASS[it.type] || 'i-peri'}`}><Svg d={TLICON[it.type] || TLICON.appt} /></div>
              <div className="tl-c"><div className="tt">{it.title}</div><div className="td">{it.sub}</div></div>
            </div>
          ))}
        </div>
      ))}
      {(!detail.timeline || detail.timeline.length === 0) && <p className="mut">No recorded activity yet.</p>}

      <div className="sec-t">Record<div className="ln" /></div>
      <div className="minirow"><span className="mut">Record handling</span><span className="pill p-mint">updates append · no duplicates</span></div>
      <div className="minirow"><span className="mut">Source</span><span>contacts · patient_timeline</span></div>
    </>
  );
}

const TLICON = {
  appt: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  interaction: '<path d="M22 16.9V21a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h4a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L9.9 11a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z"/>',
  task: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  sequence_event: '<path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>',
};
const TLCLASS = { appt: 'i-peri', interaction: 'i-mint', task: 'i-amber', sequence_event: 'i-pink' };

function FloatWin({ win, onClose, onFocus }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const r = win.rec;
  useEffect(() => {
    const move = (e) => { if (!drag.current) return; setPos({ x: Math.max(0, Math.min(window.innerWidth - 120, e.clientX - drag.current.dx)), y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - drag.current.dy)) }); };
    const up = () => (drag.current = null);
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);
  return (
    <div ref={ref} className="fwin" style={{ left: pos.x, top: pos.y, zIndex: win.z }} onMouseDown={onFocus}>
      <div className="fwin-head" onMouseDown={(e) => { if (e.target.closest('.fwin-x')) return; const b = ref.current.getBoundingClientRect(); drag.current = { dx: e.clientX - b.left, dy: e.clientY - b.top }; }}>
        <div><div className="fwin-t">Call recording</div><div className="fwin-d">{r.date}{r.dur ? ` · ${r.dur}` : ''}{r.agent ? ` · ${r.agent}` : ''}</div></div>
        <button className="fwin-x" onClick={onClose}>✕</button>
      </div>
      <div className="fwin-body">
        {r.audio ? <audio controls preload="none" src={r.audio} /> : <div className="fwin-sum">Recording file not available.</div>}
        {r.summary && <div className="fwin-sum"><b>Summary · </b>{r.summary}</div>}
        {r.turns?.length ? r.turns.map((t, i) => (
          <div className={`turn ${t.r === 'agent' ? 'agent' : 'user'}`} key={i}>
            <span className="who">{t.r === 'agent' ? 'Assistant' : 'Caller'}</span>{t.c}
          </div>
        )) : (r.transcript ? <div className="turn"><div style={{ whiteSpace: 'pre-wrap' }}>{r.transcript}</div></div> : <p className="mut">No transcript.</p>)}
      </div>
    </div>
  );
}
