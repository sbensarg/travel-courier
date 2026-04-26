import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useState } from 'react';

export const config: ViewConfig = {
  menu: { order: 0, icon: 'line-awesome/svg/paper-plane-solid.svg' },
  title: 'Travel Courier',
};

type Status = 'pending' | 'in-transit' | 'delivered' | 'failed';
type Priority = 'standard' | 'express' | 'overnight';

interface Shipment {
  id: string;
  trackingCode: string;
  sender: string;
  recipient: string;
  origin: string;
  destination: string;
  status: Status;
  weight: string;
  eta: string;
  courier: string;
  priority: Priority;
}

const COURIERS = ['Youssef K.', 'Anna P.', 'Pedro A.', 'Karim M.', 'Lena B.', 'David C.'];

const MOCK: Shipment[] = [
  { id: '1', trackingCode: 'TC-2026-8841', sender: 'Ahmed Benali',  recipient: 'Sofia Moreau',  origin: 'Tangier, MA',    destination: 'Paris, FR',    status: 'in-transit', weight: '2.4 kg', eta: 'Apr 26, 2026', courier: 'Youssef K.', priority: 'express'   },
  { id: '2', trackingCode: 'TC-2026-9032', sender: 'Lena Hoffmann', recipient: 'Marco Ricci',   origin: 'Berlin, DE',     destination: 'Rome, IT',     status: 'delivered',  weight: '1.1 kg', eta: 'Apr 23, 2026', courier: 'Anna P.',    priority: 'standard'  },
  { id: '3', trackingCode: 'TC-2026-7710', sender: 'Priya Nair',    recipient: 'James Okafor',  origin: 'London, UK',     destination: 'Lagos, NG',    status: 'pending',    weight: '5.0 kg', eta: 'Apr 28, 2026', courier: 'Unassigned', priority: 'overnight' },
  { id: '4', trackingCode: 'TC-2026-6603', sender: 'Carlos Ruiz',   recipient: 'Mei Lin',       origin: 'Madrid, ES',     destination: 'Shanghai, CN', status: 'failed',     weight: '0.8 kg', eta: '-',            courier: 'Pedro A.',   priority: 'express'   },
  { id: '5', trackingCode: 'TC-2026-5519', sender: 'Fatima Zohra',  recipient: 'Alex Dupont',   origin: 'Casablanca, MA', destination: 'Lyon, FR',     status: 'in-transit', weight: '3.3 kg', eta: 'Apr 27, 2026', courier: 'Karim M.',   priority: 'standard'  },
  { id: '6', trackingCode: 'TC-2026-4402', sender: 'Sara Kim',      recipient: 'Oliver Braun',  origin: 'Seoul, KR',      destination: 'Munich, DE',   status: 'pending',    weight: '1.8 kg', eta: 'Apr 30, 2026', courier: 'David C.',   priority: 'overnight' },
];

