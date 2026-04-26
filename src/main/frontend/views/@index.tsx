import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useState, useEffect, useRef } from 'react';

export const config: ViewConfig = {
  menu: { order: 0, icon: 'line-awesome/svg/paper-plane-solid.svg' },
  title: 'Travel Courier App',
};

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Status   = 'pending' | 'in-transit' | 'delivered' | 'failed';
type Priority = 'standard' | 'express' | 'overnight';
type Page     = 'landing' | 'app';

interface Shipment {
  id: string; trackingCode: string; sender: string; recipient: string;
  origin: string; destination: string; status: Status;
  weight: string; eta: string; courier: string; priority: Priority;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const COURIERS = ['Youssef K.','Anna P.','Pedro A.','Karim M.','Lena B.','David C.'];

const MOCK: Shipment[] = [
  { id:'1', trackingCode:'TC-2026-8841', sender:'Ahmed Benali',  recipient:'Sofia Moreau',  origin:'Tangier, MA',    destination:'Paris, FR',    status:'in-transit', weight:'2.4 kg', eta:'Apr 26, 2026', courier:'Youssef K.', priority:'express'   },
  { id:'2', trackingCode:'TC-2026-9032', sender:'Lena Hoffmann', recipient:'Marco Ricci',   origin:'Berlin, DE',     destination:'Rome, IT',     status:'delivered',  weight:'1.1 kg', eta:'Apr 23, 2026', courier:'Anna P.',    priority:'standard'  },
  { id:'3', trackingCode:'TC-2026-7710', sender:'Priya Nair',    recipient:'James Okafor',  origin:'London, UK',     destination:'Lagos, NG',    status:'pending',    weight:'5.0 kg', eta:'Apr 28, 2026', courier:'Unassigned', priority:'overnight' },
  { id:'4', trackingCode:'TC-2026-6603', sender:'Carlos Ruiz',   recipient:'Mei Lin',       origin:'Madrid, ES',     destination:'Shanghai, CN', status:'failed',     weight:'0.8 kg', eta:'-',            courier:'Pedro A.',   priority:'express'   },
  { id:'5', trackingCode:'TC-2026-5519', sender:'Fatima Zohra',  recipient:'Alex Dupont',   origin:'Casablanca, MA', destination:'Lyon, FR',     status:'in-transit', weight:'3.3 kg', eta:'Apr 27, 2026', courier:'Karim M.',   priority:'standard'  },
  { id:'6', trackingCode:'TC-2026-4402', sender:'Sara Kim',      recipient:'Oliver Braun',  origin:'Seoul, KR',      destination:'Munich, DE',   status:'pending',    weight:'1.8 kg', eta:'Apr 30, 2026', courier:'David C.',   priority:'overnight' },
];

const STATUS_META: Record<Status,{label:string;bg:string;color:string;dot:string}> = {
  'pending':    {label:'Pending',    bg:'#fef3c7', color:'#92400e', dot:'#f59e0b'},
  'in-transit': {label:'In Transit', bg:'#dbeafe', color:'#1e40af', dot:'#3b82f6'},
  'delivered':  {label:'Delivered',  bg:'#d1fae5', color:'#065f46', dot:'#10b981'},
  'failed':     {label:'Failed',     bg:'#fee2e2', color:'#991b1b', dot:'#ef4444'},
};
const PRIORITY_META: Record<Priority,{label:string;bg:string;color:string}> = {
  standard:  {label:'Standard',  bg:'#f3f4f6', color:'#374151'},
  express:   {label:'Express',   bg:'#ede9fe', color:'#5b21b6'},
  overnight: {label:'Overnight', bg:'#fff7ed', color:'#c2410c'},
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:    #0a0a0f;
    --ink2:   #12121a;
    --gold:   #d4a853;
    --gold2:  #f0c96e;
    --slate:  #8892a4;
    --white:  #f4f1eb;
    --accent: #4f8ef7;
  }

  html, body { background: var(--ink); color: var(--white); font-family: 'DM Sans', sans-serif; }

  /* ── Particle canvas ── */
  #particle-canvas { position:fixed; inset:0; pointer-events:none; z-index:0; }

  /* ── Animated gradient orbs ── */
  .orb {
    position: fixed; border-radius: 50%; filter: blur(120px);
    pointer-events: none; z-index: 0; animation: drift 18s ease-in-out infinite;
  }
  .orb-1 { width:600px; height:600px; background:rgba(79,142,247,0.12); top:-200px; right:-100px; animation-delay:0s; }
  .orb-2 { width:500px; height:500px; background:rgba(212,168,83,0.10); bottom:-100px; left:-150px; animation-delay:-6s; }
  .orb-3 { width:400px; height:400px; background:rgba(139,92,246,0.08); top:40%; left:40%; animation-delay:-12s; }

