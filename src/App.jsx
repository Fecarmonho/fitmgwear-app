import { useState, useEffect, useMemo } from "react";
import logoImg from "./logo.png";

// ─────────────────────────────────────────────
// FIREBASE CONFIG
// Substitua com suas credenciais do Firebase Console
// ─────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2t0DPn-t_-bYuEJKd3X0h8j6v6bSTuAg",
  authDomain: "fitmgwear-app.firebaseapp.com",
  projectId: "fitmgwear-app",
  storageBucket: "fitmgwear-app.firebasestorage.app",
  messagingSenderId: "324978242715",
  appId: "1:324978242715:web:c0eae2c0ebd6ad8626c23e",
  measurementId: "G-NF8VNZ0GXD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatBRL(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function formatData(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}

const LOGO_B64 = "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";

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0c0c0c;
    --surface: #161616;
    --surface2: #1e1e1e;
    --surface3: #282828;
    --border: rgba(255,255,255,0.06);
    --border2: rgba(255,255,255,0.1);
    --text: #f2f2f2;
    --text2: #888;
    --accent: #e8b84b;
    --accent2: #f5d07a;
    --green: #3ecf8e;
    --red: #f06060;
    --yellow: #f5a623;
    --blue: #4da6ff;
    --sidebar-w: 260px;
    --radius: 10px;
    --radius-sm: 7px;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; line-height: 1.5; min-height: 100vh; }
  h1,h2,h3,h4 { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 99px; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
    z-index: 100;
  }
  .sidebar-logo {
    padding: 22px 20px 18px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
  }
  .logo-img {
    width: 38px; height: 38px; border-radius: 8px;
    background: #fff;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
  }
  .logo-img img { width: 100%; height: 100%; object-fit: contain; }
  .logo-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px; color: var(--accent); line-height: 1; }
  .logo-sub { font-size: 10px; color: var(--text2); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

  .sidebar-nav { flex: 1; overflow-y: auto; padding: 14px 10px; }
  .nav-label { font-size: 10px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 1.2px; padding: 10px 10px 4px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--radius-sm);
    cursor: pointer; color: var(--text2); font-size: 13.5px; font-weight: 500;
    transition: all 0.15s; user-select: none;
    border-left: 2px solid transparent; margin-bottom: 2px;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active {
    background: rgba(232,184,75,0.08);
    color: var(--accent2);
    border-left-color: var(--accent);
  }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }

  .sidebar-footer {
    padding: 12px 10px 16px;
    border-top: 1px solid var(--border);
  }
  .footer-btn {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 12px; border-radius: var(--radius-sm);
    cursor: pointer; color: var(--text2); font-size: 12.5px; font-weight: 500;
    background: none; border: none; width: 100%; text-align: left;
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .footer-btn:hover { background: var(--surface2); color: var(--text); }
  .footer-btn.danger:hover { color: var(--red); background: rgba(240,96,96,0.07); }
  .footer-btn svg { width: 14px; height: 14px; }
  .sync-dot {
    width: 7px; height: 7px; border-radius: 50%; background: var(--green);
    margin-left: auto; box-shadow: 0 0 6px var(--green);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* ── MAIN ── */
  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-width: 0; }
  .page { padding: 36px 48px; flex: 1; max-width: 1600px; width: 100%; margin: 0 auto; }
  .page-header { margin-bottom: 28px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .page-title { font-size: 28px; color: var(--text); line-height: 1; }
  .page-sub { font-size: 13px; color: var(--text2); margin-top: 4px; }

  /* ── CARDS ── */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .card-header { padding: 18px 20px 0; display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: var(--text2); }
  .card-body { padding: 18px 20px; }

  /* ── STATS ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 28px 26px;
    position: relative; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }
  .stat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  }
  .stat-card.green::after { background: linear-gradient(90deg, var(--green), transparent); }
  .stat-card.red::after   { background: linear-gradient(90deg, var(--red), transparent); }
  .stat-card.blue::after  { background: linear-gradient(90deg, var(--blue), transparent); }
  .stat-card.gold::after  { background: linear-gradient(90deg, var(--accent), transparent); }
  .stat-card.green { border-color: rgba(62,207,142,0.2); }
  .stat-card.red   { border-color: rgba(240,96,96,0.2); }
  .stat-card.blue  { border-color: rgba(77,166,255,0.2); }
  .stat-card.gold  { border-color: rgba(232,184,75,0.2); }
  .stat-label { font-size: 12px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 14px; font-weight: 700; }
  .stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 38px; letter-spacing: 1px; line-height: 1; }
  .stat-card.green .stat-value { color: var(--green); }
  .stat-card.red .stat-value   { color: var(--red); }
  .stat-card.blue .stat-value  { color: var(--blue); }
  .stat-card.gold .stat-value  { color: var(--accent); }
  .stat-sub { font-size: 12px; color: var(--text2); margin-top: 8px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 9px 18px; border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.15s;
    text-decoration: none; white-space: nowrap;
  }
  .btn svg { width: 15px; height: 15px; }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
  .btn-secondary:hover { background: var(--surface3); }
  .btn-success { background: rgba(62,207,142,0.12); color: var(--green); border: 1px solid rgba(62,207,142,0.25); }
  .btn-success:hover { background: rgba(62,207,142,0.22); }
  .btn-danger { background: rgba(240,96,96,0.1); color: var(--red); border: 1px solid rgba(240,96,96,0.2); }
  .btn-danger:hover { background: rgba(240,96,96,0.2); }
  .btn-sm { padding: 6px 13px; font-size: 12px; }
  .btn-icon { padding: 7px; background: var(--surface2); border: 1px solid var(--border); color: var(--text2); border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .btn-icon:hover { color: var(--text); background: var(--surface3); }
  .btn-icon svg { width: 14px; height: 14px; }

  /* ── INPUTS ── */
  .input-group { display: flex; flex-direction: column; gap: 6px; }
  .input-label { font-size: 11.5px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.6px; }
  .input {
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); padding: 10px 13px;
    color: var(--text); font-family: 'DM Sans', sans-serif;
    font-size: 13.5px; width: 100%; transition: border-color 0.15s; outline: none;
  }
  .input:focus { border-color: var(--accent); }
  .input::placeholder { color: var(--text2); }
  select.input { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 30px; }
  textarea.input { resize: vertical; min-height: 80px; }

  /* ── FORM ── */
  .form-grid { display: grid; gap: 16px; }
  .form-grid-2 { grid-template-columns: 1fr 1fr; }
  .form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

  /* margem preview */
  .margem-preview {
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); padding: 12px 16px;
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  }
  .margem-item { display: flex; flex-direction: column; gap: 2px; }
  .margem-item-label { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; }
  .margem-item-value { font-family: 'Bebas Neue', sans-serif; font-size: 18px; }

  /* ── TABLE ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; padding: 11px 16px;
    font-size: 10.5px; font-weight: 700; color: var(--text2);
    text-transform: uppercase; letter-spacing: 0.7px;
    border-bottom: 1px solid var(--border);
    background: var(--surface); position: sticky; top: 0; z-index: 1;
  }
  td { padding: 13px 16px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.015); }

  /* ── BADGE ── */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; }
  .badge-green  { background: rgba(62,207,142,0.12); color: var(--green); }
  .badge-red    { background: rgba(240,96,96,0.12); color: var(--red); }
  .badge-yellow { background: rgba(245,166,35,0.12); color: var(--yellow); }
  .badge-blue   { background: rgba(77,166,255,0.12); color: var(--blue); }
  .badge-gold   { background: rgba(232,184,75,0.12); color: var(--accent); }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px;
    animation: fadeIn 0.15s;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: var(--radius); width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.2s cubic-bezier(.34,1.56,.64,1);
  }
  .modal-wide { max-width: 720px; }
  .modal-header { padding: 22px 24px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; }
  .modal-body { padding: 0 24px 24px; }

  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }

  /* ── LOGIN ── */
  .login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); position:relative; overflow:hidden; }
  .login-bg { position:absolute; inset:0; pointer-events:none; }
  .login-blob { position:absolute; border-radius:50%; filter:blur(90px); opacity:0.18; }
  .login-error { background:rgba(240,96,96,0.1); border:1px solid rgba(240,96,96,0.3); border-radius:var(--radius-sm); padding:10px 14px; font-size:13px; color:var(--red); margin-bottom:16px; }
  .login-tabs { display:flex; gap:0; margin-bottom:24px; border-radius:var(--radius-sm); overflow:hidden; border:1px solid var(--border2); }
  .login-tab { flex:1; padding:9px; font-size:13px; font-weight:600; cursor:pointer; background:none; border:none; color:var(--text2); font-family:'DM Sans',sans-serif; transition:all 0.15s; }
  .login-tab.active { background:var(--accent); color:#000; }
  .users-grid { display:grid; gap:10px; margin-top:16px; }
  .user-row { display:flex; align-items:center; gap:10px; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 14px; flex-wrap:nowrap; min-width:0; }
  .user-role-wrap { flex-shrink:0; }
  .user-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; }
  .user-info { flex:1; min-width:0; }
  .user-name { font-size:13px; font-weight:600; color:var(--text); }
  .user-email { font-size:11px; color:var(--text2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .user-role { font-size:10px; font-weight:700; padding:2px 8px; border-radius:99px; }
  .role-dono { background:rgba(232,184,75,0.15); color:var(--accent); }
  .role-func { background:rgba(77,166,255,0.12); color:var(--blue); }
  .login-card {
    background:var(--surface); border:1px solid var(--border2); border-radius:16px;
    padding:44px 40px; width:100%; max-width:420px; position:relative; z-index:1;
    animation:slideUp 0.4s cubic-bezier(.34,1.56,.64,1);
  }
  .login-logo { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
  .login-logo-img { width:56px; height:56px; border-radius:12px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .login-logo-img img { width:100%; height:100%; object-fit:contain; }
  .login-logo-text h1 { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:3px; color:var(--accent); line-height:1; }
  .login-logo-text p { font-size:12px; color:var(--text2); margin-top:2px; }

  /* ── TOAST ── */
  .toast-container { position:fixed; bottom:24px; right:24px; z-index:999; display:flex; flex-direction:column; gap:8px; }
  .toast { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:12px 16px; font-size:13px; min-width:260px; display:flex; align-items:center; gap:10px; animation:slideUp 0.25s cubic-bezier(.34,1.56,.64,1); box-shadow:0 8px 32px rgba(0,0,0,0.5); }
  .toast-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .toast.success .toast-dot { background:var(--green); }
  .toast.error .toast-dot { background:var(--red); }
  .toast.info .toast-dot { background:var(--blue); }

  /* ── MISC ── */
  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:99; }
  .empty-state { padding:52px; text-align:center; color:var(--text2); }
  .empty-icon { font-size:42px; margin-bottom:12px; opacity:0.45; }
  .empty-text { font-size:14px; }
  .mobile-navbar { display: none; position: fixed; top: 0; left: 0; right: 0; height: 60px; background: var(--surface); border-bottom: 1px solid var(--border); z-index: 101; align-items: center; padding: 0 16px; gap: 12px; }
  .mobile-menu-btn { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 8px; cursor: pointer; color: var(--text); display: flex; align-items: center; justify-content: center; }
  .mobile-logo { display: flex; align-items: center; gap: 10px; flex: 1; }
  .mobile-logo-img { width: 32px; height: 32px; border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .mobile-logo-img img { width: 100%; height: 100%; object-fit: contain; }
  .mobile-logo-name { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1.5px; color: var(--accent); line-height: 1; }
  .mobile-menu-btn svg { width:18px; height:18px; display:block; }
  .divider { border:none; border-top:1px solid var(--border); margin:16px 0; }
  .confirm-dialog { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius); padding:26px; max-width:420px; width:100%; }
  .confirm-title { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:1px; margin-bottom:10px; }
  .confirm-text { font-size:13px; color:var(--text2); margin-bottom:22px; }
  .confirm-actions { display:flex; gap:10px; justify-content:flex-end; }
  .product-thumb { width:36px; height:36px; border-radius:8px; background:var(--surface3); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .stock-alert { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--yellow); }

  /* ── LOADING ── */
  .loading-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; background:var(--bg); }
  .spinner { width:32px; height:32px; border:3px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* ── RESPONSIVE PC ── */
  @media (max-width: 1200px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .page { padding: 28px 28px; }
  }
  @media (max-width: 768px) {
    .sidebar { position:fixed; left:0; top:0; bottom:0; transform:translateX(-100%); }
    .sidebar.open { transform:translateX(0); box-shadow:8px 0 40px rgba(0,0,0,0.5); }
    .sidebar-overlay { display:block; }
    .mobile-navbar { display: flex; }
    .page { padding:20px 16px; padding-top:80px; }
    .stats-grid { grid-template-columns:1fr 1fr; }
    .form-grid-2, .form-grid-3 { grid-template-columns:1fr; }
  }
  @media (max-width: 420px) {
    .stats-grid { grid-template-columns: 1fr; }
  }

`;

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>,
    sell: <><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></>,
    expense: <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>,
    stock: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" fill="currentColor"/>,
    clients: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>,
    categories: <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22s4.5-2.01 4.5-4.5S19.99 13 17.5 13zm0 7c-1.38 0-2.5-1.12-2.5-2.5S16.12 15 17.5 15s2.5 1.12 2.5 2.5S18.88 20 17.5 20zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" fill="currentColor"/>,
    download: <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>,
    upload: <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor"/>,
    trash: <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>,
    edit: <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>,
    plus: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>,
    menu: <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>,
    close: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>,
    lock: <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" fill="currentColor"/>,
    eye: <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>,
    eyeoff: <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>,
    warn: <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>,
    check: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>,
    sync: <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" fill="currentColor"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {icons[name] || null}
    </svg>
  );
};

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
let toastCount = 0;
let setToastsGlobal = null;

function useToasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { setToastsGlobal = setToasts; }, []);
  return toasts;
}

function toast(msg, type = "success") {
  if (!setToastsGlobal) return;
  const id = ++toastCount;
  setToastsGlobal(p => [...p, { id, msg, type }]);
  setTimeout(() => setToastsGlobal(p => p.filter(t => t.id !== id)), 3500);
}

function ToastContainer() {
  const toasts = useToasts();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="toast-dot" />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL / CONFIRM
// ─────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, title, text, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-dialog">
        <div className="confirm-title">{title}</div>
        <div className="confirm-text">{text}</div>
        <div className="confirm-actions">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
          <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN — Firebase Auth
// ─────────────────────────────────────────────
function LoginScreen({ primeiroAcesso }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [nome, setNome] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    if (!email.trim() || !senha.trim()) return setErro("Preencha e-mail e senha.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "E-mail não cadastrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/too-many-requests": "Muitas tentativas. Tente mais tarde.",
      };
      setErro(msgs[err.code] || "Erro ao entrar. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  }

  async function criarDono(e) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) return setErro("Digite seu nome.");
    if (!email.trim()) return setErro("Digite seu e-mail.");
    if (senha.length < 6) return setErro("Senha deve ter no mínimo 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não conferem.");
    setLoading(true);
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.app.options.apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password: senha, returnSecureToken: true }) }
      );
      const data = await res.json();
      if (data.error) {
        const msgs = { "EMAIL_EXISTS": "Este e-mail já está cadastrado.", "WEAK_PASSWORD": "Senha muito fraca (mín. 6 caracteres)." };
        throw new Error(msgs[data.error.message] || data.error.message);
      }
      await setDoc(doc(db, "usuarios", data.localId), {
        uid: data.localId, nome: nome.trim(),
        email: email.trim(), cargo: "dono",
        criadoEm: new Date().toISOString()
      });
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      toast("Conta criada! Bem-vindo ao FitMGwear 🎉");
    } catch (err) {
      setErro(err.message || "Erro ao criar conta.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-blob" style={{ width: 500, height: 500, background: "#e8b84b", top: -150, right: -150 }} />
        <div className="login-blob" style={{ width: 400, height: 400, background: "#3ecf8e", bottom: -100, left: -100 }} />
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-img"><img src={logoImg} alt="FitMGwear" /></div>
          <div className="login-logo-text"><h1>FITMGWEAR</h1><p>Sistema de Gestão</p></div>
        </div>

        {primeiroAcesso ? (
          <>
            <div style={{ background: "rgba(232,184,75,0.08)", border: "1px solid rgba(232,184,75,0.25)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--accent)", marginBottom: 20 }}>
              👋 Primeira vez? Crie a conta do dono do sistema.
            </div>
            {erro && <div className="login-error">⚠️ {erro}</div>}
            <form onSubmit={criarDono}>
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">Seu Nome</label>
                  <input className="input" placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">E-mail</label>
                  <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="input-group">
                  <label className="input-label">Senha (mín. 6 caracteres)</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={show ? "text" : "password"} placeholder="Crie uma senha forte" value={senha} onChange={e => setSenha(e.target.value)} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}>
                      <Icon name={show ? "eyeoff" : "eye"} size={16} />
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Confirmar Senha</label>
                  <input className="input" type={show ? "text" : "password"} placeholder="Repita a senha" value={confirmar} onChange={e => setConfirmar(e.target.value)} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4, padding: "11px", opacity: loading ? 0.7 : 1 }}>
                  <Icon name="check" size={15} />
                  {loading ? "Criando conta..." : "Criar Conta e Entrar"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20 }}>
              Entre com seu e-mail e senha para acessar
            </p>
            {erro && <div className="login-error">⚠️ {erro}</div>}
            <form onSubmit={entrar}>
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">E-mail</label>
                  <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="input-group">
                  <label className="input-label">Senha</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={show ? "text" : "password"} placeholder="Digite sua senha" value={senha} onChange={e => setSenha(e.target.value)} style={{ paddingRight: 40 }} autoComplete="current-password" />
                    <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}>
                      <Icon name={show ? "eyeoff" : "eye"} size={16} />
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4, padding: "11px", opacity: loading ? 0.7 : 1 }}>
                  <Icon name="lock" size={15} />
                  {loading ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>
          </>
        )}
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text2)", marginTop: 20 }}>
          ☁️ Dados sincronizados em tempo real
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GERENCIAR USUÁRIOS (apenas dono)
// ─────────────────────────────────────────────
function GerenciarUsuarios({ usuarioAtual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", cargo: "funcionario" });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "usuarios"), snap => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingUsers(false);
    });
    return unsub;
  }, []);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function abrirNovoUsuario() {
    setEditandoUsuario(null);
    setForm({ nome: "", email: "", senha: "", cargo: "funcionario" });
    setModal(true);
  }

  function abrirEditarUsuario(u) {
    setEditandoUsuario(u);
    setForm({ nome: u.nome || "", email: u.email || "", senha: "", cargo: u.cargo || "funcionario" });
    setModal(true);
  }

  async function salvarUsuario(e) {
    e.preventDefault();
    if (editandoUsuario) {
      // Editar: só atualiza nome e cargo no Firestore
      if (!form.nome.trim()) return toast("Preencha o nome.", "error");
      setLoading(true);
      try {
        await setDoc(doc(db, "usuarios", editandoUsuario.id), {
          ...editandoUsuario,
          nome: form.nome.trim(),
          cargo: form.cargo,
        });
        toast(`Usuário ${form.nome} atualizado! ✓`);
        setModal(false);
      } catch (err) {
        toast("Erro ao atualizar usuário.", "error");
      } finally {
        setLoading(false);
      }
    } else {
      // Criar novo
      if (!form.nome.trim() || !form.email.trim() || form.senha.length < 6)
        return toast("Preencha todos os campos. Senha mínimo 6 caracteres.", "error");
      setLoading(true);
      try {
        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.app.options.apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email.trim(), password: form.senha, returnSecureToken: true })
          }
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        await setDoc(doc(db, "usuarios", data.localId), {
          uid: data.localId, nome: form.nome.trim(),
          email: form.email.trim(), cargo: form.cargo,
          criadoEm: new Date().toISOString(), criadoPor: usuarioAtual?.uid
        });
        toast(`Usuário ${form.nome} criado com sucesso! ✓`);
        setForm({ nome: "", email: "", senha: "", cargo: "funcionario" });
        setModal(false);
      } catch (err) {
        const msgs = { "EMAIL_EXISTS": "Este e-mail já está cadastrado.", "WEAK_PASSWORD": "Senha muito fraca." };
        toast(msgs[err.message] || "Erro ao criar usuário.", "error");
      } finally {
        setLoading(false);
      }
    }
  }

  async function removerUsuario(u) {
    if (u.uid === usuarioAtual?.uid) return toast("Você não pode remover a si mesmo.", "error");
    await deleteDoc(doc(db, "usuarios", u.id));
    toast("Usuário removido do sistema.");
    setConfirmId(null);
  }

  const cores = { dono: "#e8b84b", funcionario: "#4da6ff" };
  const usuarioParaRemover = usuarios.find(u => u.id === confirmId);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Usuários</h1><p className="page-sub">Gerencie quem tem acesso ao sistema</p></div>
        <button className="btn btn-primary" onClick={abrirNovoUsuario}><Icon name="plus" />Novo Usuário</button>
      </div>

      <div className="card">
        <div className="card-body">
          {loadingUsers ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Carregando...</div>
          ) : usuarios.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">Nenhum usuário cadastrado ainda</div></div>
          ) : (
            <div className="users-grid">
              {usuarios.map(u => (
                <div key={u.id} className="user-row">
                  <div className="user-avatar" style={{ background: u.cargo === "dono" ? "rgba(232,184,75,0.15)" : "rgba(77,166,255,0.12)", color: cores[u.cargo] || "var(--text2)" }}>
                    {(u.nome || u.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{u.nome || "Sem nome"}</div>
                    <div className="user-email">{u.email}</div>
                  </div>
                  <div className="user-role-wrap">
                    <span className={`user-role ${u.cargo === "dono" ? "role-dono" : "role-func"}`}>
                      {u.cargo === "dono" ? "Dono" : "Func."}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button className="btn-icon" onClick={() => abrirEditarUsuario(u)} title="Editar usuário">
                      <Icon name="edit" size={13} />
                    </button>
                    {u.uid !== usuarioAtual?.uid ? (
                      <button className="btn-icon" onClick={() => setConfirmId(u.id)} title="Remover acesso" style={{ color: "var(--red)" }}>
                        <Icon name="trash" size={13} />
                      </button>
                    ) : (
                      <span style={{ fontSize: 10, color: "var(--text2)", padding: "2px 6px", whiteSpace: "nowrap" }}>Você</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editandoUsuario ? "Editar Usuário" : "Novo Usuário"}>
        <form onSubmit={salvarUsuario}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Nome completo</label>
              <input className="input" placeholder="Ex: Maria Silva" value={form.nome} onChange={e => set("nome", e.target.value)} />
            </div>
            {!editandoUsuario && (
              <div className="input-group">
                <label className="input-label">E-mail</label>
                <input className="input" type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
            )}
            {editandoUsuario && (
              <div style={{ background: "rgba(77,166,255,0.07)", border: "1px solid rgba(77,166,255,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 12, color: "var(--text2)" }}>
                📧 E-mail: <strong style={{ color: "var(--text)" }}>{editandoUsuario.email}</strong> (não pode ser alterado)
              </div>
            )}
            {!editandoUsuario && (
              <div className="input-group">
                <label className="input-label">Senha inicial (mín. 6 caracteres)</label>
                <input className="input" type="text" placeholder="Senha para o funcionário" value={form.senha} onChange={e => set("senha", e.target.value)} />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Cargo</label>
              <select className="input" value={form.cargo} onChange={e => set("cargo", e.target.value)}>
                <option value="funcionario">Funcionário</option>
                <option value="dono">Dono / Admin</option>
              </select>
            </div>
            {!editandoUsuario && (
              <div style={{ background: "rgba(77,166,255,0.07)", border: "1px solid rgba(77,166,255,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 12, color: "var(--text2)" }}>
                💡 Passe o e-mail e senha para o funcionário. Ele pode trocar a senha depois.
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Salvando..." : editandoUsuario ? "Salvar Alterações" : "Criar Usuário"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId}
        title="Remover Usuário?"
        text={`Remover ${usuarioParaRemover?.nome || "este usuário"} do sistema? Ele não poderá mais fazer login.`}
        danger
        onConfirm={() => removerUsuario(usuarioParaRemover)}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ dados }) {
  const transacoes = dados.transacoes || [];
  const hoje = new Date().toDateString();
  const totalReceitas = transacoes.filter(t => t.tipo === "venda").reduce((s, t) => s + (t.valor || 0), 0);
  const totalDespesas = transacoes.filter(t => t.tipo === "despesa").reduce((s, t) => s + (t.valor || 0), 0);
  const saldo = totalReceitas - totalDespesas;
  const hojeVendas = transacoes.filter(t => t.tipo === "venda" && new Date(t.data).toDateString() === hoje).reduce((s,t) => s + (t.valor||0), 0);
  const hojeCount = transacoes.filter(t => new Date(t.data).toDateString() === hoje).length;
  const produtosAbaixo = (dados.produtos || []).filter(p => p.quantidadeEstoque <= p.quantidadeMinima);
  const ultimas = [...transacoes].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Painel de Controle</h1>
          <p className="page-sub">Visão geral do seu negócio em tempo real</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-label">Receitas Totais</div>
          <div className="stat-value">{formatBRL(totalReceitas)}</div>
          <div className="stat-sub">Total de vendas</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Despesas Totais</div>
          <div className="stat-value">{formatBRL(totalDespesas)}</div>
          <div className="stat-sub">Total de gastos</div>
        </div>
        <div className={`stat-card ${saldo >= 0 ? "blue" : "red"}`}>
          <div className="stat-label">Saldo Líquido</div>
          <div className="stat-value">{formatBRL(saldo)}</div>
          <div className="stat-sub">{saldo >= 0 ? "Positivo ✓" : "Atenção!"}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Hoje</div>
          <div className="stat-value">{formatBRL(hojeVendas)}</div>
          <div className="stat-sub">{hojeCount} transação(ões)</div>
        </div>
      </div>

      {produtosAbaixo.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: "rgba(245,166,35,0.3)", background: "rgba(245,166,35,0.04)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 24 }}>⚠️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--yellow)" }}>Estoque crítico</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>{produtosAbaixo.map(p => p.nome).join(", ")} — abaixo do mínimo</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ padding: "20px 20px 14px" }}>
          <span className="card-title">Últimas Transações</span>
        </div>
        <div className="table-wrap">
          {ultimas.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhuma transação ainda</div></div>
          ) : (
            <table>
              <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
              <tbody>
                {ultimas.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatData(t.data)}</td>
                    <td>{t.descricao}</td>
                    <td><span className={`badge ${t.tipo === "venda" ? "badge-green" : "badge-red"}`}>{t.tipo === "venda" ? "Venda" : "Despesa"}</span></td>
                    <td style={{ fontWeight: 700, color: t.tipo === "venda" ? "var(--green)" : "var(--red)", textAlign: "right", whiteSpace: "nowrap" }}>{formatBRL(t.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FORM TRANSAÇÃO com margem em tempo real
// ─────────────────────────────────────────────
function FormTransacao({ tipo, dados, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    descricao: "", valor: "", categoria: "", cliente: "",
    data: new Date().toISOString().split("T")[0],
    observacoes: "", produtoId: "", quantidade: 1,
  });

  const categorias = (dados.categorias || []).filter(c => tipo === "venda" ? c.tipo === "receita" : c.tipo === "despesa");
  const produtos = dados.produtos || [];

  // Produto selecionado
  const produtoSelecionado = produtos.find(p => p.id === form.produtoId);

  // Calcular margem em tempo real
  const valorVenda = parseFloat(form.valor) || 0;
  const custoUnitario = produtoSelecionado ? produtoSelecionado.precoCompra : 0;
  const custoTotal = custoUnitario * form.quantidade;
  const lucro = valorVenda - custoTotal;
  const margem = custoTotal > 0 ? (lucro / custoTotal * 100) : 0;

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleProduto(id) {
    set("produtoId", id);
    if (id) {
      const p = produtos.find(x => x.id === id);
      if (p) { set("descricao", p.nome); set("valor", (p.precoVenda * form.quantidade).toFixed(2)); }
    }
  }

  function handleQtd(q) {
    const n = Math.max(1, parseInt(q) || 1);
    set("quantidade", n);
    if (form.produtoId) {
      const p = produtos.find(x => x.id === form.produtoId);
      if (p) set("valor", (p.precoVenda * n).toFixed(2));
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!form.descricao.trim()) return toast("Preencha a descrição", "error");
    if (!form.valor || parseFloat(form.valor) <= 0) return toast("Valor inválido", "error");
    if (tipo === "venda" && form.produtoId) {
      const prod = produtos.find(p => p.id === form.produtoId);
      if (!prod || prod.quantidadeEstoque < form.quantidade) return toast("Estoque insuficiente!", "error");
    }
    onSalvar({ tipo, descricao: form.descricao, valor: parseFloat(form.valor), categoria: form.categoria, cliente: form.cliente, data: form.data || new Date().toISOString(), observacoes: form.observacoes, produtoId: form.produtoId || undefined, quantidade: form.quantidade });
  }

  return (
    <form onSubmit={submit}>
      {tipo === "venda" && produtos.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="card" style={{ padding: 18, background: "var(--surface2)", border: "1px solid var(--border2)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Vincular Produto do Estoque</div>
            <div className="form-grid form-grid-2">
              <div className="input-group">
                <label className="input-label">Produto</label>
                <select className="input" value={form.produtoId} onChange={e => handleProduto(e.target.value)}>
                  <option value="">Selecionar produto...</option>
                  {produtos.filter(p => p.quantidadeEstoque > 0).map(p => (
                    <option key={p.id} value={p.id}>{p.nome} (Estq: {p.quantidadeEstoque})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Quantidade</label>
                <input className="input" type="number" min="1" value={form.quantidade} onChange={e => handleQtd(e.target.value)} />
              </div>
            </div>

            {/* MARGEM EM TEMPO REAL */}
            {produtoSelecionado && valorVenda > 0 && (
              <div className="margem-preview" style={{ marginTop: 14 }}>
                <div className="margem-item">
                  <span className="margem-item-label">Custo Total</span>
                  <span className="margem-item-value" style={{ color: "var(--red)" }}>{formatBRL(custoTotal)}</span>
                </div>
                <div style={{ color: "var(--border2)", fontSize: 20 }}>→</div>
                <div className="margem-item">
                  <span className="margem-item-label">Venda</span>
                  <span className="margem-item-value" style={{ color: "var(--green)" }}>{formatBRL(valorVenda)}</span>
                </div>
                <div style={{ color: "var(--border2)", fontSize: 20 }}>→</div>
                <div className="margem-item">
                  <span className="margem-item-label">Lucro</span>
                  <span className="margem-item-value" style={{ color: lucro >= 0 ? "var(--green)" : "var(--red)" }}>{formatBRL(lucro)}</span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span className={`badge ${margem > 30 ? "badge-green" : margem > 10 ? "badge-gold" : "badge-red"}`} style={{ fontSize: 14, padding: "5px 12px" }}>
                    {margem.toFixed(1)}% margem
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="form-grid form-grid-2" style={{ marginBottom: 14 }}>
        <div className="input-group">
          <label className="input-label">Descrição *</label>
          <input className="input" placeholder="Ex: Camiseta Dry-Fit" value={form.descricao} onChange={e => set("descricao", e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Valor (R$) *</label>
          <input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={form.valor} onChange={e => set("valor", e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Categoria</label>
          <select className="input" value={form.categoria} onChange={e => set("categoria", e.target.value)}>
            <option value="">Selecione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        {tipo === "venda" && (
          <div className="input-group">
            <label className="input-label">Cliente</label>
            <select className="input" value={form.cliente} onChange={e => set("cliente", e.target.value)}>
              <option value="">Nenhum</option>
              {(dados.clientes || []).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Data</label>
          <input className="input" type="date" value={form.data} onChange={e => set("data", e.target.value)} />
        </div>
        <div className="input-group" style={{ gridColumn: "1 / -1" }}>
          <label className="input-label">Observações</label>
          <textarea className="input" placeholder="Opcional..." value={form.observacoes} onChange={e => set("observacoes", e.target.value)} style={{ minHeight: 60 }} />
        </div>
      </div>
      <div className="form-actions">
        {onCancelar && <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className={`btn ${tipo === "venda" ? "btn-success" : "btn-danger"}`}>
          <Icon name={tipo === "venda" ? "check" : "expense"} />
          {tipo === "venda" ? "Registrar Venda" : "Registrar Despesa"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// TRANSAÇÕES
// ─────────────────────────────────────────────
function Transacoes({ dados, onRemover }) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const transacoes = useMemo(() => {
    let list = [...(dados.transacoes || [])].sort((a, b) => new Date(b.data) - new Date(a.data));
    if (filtro !== "todos") list = list.filter(t => t.tipo === filtro);
    if (busca) list = list.filter(t => t.descricao.toLowerCase().includes(busca.toLowerCase()));
    return list;
  }, [dados.transacoes, filtro, busca]);

  function nomeCliente(id) {
    const c = (dados.clientes || []).find(x => x.id === id);
    return c ? c.nome : "";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-sub">Histórico completo de vendas e despesas</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input className="input" style={{ maxWidth: 260 }} placeholder="🔍 Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
        {["todos", "venda", "despesa"].map(f => (
          <button key={f} className={`btn btn-sm ${filtro === f ? "btn-primary" : "btn-secondary"}`} onClick={() => setFiltro(f)}>
            {f === "todos" ? "Todos" : f === "venda" ? "Vendas" : "Despesas"}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {transacoes.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhuma transação encontrada</div></div>
          ) : (
            <table>
              <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Cliente</th><th style={{ textAlign: "right" }}>Valor</th><th></th></tr></thead>
              <tbody>
                {transacoes.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatData(t.data)}</td>
                    <td>{t.descricao}{t.observacoes && <div style={{ fontSize: 11, color: "var(--text2)" }}>{t.observacoes}</div>}</td>
                    <td><span className={`badge ${t.tipo === "venda" ? "badge-green" : "badge-red"}`}>{t.tipo === "venda" ? "Venda" : "Despesa"}</span></td>
                    <td style={{ color: "var(--text2)" }}>{nomeCliente(t.cliente)}</td>
                    <td style={{ fontWeight: 700, color: t.tipo === "venda" ? "var(--green)" : "var(--red)", textAlign: "right", whiteSpace: "nowrap" }}>{formatBRL(t.valor)}</td>
                    <td><button className="btn-icon" onClick={() => setConfirmId(t.id)}><Icon name="trash" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog open={!!confirmId} title="Remover Transação?" text="Esta ação não pode ser desfeita." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Transação removida"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// ESTOQUE
// ─────────────────────────────────────────────
function Estoque({ dados, onAdicionar, onRemover, onAtualizar }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "", precoCompra: "", precoVenda: "", quantidadeEstoque: "", quantidadeMinima: "5", sku: "" });

  const produtos = dados.produtos || [];

  // Margem em tempo real no form de produto
  const pc = parseFloat(form.precoCompra) || 0;
  const pv = parseFloat(form.precoVenda) || 0;
  const margemForm = pc > 0 && pv > 0 ? ((pv - pc) / pc * 100) : null;

  function abrirModal(p = null) {
    if (p) { setEditando(p.id); setForm({ nome: p.nome, descricao: p.descricao || "", precoCompra: p.precoCompra, precoVenda: p.precoVenda, quantidadeEstoque: p.quantidadeEstoque, quantidadeMinima: p.quantidadeMinima, sku: p.sku || "" }); }
    else { setEditando(null); setForm({ nome: "", descricao: "", precoCompra: "", precoVenda: "", quantidadeEstoque: "", quantidadeMinima: "5", sku: "" }); }
    setModal(true);
  }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return toast("Preencha o nome", "error");
    if (!form.precoVenda || parseFloat(form.precoVenda) <= 0) return toast("Preço de venda inválido", "error");
    const dados_ = { nome: form.nome, descricao: form.descricao, precoCompra: parseFloat(form.precoCompra) || 0, precoVenda: parseFloat(form.precoVenda), quantidadeEstoque: parseInt(form.quantidadeEstoque) || 0, quantidadeMinima: parseInt(form.quantidadeMinima) || 5, sku: form.sku };
    if (editando) { onAtualizar(editando, dados_); toast("Produto atualizado"); }
    else { onAdicionar(dados_); toast("Produto adicionado"); }
    setModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-sub">Gerencie seus produtos e quantidades</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}><Icon name="plus" /> Novo Produto</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {produtos.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-text">Nenhum produto cadastrado</div></div>
          ) : (
            <table>
              <thead><tr><th>Produto</th><th>SKU</th><th>Compra</th><th>Venda</th><th>Estoque</th><th>Margem</th><th></th></tr></thead>
              <tbody>
                {produtos.map(p => {
                  const margem = p.precoCompra > 0 ? ((p.precoVenda - p.precoCompra) / p.precoCompra * 100) : 0;
                  const baixo = p.quantidadeEstoque <= p.quantidadeMinima;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="product-thumb">👕</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.nome}</div>
                            {p.descricao && <div style={{ fontSize: 11, color: "var(--text2)" }}>{p.descricao}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--text2)", fontSize: 12 }}>{p.sku || "—"}</td>
                      <td>{formatBRL(p.precoCompra)}</td>
                      <td style={{ fontWeight: 700 }}>{formatBRL(p.precoVenda)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className={`badge ${baixo ? "badge-yellow" : "badge-green"}`}>{p.quantidadeEstoque}</span>
                          {baixo && <span style={{ fontSize: 11, color: "var(--yellow)" }}>⚠ mín: {p.quantidadeMinima}</span>}
                        </div>
                      </td>
                      <td><span className={`badge ${margem > 30 ? "badge-green" : margem > 10 ? "badge-gold" : "badge-red"}`}>{margem.toFixed(0)}%</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-icon" onClick={() => abrirModal(p)}><Icon name="edit" /></button>
                          <button className="btn-icon" onClick={() => setConfirmId(p.id)}><Icon name="trash" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? "Editar Produto" : "Novo Produto"} wide>
        <form onSubmit={submit}>
          <div className="form-grid form-grid-2">
            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label className="input-label">Nome do Produto *</label>
              <input className="input" placeholder="Ex: Camiseta Dry-Fit P" value={form.nome} onChange={e => set("nome", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">SKU / Código</label>
              <input className="input" placeholder="Ex: CAM-001" value={form.sku} onChange={e => set("sku", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Descrição</label>
              <input className="input" placeholder="Opcional" value={form.descricao} onChange={e => set("descricao", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Preço de Compra (R$)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={form.precoCompra} onChange={e => set("precoCompra", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Preço de Venda (R$) *</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={form.precoVenda} onChange={e => set("precoVenda", e.target.value)} />
            </div>

            {/* Margem em tempo real no form de produto */}
            {margemForm !== null && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="margem-preview">
                  <div className="margem-item">
                    <span className="margem-item-label">Custo</span>
                    <span className="margem-item-value" style={{ color: "var(--red)" }}>{formatBRL(pc)}</span>
                  </div>
                  <div style={{ color: "var(--border2)", fontSize: 20 }}>→</div>
                  <div className="margem-item">
                    <span className="margem-item-label">Venda</span>
                    <span className="margem-item-value" style={{ color: "var(--green)" }}>{formatBRL(pv)}</span>
                  </div>
                  <div style={{ color: "var(--border2)", fontSize: 20 }}>→</div>
                  <div className="margem-item">
                    <span className="margem-item-label">Lucro Unitário</span>
                    <span className="margem-item-value" style={{ color: pv >= pc ? "var(--green)" : "var(--red)" }}>{formatBRL(pv - pc)}</span>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span className={`badge ${margemForm > 30 ? "badge-green" : margemForm > 10 ? "badge-gold" : "badge-red"}`} style={{ fontSize: 14, padding: "5px 12px" }}>
                      {margemForm.toFixed(1)}% margem
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Quantidade em Estoque</label>
              <input className="input" type="number" min="0" placeholder="0" value={form.quantidadeEstoque} onChange={e => set("quantidadeEstoque", e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Quantidade Mínima</label>
              <input className="input" type="number" min="0" placeholder="5" value={form.quantidadeMinima} onChange={e => set("quantidadeMinima", e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editando ? "Salvar Alterações" : "Adicionar Produto"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remover Produto?" text="Esta ação não pode ser desfeita." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Produto removido"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// CLIENTES
// ─────────────────────────────────────────────
function Clientes({ dados, onAdicionar, onRemover }) {
  const [modal, setModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });
  const clientes = dados.clientes || [];

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return toast("Preencha o nome", "error");
    onAdicionar({ ...form });
    toast("Cliente adicionado");
    setForm({ nome: "", telefone: "", email: "" });
    setModal(false);
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Clientes</h1><p className="page-sub">Gerencie sua base de clientes</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" /> Novo Cliente</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          {clientes.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">Nenhum cliente cadastrado</div></div>
          ) : (
            <table>
              <thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Desde</th><th></th></tr></thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td style={{ color: "var(--text2)" }}>{c.telefone || "—"}</td>
                    <td style={{ color: "var(--text2)" }}>{c.email || "—"}</td>
                    <td style={{ color: "var(--text2)" }}>{formatData(c.dataCriacao)}</td>
                    <td><button className="btn-icon" onClick={() => setConfirmId(c.id)}><Icon name="trash" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Novo Cliente">
        <form onSubmit={submit}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="input-group"><label className="input-label">Nome *</label><input className="input" placeholder="Nome completo" value={form.nome} onChange={e => set("nome", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Telefone</label><input className="input" placeholder="(00) 00000-0000" value={form.telefone} onChange={e => set("telefone", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => set("email", e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} title="Remover Cliente?" text="Esta ação não pode ser desfeita." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Cliente removido"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORIAS
// ─────────────────────────────────────────────
function Categorias({ dados, onAdicionar, onRemover }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: "", tipo: "receita", cor: "#3ecf8e" });
  const [confirmId, setConfirmId] = useState(null);
  const categorias = dados.categorias || [];

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return toast("Preencha o nome", "error");
    onAdicionar({ ...form });
    toast("Categoria adicionada");
    setModal(false);
    setForm({ nome: "", tipo: "receita", cor: "#3ecf8e" });
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Categorias</h1><p className="page-sub">Organize suas transações por categoria</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" /> Nova Categoria</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          {categorias.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🏷️</div><div className="empty-text">Nenhuma categoria</div></div>
          ) : (
            <table>
              <thead><tr><th>Nome</th><th>Tipo</th><th>Cor</th><th></th></tr></thead>
              <tbody>
                {categorias.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td><span className={`badge ${c.tipo === "receita" ? "badge-green" : "badge-red"}`}>{c.tipo}</span></td>
                    <td><div style={{ width: 20, height: 20, borderRadius: 6, background: c.cor, border: "1px solid var(--border2)" }} /></td>
                    <td><button className="btn-icon" onClick={() => setConfirmId(c.id)}><Icon name="trash" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Nova Categoria">
        <form onSubmit={submit}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="input-group"><label className="input-label">Nome *</label><input className="input" placeholder="Nome da categoria" value={form.nome} onChange={e => set("nome", e.target.value)} /></div>
            <div className="input-group">
              <label className="input-label">Tipo</label>
              <select className="input" value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Cor</label><input className="input" type="color" value={form.cor} onChange={e => set("cor", e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} title="Remover Categoria?" text="Esta ação não pode ser desfeita." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Categoria removida"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// RELATÓRIO PDF
// ─────────────────────────────────────────────
function Relatorio({ dados }) {
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split("T")[0]);

  const transacoes = dados.transacoes || [];
  const produtos = dados.produtos || [];
  const clientes = dados.clientes || [];

  // Filtrar por período
  const transacoesFiltradas = useMemo(() => {
    let inicio, fim;
    const hoje = new Date();
    if (periodo === "mes") {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodo === "semana") {
      const dia = hoje.getDay();
      inicio = new Date(hoje); inicio.setDate(hoje.getDate() - dia); inicio.setHours(0,0,0,0);
      fim = new Date(inicio); fim.setDate(inicio.getDate() + 6); fim.setHours(23,59,59,999);
    } else if (periodo === "ano") {
      inicio = new Date(hoje.getFullYear(), 0, 1);
      fim = new Date(hoje.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      inicio = new Date(dataInicio + "T00:00:00");
      fim = new Date(dataFim + "T23:59:59");
    }
    return transacoes.filter(t => {
      const d = new Date(t.data);
      return d >= inicio && d <= fim;
    });
  }, [transacoes, periodo, dataInicio, dataFim]);

  const totalVendas = transacoesFiltradas.filter(t => t.tipo === "venda").reduce((s, t) => s + (t.valor||0), 0);
  const totalDespesas = transacoesFiltradas.filter(t => t.tipo === "despesa").reduce((s, t) => s + (t.valor||0), 0);
  const lucroLiquido = totalVendas - totalDespesas;

  function nomeCliente(id) {
    const c = clientes.find(x => x.id === id);
    return c ? c.nome : "";
  }

  function periodoLabel() {
    if (periodo === "mes") return `Mês Atual (${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })})`;
    if (periodo === "semana") return "Semana Atual";
    if (periodo === "ano") return `Ano ${new Date().getFullYear()}`;
    return `${formatData(dataInicio)} a ${formatData(dataFim)}`;
  }

  function gerarPDF() {
    const vendas = transacoesFiltradas.filter(t => t.tipo === "venda");
    const despesas = transacoesFiltradas.filter(t => t.tipo === "despesa");

    const linhasVendas = vendas.map(t =>
      `<tr>
        <td>${formatData(t.data)}</td>
        <td>${t.descricao}</td>
        <td>${nomeCliente(t.cliente) || "—"}</td>
        <td style="text-align:right; color:#16a34a; font-weight:600">${formatBRL(t.valor)}</td>
      </tr>`
    ).join("");

    const linhasDespesas = despesas.map(t =>
      `<tr>
        <td>${formatData(t.data)}</td>
        <td>${t.descricao}</td>
        <td>${t.observacoes || "—"}</td>
        <td style="text-align:right; color:#dc2626; font-weight:600">${formatBRL(t.valor)}</td>
      </tr>`
    ).join("");

    const linhasEstoque = produtos.map(p =>
      `<tr>
        <td>${p.nome}</td>
        <td>${p.sku || "—"}</td>
        <td style="text-align:center">${p.quantidadeEstoque}</td>
        <td>${formatBRL(p.precoCompra)}</td>
        <td style="font-weight:600">${formatBRL(p.precoVenda)}</td>
      </tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Relatório FitMGwear</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; font-size: 13px; }
    .header { background: #0c0c0c; color: #fff; padding: 28px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 26px; letter-spacing: 3px; color: #e8b84b; }
    .header p { font-size: 12px; color: #888; margin-top: 4px; }
    .header-right { text-align: right; font-size: 12px; color: #888; }
    .content { padding: 32px 40px; }
    .periodo-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 5px 14px; border-radius: 99px; font-size: 12px; font-weight: 700; margin-bottom: 24px; }
    .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 32px; }
    .stat { border-radius: 8px; padding: 20px; text-align: center; }
    .stat.green { background: #f0fdf4; border: 1px solid #86efac; }
    .stat.red { background: #fef2f2; border: 1px solid #fca5a5; }
    .stat.blue { background: #eff6ff; border: 1px solid #93c5fd; }
    .stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #6b7280; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: 800; }
    .stat.green .stat-value { color: #16a34a; }
    .stat.red .stat-value { color: #dc2626; }
    .stat.blue .stat-value { color: #2563eb; }
    h2 { font-size: 16px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #374151; margin-bottom: 12px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12.5px; }
    tr:last-child td { border-bottom: none; }
    .empty { text-align: center; color: #9ca3af; padding: 20px; font-style: italic; }
    .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>FITMGWEAR</h1>
      <p>Sistema de Gestão — Relatório Financeiro</p>
    </div>
    <div class="header-right">
      <div>Gerado em: ${new Date().toLocaleDateString("pt-BR", { dateStyle: "full" })}</div>
      <div>${new Date().toLocaleTimeString("pt-BR")}</div>
    </div>
  </div>
  <div class="content">
    <div class="periodo-badge">📅 Período: ${periodoLabel()}</div>
    <div class="stats">
      <div class="stat green">
        <div class="stat-label">Total de Vendas</div>
        <div class="stat-value">${formatBRL(totalVendas)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:4px">${vendas.length} transação(ões)</div>
      </div>
      <div class="stat red">
        <div class="stat-label">Total de Despesas</div>
        <div class="stat-value">${formatBRL(totalDespesas)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:4px">${despesas.length} transação(ões)</div>
      </div>
      <div class="stat blue">
        <div class="stat-label">Lucro Líquido</div>
        <div class="stat-value" style="color:${lucroLiquido >= 0 ? '#2563eb' : '#dc2626'}">${formatBRL(lucroLiquido)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:4px">${lucroLiquido >= 0 ? "✓ Positivo" : "⚠ Negativo"}</div>
      </div>
    </div>

    <h2>Vendas (${vendas.length})</h2>
    ${vendas.length > 0 ? `
    <table>
      <thead><tr><th>Data</th><th>Descrição</th><th>Cliente</th><th style="text-align:right">Valor</th></tr></thead>
      <tbody>${linhasVendas}</tbody>
    </table>` : `<p class="empty">Nenhuma venda no período</p><br/>`}

    <h2>Despesas (${despesas.length})</h2>
    ${despesas.length > 0 ? `
    <table>
      <thead><tr><th>Data</th><th>Descrição</th><th>Obs.</th><th style="text-align:right">Valor</th></tr></thead>
      <tbody>${linhasDespesas}</tbody>
    </table>` : `<p class="empty">Nenhuma despesa no período</p><br/>`}

    <h2>Estoque Atual (${produtos.length} produtos)</h2>
    ${produtos.length > 0 ? `
    <table>
      <thead><tr><th>Produto</th><th>SKU</th><th style="text-align:center">Qtd</th><th>Compra</th><th>Venda</th></tr></thead>
      <tbody>${linhasEstoque}</tbody>
    </table>` : `<p class="empty">Nenhum produto cadastrado</p>`}

    <div class="footer">FitMGwear Gestão — Relatório gerado automaticamente</div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      // fallback: download direto
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-fitmgwear-${new Date().toISOString().split("T")[0]}.html`;
      a.click();
    }
    toast("Relatório aberto! Use Ctrl+P para imprimir/salvar como PDF.");
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Relatório</h1><p className="page-sub">Gere relatórios financeiros para exportar em PDF</p></div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="input-group" style={{ flex: "0 0 auto" }}>
              <label className="input-label">Período</label>
              <select className="input" style={{ minWidth: 160 }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="ano">Este Ano</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            {periodo === "custom" && (
              <>
                <div className="input-group">
                  <label className="input-label">De</label>
                  <input className="input" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Até</label>
                  <input className="input" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card green">
          <div className="stat-label">Vendas no Período</div>
          <div className="stat-value">{formatBRL(totalVendas)}</div>
          <div className="stat-sub">{transacoesFiltradas.filter(t=>t.tipo==="venda").length} transações</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Despesas no Período</div>
          <div className="stat-value">{formatBRL(totalDespesas)}</div>
          <div className="stat-sub">{transacoesFiltradas.filter(t=>t.tipo==="despesa").length} transações</div>
        </div>
        <div className={`stat-card ${lucroLiquido >= 0 ? "blue" : "red"}`}>
          <div className="stat-label">Lucro Líquido</div>
          <div className="stat-value">{formatBRL(lucroLiquido)}</div>
          <div className="stat-sub">{lucroLiquido >= 0 ? "Positivo ✓" : "Negativo ⚠"}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Transações</div>
          <div className="stat-value">{transacoesFiltradas.length}</div>
          <div className="stat-sub">{periodoLabel()}</div>
        </div>
      </div>

      {/* Preview tabela */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ padding: "18px 20px 14px" }}>
          <span className="card-title">Preview — Transações do Período</span>
        </div>
        <div className="table-wrap">
          {transacoesFiltradas.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhuma transação no período selecionado</div></div>
          ) : (
            <table>
              <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
              <tbody>
                {[...transacoesFiltradas].sort((a,b) => new Date(b.data)-new Date(a.data)).slice(0, 15).map(t => (
                  <tr key={t.id}>
                    <td style={{ color: "var(--text2)" }}>{formatData(t.data)}</td>
                    <td>{t.descricao}</td>
                    <td><span className={`badge ${t.tipo === "venda" ? "badge-green" : "badge-red"}`}>{t.tipo === "venda" ? "Venda" : "Despesa"}</span></td>
                    <td style={{ fontWeight: 700, color: t.tipo === "venda" ? "var(--green)" : "var(--red)", textAlign: "right" }}>{formatBRL(t.valor)}</td>
                  </tr>
                ))}
                {transacoesFiltradas.length > 15 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text2)", fontSize: 12, padding: 10 }}>... e mais {transacoesFiltradas.length - 15} transações no PDF</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" style={{ padding: "12px 28px", fontSize: 15 }} onClick={gerarPDF}>
          <Icon name="download" size={18} />
          Gerar & Baixar PDF
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
const NAV_BASE = [
  { id: "painel", label: "Painel", icon: "dashboard", group: "Principal" },
  { id: "venda", label: "Nova Venda", icon: "sell", group: "Principal" },
  { id: "despesa", label: "Nova Despesa", icon: "expense", group: "Principal" },
  { id: "transacoes", label: "Transações", icon: "categories", group: "Dados" },
  { id: "estoque", label: "Estoque", icon: "stock", group: "Dados" },
  { id: "clientes", label: "Clientes", icon: "clients", group: "Dados" },
  { id: "categorias", label: "Categorias", icon: "categories", group: "Dados" },
  { id: "relatorio", label: "Relatório PDF", icon: "download", group: "Dados" },
];
const NAV_DONO = [
  { id: "usuarios", label: "Usuários", icon: "clients", group: "Admin" },
];

function Sidebar({ page, onNavigate, onLogout, open, onClose, perfil, isDono }) {
  const navItems = isDono ? [...NAV_BASE, ...NAV_DONO] : NAV_BASE;
  const groups = [...new Set(navItems.map(i => i.group))];
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-img"><img src={logoImg} alt="MG" /></div>
          <div>
            <div className="logo-name">FITMGWEAR</div>
            <div className="logo-sub">Gestão</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {groups.map(g => (
            <div key={g}>
              <div className="nav-label">{g}</div>
              {navItems.filter(i => i.group === g).map(item => (
                <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { onNavigate(item.id); onClose(); }}>
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          {perfil && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 6, background: "var(--surface2)", borderRadius: "var(--radius-sm)", margin: "0 0 8px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: perfil.cargo === "dono" ? "rgba(232,184,75,0.2)" : "rgba(77,166,255,0.15)", color: perfil.cargo === "dono" ? "var(--accent)" : "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {(perfil.nome || "?")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{perfil.nome}</div>
                <div style={{ fontSize: 10, color: perfil.cargo === "dono" ? "var(--accent)" : "var(--blue)", textTransform: "capitalize" }}>{perfil.cargo}</div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", padding: "4px 12px 8px", fontSize: 11, color: "var(--text2)" }}>
            <Icon name="sync" size={12} />
            <span style={{ marginLeft: 6 }}>Firebase — tempo real</span>
            <div className="sync-dot" />
          </div>
          <button className="footer-btn danger" onClick={onLogout}><Icon name="lock" size={14} />Sair</button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────
// FIREBASE HOOKS
// ─────────────────────────────────────────────
const CATEGORIAS_PADRAO = [
  { id: "c1", nome: "Vendas", tipo: "receita", cor: "#3ecf8e" },
  { id: "c2", nome: "Serviços", tipo: "receita", cor: "#4da6ff" },
  { id: "c3", nome: "Aluguel", tipo: "despesa", cor: "#f06060" },
  { id: "c4", nome: "Fornecedores", tipo: "despesa", cor: "#f5a623" },
  { id: "c5", nome: "Funcionários", tipo: "despesa", cor: "#a78bfa" },
  { id: "c6", nome: "Utilidades", tipo: "despesa", cor: "#22d3ee" },
];

function useCollection(colName) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, colName), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [colName]);
  return [items, loading];
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null);       // usuário Firebase Auth
  const [perfil, setPerfil] = useState(null);         // dados do Firestore (cargo, nome)
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("painel");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  // Escutar estado de autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUsuario(u);
      if (u) {
        const snap = await getDocs(collection(db, "usuarios"));
        const perfis = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const p = perfis.find(x => x.uid === u.uid);
        setPerfil(p || { cargo: "funcionario", nome: u.displayName || u.email });
        setPrimeiroAcesso(false);
      } else {
        setPerfil(null);
        // Verificar se existe algum usuário cadastrado
        try {
          const snap = await getDocs(collection(db, "usuarios"));
          setPrimeiroAcesso(snap.empty);
        } catch {
          setPrimeiroAcesso(false);
        }
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const isDono = perfil?.cargo === "dono";

  const [transacoes, loadingT] = useCollection("transacoes");
  const [produtos, loadingP] = useCollection("produtos");
  const [clientes, loadingC] = useCollection("clientes");
  const [categorias, loadingCat] = useCollection("categorias");

  const loading = loadingT || loadingP || loadingC || loadingCat;

  // Se não há categorias, inicializar
  useEffect(() => {
    if (!loadingCat && categorias.length === 0) {
      CATEGORIAS_PADRAO.forEach(c => setDoc(doc(db, "categorias", c.id), c));
    }
  }, [loadingCat, categorias.length]);

  const dados = { transacoes, produtos, clientes, categorias };

  async function handleLogout() {
    await signOut(auth);
    setPage("painel");
  }

  // CRUD — Firebase
  async function adicionarTransacao(t) {
    const id = uid();
    // Garantir que a data seja sempre ISO string completa
    let dataISO = t.data;
    if (dataISO && dataISO.length === 10) {
      // vem como "2025-01-15", converter para ISO com hora local
      dataISO = new Date(dataISO + "T12:00:00").toISOString();
    } else if (!dataISO) {
      dataISO = new Date().toISOString();
    }
    const novaT = { ...t, id, data: dataISO };
    if (t.produtoId && t.tipo === "venda") {
      const prod = produtos.find(p => p.id === t.produtoId);
      if (prod) {
        await setDoc(doc(db, "produtos", prod.id), { ...prod, quantidadeEstoque: Math.max(0, prod.quantidadeEstoque - t.quantidade) });
      }
    }
    await setDoc(doc(db, "transacoes", id), novaT);
    toast(t.tipo === "venda" ? "Venda registrada! ✓" : "Despesa registrada! ✓");
    setPage("transacoes");
  }

  async function removerTransacao(id) { await deleteDoc(doc(db, "transacoes", id)); }

  async function adicionarCliente(c) {
    const id = uid();
    await setDoc(doc(db, "clientes", id), { ...c, id, dataCriacao: new Date().toISOString() });
  }
  async function removerCliente(id) { await deleteDoc(doc(db, "clientes", id)); }

  async function adicionarCategoria(c) {
    const id = uid();
    await setDoc(doc(db, "categorias", id), { ...c, id });
  }
  async function removerCategoria(id) { await deleteDoc(doc(db, "categorias", id)); }

  async function adicionarProduto(p) {
    const id = uid();
    await setDoc(doc(db, "produtos", id), { ...p, id, dataCriacao: new Date().toISOString() });
  }
  async function removerProduto(id) { await deleteDoc(doc(db, "produtos", id)); }
  async function atualizarProduto(id, upd) {
    const prod = produtos.find(p => p.id === id);
    if (prod) await setDoc(doc(db, "produtos", id), { ...prod, ...upd });
  }

  // Aguardar verificação do auth
  if (authLoading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Verificando acesso...</p>
      </div>
    </>
  );

  // Não logado → tela de login
  if (!usuario) return (
    <>
      <style>{CSS}</style>
      <LoginScreen primeiroAcesso={primeiroAcesso} />
      <ToastContainer />
    </>
  );

  // Logado mas dados carregando
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: "var(--text2)", fontSize: 13 }}>Carregando dados...</p>
      </div>
    </>
  );

  function renderPage() {
    if (page === "painel") return <Dashboard dados={dados} />;
    if (page === "venda") return (
      <div>
        <div className="page-header"><div><h1 className="page-title">Registrar Venda</h1><p className="page-sub">Adicione uma nova venda ao caixa</p></div></div>
        <div className="card"><div className="card-body"><FormTransacao tipo="venda" dados={dados} onSalvar={adicionarTransacao} onCancelar={() => setPage("painel")} /></div></div>
      </div>
    );
    if (page === "despesa") return (
      <div>
        <div className="page-header"><div><h1 className="page-title">Registrar Despesa</h1><p className="page-sub">Adicione uma nova despesa</p></div></div>
        <div className="card"><div className="card-body"><FormTransacao tipo="despesa" dados={dados} onSalvar={adicionarTransacao} onCancelar={() => setPage("painel")} /></div></div>
      </div>
    );
    if (page === "transacoes") return <Transacoes dados={dados} onRemover={removerTransacao} />;
    if (page === "estoque") return <Estoque dados={dados} onAdicionar={adicionarProduto} onRemover={removerProduto} onAtualizar={atualizarProduto} />;
    if (page === "clientes") return <Clientes dados={dados} onAdicionar={adicionarCliente} onRemover={removerCliente} />;
    if (page === "categorias") return <Categorias dados={dados} onAdicionar={adicionarCategoria} onRemover={removerCategoria} />;
    if (page === "usuarios" && isDono) return <GerenciarUsuarios usuarioAtual={usuario} />;
    if (page === "relatorio") return <Relatorio dados={dados} />;
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="mobile-navbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Icon name="menu" size={18} />
          </button>
          <div className="mobile-logo">
            <div className="mobile-logo-img"><img src={logoImg} alt="Logo" /></div>
            <span className="mobile-logo-name">FITMGWEAR</span>
          </div>
        </div>
        <Sidebar page={page} onNavigate={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} perfil={perfil} isDono={isDono} />
        <main className="main">
          <div className="page">{renderPage()}</div>
        </main>
      </div>
      <ToastContainer />
    </>
  );
}
