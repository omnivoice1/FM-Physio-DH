import Link from 'next/link';

const I = {
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 .01M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  board: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18" opacity=".5"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  alert: '<path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>',
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
};
export const Icon = ({ name, w = 20 }) => <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" dangerouslySetInnerHTML={{ __html: I[name] || I.board }} />;

export function Kpi({ href, icon, iconClass = 'i-peri', value, label, sub, alert }) {
  const body = (
    <>
      <div className="row1"><div className={`ic ${iconClass}`}><Icon name={icon} /></div>{href && <div className="arr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{ __html: I.arrow }} /></div>}</div>
      <div className={`v${alert ? ' alert' : ''}`}>{value}</div>
      <div className="lab">{label}</div>
      {sub && <div className="d">{sub}</div>}
    </>
  );
  return href ? <Link href={href} className="card kpi">{body}</Link> : <div className="card kpi" style={{ cursor: 'default' }}>{body}</div>;
}

export function Bars({ rows, max }) {
  const mx = max || Math.max(...rows.map((r) => r.v), 1);
  return <div className="bars">{rows.map((r, i) => (
    <div className="row" key={i}><span>{r.label}</span><div className="track"><div className="fill" style={{ width: `${Math.round(r.v / mx * 100)}%`, background: r.color || 'var(--peri)' }} /></div><span className="n">{r.v}</span></div>
  ))}</div>;
}

export function Donut({ segments }) {
  const tot = segments.reduce((a, s) => a + s.v, 0) || 1;
  let acc = 0;
  const stops = segments.map((s) => { const a = acc / tot * 360; acc += s.v; return `${s.color} ${a}deg ${acc / tot * 360}deg`; }).join(',');
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops})` }}><div className="hole"><div className="num">{tot}</div><small>total</small></div></div>
      <div className="leg">{segments.map((s, i) => <div className="r" key={i}><span className="sw" style={{ background: s.color }} />{s.label}<b>{s.v}</b></div>)}</div>
    </div>
  );
}

export function Stub({ title, note }) {
  return (
    <div className="empty">
      <div className="ic"><Icon name="clock" w={24} /></div>
      <h2>{title}</h2>
      <p>{note}</p>
    </div>
  );
}