const STATUS_META: Record<Status, { label: string; bg: string; color: string; dot: string }> = {
  'pending':    { label: 'Pending',    bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  'in-transit': { label: 'In Transit', bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  'delivered':  { label: 'Delivered',  bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  'failed':     { label: 'Failed',     bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const PRIORITY_META: Record<Priority, { label: string; bg: string; color: string }> = {
  standard:  { label: 'Standard',  bg: '#f3f4f6', color: '#374151' },
  express:   { label: 'Express',   bg: '#ede9fe', color: '#5b21b6' },
  overnight: { label: 'Overnight', bg: '#fff7ed', color: '#c2410c' },
};

const INP: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #d1d5db', fontSize: 14,
  boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
  background: '#fff', color: '#111',
};

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase', padding: '3px 10px',
      borderRadius: 20, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 20, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

function NewShipmentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Shipment) => void }) {
  const [form, setForm] = useState({
    sender: '', recipient: '', origin: '', destination: '',
    weight: '', courier: COURIERS[0], priority: 'standard' as Priority,
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const req = ['sender', 'recipient', 'origin', 'destination'];
    const errs = Object.fromEntries(req.filter(k => !(form as any)[k]).map(k => [k, true]));
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({
      id: String(Date.now()),
      trackingCode: 'TC-2026-' + Math.floor(1000 + Math.random() * 9000),
      sender: form.sender, recipient: form.recipient,
      origin: form.origin, destination: form.destination,
      status: 'pending',
      weight: form.weight ? form.weight + ' kg' : '1.0 kg',
      eta: 'TBD', courier: form.courier, priority: form.priority,
    });
    onClose();
  };

  const FIELDS: [keyof typeof form, string, boolean][] = [
    ['sender',      'Sender name',                 true],
    ['recipient',   'Recipient name',               true],
    ['origin',      'Origin (city, country)',       true],
    ['destination', 'Destination (city, country)',  true],
    ['weight',      'Weight in kg (optional)',      false],
  ];

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px,4vw,32px)',
        width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111' }}>New Shipment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22,
            cursor: 'pointer', color: '#9ca3af', lineHeight: 1, padding: 4 }}>x</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {FIELDS.map(([k, label, required]) => (
            <div key={k} style={{ gridColumn: k === 'weight' ? '1 / -1' : undefined }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
              <input style={{ ...INP, borderColor: errors[k] ? '#ef4444' : '#d1d5db' }}
                value={form[k]} onChange={set(k)} placeholder={label} />
              {errors[k] && <span style={{ fontSize: 11, color: '#ef4444' }}>Required</span>}
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Priority</label>
            <select style={INP} value={form.priority} onChange={set('priority')}>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="overnight">Overnight</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Courier</label>
            <select style={INP} value={form.courier} onChange={set('courier')}>
              {COURIERS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={onClose} style={{ flex: '1 1 100px', padding: '11px 0', borderRadius: 10,
            border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: '#374151' }}>Cancel</button>
          <button onClick={submit} style={{ flex: '2 1 160px', padding: '11px 0', borderRadius: 10,
            border: 'none', background: 'linear-gradient(135deg,#1e40af,#6d28d9)',
            color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Create Shipment</button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ shipment, onClose, onStatusChange }: {
  shipment: Shipment; onClose: () => void;
  onStatusChange: (id: string, s: Status) => void;
}) {
  const statuses: Status[] = ['pending', 'in-transit', 'delivered', 'failed'];
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        display: 'flex', justifyContent: 'flex-end', zIndex: 998 }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 420, height: '100%',
        padding: 'clamp(20px,4vw,32px)', overflowY: 'auto',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.15)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 14,
          cursor: 'pointer', color: '#6b7280', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, padding: 0 }}>
          Back
        </button>
        <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)',
          borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Tracking Code</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a8a',
            fontFamily: 'monospace', wordBreak: 'break-all' }}>{shipment.trackingCode}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={shipment.status} />
            <PriorityBadge priority={shipment.priority} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          background: '#f9fafb', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>From</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginTop: 2 }}>{shipment.origin}</div>
          </div>
          <div style={{ fontSize: 18 }}>plane</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>To</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginTop: 2 }}>{shipment.destination}</div>
          </div>
        </div>
        {(['Sender', 'Recipient', 'Courier', 'Weight', 'ETA'] as const).map((label, i) => {
          const val = [shipment.sender, shipment.recipient, shipment.courier, shipment.weight, shipment.eta][i];
          return (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#111', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {statuses.map(s => (
              <button key={s} onClick={() => onStatusChange(shipment.id, s)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: shipment.status === s ? '2px solid #1e40af' : '1px solid #e5e7eb',
                background: shipment.status === s ? '#eff6ff' : '#fff',
                color: shipment.status === s ? '#1e40af' : '#6b7280',
              }}>
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShipmentCard({ s, onClick }: { s: Shipment; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
      padding: 16, cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1e40af' }}>{s.trackingCode}</span>
        <StatusBadge status={s.status} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        background: '#f9fafb', borderRadius: 8, padding: '8px 10px' }}>
        <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{s.origin}</span>
        <span style={{ fontSize: 14 }}>to</span>
        <span style={{ fontSize: 12, color: '#374151', flex: 1, textAlign: 'right' }}>{s.destination}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <div>
          <div style={{ fontSize: 12, color: '#374151' }}>{s.sender} to {s.recipient}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Courier: {s.courier} - {s.weight}</div>
        </div>
        <PriorityBadge priority={s.priority} />
      </div>
    </div>
  );
}

export default function TravelCourierAppView() {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState<Status | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState<Shipment | null>(null);

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || [s.trackingCode, s.sender, s.recipient, s.origin, s.destination]
      .some(v => v.toLowerCase().includes(q));
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total:     shipments.length,
    inTransit: shipments.filter(s => s.status === 'in-transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    pending:   shipments.filter(s => s.status === 'pending').length,
  };

  const addShipment = (s: Shipment) => setShipments(prev => [s, ...prev]);
  const updateStatus = (id: string, status: Status) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const STATS = [
    { label: 'Total',      value: counts.total,     accent: '#60a5fa' },
    { label: 'In Transit', value: counts.inTransit,  accent: '#a78bfa' },
    { label: 'Delivered',  value: counts.delivered,  accent: '#34d399' },
    { label: 'Pending',    value: counts.pending,    accent: '#fbbf24' },
  ];

  const FILTER_BTNS: (Status | 'all')[] = ['all', 'pending', 'in-transit', 'delivered', 'failed'];

  return (
    <div style={{ minHeight: '100%', background: '#f8fafc',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <div style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#4c1d95 100%)',
        padding: 'clamp(20px,4vw,32px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(18px,4vw,26px)', fontWeight: 800,
                  color: '#fff', letterSpacing: '-0.5px' }}>TravelCourier</h1>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  Global parcel dispatch and tracking
                </p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} style={{
              background: '#fff', color: '#1e3a8a', border: 'none',
              padding: '10px 20px', borderRadius: 10, fontSize: 14,
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              + New Shipment
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
            {STATS.map(({ label, value, accent }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14,
                padding: 'clamp(12px,2vw,18px)', borderLeft: `3px solid ${accent}` }}>
                <div style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, color: '#fff' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px,3vw,28px)' }}>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tracking code, sender, recipient..."
            style={{ ...INP, flex: '1 1 200px', borderRadius: 10, padding: '10px 14px' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTER_BTNS.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: '1px solid #e5e7eb', whiteSpace: 'nowrap',
                background: filterStatus === s ? '#1e3a8a' : '#fff',
                color:      filterStatus === s ? '#fff'    : '#374151',
              }}>
                {s === 'all' ? 'All' : STATUS_META[s as Status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="tc-desktop">
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Tracking Code','Route','Sender / Recipient','Courier','Weight','ETA','Priority','Status'].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10,
                        fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em',
                        textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                      No shipments found
                    </td></tr>
                  ) : filtered.map(s => (
                    <tr key={s.id} onClick={() => setSelected(s)}
                      style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '13px 14px', fontWeight: 700, color: '#1e40af', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{s.trackingCode}</td>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ fontSize: 12, color: '#374151' }}>{s.origin}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>to {s.destination}</div>
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ color: '#374151' }}>{s.sender}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{s.recipient}</div>
                      </td>
                      <td style={{ padding: '13px 14px', color: '#374151', whiteSpace: 'nowrap' }}>{s.courier}</td>
                      <td style={{ padding: '13px 14px', color: '#374151' }}>{s.weight}</td>
                      <td style={{ padding: '13px 14px', color: '#374151', whiteSpace: 'nowrap', fontSize: 12 }}>{s.eta}</td>
                      <td style={{ padding: '13px 14px' }}><PriorityBadge priority={s.priority} /></td>
                      <td style={{ padding: '13px 14px' }}><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="tc-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0
            ? <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>No shipments found</div>
            : filtered.map(s => <ShipmentCard key={s.id} s={s} onClick={() => setSelected(s)} />)
          }
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
          Showing {filtered.length} of {shipments.length} shipments
        </div>
      </div>

      {showModal && <NewShipmentModal onClose={() => setShowModal(false)} onAdd={addShipment} />}
      {selected  && <DetailPanel shipment={selected} onClose={() => setSelected(null)} onStatusChange={updateStatus} />}
    </div>
  );
}