  @keyframes drift {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(40px,-30px) scale(1.08); }
    66%      { transform: translate(-30px,40px) scale(0.95); }
  }

  /* ── Hero section ── */
  .hero { position:relative; min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:40px 24px; z-index:1; overflow:hidden; }

  .hero-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(212,168,83,0.12); border:1px solid rgba(212,168,83,0.3);
    padding:6px 16px; border-radius:40px; font-size:12px; font-weight:600;
    letter-spacing:0.12em; text-transform:uppercase; color:var(--gold);
    margin-bottom:28px;
    animation: fadeUp 0.8s ease both;
  }
  .badge-dot { width:6px; height:6px; border-radius:50%; background:var(--gold); animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(52px, 9vw, 110px);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -2px;
    color: var(--white);
    animation: fadeUp 0.8s 0.15s ease both;
  }
  .hero-title em { font-style:italic; color:var(--gold); }

  .hero-sub {
    margin-top: 24px;
    font-size: clamp(15px,2vw,19px);
    color: var(--slate);
    max-width: 520px;
    line-height: 1.7;
    font-weight: 300;
    animation: fadeUp 0.8s 0.3s ease both;
  }

  .hero-cta {
    margin-top: 40px;
    display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.8s 0.45s ease both;
  }

  .btn-primary {
    position: relative; overflow: hidden;
    padding: 16px 38px; border-radius: 60px; border: none;
    background: linear-gradient(135deg, #d4a853, #f0c96e);
    color: #0a0a0f; font-size: 15px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    transition: transform 0.2s, box-shadow 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(212,168,83,0.4); }
  .btn-primary::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
    opacity:0; transition:opacity 0.2s;
  }
  .btn-primary:hover::after { opacity:1; }

  .btn-outline {
    padding: 16px 38px; border-radius: 60px;
    border: 1px solid rgba(244,241,235,0.2);
    background: rgba(244,241,235,0.05);
    color: var(--white); font-size: 15px; font-weight: 500;
    cursor: pointer; letter-spacing: 0.02em;
    transition: background 0.2s, border-color 0.2s;
    font-family: 'DM Sans', sans-serif;
    backdrop-filter: blur(8px);
  }
  .btn-outline:hover { background: rgba(244,241,235,0.1); border-color: rgba(244,241,235,0.4); }

  /* ── Floating flight path line ── */
  .flight-line { position:absolute; width:100%; top:55%; left:0; pointer-events:none; opacity:0.15; }

  /* ── Stats bar ── */
  .stats-bar {
    animation: fadeUp 0.8s 0.6s ease both;
    display: flex; gap: 0; margin-top: 64px;
    border: 1px solid rgba(244,241,235,0.08);
    border-radius: 16px; overflow: hidden;
    backdrop-filter: blur(12px);
    background: rgba(255,255,255,0.03);
  }
  .stat-item {
    padding: 20px 32px; text-align: center; flex: 1;
    border-right: 1px solid rgba(244,241,235,0.08);
  }
  .stat-item:last-child { border-right: none; }
  .stat-num { font-family:'Playfair Display',serif; font-size:32px; font-weight:700; color:var(--gold); }
  .stat-lbl { font-size:11px; color:var(--slate); letter-spacing:0.1em; text-transform:uppercase; margin-top:4px; }

  /* ── Features section ── */
  .features-section { position:relative; z-index:1; padding:100px 24px; max-width:1100px; margin:0 auto; }
  .section-eyebrow { font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold); font-weight:600; margin-bottom:12px; }
  .section-title { font-family:'Playfair Display',serif; font-size:clamp(34px,5vw,54px); font-weight:900; line-height:1.05; color:var(--white); }

  .feature-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-top:56px; }
  .feature-card {
    background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; padding:32px; transition:background 0.3s, border-color 0.3s, transform 0.3s;
    cursor:default;
  }
  .feature-card:hover { background:rgba(212,168,83,0.06); border-color:rgba(212,168,83,0.25); transform:translateY(-4px); }
  .feature-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
  .feature-card h3 { font-size:18px; font-weight:600; color:var(--white); margin-bottom:8px; }
  .feature-card p  { font-size:14px; color:var(--slate); line-height:1.65; }

  /* ── Route showcase ── */
  .route-showcase { position:relative; z-index:1; padding:0 24px 100px; max-width:1100px; margin:0 auto; }
  .route-card {
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
    border-radius:24px; padding:40px; display:flex; gap:24px; flex-wrap:wrap;
    align-items:center; justify-content:space-between;
    transition:background 0.3s;
  }
  .route-card:hover { background:rgba(79,142,247,0.05); }
  .route-pill { padding:6px 14px; border-radius:30px; font-size:12px; font-weight:600; }

  /* ── Divider line ── */
  .divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:0 24px; position:relative; z-index:1; }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes planeSlide {
    from { transform:translateX(-60px); opacity:0; }
    to   { transform:translateX(0);     opacity:1; }
  }
  @keyframes shimmer {
    0%   { background-position:200% center; }
    100% { background-position:-200% center; }
  }

  /* ── App dashboard styles ── */
  .app-root { min-height:100vh; background:#0f1117; font-family:'DM Sans',sans-serif; }

  .app-header {
    background:linear-gradient(135deg,#0f1b3d 0%,#1a0a35 100%);
    padding:clamp(20px,4vw,32px);
    border-bottom:1px solid rgba(255,255,255,0.06);
  }

  .stat-tile {
    background:rgba(255,255,255,0.06); border-radius:14px;
    padding:18px; border-left:3px solid var(--c);
    transition:background 0.2s;
  }
  .stat-tile:hover { background:rgba(255,255,255,0.1); }

  .table-wrap { background:#161b27; border-radius:16px; border:1px solid rgba(255,255,255,0.07); overflow:hidden; }
  .tbl-row { border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition:background 0.15s; }
  .tbl-row:hover { background:rgba(255,255,255,0.04); }

  .inp { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); color:#f4f1eb;
    border-radius:10px; padding:10px 14px; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; width:100%; }
  .inp::placeholder { color:#4a5568; }
  .inp:focus { border-color:rgba(212,168,83,0.5); background:rgba(255,255,255,0.09); }

  .filter-btn { padding:9px 14px; border-radius:10px; font-size:12px; font-weight:600;
    cursor:pointer; border:1px solid rgba(255,255,255,0.12); white-space:nowrap;
    font-family:'DM Sans',sans-serif; transition:all 0.15s; }
  .filter-btn.active { background:var(--gold); color:#0a0a0f; border-color:var(--gold); }
  .filter-btn:not(.active) { background:rgba(255,255,255,0.05); color:#8892a4; }
  .filter-btn:not(.active):hover { background:rgba(255,255,255,0.1); color:#f4f1eb; }

  .panel-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; justify-content:flex-end; z-index:998; }
  .panel { background:#161b27; width:100%; max-width:420px; height:100%; padding:clamp(20px,4vw,32px); overflow-y:auto; border-left:1px solid rgba(255,255,255,0.08); }

  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:999; padding:16px; }
  .modal { background:#161b27; border-radius:20px; padding:clamp(20px,4vw,32px); width:100%; max-width:520px; border:1px solid rgba(255,255,255,0.1); max-height:90vh; overflow-y:auto; }

  /* ── Responsive ── */
  .tc-desktop { display:block; }
  .tc-mobile  { display:none; }
  @media(max-width:700px) {
    .tc-desktop { display:none; }
    .tc-mobile  { display:flex; }
    .stats-bar  { flex-direction:column; }
    .stat-item  { border-right:none; border-bottom:1px solid rgba(244,241,235,0.08); }
    .stat-item:last-child { border-bottom:none; }
  }

  /* ── Chat FAB ── */
  .chat-fab {
    position:fixed; bottom:28px; right:28px; z-index:990;
    width:58px; height:58px; border-radius:50%; border:none; cursor:pointer;
    background:linear-gradient(135deg,#d4a853,#f0c96e);
    box-shadow:0 8px 32px rgba(212,168,83,0.45);
    display:flex; align-items:center; justify-content:center;
    transition:transform 0.2s, box-shadow 0.2s;
  }
  .chat-fab:hover { transform:scale(1.1) translateY(-2px); box-shadow:0 12px 40px rgba(212,168,83,0.6); }
  .chat-fab .badge {
    position:absolute; top:-4px; right:-4px; width:18px; height:18px;
    border-radius:50%; background:#ef4444; border:2px solid #0f1117;
    font-size:10px; font-weight:800; color:#fff;
    display:flex; align-items:center; justify-content:center;
  }

  /* ── Chat window ── */
  .chat-win {
    position:fixed; bottom:100px; right:28px; z-index:991;
    width:360px; max-width:calc(100vw - 32px);
    height:520px; max-height:calc(100vh - 130px);
    background:#161b27; border-radius:20px;
    border:1px solid rgba(255,255,255,0.1);
    box-shadow:0 24px 64px rgba(0,0,0,0.6);
    display:flex; flex-direction:column;
    animation:chatPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes chatPop {
    from { opacity:0; transform:scale(0.85) translateY(20px); transform-origin:bottom right; }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  .chat-header {
    padding:16px 18px; border-bottom:1px solid rgba(255,255,255,0.07);
    display:flex; align-items:center; gap:12; flex-shrink:0;
  }
  .chat-avatar {
    width:38px; height:38px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-weight:800; font-size:14px; color:#0a0a0f;
  }
  .online-dot {
    width:9px; height:9px; border-radius:50%; background:#34d399;
    position:absolute; bottom:1px; right:1px;
    border:2px solid #161b27; animation:pulse 2s infinite;
  }

  .chat-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10; }
  .chat-msgs::-webkit-scrollbar { width:4px; }
  .chat-msgs::-webkit-scrollbar-track { background:transparent; }
  .chat-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }

  .msg-bubble {
    max-width:78%; padding:10px 14px; border-radius:16px; font-size:13px; line-height:1.5;
    animation:msgIn 0.2s ease both;
  }
  @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .msg-me    { background:linear-gradient(135deg,#1e3a5f,#1a2a4a); color:#e2e8f0; border-bottom-right-radius:4px; align-self:flex-end; }
  .msg-other { background:rgba(255,255,255,0.07); color:#e2e8f0; border-bottom-left-radius:4px; align-self:flex-start; }
  .msg-time  { font-size:10px; color:#4a5568; margin-top:3px; }

  .chat-input-row {
    padding:12px 14px; border-top:1px solid rgba(255,255,255,0.07);
    display:flex; gap:8px; flex-shrink:0; align-items:flex-end;
  }
  .chat-input {
    flex:1; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1);
    border-radius:12px; padding:10px 14px; font-size:13px; color:#f4f1eb;
    font-family:'DM Sans',sans-serif; outline:none; resize:none; min-height:40px; max-height:100px;
  }
  .chat-input:focus { border-color:rgba(212,168,83,0.4); background:rgba(255,255,255,0.09); }
  .chat-input::placeholder { color:#4a5568; }
  .chat-send {
    width:38px; height:38px; border-radius:12px; border:none; cursor:pointer;
    background:linear-gradient(135deg,#d4a853,#f0c96e); color:#0a0a0f;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:transform 0.15s, box-shadow 0.15s;
  }
  .chat-send:hover { transform:scale(1.08); box-shadow:0 4px 16px rgba(212,168,83,0.4); }

  .chat-conv-list { display:flex; flex-direction:column; }
  .conv-item {
    display:flex; align-items:center; gap:12px; padding:12px 16px; cursor:pointer;
    border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s;
  }
  .conv-item:hover, .conv-item.active { background:rgba(212,168,83,0.07); }
  .conv-unread { background:#d4a853; color:#0a0a0f; font-size:10px; font-weight:800;
    width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

  .typing-indicator { display:flex; gap:4px; align-items:center; padding:10px 14px;
    background:rgba(255,255,255,0.07); border-radius:16px; border-bottom-left-radius:4px;
    align-self:flex-start; }
  .typing-dot { width:6px; height:6px; border-radius:50%; background:#8892a4; animation:typingBounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay:0.2s; }
  .typing-dot:nth-child(3) { animation-delay:0.4s; }
  @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
`;

/* ─────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────── */
function Ico({ d, size=20, color='currentColor', strokeWidth=1.8 }:
  {d:string|string[]; size?:number; color?:string; strokeWidth?:number}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p,i) => <path key={i} d={p}/>)}
    </svg>
  );
}

const ICONS = {
  plane:  ['M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2a.5.5 0 0 0-.3.8l1.5 1.5 2 6.6L3.5 16.5a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l1.6-1.6 6.6 2 1.5 1.5a.5.5 0 0 0 .8-.3Z'],
  box:    ['M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z','M3.3 7l8.7 5 8.7-5','M12 22V12'],
  check:  ['M22 11.08V12a10 10 0 1 1-5.93-9.14','M9 11l3 3L22 4'],
  clock:  ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M12 6v6l4 2'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  zap:    ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
  globe:  ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M2 12h20','M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  track:  ['M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  chat:   ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  send:   ['M22 2 11 13','M22 2 15 22 11 13 2 9l20-7z'],
  back:   ['M19 12H5','M12 19l-7-7 7-7'],
};

/* ─────────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const N = 60;
    const pts = Array.from({length:N}, () => ({
      x: Math.random()*innerWidth, y: Math.random()*innerHeight,
      vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3,
      r: Math.random()*1.5+0.5,
    }));
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
        if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle='rgba(212,168,83,0.35)';
        ctx.fill();
      });
      for(let i=0;i<N;i++) for(let j=i+1;j<N;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x,pts[i].y);
          ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(212,168,83,${0.06*(1-dist/120)})`;
          ctx.lineWidth=0.5;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  }, []);
  return <canvas ref={ref} id="particle-canvas" />;
}

/* ─────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────── */
function LandingPage({ onEnter }: { onEnter: () => void }) {
  const features = [
    { icon: ICONS.plane,  color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)',  title: 'Real-Time Tracking',    desc: 'Follow every parcel from dispatch to doorstep with live status updates and ETA estimates.' },
    { icon: ICONS.globe,  color: '#d4a853', bg: 'rgba(212,168,83,0.12)',  title: 'Global Routes',         desc: 'Ship across 180+ countries with intelligent route planning and courier assignment.' },
    { icon: ICONS.zap,    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', title: 'Express & Overnight',   desc: 'Priority shipments with guaranteed delivery windows for urgent parcels.' },
    { icon: ICONS.shield, color: '#34d399', bg: 'rgba(52,211,153,0.12)',  title: 'Secure & Insured',      desc: 'Every shipment covered with end-to-end encryption and cargo insurance.' },
    { icon: ICONS.track,  color: '#f87171', bg: 'rgba(248,113,113,0.12)', title: 'Smart Dispatch',        desc: 'Automated courier assignment based on availability, route, and priority level.' },
    { icon: ICONS.check,  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  title: 'Delivery Confirmation', desc: 'Digital proof of delivery with recipient signature and timestamp logging.' },
  ];

  const routes = [
    { from:'Tangier, MA', to:'Paris, FR', code:'TC-2026-8841', status:'in-transit' as Status, time:'2d 4h' },
    { from:'Berlin, DE',  to:'Rome, IT',  code:'TC-2026-9032', status:'delivered'  as Status, time:'1d 12h' },
    { from:'Seoul, KR',   to:'Munich, DE',code:'TC-2026-4402', status:'pending'    as Status, time:'4d 8h' },
  ];

  return (
    <div style={{ background:'var(--ink)', color:'var(--white)', position:'relative' }}>
      <ParticleCanvas />
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:10,
        padding:'18px clamp(20px,4vw,48px)', display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(10,10,15,0.7)', backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Ico d={ICONS.plane} size={22} color="#d4a853"/>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#f4f1eb' }}>TravelCourier</span>
        </div>
        <button onClick={onEnter} className="btn-primary" style={{ padding:'10px 24px', fontSize:13 }}>
          Open Dashboard
        </button>
      </nav>

      {/* HERO */}
      <section className="hero" style={{ paddingTop:100 }}>
        <div className="hero-badge">
          <span className="badge-dot"/>
          Built for Vaadin Competition 2026
        </div>
        <h1 className="hero-title">
          Ship Smarter,<br/><em>Arrive Faster</em>
        </h1>
        <p className="hero-sub">
          A modern global courier dispatch platform. Track parcels in real-time, assign couriers instantly, and manage worldwide shipments from one beautiful dashboard.
        </p>
        <div className="hero-cta">
          <button onClick={onEnter} className="btn-primary">
            Launch App &nbsp;→
          </button>
          <button className="btn-outline">Watch Demo</button>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          {[['12,400+','Shipments Delivered'],['98.4%','On-Time Rate'],['180+','Countries Covered'],['24/7','Live Support']].map(([n,l]) => (
            <div key={l} className="stat-item">
              <div className="stat-num">{n}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider"/>

      {/* FEATURES */}
      <section className="features-section">
        <div style={{ textAlign:'center', marginBottom:0 }}>
          <p className="section-eyebrow">Why TravelCourier</p>
          <h2 className="section-title">Everything your<br/>logistics needs</h2>
        </div>
        <div className="feature-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background:f.bg }}>
                <Ico d={f.icon} size={22} color={f.color}/>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider"/>

      {/* LIVE ROUTES */}
      <section className="route-showcase">
        <p className="section-eyebrow" style={{ textAlign:'center' }}>Live Shipments</p>
        <h2 className="section-title" style={{ textAlign:'center', marginBottom:40 }}>Routes in motion</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {routes.map(r => {
            const m = STATUS_META[r.status];
            return (
              <div key={r.code} className="route-card">
                <div style={{ display:'flex', alignItems:'center', gap:16, minWidth:0, flex:2 }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:'rgba(79,142,247,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Ico d={ICONS.plane} size={18} color="#4f8ef7"/>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#f4f1eb' }}>{r.from}</div>
                    <div style={{ fontSize:12, color:'#4a5568', marginTop:2 }}>→ {r.to}</div>
                  </div>
                </div>
                <div style={{ fontFamily:'monospace', fontSize:13, fontWeight:600, color:'#4f8ef7', letterSpacing:'0.05em' }}>{r.code}</div>
                <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ background:m.bg, color:m.color, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, textTransform:'uppercase', letterSpacing:'0.05em', display:'inline-flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:m.dot }}/> {m.label}
                  </span>
                  <span style={{ fontSize:12, color:'#8892a4' }}>ETA {r.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div style={{ marginTop:64, borderRadius:24, background:'linear-gradient(135deg,rgba(212,168,83,0.12),rgba(79,142,247,0.08))', border:'1px solid rgba(212,168,83,0.2)', padding:'48px 40px', textAlign:'center' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:900, color:'#f4f1eb', marginBottom:12 }}>
            Ready to ship smarter?
          </h2>
          <p style={{ color:'#8892a4', fontSize:16, marginBottom:32, maxWidth:400, margin:'0 auto 32px' }}>
            Open the dashboard and manage your global courier operations in real-time.
          </p>
          <button onClick={onEnter} className="btn-primary" style={{ fontSize:16, padding:'18px 48px' }}>
            Open Dashboard &nbsp;→
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.06)', padding:'32px 24px', textAlign:'center', color:'#4a5568', fontSize:13 }}>
        TravelCourier &nbsp;·&nbsp; Built with Vaadin Hilla + React &nbsp;·&nbsp; Vaadin Community Competition 2026
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BADGES
───────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700,
      letterSpacing:'0.05em', textTransform:'uppercase', padding:'3px 10px',
      borderRadius:20, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:m.dot, flexShrink:0 }}/>
      {m.label}
    </span>
  );
}
function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return (
    <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase',
      padding:'3px 9px', borderRadius:20, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>
      {m.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   NEW SHIPMENT MODAL
───────────────────────────────────────────── */
const INP_S: React.CSSProperties = {
  width:'100%', padding:'9px 12px', borderRadius:8,
  border:'1px solid rgba(255,255,255,0.12)', fontSize:14,
  boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif", outline:'none',
  background:'rgba(255,255,255,0.07)', color:'#f4f1eb',
};

function NewShipmentModal({ onClose, onAdd }: { onClose:()=>void; onAdd:(s:Shipment)=>void }) {
  const [form, setForm] = useState({ sender:'', recipient:'', origin:'', destination:'', weight:'', courier:COURIERS[0], priority:'standard' as Priority });
  const [errors, setErrors] = useState<Record<string,boolean>>({});
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(f=>({...f,[k]:e.target.value}));
  const submit = () => {
    const req = ['sender','recipient','origin','destination'];
    const errs = Object.fromEntries(req.filter(k=>!(form as Record<string,string>)[k]).map(k=>[k,true]));
    if(Object.keys(errs).length){setErrors(errs);return;}
    onAdd({ id:String(Date.now()), trackingCode:'TC-2026-'+Math.floor(1000+Math.random()*9000),
      sender:form.sender, recipient:form.recipient, origin:form.origin, destination:form.destination,
      status:'pending', weight:form.weight?form.weight+' kg':'1.0 kg', eta:'TBD', courier:form.courier, priority:form.priority });
    onClose();
  };
  const FIELDS: Array<[keyof typeof form, string, boolean]> = [
    ['sender','Sender name',true],['recipient','Recipient name',true],
    ['origin','Origin (city, country)',true],['destination','Destination (city, country)',true],
    ['weight','Weight in kg (optional)',false],
  ];
  const LBL: React.CSSProperties = { fontSize:12, fontWeight:600, color:'#8892a4', display:'block', marginBottom:4 };
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} className="modal-overlay">
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
          <h2 style={{fontSize:20,fontWeight:800,color:'#f4f1eb',fontFamily:"'Playfair Display',serif"}}>New Shipment</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#4a5568',lineHeight:1}}>&#x2715;</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          {FIELDS.map(([k,label,req]) => (
            <div key={k} style={{gridColumn:k==='weight'?'1 / -1':undefined}}>
              <label style={LBL}>{label}{req&&<span style={{color:'#ef4444'}}> *</span>}</label>
              <input style={{...INP_S,borderColor:errors[k]?'#ef4444':'rgba(255,255,255,0.12)'}}
                value={(form as Record<string,string>)[k]} onChange={set(k)} placeholder={label}/>
              {errors[k]&&<span style={{fontSize:11,color:'#ef4444'}}>Required</span>}
            </div>
          ))}
          <div>
            <label style={LBL}>Priority</label>
            <select style={INP_S} value={form.priority} onChange={set('priority')}>
              <option value="standard">Standard</option><option value="express">Express</option><option value="overnight">Overnight</option>
            </select>
          </div>
          <div>
            <label style={LBL}>Assign Courier</label>
            <select style={INP_S} value={form.courier} onChange={set('courier')}>
              {COURIERS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:24,flexWrap:'wrap'}}>
          <button onClick={onClose} style={{flex:'1 1 100px',padding:'11px 0',borderRadius:10,border:'1px solid rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.05)',cursor:'pointer',fontSize:14,fontWeight:600,color:'#8892a4',fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
          <button onClick={submit} style={{flex:'2 1 160px',padding:'11px 0',borderRadius:10,border:'none',background:'linear-gradient(135deg,#d4a853,#f0c96e)',color:'#0a0a0f',cursor:'pointer',fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Create Shipment</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DETAIL PANEL
───────────────────────────────────────────── */
function DetailPanel({ shipment, onClose, onStatusChange }: { shipment:Shipment; onClose:()=>void; onStatusChange:(id:string,s:Status)=>void }) {
  const statuses: Status[] = ['pending','in-transit','delivered','failed'];
  const ROW = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' } as React.CSSProperties;
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} className="panel-overlay">
      <div className="panel">
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:14,cursor:'pointer',color:'#8892a4',marginBottom:20,display:'flex',alignItems:'center',gap:6,fontWeight:600,padding:0,fontFamily:"'DM Sans',sans-serif"}}>
          &#8592; Back
        </button>
        <div style={{background:'linear-gradient(135deg,rgba(15,27,61,0.8),rgba(26,10,53,0.8))',borderRadius:16,padding:20,marginBottom:24,border:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{fontSize:10,fontWeight:700,color:'#4a5568',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Tracking Code</div>
          <div style={{fontSize:18,fontWeight:800,color:'#d4a853',fontFamily:'monospace',wordBreak:'break-all'}}>{shipment.trackingCode}</div>
          <div style={{marginTop:10,display:'flex',gap:8,flexWrap:'wrap'}}>
            <StatusBadge status={shipment.status}/><PriorityBadge priority={shipment.priority}/>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:20,background:'rgba(255,255,255,0.03)',borderRadius:12,padding:'12px 16px'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:'#4a5568',fontWeight:600,textTransform:'uppercase'}}>From</div>
            <div style={{fontSize:13,fontWeight:700,color:'#f4f1eb',marginTop:2}}>{shipment.origin}</div>
          </div>
          <Ico d={ICONS.plane} size={18} color="#4f8ef7"/>
          <div style={{flex:1,textAlign:'right'}}>
            <div style={{fontSize:10,color:'#4a5568',fontWeight:600,textTransform:'uppercase'}}>To</div>
            <div style={{fontSize:13,fontWeight:700,color:'#f4f1eb',marginTop:2}}>{shipment.destination}</div>
          </div>
        </div>
        {(['Sender','Recipient','Courier','Weight','ETA'] as const).map((label,i)=>{
          const vals=[shipment.sender,shipment.recipient,shipment.courier,shipment.weight,shipment.eta];
          return (
            <div key={label} style={ROW}>
              <span style={{fontSize:13,color:'#4a5568',fontWeight:500}}>{label}</span>
              <span style={{fontSize:13,color:'#f4f1eb',fontWeight:600,textAlign:'right',maxWidth:'60%'}}>{vals[i]}</span>
            </div>
          );
        })}
        <div style={{marginTop:24}}>
          <div style={{fontSize:12,fontWeight:700,color:'#8892a4',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.05em'}}>Update Status</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {statuses.map(s=>(
              <button key={s} onClick={()=>onStatusChange(shipment.id,s)} style={{
                padding:'7px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',
                border:shipment.status===s?'2px solid #d4a853':'1px solid rgba(255,255,255,0.12)',
                background:shipment.status===s?'rgba(212,168,83,0.15)':'rgba(255,255,255,0.04)',
                color:shipment.status===s?'#d4a853':'#8892a4',
                fontFamily:"'DM Sans',sans-serif",
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

/* ─────────────────────────────────────────────
   MOBILE CARD
───────────────────────────────────────────── */
function ShipmentCard({ s, onClick }: { s:Shipment; onClick:()=>void }) {
  return (
    <div onClick={onClick} style={{background:'#161b27',borderRadius:14,border:'1px solid rgba(255,255,255,0.07)',padding:16,cursor:'pointer'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <span style={{fontFamily:'monospace',fontSize:13,fontWeight:700,color:'#d4a853'}}>{s.trackingCode}</span>
        <StatusBadge status={s.status}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,background:'rgba(255,255,255,0.03)',borderRadius:8,padding:'8px 10px'}}>
        <span style={{fontSize:12,color:'#f4f1eb',flex:1}}>{s.origin}</span>
        <Ico d={ICONS.plane} size={14} color="#4f8ef7"/>
        <span style={{fontSize:12,color:'#f4f1eb',flex:1,textAlign:'right'}}>{s.destination}</span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}>
        <div>
          <div style={{fontSize:12,color:'#8892a4'}}>{s.sender} &#8594; {s.recipient}</div>
          <div style={{fontSize:11,color:'#4a5568',marginTop:2}}>Courier: {s.courier} &middot; {s.weight}</div>
        </div>
        <PriorityBadge priority={s.priority}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP DASHBOARD
───────────────────────────────────────────── */
function AppDashboard({ onBack }: { onBack:()=>void }) {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState<Status|'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState<Shipment|null>(null);
  const [chatOpen, setChatOpen]   = useState(false);
  const CHAT_UNREAD = 2; // reflects unread count from initial convos

  const filtered = shipments.filter(s=>{
    const q=search.toLowerCase();
    const matchSearch=!q||[s.trackingCode,s.sender,s.recipient,s.origin,s.destination].some(v=>v.toLowerCase().includes(q));
    return matchSearch&&(filterStatus==='all'||s.status===filterStatus);
  });

  const counts = {
    total:     shipments.length,
    inTransit: shipments.filter(s=>s.status==='in-transit').length,
    delivered: shipments.filter(s=>s.status==='delivered').length,
    pending:   shipments.filter(s=>s.status==='pending').length,
  };

  const addShipment  = (s:Shipment) => setShipments(prev=>[s,...prev]);
  const updateStatus = (id:string, status:Status) => {
    setShipments(prev=>prev.map(s=>s.id===id?{...s,status}:s));
    setSelected(prev=>prev?.id===id?{...prev,status}:prev);
  };

  const STATS = [
    {label:'Total',      value:counts.total,     icon:'box'   as const, c:'#60a5fa'},
    {label:'In Transit', value:counts.inTransit,  icon:'plane' as const, c:'#a78bfa'},
    {label:'Delivered',  value:counts.delivered,  icon:'check' as const, c:'#34d399'},
    {label:'Pending',    value:counts.pending,    icon:'clock' as const, c:'#fbbf24'},
  ];
  const FILTERS: (Status|'all')[] = ['all','pending','in-transit','delivered','failed'];
  const TH: React.CSSProperties = { padding:'11px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#4a5568', letterSpacing:'0.07em', textTransform:'uppercase', whiteSpace:'nowrap' };

  return (
    <div className="app-root">
      {/* Header */}
      <div className="app-header">
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:24}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <button onClick={onBack} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'8px 14px',color:'#8892a4',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6,fontFamily:"'DM Sans',sans-serif"}}>
                &#8592; Home
              </button>
              <div>
                <h1 style={{margin:0,fontSize:'clamp(18px,3vw,24px)',fontWeight:800,color:'#f4f1eb',fontFamily:"'Playfair Display',serif",display:'flex',alignItems:'center',gap:10}}>
                  <Ico d={ICONS.plane} size={24} color="#d4a853"/> TravelCourier
                </h1>
                <p style={{margin:'2px 0 0',fontSize:12,color:'#4a5568'}}>Global parcel dispatch &amp; tracking</p>
              </div>
            </div>
            <button onClick={()=>setShowModal(true)} style={{background:'linear-gradient(135deg,#d4a853,#f0c96e)',color:'#0a0a0f',border:'none',padding:'10px 22px',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:"'DM Sans',sans-serif"}}>
              + New Shipment
            </button>
          </div>
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {STATS.map(({label,value,icon,c})=>(
              <div key={label} className="stat-tile" style={{'--c':c} as React.CSSProperties}>
                <Ico d={ICONS[icon]} size={20} color={c}/>
                <div style={{fontSize:'clamp(20px,3vw,26px)',fontWeight:800,color:'#f4f1eb',marginTop:8,fontFamily:"'Playfair Display',serif"}}>{value}</div>
                <div style={{fontSize:12,color:'#4a5568',marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'clamp(16px,3vw,28px)'}}>
        {/* Search + filters */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:18}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search tracking code, sender, recipient..."
            className="inp" style={{flex:'1 1 200px'}}/>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {FILTERS.map(s=>(
              <button key={s} onClick={()=>setFilter(s)} className={`filter-btn${filterStatus===s?' active':''}`}>
                {s==='all'?'All':STATUS_META[s as Status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="tc-desktop">
          <div className="table-wrap">
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                    {['Tracking Code','Route','Sender / Recipient','Courier','Weight','ETA','Priority','Status'].map(h=>(
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0
                    ? <tr><td colSpan={8} style={{padding:48,textAlign:'center',color:'#4a5568'}}>No shipments found</td></tr>
                    : filtered.map(s=>(
                      <tr key={s.id} onClick={()=>setSelected(s)} className="tbl-row">
                        <td style={{padding:'13px 14px',fontWeight:700,color:'#d4a853',fontFamily:'monospace',whiteSpace:'nowrap'}}>{s.trackingCode}</td>
                        <td style={{padding:'13px 14px'}}>
                          <div style={{fontSize:12,color:'#f4f1eb'}}>{s.origin}</div>
                          <div style={{fontSize:11,color:'#4a5568',marginTop:2}}>&#8594; {s.destination}</div>
                        </td>
                        <td style={{padding:'13px 14px'}}>
                          <div style={{color:'#f4f1eb'}}>{s.sender}</div>
                          <div style={{fontSize:12,color:'#4a5568',marginTop:2}}>{s.recipient}</div>
                        </td>
                        <td style={{padding:'13px 14px',color:'#8892a4',whiteSpace:'nowrap'}}>{s.courier}</td>
                        <td style={{padding:'13px 14px',color:'#8892a4'}}>{s.weight}</td>
                        <td style={{padding:'13px 14px',color:'#8892a4',whiteSpace:'nowrap',fontSize:12}}>{s.eta}</td>
                        <td style={{padding:'13px 14px'}}><PriorityBadge priority={s.priority}/></td>
                        <td style={{padding:'13px 14px'}}><StatusBadge status={s.status}/></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="tc-mobile" style={{display:'flex',flexDirection:'column',gap:12}}>
          {filtered.length===0
            ? <div style={{textAlign:'center',color:'#4a5568',padding:40}}>No shipments found</div>
            : filtered.map(s=><ShipmentCard key={s.id} s={s} onClick={()=>setSelected(s)}/>)
          }
        </div>

        <div style={{marginTop:10,fontSize:12,color:'#4a5568',textAlign:'right'}}>
          Showing {filtered.length} of {shipments.length} shipments
        </div>
      </div>

      {showModal && <NewShipmentModal onClose={()=>setShowModal(false)} onAdd={addShipment}/>}
      {selected  && <DetailPanel shipment={selected} onClose={()=>setSelected(null)} onStatusChange={updateStatus}/>}
      <ChatFAB onClick={()=>setChatOpen(o=>!o)} unread={chatOpen ? 0 : CHAT_UNREAD}/>
      {chatOpen && <ChatWindow onClose={()=>setChatOpen(false)}/>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAT
───────────────────────────────────────────── */
interface ChatMessage {
  id: string; text: string; from: 'me' | 'other';
  time: string; read: boolean;
}
interface Conversation {
  id: string; courierName: string; trackingCode: string;
  avatar: string; avatarColor: string; online: boolean;
  messages: ChatMessage[];
  unread: number;
}

const now = () => new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const uid = () => Math.random().toString(36).slice(2,9);

const INITIAL_CONVOS: Conversation[] = [
  {
    id:'c1', courierName:'Youssef K.', trackingCode:'TC-2026-8841',
    avatar:'YK', avatarColor:'#4f8ef7', online:true, unread:2,
    messages:[
      {id:'m1', text:"Hello! I've picked up your parcel from Tangier. Everything is packed safely.", from:'other', time:'09:14', read:true},
      {id:'m2', text:"I'm currently at the border checkpoint. Should clear in ~2 hours.", from:'other', time:'09:15', read:true},
      {id:'m3', text:"Great, thank you for the update! Please handle it carefully, it's fragile.", from:'me', time:'09:32', read:true},
      {id:'m4', text:"Understood! I've marked it fragile on the manifest. I'll send a photo when I cross.", from:'other', time:'09:45', read:false},
      {id:'m5', text:"We're through the checkpoint now, heading to Paris 🚀", from:'other', time:'11:02', read:false},
    ],
  },
  {
    id:'c2', courierName:'Karim M.', trackingCode:'TC-2026-5519',
    avatar:'KM', avatarColor:'#a78bfa', online:true, unread:0,
    messages:[
      {id:'m6', text:"Bonjour! Your package from Casablanca is with me. Departing this afternoon.", from:'other', time:'08:00', read:true},
      {id:'m7', text:"Perfect timing! What time do you expect to arrive in Lyon?", from:'me', time:'08:05', read:true},
      {id:'m8', text:"I should arrive by April 27 around noon. Will keep you posted.", from:'other', time:'08:06', read:true},
    ],
  },
  {
    id:'c3', courierName:'Anna P.', trackingCode:'TC-2026-9032',
    avatar:'AP', avatarColor:'#34d399', online:false, unread:0,
    messages:[
      {id:'m9',  text:"Your parcel has been delivered to the recipient in Rome. Thank you!", from:'other', time:'Yesterday', read:true},
      {id:'m10', text:"Wonderful! Thank you Anna, smooth delivery as always.", from:'me', time:'Yesterday', read:true},
    ],
  },
];

const COURIER_REPLIES: Record<string, string[]> = {
  c1: [
    "Sure, I'll take extra care with it!",
    "Currently on the highway, about 3 hours from Paris.",
    "I'll send you a photo of the parcel when I arrive.",
    "No problem! Will update you at the next checkpoint.",
    "Traffic is light today, might arrive early!",
  ],
  c2: [
    "Of course! Everything looks good with the package.",
    "I'm about halfway to Lyon now.",
    "Should be there by tomorrow morning at the latest.",
    "The package is secure and the weather is clear.",
  ],
  c3: [
    "The delivery was smooth! The recipient was very happy.",
    "Let me know if you need anything else.",
    "Always a pleasure working with TravelCourier!",
  ],
};

function ChatWindow({ onClose }: { onClose: () => void }) {
  const [convos, setConvos]         = useState<Conversation[]>(INITIAL_CONVOS);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [input, setInput]           = useState('');
  const [typing, setTyping]         = useState(false);
  const msgsEndRef                  = useRef<HTMLDivElement>(null);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);

  const active = convos.find(c => c.id === activeId) ?? null;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length, typing]);

  // Mark messages read when opening a convo
  useEffect(() => {
    if (!activeId) return;
    setConvos(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, read: true })) }
        : c
    ));
  }, [activeId]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !activeId) return;
    const newMsg: ChatMessage = { id: uid(), text, from: 'me', time: now(), read: true };
    setConvos(prev => prev.map(c =>
      c.id === activeId ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
    setInput('');
    textareaRef.current?.focus();

    // Simulate courier reply
    const replies = COURIER_REPLIES[activeId];
    if (replies) {
      setTyping(true);
      const delay = 1200 + Math.random() * 1200;
      setTimeout(() => {
        setTyping(false);
        const reply: ChatMessage = {
          id: uid(),
          text: replies[Math.floor(Math.random() * replies.length)],
          from: 'other', time: now(), read: true,
        };
        setConvos(prev => prev.map(c =>
          c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c
        ));
      }, delay);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const totalUnread = convos.reduce((sum, c) => sum + c.unread, 0);

  // ── Conversation list ──
  if (!active) {
    return (
      <div className="chat-win">
        <div className="chat-header" style={{justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:12,background:'rgba(212,168,83,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Ico d={ICONS.chat} size={18} color="#d4a853"/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:'#f4f1eb',fontFamily:"'DM Sans',sans-serif"}}>Messages</div>
              <div style={{fontSize:11,color:'#4a5568'}}>{convos.filter(c=>c.online).length} couriers online</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#4a5568',cursor:'pointer',fontSize:18,padding:4}}>&#x2715;</button>
        </div>

        <div className="chat-conv-list" style={{flex:1,overflowY:'auto'}}>
          {convos.map(c => (
            <div key={c.id} className="conv-item" onClick={() => setActiveId(c.id)}>
              <div style={{position:'relative',flexShrink:0}}>
                <div className="chat-avatar" style={{background:`${c.avatarColor}22`,color:c.avatarColor,border:`2px solid ${c.avatarColor}44`}}>
                  {c.avatar}
                </div>
                {c.online && <div className="online-dot"/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:14,fontWeight:600,color:'#f4f1eb'}}>{c.courierName}</span>
                  <span style={{fontSize:10,color:'#4a5568'}}>{c.messages.at(-1)?.time}</span>
                </div>
                <div style={{fontSize:11,color:'#4f8ef7',marginBottom:2,fontFamily:'monospace'}}>{c.trackingCode}</div>
                <div style={{fontSize:12,color:'#4a5568',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {c.messages.at(-1)?.text}
                </div>
              </div>
              {c.unread > 0 && <div className="conv-unread">{c.unread}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Active chat ──
  return (
    <div className="chat-win">
      {/* Header */}
      <div className="chat-header">
        <button onClick={() => setActiveId(null)} style={{background:'none',border:'none',color:'#8892a4',cursor:'pointer',padding:'0 4px 0 0',display:'flex',alignItems:'center'}}>
          <Ico d={ICONS.back} size={18} color="#8892a4"/>
        </button>
        <div style={{position:'relative',flexShrink:0}}>
          <div className="chat-avatar" style={{background:`${active.avatarColor}22`,color:active.avatarColor,border:`2px solid ${active.avatarColor}44`}}>
            {active.avatar}
          </div>
          {active.online && <div className="online-dot"/>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:'#f4f1eb'}}>{active.courierName}</div>
          <div style={{fontSize:11,color: active.online ? '#34d399' : '#4a5568'}}>
            {active.online ? '● Online' : '○ Offline'} &nbsp;·&nbsp;
            <span style={{color:'#4f8ef7',fontFamily:'monospace'}}>{active.trackingCode}</span>
          </div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#4a5568',cursor:'pointer',fontSize:18,padding:4}}>&#x2715;</button>
      </div>

      {/* Shipment context pill */}
      <div style={{padding:'8px 16px',background:'rgba(79,142,247,0.07)',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:8}}>
        <Ico d={ICONS.box} size={13} color="#4f8ef7"/>
        <span style={{fontSize:11,color:'#8892a4'}}>
          {MOCK.find(s=>s.trackingCode===active.trackingCode)?.origin}
          <span style={{color:'#4a5568'}}> → </span>
          {MOCK.find(s=>s.trackingCode===active.trackingCode)?.destination}
        </span>
      </div>

      {/* Messages */}
      <div className="chat-msgs">
        {active.messages.map(m => (
          <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems:m.from==='me'?'flex-end':'flex-start'}}>
            <div className={`msg-bubble ${m.from==='me'?'msg-me':'msg-other'}`}>{m.text}</div>
            <div className="msg-time" style={{textAlign:m.from==='me'?'right':'left'}}>{m.time}</div>
          </div>
        ))}
        {typing && (
          <div className="typing-indicator">
            <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
          </div>
        )}
        <div ref={msgsEndRef}/>
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message… (Enter to send)"
          rows={1}
        />
        <button className="chat-send" onClick={sendMessage}>
          <Ico d={ICONS.send} size={16} color="#0a0a0f"/>
        </button>
      </div>
    </div>
  );
}

function ChatFAB({ onClick, unread }: { onClick: () => void; unread: number }) {
  return (
    <button className="chat-fab" onClick={onClick}>
      <Ico d={ICONS.chat} size={24} color="#0a0a0f"/>
      {unread > 0 && <div className="badge">{unread}</div>}
    </button>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function TravelCourierAppView() {
  const [page, setPage] = useState<Page>('landing');
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      {page === 'landing'
        ? <LandingPage onEnter={() => setPage('app')} />
        : <AppDashboard onBack={() => setPage('landing')} />
      }
    </>
  );
}