// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
export const CSS = `
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

  .sidebar {
    width: var(--sidebar-w);
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
    z-index: 100;
  }
  .sidebar-logo { padding: 22px 20px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .logo-img { width: 38px; height: 38px; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .logo-img img { width: 100%; height: 100%; object-fit: contain; }
  .logo-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px; color: var(--accent); line-height: 1; }
  .logo-sub { font-size: 10px; color: var(--text2); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

  .sidebar-nav { flex: 1; overflow-y: auto; padding: 14px 10px; }
  .nav-label { font-size: 10px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 1.2px; padding: 10px 10px 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); cursor: pointer; color: var(--text2); font-size: 13.5px; font-weight: 500; transition: all 0.15s; user-select: none; border-left: 2px solid transparent; margin-bottom: 2px; }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: rgba(232,184,75,0.08); color: var(--accent2); border-left-color: var(--accent); }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }

  .sidebar-footer { padding: 12px 10px 16px; border-top: 1px solid var(--border); }
  .footer-btn { display: flex; align-items: center; gap: 9px; padding: 8px 12px; border-radius: var(--radius-sm); cursor: pointer; color: var(--text2); font-size: 12.5px; font-weight: 500; background: none; border: none; width: 100%; text-align: left; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .footer-btn:hover { background: var(--surface2); color: var(--text); }
  .footer-btn.danger:hover { color: var(--red); background: rgba(240,96,96,0.07); }
  .footer-btn svg { width: 14px; height: 14px; }
  .sync-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); margin-left: auto; box-shadow: 0 0 6px var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-width: 0; }
  .page { padding: 36px 48px; flex: 1; max-width: 1600px; width: 100%; margin: 0 auto; }
  .page-header { margin-bottom: 28px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .page-title { font-size: 28px; color: var(--text); line-height: 1; }
  .page-sub { font-size: 13px; color: var(--text2); margin-top: 4px; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .card-header { padding: 18px 20px 0; display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: var(--text2); }
  .card-body { padding: 18px 20px; }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px; }
  .stats-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 18px; position: relative; overflow: hidden; transition: transform 0.15s, box-shadow 0.15s; min-width: 0; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }
  .stat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
  .stat-card.green::after { background: linear-gradient(90deg, var(--green), transparent); }
  .stat-card.red::after   { background: linear-gradient(90deg, var(--red), transparent); }
  .stat-card.blue::after  { background: linear-gradient(90deg, var(--blue), transparent); }
  .stat-card.gold::after  { background: linear-gradient(90deg, var(--accent), transparent); }
  .stat-card.green { border-color: rgba(62,207,142,0.2); }
  .stat-card.red   { border-color: rgba(240,96,96,0.2); }
  .stat-card.blue  { border-color: rgba(77,166,255,0.2); }
  .stat-card.gold  { border-color: rgba(232,184,75,0.2); }
  .stat-label { font-size: 12px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 14px; font-weight: 700; }
  .stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 38px; letter-spacing: 1px; line-height: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .stat-card.green .stat-value { color: var(--green); }
  .stat-card.red .stat-value   { color: var(--red); }
  .stat-card.blue .stat-value  { color: var(--blue); }
  .stat-card.gold .stat-value  { color: var(--accent); }
  .stat-sub { font-size: 12px; color: var(--text2); margin-top: 8px; }

  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 18px; border-radius: var(--radius-sm); font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; text-decoration: none; white-space: nowrap; }
  .btn svg { width: 15px; height: 15px; }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
  .btn-secondary:hover { background: var(--surface3); }
  .btn-success { background: rgba(62,207,142,0.12); color: var(--green); border: 1px solid rgba(62,207,142,0.25); }
  .btn-success:hover { background: rgba(62,207,142,0.22); }
  .btn-danger { background: rgba(240,96,96,0.1); color: var(--red); border: 1px solid rgba(240,96,96,0.2); }
  .btn-danger:hover { background: rgba(240,96,96,0.2); }
  .btn-info { background: rgba(77,166,255,0.1); color: var(--blue); border: 1px solid rgba(77,166,255,0.2); }
  .btn-info:hover { background: rgba(77,166,255,0.2); }
  .btn-whatsapp { background: #25d366; color: #fff; border: none; }
  .btn-whatsapp:hover { background: #20ba57; transform: translateY(-1px); }
  .btn-sm { padding: 6px 13px; font-size: 12px; }
  .btn-icon { padding: 7px; background: var(--surface2); border: 1px solid var(--border); color: var(--text2); border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .btn-icon:hover { color: var(--text); background: var(--surface3); }
  .btn-icon.danger:hover { color: var(--red); background: rgba(240,96,96,0.1); border-color: rgba(240,96,96,0.3); }
  .btn-icon svg { width: 14px; height: 14px; }

  .input-group { display: flex; flex-direction: column; gap: 6px; }
  .input-label { font-size: 11.5px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.6px; }
  .input { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 10px 13px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 13.5px; width: 100%; transition: border-color 0.15s; outline: none; }
  .input:focus { border-color: var(--accent); }
  .input::placeholder { color: var(--text2); }
  select.input { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 30px; }
  textarea.input { resize: vertical; min-height: 80px; }

  .form-grid { display: grid; gap: 16px; }
  .form-grid-2 { grid-template-columns: 1fr 1fr; }
  .form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

  .margem-preview { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .margem-item { display: flex; flex-direction: column; gap: 2px; }
  .margem-item-label { font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; }
  .margem-item-value { font-family: 'Bebas Neue', sans-serif; font-size: 18px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 11px 16px; font-size: 10.5px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.7px; border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 1; }
  td { padding: 13px 16px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.015); }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600; }
  .badge-green  { background: rgba(62,207,142,0.12); color: var(--green); }
  .badge-red    { background: rgba(240,96,96,0.12); color: var(--red); }
  .badge-yellow { background: rgba(245,166,35,0.12); color: var(--yellow); }
  .badge-blue   { background: rgba(77,166,255,0.12); color: var(--blue); }
  .badge-gold   { background: rgba(232,184,75,0.12); color: var(--accent); }
  .badge-purple { background: rgba(167,139,250,0.12); color: #a78bfa; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; animation: fadeIn 0.15s; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius); width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.2s cubic-bezier(.34,1.56,.64,1); }
  .modal-wide { max-width: 760px; }
  .modal-header { padding: 22px 24px 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; }
  .modal-body { padding: 0 24px 24px; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }

  .login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--bg); position:relative; overflow:hidden; }
  .login-bg { position:absolute; inset:0; pointer-events:none; }
  .login-blob { position:absolute; border-radius:50%; filter:blur(90px); opacity:0.18; }
  .login-error { background:rgba(240,96,96,0.1); border:1px solid rgba(240,96,96,0.3); border-radius:var(--radius-sm); padding:10px 14px; font-size:13px; color:var(--red); margin-bottom:16px; }
  .login-card { background:var(--surface); border:1px solid var(--border2); border-radius:16px; padding:44px 40px; width:100%; max-width:420px; position:relative; z-index:1; animation:slideUp 0.4s cubic-bezier(.34,1.56,.64,1); }
  .login-logo { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
  .login-logo-img { width:56px; height:56px; border-radius:12px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .login-logo-img img { width:100%; height:100%; object-fit:contain; }
  .login-logo-text h1 { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:3px; color:var(--accent); line-height:1; }
  .login-logo-text p { font-size:12px; color:var(--text2); margin-top:2px; }

  .toast-container { position:fixed; bottom:24px; right:24px; z-index:999; display:flex; flex-direction:column; gap:8px; }
  .toast { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:12px 16px; font-size:13px; min-width:260px; display:flex; align-items:center; gap:10px; animation:slideUp 0.25s cubic-bezier(.34,1.56,.64,1); box-shadow:0 8px 32px rgba(0,0,0,0.5); }
  .toast-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .toast.success .toast-dot { background:var(--green); }
  .toast.error .toast-dot { background:var(--red); }
  .toast.info .toast-dot { background:var(--blue); }

  .usuarios-grid { display: grid; gap: 12px; }
  .usuario-card { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .usuario-card-top { display: flex; align-items: center; gap: 12px; }
  .usuario-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .usuario-info { flex: 1; min-width: 0; }
  .usuario-nome { font-size: 14px; font-weight: 700; color: var(--text); word-break: break-word; }
  .usuario-email { font-size: 12px; color: var(--text2); word-break: break-all; margin-top: 2px; }
  .usuario-role { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 99px; }
  .role-dono { background: rgba(232,184,75,0.15); color: var(--accent); }
  .role-func { background: rgba(77,166,255,0.12); color: var(--blue); }

  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:99; }
  .sidebar-overlay.visible { display:block; }
  .empty-state { padding:52px; text-align:center; color:var(--text2); }
  .empty-icon { font-size:42px; margin-bottom:12px; opacity:0.45; }
  .empty-text { font-size:14px; }
  .mobile-navbar { display: none; position: fixed; top: 0; left: 0; right: 0; height: 60px; background: var(--surface); border-bottom: 1px solid var(--border); z-index: 101; align-items: center; padding: 0 16px; gap: 12px; }
  .mobile-menu-btn { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 8px; cursor: pointer; color: var(--text); display: flex; align-items: center; justify-content: center; }
  .mobile-logo { display: flex; align-items: center; gap: 10px; flex: 1; }
  .mobile-logo-img { width: 38px; height: 38px; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .mobile-logo-img img { width: 100%; height: 100%; object-fit: contain; }
  .mobile-logo-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px; color: var(--accent); line-height: 1; }
  .mobile-menu-btn svg { width:18px; height:18px; display:block; }
  .confirm-dialog { background:var(--surface); border:1px solid var(--border2); border-radius:var(--radius); padding:26px; max-width:420px; width:100%; }
  .confirm-title { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:1px; margin-bottom:10px; }
  .confirm-text { font-size:13px; color:var(--text2); margin-bottom:22px; }
  .confirm-actions { display:flex; gap:10px; justify-content:flex-end; }
  .product-thumb { width:36px; height:36px; border-radius:8px; background:var(--surface3); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }

  .tags-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .tag-opt { padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--border2); background: var(--surface2); color: var(--text2); transition: all 0.15s; user-select: none; }
  .tag-opt:hover { border-color: var(--accent); color: var(--accent); }
  .tag-opt.selected { background: rgba(232,184,75,0.15); border-color: var(--accent); color: var(--accent); }

  .loading-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; background:var(--bg); }

  /* Tela de abertura do app — fundo branco com a marca em destaque */
  .splash { position:fixed; inset:0; z-index:999; background:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:26px; padding:32px; }
  .splash-logo { width:min(62vw, 300px); height:auto; object-fit:contain; animation:splashIn 0.5s ease-out both; }
  .splash-nome { font-family:'Bebas Neue', sans-serif; font-size:clamp(30px, 8vw, 46px); letter-spacing:4px; color:#111; line-height:1; text-align:center; animation:splashIn 0.5s 0.1s ease-out both; }
  .splash-nome span { color:var(--accent); }
  .splash-spinner { width:26px; height:26px; border:3px solid rgba(0,0,0,0.1); border-top-color:var(--accent); border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes splashIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .spinner { width:32px; height:32px; border:3px solid var(--border2); border-top-color:var(--accent); border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* Fotos do produto (a primeira e a capa da vitrine) */
  .fotos-strip { display:flex; gap:10px; flex-wrap:wrap; }
  .foto-slot { position:relative; width:78px; height:104px; border-radius:8px; overflow:hidden; border:1px solid var(--border2); background:var(--surface2); flex-shrink:0; }
  .foto-slot.capa { border-color:var(--accent); box-shadow:0 0 0 1px var(--accent); }
  .foto-slot img { width:100%; height:100%; object-fit:cover; display:block; }
  .foto-slot.vazio { display:flex; align-items:center; justify-content:center; font-size:26px; color:var(--text2); }
  .foto-capa-tag { position:absolute; top:0; left:0; background:var(--accent); color:#111; font-size:9px; font-weight:800; letter-spacing:0.5px; padding:2px 6px; border-bottom-right-radius:6px; }
  .foto-slot-acoes { position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:center; gap:4px; padding:4px; background:linear-gradient(transparent, rgba(0,0,0,0.65)); }
  .foto-slot-acoes button { border:none; background:rgba(255,255,255,0.9); color:#111; width:24px; height:24px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; }
  .foto-slot-acoes button:hover { background:var(--accent); }
  .foto-slot-acoes button.danger:hover { background:var(--red); color:#fff; }

  .produto-pai-row td { background: var(--surface); }
  .produto-pai-row:hover td { background: rgba(232,184,75,0.03) !important; }
  .produto-expand-btn { background: none; border: 1px solid var(--border2); border-radius: 6px; padding: 4px 8px; cursor: pointer; color: var(--text2); font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; transition: all 0.15s; white-space: nowrap; }
  .produto-expand-btn:hover { border-color: var(--accent); color: var(--accent); }
  .variante-row td { background: rgba(255,255,255,0.015); padding-top: 9px; padding-bottom: 9px; }
  .variante-row:hover td { background: rgba(255,255,255,0.03) !important; }
  .variante-indent { padding-left: 52px !important; }
  .variante-label { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text2); }
  .variante-label-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; background: rgba(77,166,255,0.1); color: var(--blue); border: 1px solid rgba(77,166,255,0.2); }

  .variante-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .variante-item { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 12px 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .variante-item-label { font-size: 13px; font-weight: 700; color: var(--text); flex: 1; min-width: 140px; }
  .variante-item-estoque { font-size: 12px; color: var(--text2); }
  .add-variante-row { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; margin-top: 10px; }

  .variante-grade-section { margin-top: 14px; }
  .variante-grade-label { font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
  .variante-grade-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .variante-chip { padding: 7px 16px; border-radius: 99px; font-size: 13px; font-weight: 700; border: 1.5px solid var(--border2); background: var(--surface2); color: var(--text2); cursor: pointer; transition: all 0.15s; user-select: none; position: relative; }
  .variante-chip:hover:not(.disabled) { border-color: var(--accent); color: var(--accent); }
  .variante-chip.active { border-color: var(--accent); background: rgba(232,184,75,0.12); color: var(--accent); }
  .variante-chip.active-cor { border-color: var(--blue); background: rgba(77,166,255,0.12); color: var(--blue); }
  .variante-chip.disabled { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }
  .variante-chip-estoque { position: absolute; top: -6px; right: -4px; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 99px; background: var(--yellow); color: #000; line-height: 1.4; }
  .variante-chip-estoque.zero { background: var(--red); color: #fff; }
  .variante-resultado { margin-top: 12px; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(232,184,75,0.07); border: 1px solid rgba(232,184,75,0.25); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  .variante-resultado-nome { font-size: 13px; font-weight: 700; color: var(--accent); }

  .info-box { background: rgba(77,166,255,0.07); border: 1px solid rgba(77,166,255,0.2); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12px; color: var(--text2); }
  .warn-box { background: rgba(245,166,35,0.07); border: 1px solid rgba(245,166,35,0.25); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12px; color: var(--yellow); }

  .compra-card { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 16px 18px; display: flex; align-items: flex-start; gap: 14px; transition: box-shadow 0.15s; }
  .compra-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.25); }
  .compra-card-info { flex: 1; min-width: 0; }
  .compra-card-fornecedor { font-size: 14px; font-weight: 700; color: var(--text); }
  .compra-card-valor { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--accent); margin-top: 2px; }
  .compra-card-meta { font-size: 12px; color: var(--text2); margin-top: 4px; }
  .compra-card-obs { font-size: 12px; color: var(--text2); margin-top: 6px; font-style: italic; border-left: 2px solid var(--border2); padding-left: 8px; }
  .compra-card-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
  .compras-pendentes-list { display: flex; flex-direction: column; gap: 10px; }

  /* ── CARRINHO DE COMPRAS ── */
  .cart-section { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 18px; margin-bottom: 20px; }
  .cart-section-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: var(--text2); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .cart-add-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: flex-end; }
  .cart-item-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); margin-top: 8px; }
  .cart-item-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--text); }
  .cart-item-qty { font-size: 12px; color: var(--text2); padding: 3px 10px; background: var(--surface2); border-radius: 99px; }
  .cart-item-price { font-size: 13px; font-weight: 700; color: var(--accent); min-width: 90px; text-align: right; }
  .cart-total-row { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
  .cart-total-label { font-size: 13px; color: var(--text2); font-weight: 700; }
  .cart-total-value { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--accent); }
  .cart-empty { text-align: center; padding: 22px; color: var(--text2); font-size: 13px; }

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
    .stats-grid { grid-template-columns: 1fr; }
    .stats-grid-3 { grid-template-columns: 1fr; }
    .form-grid-2, .form-grid-3 { grid-template-columns:1fr; }
    .cart-add-row { grid-template-columns: 1fr 1fr; }
    .stat-value { font-size: 42px; }
  }
  @media (max-width: 420px) {
    .stat-value { font-size: 36px; }
  }
`;
