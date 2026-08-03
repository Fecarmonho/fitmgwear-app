import { useState, useEffect, useMemo } from "react";
import logoImg from "./logo.png";

import { collection, query, where, doc, onSnapshot, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

import { db, auth } from "./firebase.js";
import { CSS } from "./styles.js";
import { uid, lerImagemComoBase64, formatBRL, formatData, hojeLocal, ordenarVariantes, compararTamanhos } from "./utils.js";
import { Icon } from "./components/Icon.jsx";
import { toast } from "./toast.js";
import { ToastContainer } from "./components/Toast.jsx";
import { Modal, ConfirmDialog } from "./components/Modal.jsx";

// ─────────────────────────────────────────────
// SPLASH — tela de abertura do app
// ─────────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="splash">
      {/* logo-splash: fundo transparente e 512px — o logo-512.png do PWA tem fundo preto */}
      <img src="/logo-splash.png" alt="FIT MG WEAR" className="splash-logo" onError={e => { e.currentTarget.src = logoImg; }} />
      <div className="splash-nome">FITMGWEAR <span>OFICIAL</span></div>
      <div className="splash-spinner" />
    </div>
  );
}

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
      setErro(msgs[err.code] || "Erro ao entrar.");
    } finally { setLoading(false); }
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
      if (data.error) { const msgs = { "EMAIL_EXISTS": "E-mail já cadastrado.", "WEAK_PASSWORD": "Senha fraca." }; throw new Error(msgs[data.error.message] || data.error.message); }
      await setDoc(doc(db, "usuarios", data.localId), { uid: data.localId, nome: nome.trim(), email: email.trim(), cargo: "dono", criadoEm: new Date().toISOString() });
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (err) { setErro(err.message || "Erro ao criar conta."); setLoading(false); }
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
              👋 Primeira vez? Crie a conta do dono.
            </div>
            {erro && <div className="login-error">⚠️ {erro}</div>}
            <form onSubmit={criarDono}>
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="input-group"><label className="input-label">Nome</label><input className="input" placeholder="João Silva" value={nome} onChange={e => setNome(e.target.value)} /></div>
                <div className="input-group"><label className="input-label">E-mail</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div className="input-group"><label className="input-label">Senha</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={show ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}><Icon name={show ? "eyeoff" : "eye"} size={16} /></button>
                  </div>
                </div>
                <div className="input-group"><label className="input-label">Confirmar Senha</label><input className="input" type={show ? "text" : "password"} value={confirmar} onChange={e => setConfirmar(e.target.value)} /></div>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px" }}><Icon name="check" />{loading ? "Criando..." : "Criar Conta"}</button>
              </div>
            </form>
          </>
        ) : (
          <>
            {erro && <div className="login-error">⚠️ {erro}</div>}
            <form onSubmit={entrar}>
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="input-group"><label className="input-label">E-mail</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div className="input-group"><label className="input-label">Senha</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={show ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}><Icon name={show ? "eyeoff" : "eye"} size={16} /></button>
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px" }}><Icon name="lock" />{loading ? "Entrando..." : "Entrar"}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GERENCIAR USUÁRIOS
// ─────────────────────────────────────────────
function GerenciarUsuarios({ usuarioAtual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", cargo: "funcionario" });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [confirmRemover, setConfirmRemover] = useState(null);
  const [modalSenha, setModalSenha] = useState(null);
  const [formSenha, setFormSenha] = useState({ senhaAtual: "", senhaNova: "", confirmar: "" });
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [showSenhas, setShowSenhas] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "usuarios"), snap => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingUsers(false);
    });
    return unsub;
  }, []);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function setSenhaF(k, v) { setFormSenha(p => ({ ...p, [k]: v })); }

  async function criarUsuario(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || form.senha.length < 6)
      return toast("Preencha todos os campos. Senha mínima: 6 caracteres.", "error");
    setLoading(true);
    try {
      const resCriar = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.app.options.apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email.trim(), password: form.senha, returnSecureToken: true }) }
      );
      const dataCriar = await resCriar.json();
      if (dataCriar.error) {
        if (dataCriar.error.message === "EMAIL_EXISTS") {
          const resSignin = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${auth.app.options.apiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email.trim(), password: form.senha, returnSecureToken: true }) }
          );
          const dataSignin = await resSignin.json();
          if (dataSignin.error) { toast("E-mail já registrado com outra senha.", "error"); setLoading(false); return; }
          const localId = dataSignin.localId;
          const jaExiste = usuarios.find(u => u.uid === localId);
          if (jaExiste) { toast(`Este e-mail já está ativo como "${jaExiste.nome}".`, "error"); setLoading(false); return; }
          await setDoc(doc(db, "usuarios", localId), { uid: localId, nome: form.nome.trim(), email: form.email.trim(), cargo: form.cargo, criadoEm: new Date().toISOString(), criadoPor: usuarioAtual?.uid });
          toast(`Usuário ${form.nome} reativado! ✓`);
          setForm({ nome: "", email: "", senha: "", cargo: "funcionario" }); setModal(false); setLoading(false); return;
        }
        const msgs = { "WEAK_PASSWORD": "Senha fraca.", "INVALID_EMAIL": "E-mail inválido." };
        throw new Error(msgs[dataCriar.error.message] || dataCriar.error.message);
      }
      await setDoc(doc(db, "usuarios", dataCriar.localId), { uid: dataCriar.localId, nome: form.nome.trim(), email: form.email.trim(), cargo: form.cargo, criadoEm: new Date().toISOString(), criadoPor: usuarioAtual?.uid });
      toast(`Usuário ${form.nome} criado! ✓`);
      setForm({ nome: "", email: "", senha: "", cargo: "funcionario" }); setModal(false);
    } catch (err) { toast(err.message || "Erro ao criar usuário.", "error"); }
    finally { setLoading(false); }
  }

  async function alterarSenha(e) {
    e.preventDefault();
    if (!formSenha.senhaAtual) return toast("Informe a senha atual.", "error");
    if (formSenha.senhaNova.length < 6) return toast("Nova senha mínimo 6 caracteres.", "error");
    if (formSenha.senhaNova !== formSenha.confirmar) return toast("As senhas não conferem.", "error");
    setLoadingSenha(true);
    try {
      const resLogin = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${auth.app.options.apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: modalSenha.email, password: formSenha.senhaAtual, returnSecureToken: true }) }
      );
      const dataLogin = await resLogin.json();
      if (dataLogin.error) { const msgs = { "INVALID_PASSWORD": "Senha atual incorreta.", "INVALID_LOGIN_CREDENTIALS": "Senha atual incorreta." }; throw new Error(msgs[dataLogin.error.message] || "Senha atual incorreta."); }
      const resUpdate = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${auth.app.options.apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: dataLogin.idToken, password: formSenha.senhaNova, returnSecureToken: true }) }
      );
      const dataUpdate = await resUpdate.json();
      if (dataUpdate.error) throw new Error("Erro ao atualizar senha.");
      toast(`Senha de "${modalSenha.nome}" alterada! ✓`);
      setModalSenha(null); setFormSenha({ senhaAtual: "", senhaNova: "", confirmar: "" });
    } catch (err) { toast(err.message || "Erro ao alterar senha.", "error"); }
    finally { setLoadingSenha(false); }
  }

  async function confirmarRemover() {
    if (!confirmRemover) return;
    await deleteDoc(doc(db, "usuarios", confirmRemover.id));
    toast(`"${confirmRemover.nome}" removido.`);
    setConfirmRemover(null);
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Usuários</h1><p className="page-sub">Gerencie quem tem acesso ao sistema</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" />Novo Usuário</button>
      </div>
      <div className="card"><div className="card-body">
        {loadingUsers
          ? <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>Carregando...</div>
          : usuarios.length === 0
            ? <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">Nenhum usuário</div></div>
            : <div className="usuarios-grid">
              {usuarios.map(u => (
                <div key={u.id} className="usuario-card">
                  <div className="usuario-card-top">
                    <div className="usuario-avatar" style={{ background: u.cargo === "dono" ? "rgba(232,184,75,0.15)" : "rgba(77,166,255,0.12)", color: u.cargo === "dono" ? "var(--accent)" : "var(--blue)" }}>
                      {(u.nome || "?")[0].toUpperCase()}
                    </div>
                    <div className="usuario-info">
                      <div className="usuario-nome">{u.nome}</div>
                      <div className="usuario-email">{u.email}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <span className={`usuario-role ${u.cargo === "dono" ? "role-dono" : "role-func"}`} style={{ alignSelf: "flex-start" }}>
                      {u.cargo === "dono" ? "👑 Dono" : "👤 Funcionário"}
                    </span>
                    {u.uid === usuarioAtual?.uid
                      ? <span style={{ fontSize: 11, color: "var(--text2)", padding: "4px 8px", borderRadius: 99, background: "var(--surface3)", alignSelf: "flex-start" }}>Você</span>
                      : <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn btn-sm btn-info" style={{ flex: 1 }} onClick={() => { setModalSenha(u); setFormSenha({ senhaAtual: "", senhaNova: "", confirmar: "" }); setShowSenhas(false); }}>🔑 Alterar Senha</button>
                        <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => setConfirmRemover({ id: u.id, uid: u.uid, nome: u.nome })}><Icon name="trash" size={13} />Remover</button>
                      </div>
                    }
                  </div>
                </div>
              ))}
            </div>
        }
      </div></div>

      <Modal open={modal} onClose={() => { setModal(false); setForm({ nome: "", email: "", senha: "", cargo: "funcionario" }); }} title="Novo Usuário">
        <form onSubmit={criarUsuario}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="input-group"><label className="input-label">Nome</label><input className="input" value={form.nome} onChange={e => set("nome", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">E-mail</label><input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Senha</label><input className="input" type="password" value={form.senha} onChange={e => set("senha", e.target.value)} placeholder="Mínimo 6 caracteres" /></div>
            <div className="input-group"><label className="input-label">Cargo</label>
              <select className="input" value={form.cargo} onChange={e => set("cargo", e.target.value)}>
                <option value="funcionario">Funcionário</option>
                <option value="dono">Dono / Admin</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Processando..." : "Criar"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!modalSenha} onClose={() => setModalSenha(null)} title={`Alterar Senha — ${modalSenha?.nome || ""}`}>
        <form onSubmit={alterarSenha}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Senha Atual</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={showSenhas ? "text" : "password"} value={formSenha.senhaAtual} onChange={e => setSenhaF("senhaAtual", e.target.value)} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowSenhas(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}><Icon name={showSenhas ? "eyeoff" : "eye"} size={16} /></button>
              </div>
            </div>
            <div className="input-group"><label className="input-label">Nova Senha</label><input className="input" type={showSenhas ? "text" : "password"} value={formSenha.senhaNova} onChange={e => setSenhaF("senhaNova", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Confirmar Nova Senha</label><input className="input" type={showSenhas ? "text" : "password"} value={formSenha.confirmar} onChange={e => setSenhaF("confirmar", e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalSenha(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loadingSenha}>{loadingSenha ? "Alterando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmRemover} title="Remover Usuário?" text={`"${confirmRemover?.nome}" perderá o acesso.`} danger onConfirm={confirmarRemover} onCancel={() => setConfirmRemover(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// RELATÓRIO PDF — VERSÃO COMPLETA
// ─────────────────────────────────────────────
function RelatorioPDF({ dados }) {
  const transacoes = dados.transacoes || [];
  const produtos = dados.produtos || [];
  const variantesProduto = dados.variantesProduto || [];
  const compras = dados.compras || [];

  const [mes, setMes] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const transacoesFiltradas = useMemo(() =>
    transacoes.filter(t => t.data && t.data.startsWith(mes)).sort((a, b) => new Date(a.data) - new Date(b.data)),
    [transacoes, mes]);

  const vendasMes = useMemo(() => transacoesFiltradas.filter(t => t.tipo === "venda"), [transacoesFiltradas]);
  const despesasMesArr = useMemo(() => transacoesFiltradas.filter(t => t.tipo === "despesa"), [transacoesFiltradas]);
  const receitasMes = useMemo(() => vendasMes.reduce((s, t) => s + t.valor, 0), [vendasMes]);
  const despesasMes = useMemo(() => despesasMesArr.reduce((s, t) => s + t.valor, 0), [despesasMesArr]);
  const saldoMes = receitasMes - despesasMes;
  const qtdVendas = vendasMes.length;
  const ticketMedio = qtdVendas > 0 ? receitasMes / qtdVendas : 0;
  const maiorVenda = vendasMes.length > 0 ? Math.max(...vendasMes.map(t => t.valor)) : 0;
  const percentLucroDespesa = despesasMes > 0 ? ((saldoMes / despesasMes) * 100).toFixed(1) : receitasMes > 0 ? "∞" : "0.0";

  const comprasMes = useMemo(() => compras.filter(c => c.data && c.data.startsWith(mes)), [compras, mes]);
  const totalComprasMes = comprasMes.reduce((s, c) => s + c.valor, 0);
  const comprasPendentesMes = comprasMes.filter(c => c.status === "aguardando").length;

  // Vendas por dia (para gráfico)
  const [ano, mesNum] = mes.split("-");
  const diasNoMes = new Date(parseInt(ano), parseInt(mesNum), 0).getDate();
  const vendasPorDia = useMemo(() => {
    const map = {};
    for (let d = 1; d <= diasNoMes; d++) map[d] = 0;
    vendasMes.forEach(t => {
      const dia = parseInt(t.data.slice(8, 10));
      if (dia) map[dia] = (map[dia] || 0) + t.valor;
    });
    return map;
  }, [vendasMes, diasNoMes]);

  // Ranking de produtos mais vendidos
  const rankingProdutos = useMemo(() => {
    const map = {};
    vendasMes.forEach(t => {
      if (t.itens && Array.isArray(t.itens)) {
        t.itens.forEach(item => {
          const key = item.produtoId || item.label || "Outros";
          const nome = item.label || item.descricao || "Produto";
          if (!map[key]) map[key] = { nome, quantidade: 0, valor: 0 };
          map[key].quantidade += item.quantidade || 1;
          map[key].valor += item.subtotal || 0;
        });
      } else {
        const key = t.descricao || "Outros";
        if (!map[key]) map[key] = { nome: key, quantidade: 0, valor: 0 };
        map[key].quantidade += t.quantidade || 1;
        map[key].valor += t.valor || 0;
      }
    });
    return Object.values(map).sort((a, b) => b.valor - a.valor).slice(0, 10);
  }, [vendasMes]);

  const produtosAbaixo = [];
  produtos.forEach(p => {
    const vars = variantesProduto.filter(v => v.produtoPaiId === p.id);
    if (vars.length > 0) { vars.forEach(v => { if (v.estoque <= (p.quantidadeMinima || 5)) produtosAbaixo.push({ nome: `${p.nome} (${v.label})`, estoque: v.estoque }); }); }
    else { if (p.quantidadeEstoque <= p.quantidadeMinima) produtosAbaixo.push({ nome: p.nome, estoque: p.quantidadeEstoque }); }
  });

  function gerarPDF() {
    const nomeMes = new Date(parseInt(ano), parseInt(mesNum) - 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    const pctColor = saldoMes >= 0 ? "#16a34a" : "#dc2626";
    const hoje = new Date().toLocaleDateString("pt-BR");

    // ── Gráfico SVG de barras diárias ──
    const maxVal = Math.max(...Object.values(vendasPorDia), 1);
    const barW = 14;
    const gap = 3;
    const chartH = 100;
    const chartW = diasNoMes * (barW + gap);
    const barsSVG = Object.entries(vendasPorDia).map(([dia, val]) => {
      const h = val > 0 ? Math.max(4, (val / maxVal) * chartH) : 2;
      const x = (parseInt(dia) - 1) * (barW + gap);
      const y = chartH - h;
      const cor = val > 0 ? "#e8b84b" : "#e5e7eb";
      return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${cor}"/>${val > 0 ? `<text x="${x + barW / 2}" y="${y - 3}" text-anchor="middle" font-size="7" fill="#666">${formatBRL(val).replace("R$\u00a0","").replace("R$ ","")}</text>` : ""}`;
    }).join("");
    const labelsSVG = Object.keys(vendasPorDia).filter(d => parseInt(d) % 5 === 0 || parseInt(d) === 1).map(dia => {
      const x = (parseInt(dia) - 1) * (barW + gap) + barW / 2;
      return `<text x="${x}" y="${chartH + 12}" text-anchor="middle" font-size="8" fill="#888">${dia}</text>`;
    }).join("");
    const svgGrafico = `<svg xmlns="http://www.w3.org/2000/svg" width="${chartW}" height="${chartH + 20}" viewBox="0 0 ${chartW} ${chartH + 20}">${barsSVG}${labelsSVG}</svg>`;
    const svgBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgGrafico)))}`;

    // ── Ranking HTML ──
    const rankingLinhas = rankingProdutos.length === 0
      ? "<tr><td colspan='4' style='color:#aaa;text-align:center'>Nenhuma venda registrada com produtos</td></tr>"
      : rankingProdutos.map((p, i) => {
        const pct = receitasMes > 0 ? ((p.valor / receitasMes) * 100).toFixed(1) : "0.0";
        const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
        const barPct = rankingProdutos[0].valor > 0 ? (p.valor / rankingProdutos[0].valor * 100).toFixed(0) : 0;
        return `<tr>
          <td style="font-weight:700;font-size:13px">${medalha}</td>
          <td>
            <div style="font-weight:600;font-size:12px">${p.nome}</div>
            <div style="background:#f3f4f6;border-radius:99px;height:5px;margin-top:4px;overflow:hidden">
              <div style="background:#e8b84b;height:5px;width:${barPct}%;border-radius:99px"></div>
            </div>
          </td>
          <td style="text-align:center;font-weight:600;color:#374151">${p.quantidade} un.</td>
          <td style="text-align:right;font-weight:700;color:#16a34a">${formatBRL(p.valor)}<div style="font-size:10px;color:#9ca3af">${pct}% do total</div></td>
        </tr>`;
      }).join("");

    // ── Transações ──
    const linhasT = [...transacoesFiltradas].reverse().map(t =>
      `<tr><td style="color:#6b7280;white-space:nowrap">${formatData(t.data)}</td><td>${t.descricao || "—"}</td><td><span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background:${t.tipo === "venda" ? "#dcfce7" : "#fee2e2"};color:${t.tipo === "venda" ? "#16a34a" : "#dc2626"}">${t.tipo === "venda" ? "Venda" : "Despesa"}</span></td><td style="text-align:right;font-weight:700;color:${t.tipo === "venda" ? "#16a34a" : "#dc2626"}">${formatBRL(t.valor)}</td></tr>`
    ).join("");

    // ── Estoque ──
    const linhasProd = produtos.map(p => {
      const vars = variantesProduto.filter(v => v.produtoPaiId === p.id);
      const estoqueTotal = vars.length > 0 ? vars.reduce((s, v) => s + (v.estoque || 0), 0) : p.quantidadeEstoque;
      const margem = p.precoCompra > 0 ? ((p.precoVenda - p.precoCompra) / p.precoCompra * 100).toFixed(0) : "—";
      const baixo = estoqueTotal <= p.quantidadeMinima;
      return `<tr style="background:${baixo ? "#fffbeb" : "#fff"}"><td style="font-weight:600">${p.nome}${p.sku ? `<div style="font-size:10px;color:#9ca3af">SKU: ${p.sku}</div>` : ""}</td><td style="text-align:center;font-weight:700;color:${baixo ? "#d97706" : "#16a34a"}">${estoqueTotal}</td><td style="text-align:right">${formatBRL(p.precoVenda)}</td><td style="text-align:center"><span style="padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background:${margem !== "—" && parseInt(margem) > 30 ? "#dcfce7" : "#fef9c3"};color:${margem !== "—" && parseInt(margem) > 30 ? "#16a34a" : "#d97706"}">${margem}%</span></td></tr>`;
    }).join("");

    // ── Compras ──
    const linhasCompras = comprasMes.map(c =>
      `<tr><td style="color:#6b7280">${formatData(c.data)}</td><td>${c.fornecedor}</td><td style="text-align:right;font-weight:700;color:#e8b84b">${formatBRL(c.valor)}</td><td style="color:${c.status === "recebido" ? "#16a34a" : "#d97706"}">${c.status === "recebido" ? "✓ Recebido" : "⏳ Aguardando"}</td></tr>`
    ).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório FitMGwear — ${nomeMesCap}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111827;background:#fff;padding:0}
  .page{padding:36px 40px}
  /* HEADER */
  .report-header{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:20px;border-bottom:3px solid #e8b84b;margin-bottom:28px}
  .brand h1{font-size:30px;font-weight:900;letter-spacing:4px;color:#e8b84b;line-height:1}
  .brand p{font-size:12px;color:#6b7280;margin-top:3px;letter-spacing:1px}
  .report-meta{text-align:right}
  .report-meta .period{font-size:18px;font-weight:800;color:#111827;line-height:1}
  .report-meta .generated{font-size:11px;color:#9ca3af;margin-top:3px}
  /* SECTION */
  .section{margin-bottom:32px}
  .section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:7px;margin-bottom:16px;display:flex;align-items:center;gap:7px}
  .section-title span{font-size:15px}
  /* KPI GRID */
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:8px}
  .kpi{border-radius:10px;padding:16px 18px;border:1px solid #e5e7eb;position:relative;overflow:hidden}
  .kpi::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;border-radius:0 0 10px 10px}
  .kpi-green{border-color:#bbf7d0}.kpi-green::after{background:#16a34a}
  .kpi-red{border-color:#fecaca}.kpi-red::after{background:#dc2626}
  .kpi-blue{border-color:#bfdbfe}.kpi-blue::after{background:#2563eb}
  .kpi-gold{border-color:#fde68a}.kpi-gold::after{background:#e8b84b}
  .kpi-purple{border-color:#e9d5ff}.kpi-purple::after{background:#7c3aed}
  .kpi-teal{border-color:#99f6e4}.kpi-teal::after{background:#0d9488}
  .kpi-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;margin-bottom:8px}
  .kpi-value{font-size:22px;font-weight:900;line-height:1;letter-spacing:-0.5px}
  .kpi-sub{font-size:10px;color:#9ca3af;margin-top:4px}
  .kpi-green .kpi-value{color:#16a34a}
  .kpi-red .kpi-value{color:#dc2626}
  .kpi-blue .kpi-value{color:#2563eb}
  .kpi-gold .kpi-value{color:#e8b84b}
  .kpi-purple .kpi-value{color:#7c3aed}
  .kpi-teal .kpi-value{color:#0d9488}
  /* CHART */
  .chart-wrap{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px}
  .chart-title{font-size:11px;font-weight:700;color:#374151;margin-bottom:12px}
  .chart-img{width:100%;overflow-x:auto}
  /* TABLE */
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:9px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;background:#f9fafb;border-bottom:2px solid #e5e7eb;color:#6b7280}
  td{padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#fafafa}
  .tfoot-row td{background:#f9fafb;font-weight:700;border-top:2px solid #e8b84b;font-size:12px}
  /* ALERT */
  .alert{border-radius:8px;padding:10px 14px;font-size:11px;margin-bottom:16px}
  .alert-warn{background:#fffbeb;border:1px solid #fbbf24;color:#92400e}
  /* FOOTER */
  .report-footer{margin-top:36px;padding-top:14px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af}
  /* TOC */
  .toc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:28px}
  .toc-item{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;font-size:11px;color:#374151;font-weight:600}
  .toc-item span{font-size:16px;margin-right:6px}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="report-header">
    <div class="brand">
      <h1>FITMGWEAR</h1>
      <p>Relatório Financeiro Mensal</p>
    </div>
    <div class="report-meta">
      <div class="period">${nomeMesCap}</div>
      <div class="generated">Gerado em ${hoje}</div>
    </div>
  </div>

  <!-- ÍNDICE -->
  <div class="toc">
    <div class="toc-item"><span>📊</span>Índice de Vendas</div>
    <div class="toc-item"><span>📈</span>Gráfico Diário</div>
    <div class="toc-item"><span>🏆</span>Produtos Mais Vendidos</div>
    <div class="toc-item"><span>💳</span>Transações</div>
    <div class="toc-item"><span>📦</span>Estoque Atual</div>
    <div class="toc-item"><span>🛒</span>Compras do Mês</div>
  </div>

  <!-- 1. ÍNDICE DE VENDAS -->
  <div class="section">
    <div class="section-title"><span>📊</span>1. Índice de Vendas — Resumo Geral</div>
    <div class="kpi-grid">
      <div class="kpi kpi-green">
        <div class="kpi-label">Total Vendido</div>
        <div class="kpi-value">${formatBRL(receitasMes)}</div>
        <div class="kpi-sub">receitas do mês</div>
      </div>
      <div class="kpi kpi-red">
        <div class="kpi-label">Total Despesas</div>
        <div class="kpi-value">${formatBRL(despesasMes)}</div>
        <div class="kpi-sub">gastos do mês</div>
      </div>
      <div class="kpi kpi-blue">
        <div class="kpi-label">Saldo Líquido</div>
        <div class="kpi-value" style="color:${pctColor}">${formatBRL(saldoMes)}</div>
        <div class="kpi-sub">${saldoMes >= 0 ? "lucro" : "prejuízo"}</div>
      </div>
      <div class="kpi kpi-gold">
        <div class="kpi-label">Lucro / Despesa</div>
        <div class="kpi-value" style="color:${pctColor}">${percentLucroDespesa}${percentLucroDespesa !== "∞" ? "%" : ""}</div>
        <div class="kpi-sub">índice de eficiência</div>
      </div>
    </div>
    <div class="kpi-grid" style="margin-top:12px">
      <div class="kpi kpi-teal">
        <div class="kpi-label">Nº de Vendas</div>
        <div class="kpi-value">${qtdVendas}</div>
        <div class="kpi-sub">transações de venda</div>
      </div>
      <div class="kpi kpi-purple">
        <div class="kpi-label">Ticket Médio</div>
        <div class="kpi-value">${formatBRL(ticketMedio)}</div>
        <div class="kpi-sub">por venda</div>
      </div>
      <div class="kpi kpi-gold">
        <div class="kpi-label">Maior Venda</div>
        <div class="kpi-value">${formatBRL(maiorVenda)}</div>
        <div class="kpi-sub">maior transação</div>
      </div>
      <div class="kpi kpi-blue">
        <div class="kpi-label">Compras</div>
        <div class="kpi-value" style="color:#7c3aed">${formatBRL(totalComprasMes)}</div>
        <div class="kpi-sub">${comprasMes.length} pedido${comprasMes.length !== 1 ? "s" : ""}${comprasPendentesMes > 0 ? ` · ${comprasPendentesMes} pendente${comprasPendentesMes !== 1 ? "s" : ""}` : ""}</div>
      </div>
    </div>
  </div>

  <!-- 2. GRÁFICO DIÁRIO -->
  <div class="section">
    <div class="section-title"><span>📈</span>2. Gráfico de Vendas — Por Dia</div>
    <div class="chart-wrap">
      <div class="chart-title">Receitas diárias em ${nomeMesCap} (R$)</div>
      <div class="chart-img">
        <img src="${svgBase64}" style="max-width:100%;height:auto" />
      </div>
      <div style="display:flex;gap:24px;margin-top:12px;font-size:10px;color:#6b7280">
        <span>🟡 Dias com vendas &nbsp;&nbsp; ⬜ Dias sem vendas</span>
        <span style="margin-left:auto">Total de dias com venda: <strong>${Object.values(vendasPorDia).filter(v => v > 0).length}</strong> de ${diasNoMes}</span>
      </div>
    </div>
  </div>

  <!-- 3. RANKING PRODUTOS -->
  <div class="section">
    <div class="section-title"><span>🏆</span>3. Produtos Mais Vendidos</div>
    ${rankingProdutos.length === 0
      ? "<p style='color:#aaa;font-size:12px'>Nenhuma venda com produtos vinculados neste período.</p>"
      : `<table>
          <thead><tr><th>#</th><th>Produto</th><th style="text-align:center">Quantidade</th><th style="text-align:right">Valor Total</th></tr></thead>
          <tbody>${rankingLinhas}</tbody>
          <tfoot><tr class="tfoot-row"><td colspan="2">Total (top ${rankingProdutos.length})</td><td style="text-align:center">${rankingProdutos.reduce((s, p) => s + p.quantidade, 0)} un.</td><td style="text-align:right;color:#16a34a">${formatBRL(rankingProdutos.reduce((s, p) => s + p.valor, 0))}</td></tr></tfoot>
        </table>`
    }
  </div>

  <!-- 4. TRANSAÇÕES -->
  <div class="section">
    <div class="section-title"><span>💳</span>4. Transações do Mês (${transacoesFiltradas.length})</div>
    ${produtosAbaixo.length > 0 ? `<div class="alert alert-warn">⚠️ Estoque crítico: ${produtosAbaixo.map(p => `<strong>${p.nome}</strong> (${p.estoque} un.)`).join(", ")}</div>` : ""}
    ${transacoesFiltradas.length === 0
      ? "<p style='color:#aaa;font-size:12px'>Nenhuma transação neste mês.</p>"
      : `<table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th style="text-align:right">Valor</th></tr></thead>
          <tbody>${linhasT}</tbody>
          <tfoot>
            <tr class="tfoot-row"><td colspan="2">Receitas</td><td></td><td style="text-align:right;color:#16a34a">${formatBRL(receitasMes)}</td></tr>
            <tr class="tfoot-row"><td colspan="2">Despesas</td><td></td><td style="text-align:right;color:#dc2626">${formatBRL(despesasMes)}</td></tr>
          </tfoot>
        </table>`
    }
  </div>

  <!-- 5. ESTOQUE -->
  <div class="section">
    <div class="section-title"><span>📦</span>5. Estoque Atual (${produtos.length} produtos)</div>
    ${produtos.length === 0
      ? "<p style='color:#aaa;font-size:12px'>Nenhum produto cadastrado.</p>"
      : `<table>
          <thead><tr><th>Produto</th><th style="text-align:center">Estoque</th><th style="text-align:right">Preço Venda</th><th style="text-align:center">Margem</th></tr></thead>
          <tbody>${linhasProd}</tbody>
        </table>`
    }
  </div>

  <!-- 6. COMPRAS -->
  <div class="section">
    <div class="section-title"><span>🛒</span>6. Compras do Mês (${comprasMes.length})</div>
    ${comprasMes.length === 0
      ? "<p style='color:#aaa;font-size:12px'>Nenhuma compra neste mês.</p>"
      : `<table>
          <thead><tr><th>Data</th><th>Fornecedor</th><th style="text-align:right">Valor</th><th>Status</th></tr></thead>
          <tbody>${linhasCompras}</tbody>
          <tfoot><tr class="tfoot-row"><td colspan="2">Total</td><td style="text-align:right;color:#e8b84b">${formatBRL(totalComprasMes)}</td><td>${comprasPendentesMes > 0 ? `⏳ ${comprasPendentesMes} aguardando` : "✓ Todos recebidos"}</td></tr></tfoot>
        </table>`
    }
  </div>

  <!-- FOOTER -->
  <div class="report-footer">
    <span>FitMGwear — Sistema de Gestão</span>
    <span>Relatório referente a ${nomeMesCap}</span>
    <span>Gerado em ${hoje}</span>
  </div>

</div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Relatório PDF</h1><p className="page-sub">Relatório financeiro completo com gráfico e ranking</p></div>
        <button className="btn btn-primary" onClick={gerarPDF}><Icon name="download" />Gerar e Imprimir PDF</button>
      </div>

      {/* Preview dos dados no app */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="input-group" style={{ minWidth: 200 }}>
              <label className="input-label">Mês de referência</label>
              <input className="input" type="month" value={mes} onChange={e => setMes(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 20 }}>
              <div style={{ fontSize: 13 }}><span style={{ color: "var(--text2)" }}>Receitas: </span><span style={{ color: "var(--green)", fontWeight: 700 }}>{formatBRL(receitasMes)}</span></div>
              <div style={{ fontSize: 13 }}><span style={{ color: "var(--text2)" }}>Despesas: </span><span style={{ color: "var(--red)", fontWeight: 700 }}>{formatBRL(despesasMes)}</span></div>
              <div style={{ fontSize: 13 }}><span style={{ color: "var(--text2)" }}>Saldo: </span><span style={{ color: saldoMes >= 0 ? "var(--blue)" : "var(--red)", fontWeight: 700 }}>{formatBRL(saldoMes)}</span></div>
              <div style={{ fontSize: 13 }}><span style={{ color: "var(--text2)" }}>Vendas: </span><span style={{ fontWeight: 700 }}>{qtdVendas}</span></div>
              <div style={{ fontSize: 13 }}><span style={{ color: "var(--text2)" }}>Ticket médio: </span><span style={{ color: "var(--accent)", fontWeight: 700 }}>{formatBRL(ticketMedio)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking preview */}
      {rankingProdutos.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header" style={{ padding: "16px 20px 12px" }}><span className="card-title">🏆 Top Produtos do Mês</span></div>
          <div className="table-wrap">
            <table><thead><tr><th>#</th><th>Produto</th><th style={{ textAlign: "center" }}>Qtd</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
              <tbody>{rankingProdutos.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text2)" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`}</td>
                  <td style={{ fontWeight: 600 }}>{p.nome}</td>
                  <td style={{ textAlign: "center", color: "var(--text2)" }}>{p.quantidade} un.</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--green)" }}>{formatBRL(p.valor)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ padding: "18px 20px 14px" }}><span className="card-title">Transações ({transacoesFiltradas.length})</span></div>
        <div className="table-wrap">
          {transacoesFiltradas.length === 0
            ? <div className="empty-state"><div className="empty-icon">📄</div><div className="empty-text">Nenhuma transação neste mês</div></div>
            : <table><thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
              <tbody>{[...transacoesFiltradas].reverse().map(t => (
                <tr key={t.id}>
                  <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatData(t.data)}</td>
                  <td>{t.descricao}</td>
                  <td><span className={`badge ${t.tipo === "venda" ? "badge-green" : "badge-red"}`}>{t.tipo === "venda" ? "Venda" : "Despesa"}</span></td>
                  <td style={{ fontWeight: 700, color: t.tipo === "venda" ? "var(--green)" : "var(--red)", textAlign: "right" }}>{formatBRL(t.valor)}</td>
                </tr>
              ))}</tbody></table>
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BALANÇO DE ESTOQUE PDF  ← NOVO
// ─────────────────────────────────────────────
function gerarBalancoPDF(produtos, variantesProduto) {
  const dataHoje = new Date().toLocaleDateString("pt-BR");
  const horaHoje = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  let totalPecas = 0;
  let totalCustoEstoque = 0;
  let totalValorVenda = 0;

  const linhasProdutos = produtos.map(p => {
    const vars = ordenarVariantes(variantesProduto.filter(v => v.produtoPaiId === p.id));
    const temVars = vars.length > 0;
    const estoqueTotal = temVars ? vars.reduce((s, v) => s + (v.estoque || 0), 0) : p.quantidadeEstoque;
    const custoTotal = estoqueTotal * p.precoCompra;
    const valorVendaTotal = estoqueTotal * p.precoVenda;
    const margem = p.precoCompra > 0 ? ((p.precoVenda - p.precoCompra) / p.precoCompra * 100).toFixed(0) : "—";
    const baixo = estoqueTotal <= p.quantidadeMinima;

    totalPecas += estoqueTotal;
    totalCustoEstoque += custoTotal;
    totalValorVenda += valorVendaTotal;

    const varLinhas = temVars
      ? vars.map(v => `<tr style="background:#fafafa"><td style="padding-left:32px;font-size:10px;color:#666">↳ ${v.label}</td><td></td><td style="text-align:center;font-size:11px">${v.estoque}</td><td></td><td></td><td></td><td></td></tr>`).join("")
      : "";

    return `
      <tr style="background:${baixo ? "#fffbeb" : "#fff"}">
        <td style="font-weight:700">${p.nome}${p.sku ? `<br><span style="font-size:10px;color:#999">SKU: ${p.sku}</span>` : ""}</td>
        <td style="text-align:center">${temVars ? `<span style="font-size:10px;color:#666">${vars.length} var.</span>` : "—"}</td>
        <td style="text-align:center;font-weight:700;color:${baixo ? "#d97706" : "#16a34a"}">${estoqueTotal}</td>
        <td style="text-align:right">${formatBRL(p.precoCompra)}</td>
        <td style="text-align:right">${formatBRL(p.precoVenda)}</td>
        <td style="text-align:right;font-weight:600;color:#9333ea">${formatBRL(custoTotal)}</td>
        <td style="text-align:right;font-weight:600;color:#16a34a">${formatBRL(valorVendaTotal)}</td>
        <td style="text-align:center"><span style="background:${margem !== "—" && parseInt(margem) > 30 ? "#dcfce7" : margem !== "—" && parseInt(margem) > 10 ? "#fef9c3" : "#fee2e2"};color:${margem !== "—" && parseInt(margem) > 30 ? "#16a34a" : margem !== "—" && parseInt(margem) > 10 ? "#d97706" : "#dc2626"};padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700">${margem}%</span></td>
      </tr>
      ${varLinhas}
    `;
  }).join("");

  const lucroEstoque = totalValorVenda - totalCustoEstoque;
  const margemGeral = totalCustoEstoque > 0 ? ((lucroEstoque / totalCustoEstoque) * 100).toFixed(1) : "0.0";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Balanço de Estoque — FitMGwear</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #e8b84b; }
  h1 { font-size: 28px; font-weight: 900; letter-spacing: 3px; color: #e8b84b; line-height: 1; }
  .sub { font-size: 13px; color: #666; margin-top: 4px; }
  .date { text-align: right; font-size: 11px; color: #666; }
  .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
  .stat { padding: 16px; border-radius: 10px; border: 1px solid #e5e7eb; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 6px; font-weight: 700; }
  .stat-value { font-size: 22px; font-weight: 900; line-height: 1; }
  .stat-sub { font-size: 10px; color: #9ca3af; margin-top: 4px; }
  .green { color: #16a34a; } .red { color: #dc2626; } .blue { color: #2563eb; } .gold { color: #d97706; } .purple { color: #7c3aed; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 22px 0 10px; color: #374151; border-bottom: 2px solid #e8b84b; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 9px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #f9fafb; border-bottom: 2px solid #e5e7eb; color: #6b7280; letter-spacing: 0.5px; }
  td { padding: 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; vertical-align: middle; }
  .total-row td { background: #f9fafb; font-weight: 700; border-top: 2px solid #e8b84b; font-size: 12px; }
  .aviso { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px; padding: 10px 14px; font-size: 11px; color: #92400e; margin-bottom: 16px; }
  .footer { margin-top: 32px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>FITMGWEAR</h1>
    <div class="sub">Balanço de Estoque</div>
  </div>
  <div class="date">Gerado em: ${dataHoje} às ${horaHoje}</div>
</div>

<div class="stats">
  <div class="stat">
    <div class="stat-label">Total de Produtos</div>
    <div class="stat-value blue">${produtos.length}</div>
    <div class="stat-sub">itens cadastrados</div>
  </div>
  <div class="stat">
    <div class="stat-label">Peças em Estoque</div>
    <div class="stat-value green">${totalPecas}</div>
    <div class="stat-sub">unidades disponíveis</div>
  </div>
  <div class="stat">
    <div class="stat-label">Custo Total Estoque</div>
    <div class="stat-value purple">${formatBRL(totalCustoEstoque)}</div>
    <div class="stat-sub">valor investido</div>
  </div>
  <div class="stat">
    <div class="stat-label">Valor de Venda Total</div>
    <div class="stat-value green">${formatBRL(totalValorVenda)}</div>
    <div class="stat-sub">se vender tudo</div>
  </div>
</div>

<div class="stats" style="grid-template-columns:repeat(2,1fr)">
  <div class="stat">
    <div class="stat-label">Lucro Potencial</div>
    <div class="stat-value ${lucroEstoque >= 0 ? "green" : "red"}">${formatBRL(lucroEstoque)}</div>
    <div class="stat-sub">venda − custo</div>
  </div>
  <div class="stat">
    <div class="stat-label">Margem Geral</div>
    <div class="stat-value ${parseFloat(margemGeral) > 20 ? "green" : parseFloat(margemGeral) > 5 ? "gold" : "red"}">${margemGeral}%</div>
    <div class="stat-sub">margem média do estoque</div>
  </div>
</div>

<h2>📦 Produtos em Estoque (${produtos.length})</h2>
${produtos.length === 0 ? "<p style='color:#aaa;padding:20px 0'>Nenhum produto cadastrado.</p>" : `
<table>
  <thead>
    <tr>
      <th>Produto / SKU</th>
      <th style="text-align:center">Variantes</th>
      <th style="text-align:center">Qtd.</th>
      <th style="text-align:right">Pr. Compra</th>
      <th style="text-align:right">Pr. Venda</th>
      <th style="text-align:right">Custo Total</th>
      <th style="text-align:right">Valor Venda</th>
      <th style="text-align:center">Margem</th>
    </tr>
  </thead>
  <tbody>
    ${linhasProdutos}
    <tr class="total-row">
      <td colspan="2">TOTAL GERAL</td>
      <td style="text-align:center">${totalPecas} un.</td>
      <td></td>
      <td></td>
      <td style="text-align:right;color:#7c3aed">${formatBRL(totalCustoEstoque)}</td>
      <td style="text-align:right;color:#16a34a">${formatBRL(totalValorVenda)}</td>
      <td style="text-align:center;color:${lucroEstoque >= 0 ? "#16a34a" : "#dc2626"}">${margemGeral}%</td>
    </tr>
  </tbody>
</table>
`}
<div class="footer">FitMGwear Sistema de Gestão — Balanço gerado em ${dataHoje}</div>
</body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
}

// ─────────────────────────────────────────────
// ESTOQUE CRÍTICO CARD (colapsável)
// ─────────────────────────────────────────────
function EstoqueCriticoCard({ produtos }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="card" style={{ marginBottom: 16, borderColor: "rgba(245,166,35,0.35)", background: "rgba(245,166,35,0.04)", overflow: "hidden" }}>
      <div
        onClick={() => setAberto(p => !p)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", userSelect: "none" }}
      >
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--yellow)" }}>Estoque crítico</span>
          <span style={{
            marginLeft: 10, background: "rgba(245,166,35,0.18)", color: "var(--yellow)",
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(245,166,35,0.3)"
          }}>{produtos.length} iten{produtos.length !== 1 ? "s" : ""}</span>
        </div>
        <svg width={16} height={16} viewBox="0 0 24 24" style={{ color: "var(--text2)", flexShrink: 0, transition: "transform 0.2s", transform: aberto ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M7 10l5 5 5-5z" fill="currentColor"/>
        </svg>
      </div>
      {aberto && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(245,166,35,0.15)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px", paddingTop: 12 }}>
            {produtos.map((p, i) => (
              <span key={i} style={{
                background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
                color: "var(--text2)", fontSize: 12, padding: "4px 10px", borderRadius: 99
              }}>{p}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ dados }) {
  const transacoes = dados.transacoes || [];
  const compras = dados.compras || [];
  const encomendas = dados.encomendas || [];
  const fiados = dados.fiados || [];
  const hojeISO = hojeLocal();
  const [ocultar, setOcultar] = useState(false);

  const totalReceitas = transacoes.filter(t => t.tipo === "venda").reduce((s, t) => s + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const hojeCount = transacoes.filter(t => t.data && t.data.slice(0, 10) === hojeISO).length;

  const comprasPendentes = compras.filter(c => c.status === "aguardando");
  const totalPendente = comprasPendentes.reduce((s, c) => s + c.valor, 0);

  const encomendasAtivas = encomendas.filter(e => e.status !== "entregue");
  const encomendasAtrasadas = encomendasAtivas.filter(e => e.dataEntrega && e.dataEntrega < hojeISO);

  const fiadosPendentes = fiados.filter(f => f.status === "pendente");
  const totalFiado = fiadosPendentes.reduce((s, f) => s + f.valor, 0);

  const produtosAbaixo = [];
  (dados.produtos || []).forEach(p => {
    const vars = (dados.variantesProduto || []).filter(v => v.produtoPaiId === p.id);
    if (vars.length > 0) { vars.forEach(v => { if (v.estoque <= (p.quantidadeMinima || 5)) produtosAbaixo.push(`${p.nome} (${v.label})`); }); }
    else { if (p.quantidadeEstoque <= p.quantidadeMinima) produtosAbaixo.push(p.nome); }
  });

  const ultimas = [...transacoes].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 8);

  // Formata ou oculta valor
  const val = (v) => ocultar ? "••••••" : formatBRL(v);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Painel de Controle</h1><p className="page-sub">Visão geral do seu negócio em tempo real</p></div>
        <button
          className="btn btn-secondary"
          onClick={() => setOcultar(o => !o)}
          title={ocultar ? "Mostrar valores" : "Ocultar valores"}
          style={{ gap: 6 }}
        >
          <Icon name={ocultar ? "eye" : "eyeoff"} size={16} />
          {ocultar ? "Mostrar" : "Ocultar"}
        </button>
      </div>
      <div className="stats-grid">
        <div className="stat-card green"><div className="stat-label">Receitas Totais</div><div className="stat-value">{val(totalReceitas)}</div></div>
        <div className="stat-card red"><div className="stat-label">Despesas Totais</div><div className="stat-value">{val(totalDespesas)}</div></div>
        <div className={`stat-card ${saldo >= 0 ? "blue" : "red"}`}><div className="stat-label">Saldo Líquido</div><div className="stat-value">{val(saldo)}</div></div>
        <div className="stat-card gold"><div className="stat-label">Hoje</div><div className="stat-value">{hojeCount}</div><div className="stat-sub">Transações</div></div>
      </div>

      {produtosAbaixo.length > 0 && <EstoqueCriticoCard produtos={produtosAbaixo} />}

      {comprasPendentes.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.04)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 24 }}>🛒</div>
            <div><div style={{ fontWeight: 700, fontSize: 14, color: "#a78bfa" }}>{comprasPendentes.length} compra{comprasPendentes.length > 1 ? "s" : ""} aguardando recebimento</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Pendente: <strong style={{ color: "var(--accent)" }}>{formatBRL(totalPendente)}</strong></div></div>
          </div>
        </div>
      )}

      {encomendasAtivas.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: encomendasAtrasadas.length > 0 ? "rgba(240,96,96,0.3)" : "rgba(77,166,255,0.3)", background: encomendasAtrasadas.length > 0 ? "rgba(240,96,96,0.04)" : "rgba(77,166,255,0.04)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 24 }}>📦</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: encomendasAtrasadas.length > 0 ? "var(--red)" : "var(--blue)" }}>
                {encomendasAtivas.length} encomenda{encomendasAtivas.length > 1 ? "s" : ""} ativa{encomendasAtivas.length > 1 ? "s" : ""}
                {encomendasAtrasadas.length > 0 && ` — ${encomendasAtrasadas.length} atrasada${encomendasAtrasadas.length > 1 ? "s" : ""}!`}
              </div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>{encomendasAtivas.map(e => e.cliente).join(", ")}</div>
            </div>
          </div>
        </div>
      )}

      {fiadosPendentes.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(240,96,96,0.3)", background: "rgba(240,96,96,0.04)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontSize: 24 }}>🤝</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--red)" }}>{fiadosPendentes.length} fiado{fiadosPendentes.length > 1 ? "s" : ""} em aberto</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Total a receber: <strong style={{ color: "var(--accent)" }}>{formatBRL(totalFiado)}</strong></div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ padding: "20px 20px 14px" }}><span className="card-title">Últimas Transações</span></div>
        <div className="table-wrap">
          {ultimas.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhuma transação ainda</div></div>
            : <table><thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
              <tbody>{ultimas.map(t => (
                <tr key={t.id}>
                  <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatData(t.data)}</td>
                  <td>{t.descricao}</td>
                  <td><span className={`badge ${t.tipo === "venda" ? "badge-green" : "badge-red"}`}>{t.tipo === "venda" ? "Venda" : "Despesa"}</span></td>
                  <td style={{ fontWeight: 700, color: t.tipo === "venda" ? "var(--green)" : "var(--red)", textAlign: "right", whiteSpace: "nowrap" }}>{formatBRL(t.valor)}</td>
                </tr>
              ))}</tbody></table>
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SELETOR DE ITEM (produto + variante + qtd) usado no carrinho de venda
// ─────────────────────────────────────────────
function SeletorItemVenda({ dados, onAdicionarItem, estoqueReservado }) {
  const [produtoId, setProdutoId] = useState("");
  const [tamSel, setTamSel] = useState("");
  const [corSel, setCorSel] = useState("");
  const [quantidade, setQuantidade] = useState("1");

  const produtos = dados.produtos || [];
  const variantesProduto = dados.variantesProduto || [];

  const produtosDisponiveis = produtos.filter(p => {
    const vars = variantesProduto.filter(v => v.produtoPaiId === p.id);
    if (vars.length > 0) return vars.some(v => {
      const reservado = estoqueReservado[v.id] || 0;
      return (v.estoque - reservado) > 0;
    });
    const reservado = estoqueReservado[p.id] || 0;
    return (p.quantidadeEstoque - reservado) > 0;
  });

  const produtoSel = produtos.find(p => p.id === produtoId);
  const variantesDisp = useMemo(() => produtoId ? variantesProduto.filter(v => v.produtoPaiId === produtoId) : [], [produtoId, variantesProduto]);
  const temVariantes = variantesDisp.length > 0;

  const { tamanhos, coresParaTam } = useMemo(() => {
    if (!temVariantes) return { tamanhos: [], coresParaTam: {} };
    const tamSet = new Set();
    const coresMap = {};
    variantesDisp.forEach(v => {
      const partes = v.label.split("/").map(s => s.trim());
      if (partes.length >= 2) {
        const [tam, ...corParts] = partes; const cor = corParts.join("/");
        tamSet.add(tam);
        if (!coresMap[tam]) coresMap[tam] = [];
        if (!coresMap[tam].find(c => c.cor === cor)) coresMap[tam].push({ cor, variante: v });
      } else {
        tamSet.add(v.label); coresMap[v.label] = [{ cor: "", variante: v }];
      }
    });
    Object.keys(coresMap).forEach(tam => {
      coresMap[tam].sort((a, b) => a.cor.localeCompare(b.cor, "pt-BR", { sensitivity: "base" }));
    });
    return { tamanhos: [...tamSet].sort(compararTamanhos), coresParaTam: coresMap };
  }, [variantesDisp, temVariantes]);

  const varianteSel = useMemo(() => {
    if (!tamSel) return null;
    const opcoes = coresParaTam[tamSel] || [];
    if (opcoes.length === 1 && opcoes[0].cor === "") return opcoes[0].variante;
    if (!corSel) return null;
    return opcoes.find(o => o.cor === corSel)?.variante || null;
  }, [tamSel, corSel, coresParaTam]);

  const estoqueDisp = useMemo(() => {
    if (varianteSel) return varianteSel.estoque - (estoqueReservado[varianteSel.id] || 0);
    if (!temVariantes && produtoSel) return produtoSel.quantidadeEstoque - (estoqueReservado[produtoSel.id] || 0);
    return 0;
  }, [varianteSel, temVariantes, produtoSel, estoqueReservado]);

  const qtd = parseInt(quantidade) || 1;
  const precoUnit = produtoSel ? produtoSel.precoVenda : 0;
  const custoUnit = produtoSel ? produtoSel.precoCompra : 0;
  const subtotal = precoUnit * qtd;
  const lucroItem = (precoUnit - custoUnit) * qtd;

  function handleProduto(id) {
    setProdutoId(id); setTamSel(""); setCorSel(""); setQuantidade("1");
  }

  function podeAdicionar() {
    if (!produtoSel) return false;
    if (temVariantes && !varianteSel) return false;
    if (qtd < 1 || qtd > estoqueDisp) return false;
    return true;
  }

  function adicionar() {
    if (!podeAdicionar()) {
      if (!produtoSel) return toast("Selecione um produto", "error");
      if (temVariantes && !varianteSel) return toast("Selecione tamanho e cor", "error");
      if (qtd > estoqueDisp) return toast(`Estoque insuficiente! Disponível: ${estoqueDisp}`, "error");
      return;
    }
    const label = varianteSel ? `${produtoSel.nome} — ${varianteSel.label}` : produtoSel.nome;
    onAdicionarItem({
      id: uid(),
      produtoId: produtoSel.id,
      varianteId: varianteSel ? varianteSel.id : null,
      label,
      quantidade: qtd,
      precoUnit,
      custoUnit,
      subtotal: precoUnit * qtd,
    });
    // reset seletor
    setProdutoId(""); setTamSel(""); setCorSel(""); setQuantidade("1");
    toast("Item adicionado ao carrinho ✓");
  }

  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", padding: 18, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>
        ➕ Adicionar Item ao Carrinho
      </div>

      <div className="form-grid form-grid-2" style={{ marginBottom: temVariantes && produtoId ? 0 : 0 }}>
        <div className="input-group">
          <label className="input-label">Produto</label>
          <select className="input" value={produtoId} onChange={e => handleProduto(e.target.value)}>
            <option value="">Selecionar produto...</option>
            {produtosDisponiveis.map(p => {
              const vars = variantesProduto.filter(v => v.produtoPaiId === p.id);
              const est = vars.length > 0
                ? vars.reduce((s, v) => s + Math.max(0, v.estoque - (estoqueReservado[v.id] || 0)), 0)
                : Math.max(0, p.quantidadeEstoque - (estoqueReservado[p.id] || 0));
              return <option key={p.id} value={p.id}>{p.nome} (Estq: {est})</option>;
            })}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Quantidade {estoqueDisp > 0 ? `(máx: ${estoqueDisp})` : ""}</label>
          <input className="input" type="number" min="1" max={estoqueDisp || undefined}
            value={quantidade} onChange={e => setQuantidade(e.target.value)}
            style={qtd > estoqueDisp && estoqueDisp > 0 ? { borderColor: "var(--red)" } : {}} />
        </div>
      </div>

      {/* Seletor de variantes */}
      {produtoId && temVariantes && (
        <div className="variante-grade-section">
          <div className="variante-grade-label">Tamanho</div>
          <div className="variante-grade-chips">
            {tamanhos.map(tam => {
              const opcoes = coresParaTam[tam] || [];
              const estTam = opcoes.reduce((s, o) => s + Math.max(0, o.variante.estoque - (estoqueReservado[o.variante.id] || 0)), 0);
              return (
                <div key={tam} className={`variante-chip ${tamSel === tam ? "active" : ""} ${estTam === 0 ? "disabled" : ""}`}
                  onClick={() => estTam > 0 && (setTamSel(tam), setCorSel(""))}>
                  {tam}
                  {estTam <= 5 && estTam > 0 && <span className="variante-chip-estoque">{estTam}</span>}
                  {estTam === 0 && <span className="variante-chip-estoque zero">0</span>}
                </div>
              );
            })}
          </div>
          {tamSel && coresParaTam[tamSel]?.[0]?.cor !== "" && (
            <div style={{ marginTop: 12 }}>
              <div className="variante-grade-label">Cor</div>
              <div className="variante-grade-chips">
                {(coresParaTam[tamSel] || []).map(({ cor, variante: v }) => {
                  const estV = Math.max(0, v.estoque - (estoqueReservado[v.id] || 0));
                  return (
                    <div key={cor} className={`variante-chip ${corSel === cor ? "active-cor" : ""} ${estV === 0 ? "disabled" : ""}`}
                      onClick={() => estV > 0 && setCorSel(cor)}>
                      {cor}
                      {estV <= 5 && estV > 0 && <span className="variante-chip-estoque">{estV}</span>}
                      {estV === 0 && <span className="variante-chip-estoque zero">0</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {varianteSel && (
            <div className="variante-resultado" style={{ marginTop: 10 }}>
              <span className="variante-resultado-nome">✓ {varianteSel.label}</span>
              <span className={`badge ${estoqueDisp <= 5 ? "badge-yellow" : "badge-green"}`}>{estoqueDisp} un. disponíveis</span>
            </div>
          )}
        </div>
      )}

      {/* Preview margem */}
      {produtoSel && subtotal > 0 && (!temVariantes || varianteSel) && (
        <div className="margem-preview" style={{ marginTop: 14 }}>
          <div className="margem-item"><span className="margem-item-label">Unit.</span><span className="margem-item-value" style={{ color: "var(--green)" }}>{formatBRL(precoUnit)}</span></div>
          <div style={{ color: "var(--border2)", fontSize: 18 }}>×{qtd}</div>
          <div className="margem-item"><span className="margem-item-label">Subtotal</span><span className="margem-item-value" style={{ color: "var(--green)" }}>{formatBRL(subtotal)}</span></div>
          <div style={{ color: "var(--border2)", fontSize: 18 }}>→</div>
          <div className="margem-item"><span className="margem-item-label">Lucro</span><span className="margem-item-value" style={{ color: lucroItem >= 0 ? "var(--green)" : "var(--red)" }}>{formatBRL(lucroItem)}</span></div>
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-success" onClick={adicionar} disabled={!podeAdicionar()}>
          <Icon name="plus" />Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CARRINHO DE VENDA
// ─────────────────────────────────────────────
function CarrinhoVenda({ dados, onSalvar, onCancelar }) {
  const [itens, setItens] = useState([]);
  const [meta, setMeta] = useState({ cliente: "", data: hojeLocal(), categoria: "", observacoes: "" });

  const categorias = (dados.categorias || []).filter(c => c.tipo === "receita");

  // controla estoque já reservado pelo carrinho para não deixar adicionar mais do que tem
  const estoqueReservado = useMemo(() => {
    const map = {};
    itens.forEach(i => {
      const key = i.varianteId || i.produtoId;
      map[key] = (map[key] || 0) + i.quantidade;
    });
    return map;
  }, [itens]);

  const totalCarrinho = itens.reduce((s, i) => s + i.subtotal, 0);
  const totalCusto = itens.reduce((s, i) => s + i.custoUnit * i.quantidade, 0);
  const totalLucro = totalCarrinho - totalCusto;
  const margemGeral = totalCusto > 0 ? (totalLucro / totalCusto * 100) : 0;

  function removerItem(id) { setItens(p => p.filter(i => i.id !== id)); }

  function fecharVenda() {
    if (itens.length === 0) return toast("Adicione pelo menos 1 item", "error");
    // gera um payload por item — a função onSalvar receberá array
    const descricaoGeral = itens.map(i => `${i.label} (${i.quantidade}x)`).join(", ");
    onSalvar({
      itens,
      descricao: descricaoGeral,
      valor: totalCarrinho,
      cliente: meta.cliente,
      categoria: meta.categoria,
      data: meta.data || hojeLocal(),
      observacoes: meta.observacoes,
    });
  }

  return (
    <div>
      {/* Seletor de item */}
      <SeletorItemVenda dados={dados} onAdicionarItem={item => setItens(p => [...p, item])} estoqueReservado={estoqueReservado} />

      {/* Carrinho */}
      <div className="cart-section">
        <div className="cart-section-title">🛒 Carrinho ({itens.length} {itens.length === 1 ? "item" : "itens"})</div>
        {itens.length === 0
          ? <div className="cart-empty">Nenhum item ainda. Selecione um produto acima e clique em <strong>Adicionar ao Carrinho</strong>.</div>
          : <>
            {itens.map(i => (
              <div key={i.id} className="cart-item-row">
                <span className="cart-item-name">{i.label}</span>
                <span className="cart-item-qty">{i.quantidade}x {formatBRL(i.precoUnit)}</span>
                <span className="cart-item-price">{formatBRL(i.subtotal)}</span>
                <button className="btn-icon danger" onClick={() => removerItem(i.id)}><Icon name="trash" /></button>
              </div>
            ))}
            <div className="cart-total-row">
              <div>
                <div className="cart-total-label">Total da Venda</div>
                {totalCusto > 0 && (
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                    Lucro: <span style={{ color: totalLucro >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{formatBRL(totalLucro)}</span>
                    <span className={`badge ${margemGeral > 30 ? "badge-green" : margemGeral > 10 ? "badge-gold" : "badge-red"}`} style={{ marginLeft: 8, fontSize: 11 }}>{margemGeral.toFixed(0)}%</span>
                  </div>
                )}
              </div>
              <span className="cart-total-value">{formatBRL(totalCarrinho)}</span>
            </div>
          </>
        }
      </div>

      {/* Dados gerais da venda */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header" style={{ padding: "16px 20px 12px" }}><span className="card-title">Dados da Venda</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-2">
            <div className="input-group">
              <label className="input-label">Cliente</label>
              <select className="input" value={meta.cliente} onChange={e => setMeta(p => ({ ...p, cliente: e.target.value }))}>
                <option value="">Nenhum</option>
                {(dados.clientes || []).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Data</label>
              <input className="input" type="date" value={meta.data} onChange={e => setMeta(p => ({ ...p, data: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Categoria</label>
              <select className="input" value={meta.categoria} onChange={e => setMeta(p => ({ ...p, categoria: e.target.value }))}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Observações</label>
              <input className="input" placeholder="Opcional..." value={meta.observacoes} onChange={e => setMeta(p => ({ ...p, observacoes: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        {onCancelar && <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>}
        <button className="btn btn-success" onClick={fecharVenda} disabled={itens.length === 0}>
          <Icon name="check" />
          Finalizar Venda {itens.length > 0 && `— ${formatBRL(totalCarrinho)}`}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FORM TRANSAÇÃO (despesas — mantido simples)
// ─────────────────────────────────────────────
function FormTransacao({ tipo, dados, onSalvar, onCancelar }) {
  const [form, setForm] = useState({ descricao: "", valor: "", categoria: "", data: hojeLocal(), observacoes: "" });
  const categorias = (dados.categorias || []).filter(c => c.tipo === "despesa");
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function submit(e) {
    e.preventDefault();
    if (!form.descricao.trim()) return toast("Preencha a descrição", "error");
    if (!form.valor || parseFloat(form.valor) <= 0) return toast("Valor inválido", "error");
    onSalvar({ tipo, descricao: form.descricao, valor: parseFloat(form.valor), categoria: form.categoria || "", data: form.data || hojeLocal(), observacoes: form.observacoes || "", quantidade: 1 });
  }
  return (
    <form onSubmit={submit}>
      <div className="form-grid form-grid-2" style={{ marginBottom: 14 }}>
        <div className="input-group"><label className="input-label">Descrição *</label><input className="input" placeholder="Ex: Aluguel, Luz..." value={form.descricao} onChange={e => set("descricao", e.target.value)} /></div>
        <div className="input-group"><label className="input-label">Valor (R$) *</label><input className="input" type="number" step="0.01" min="0" value={form.valor} onChange={e => set("valor", e.target.value)} /></div>
        <div className="input-group">
          <label className="input-label">Categoria</label>
          <select className="input" value={form.categoria} onChange={e => set("categoria", e.target.value)}>
            <option value="">Selecione...</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="input-group"><label className="input-label">Data</label><input className="input" type="date" value={form.data} onChange={e => set("data", e.target.value)} /></div>
        <div className="input-group" style={{ gridColumn: "1 / -1" }}><label className="input-label">Observações</label><textarea className="input" value={form.observacoes} onChange={e => set("observacoes", e.target.value)} style={{ minHeight: 60 }} /></div>
      </div>
      <div className="form-actions">
        {onCancelar && <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>}
        <button type="submit" className="btn btn-danger"><Icon name="expense" />Registrar Despesa</button>
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
    if (!id) return "";
    const found = (dados.clientes || []).find(x => x.id === id);
    return found ? found.nome : id;
  }

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Transações</h1><p className="page-sub">Histórico completo</p></div></div>
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
          {transacoes.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhuma transação</div></div>
            : <table><thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Cliente</th><th style={{ textAlign: "right" }}>Valor</th><th></th></tr></thead>
              <tbody>{transacoes.map(t => (
                <tr key={t.id}>
                  <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatData(t.data)}</td>
                  <td>{t.descricao}{t.observacoes && <div style={{ fontSize: 11, color: "var(--text2)" }}>{t.observacoes}</div>}</td>
                  <td><span className={`badge ${t.tipo === "venda" ? "badge-green" : "badge-red"}`}>{t.tipo === "venda" ? "Venda" : "Despesa"}</span></td>
                  <td style={{ color: "var(--text2)" }}>{nomeCliente(t.cliente)}</td>
                  <td style={{ fontWeight: 700, color: t.tipo === "venda" ? "var(--green)" : "var(--red)", textAlign: "right", whiteSpace: "nowrap" }}>{formatBRL(t.valor)}</td>
                  <td><button className="btn-icon danger" onClick={() => setConfirmId(t.id)}><Icon name="trash" /></button></td>
                </tr>
              ))}</tbody></table>
          }
        </div>
      </div>
      <ConfirmDialog open={!!confirmId} title="Remover Transação?" text="Esta ação não pode ser desfeita." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Transação removida"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// ESTOQUE  (com botão Balanço PDF)
// ─────────────────────────────────────────────
function Estoque({ dados, onAdicionar, onRemover, onAtualizar, onAdicionarVariante, onRemoverVariante, onAtualizarVariante }) {
  const [modal, setModal] = useState(false);
  const [modalVariantes, setModalVariantes] = useState(null);
  const [editando, setEditando] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [expandidos, setExpandidos] = useState({});
  const [form, setForm] = useState({ nome: "", descricao: "", precoCompra: "", precoVenda: "", quantidadeEstoque: "", quantidadeMinima: "5", sku: "", imagemUrl: "" });
  const [novaVariante, setNovaVariante] = useState({ label: "", estoque: "" });
  const [editandoVariante, setEditandoVariante] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function handleImagemChange(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Selecione um arquivo de imagem", "error");
    setEnviandoImagem(true);
    try {
      // Duas versões da foto. Tela de celular desenha 2 a 3 pixels para cada
      // ponto de tamanho aparente, então as duas precisam de folga de resolução:
      //  - card da vitrine: aparece com ~180px no celular e ~380px no
      //    computador; 900px deixa nítido (custa ~80 a 150 KB por peça)
      //  - tela cheia: 1600px, para a foto ampliada não borrar
      const miniatura = await lerImagemComoBase64(file, 900, 0.7);
      let grande = await lerImagemComoBase64(file, 1600, 0.85);
      // um documento do Firestore não passa de 1 MB; se a foto ficar perto
      // disso, salva uma versão um pouco menor em vez de falhar ao gravar
      if (grande.length > 700000) grande = await lerImagemComoBase64(file, 1300, 0.8);
      if (grande.length > 900000) grande = await lerImagemComoBase64(file, 1100, 0.75);
      setForm(p => ({ ...p, imagemUrl: miniatura, imagemGrande: grande }));
    } catch {
      toast("Não foi possível carregar essa imagem", "error");
    } finally {
      setEnviandoImagem(false);
    }
  }

  function removerImagemSelecionada() {
    setForm(p => ({ ...p, imagemUrl: "", imagemGrande: "" }));
  }

  const produtos = dados.produtos || [];
  const variantesProduto = dados.variantesProduto || [];
  const pc = parseFloat(form.precoCompra) || 0;
  const pv = parseFloat(form.precoVenda) || 0;
  const margemForm = pc > 0 && pv > 0 ? ((pv - pc) / pc * 100) : null;

  // Totais para exibição no cabeçalho
  const totalPecas = produtos.reduce((s, p) => {
    const vars = variantesProduto.filter(v => v.produtoPaiId === p.id);
    return s + (vars.length > 0 ? vars.reduce((a, v) => a + (v.estoque || 0), 0) : p.quantidadeEstoque);
  }, 0);
  const totalCusto = produtos.reduce((s, p) => {
    const vars = variantesProduto.filter(v => v.produtoPaiId === p.id);
    const est = vars.length > 0 ? vars.reduce((a, v) => a + (v.estoque || 0), 0) : p.quantidadeEstoque;
    return s + est * p.precoCompra;
  }, 0);
  const totalVenda = produtos.reduce((s, p) => {
    const vars = variantesProduto.filter(v => v.produtoPaiId === p.id);
    const est = vars.length > 0 ? vars.reduce((a, v) => a + (v.estoque || 0), 0) : p.quantidadeEstoque;
    return s + est * p.precoVenda;
  }, 0);

  function abrirModal(p = null) {
    if (p) { setEditando(p.id); setForm({ nome: p.nome, descricao: p.descricao || "", precoCompra: p.precoCompra, precoVenda: p.precoVenda, quantidadeEstoque: p.quantidadeEstoque, quantidadeMinima: p.quantidadeMinima, sku: p.sku || "", imagemUrl: p.imagemUrl || "" }); }
    else { setEditando(null); setForm({ nome: "", descricao: "", precoCompra: "", precoVenda: "", quantidadeEstoque: "", quantidadeMinima: "5", sku: "", imagemUrl: "" }); }
    setModal(true);
  }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function toggleExpand(id) { setExpandidos(p => ({ ...p, [id]: !p[id] })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return toast("Preencha o nome", "error");
    if (!form.precoVenda || parseFloat(form.precoVenda) <= 0) return toast("Preço de venda inválido", "error");
    // salvar durante o preparo da foto gravava a peça sem imagem
    if (enviandoImagem) return toast("Espere a foto terminar de carregar", "error");
    setSalvando(true);
    try {
      const d = { nome: form.nome, descricao: form.descricao, precoCompra: parseFloat(form.precoCompra) || 0, precoVenda: parseFloat(form.precoVenda), quantidadeEstoque: parseInt(form.quantidadeEstoque) || 0, quantidadeMinima: parseInt(form.quantidadeMinima) || 5, sku: form.sku, imagemUrl: form.imagemUrl || "" };
      // só mexe na foto grande se a imagem foi trocada ou removida nesta edição
      if (form.imagemGrande !== undefined) d.imagemGrande = form.imagemGrande;
      if (editando) { await onAtualizar(editando, d); toast("Produto atualizado"); }
      else { await onAdicionar(d); toast("Produto adicionado"); }
      setModal(false);
    } catch (err) {
      toast("Erro ao salvar produto: " + (err.message || ""), "error");
    } finally {
      setSalvando(false);
    }
  }

  async function salvarVariante(e) {
    e.preventDefault();
    if (!novaVariante.label.trim()) return toast("Informe o label da variante", "error");
    await onAdicionarVariante({ produtoPaiId: modalVariantes.id, label: novaVariante.label.trim(), estoque: parseInt(novaVariante.estoque) || 0 });
    setNovaVariante({ label: "", estoque: "" }); toast("Variante adicionada ✓");
  }

  async function salvarEdicaoVariante(e) {
    e.preventDefault();
    if (!editandoVariante) return;
    await onAtualizarVariante(editandoVariante.id, { label: editandoVariante.label, estoque: parseInt(editandoVariante.estoque) || 0 });
    setEditandoVariante(null); toast("Variante atualizada ✓");
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Estoque</h1><p className="page-sub">Gerencie produtos e variantes</p></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* ── BOTÃO BALANÇO PDF ── */}
          <button className="btn btn-info" onClick={() => gerarBalancoPDF(produtos, variantesProduto)}>
            <Icon name="balanco" />Balanço PDF
          </button>
          <button className="btn btn-primary" onClick={() => abrirModal()}><Icon name="plus" /> Novo Produto</button>
        </div>
      </div>

      {/* Resumo rápido do estoque */}
      {produtos.length > 0 && (
        <div className="stats-grid-3">
          <div className="stat-card blue">
            <div className="stat-label">Total de Peças</div>
            <div className="stat-value">{totalPecas}</div>
            <div className="stat-sub">unidades em estoque</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Custo do Estoque</div>
            <div className="stat-value">{formatBRL(totalCusto)}</div>
            <div className="stat-sub">valor investido</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Valor de Venda</div>
            <div className="stat-value">{formatBRL(totalVenda)}</div>
            <div className="stat-sub">potencial de receita</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          {produtos.length === 0
            ? <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-text">Nenhum produto cadastrado</div></div>
            : <table>
              <thead><tr><th>Produto</th><th>SKU</th><th>Compra</th><th>Venda</th><th>Estoque</th><th>Margem</th><th></th></tr></thead>
              <tbody>
                {produtos.map(p => {
                  const vars = ordenarVariantes(variantesProduto.filter(v => v.produtoPaiId === p.id));
                  const temVars = vars.length > 0;
                  const estoqueTotal = temVars ? vars.reduce((s, v) => s + (v.estoque || 0), 0) : p.quantidadeEstoque;
                  const baixo = estoqueTotal <= p.quantidadeMinima;
                  const margem = p.precoCompra > 0 ? ((p.precoVenda - p.precoCompra) / p.precoCompra * 100) : 0;
                  const expandido = expandidos[p.id];
                  return [
                    <tr key={p.id} className="produto-pai-row">
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className="product-thumb" style={p.imagemUrl ? { padding: 0, overflow: "hidden" } : undefined}>{p.imagemUrl ? <img src={p.imagemUrl} alt={p.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👕"}</div><div><div style={{ fontWeight: 700 }}>{p.nome}</div>{p.descricao && <div style={{ fontSize: 11, color: "var(--text2)" }}>{p.descricao}</div>}</div></div></td>
                      <td style={{ color: "var(--text2)", fontSize: 12 }}>{p.sku || "—"}</td>
                      <td>{formatBRL(p.precoCompra)}</td>
                      <td style={{ fontWeight: 700 }}>{formatBRL(p.precoVenda)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span className={`badge ${baixo ? "badge-yellow" : "badge-green"}`}>{estoqueTotal} un.</span>
                          {baixo && <span style={{ fontSize: 11, color: "var(--yellow)" }}>⚠ mín: {p.quantidadeMinima}</span>}
                          {temVars && <button className="produto-expand-btn" onClick={() => toggleExpand(p.id)}><Icon name={expandido ? "chevronDown" : "chevronRight"} size={12} />{vars.length} variante{vars.length !== 1 ? "s" : ""}</button>}
                        </div>
                      </td>
                      <td><span className={`badge ${margem > 30 ? "badge-green" : margem > 10 ? "badge-gold" : "badge-red"}`}>{margem.toFixed(0)}%</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn-icon" title="Gerenciar Variantes" onClick={() => { setModalVariantes(p); setNovaVariante({ label: "", estoque: "" }); setEditandoVariante(null); }} style={{ color: "var(--blue)", borderColor: "rgba(77,166,255,0.3)" }}><Icon name="variant" /></button>
                          <button className="btn-icon" onClick={() => abrirModal(p)}><Icon name="edit" /></button>
                          <button className="btn-icon danger" onClick={() => setConfirmId(p.id)}><Icon name="trash" /></button>
                        </div>
                      </td>
                    </tr>,
                    ...(temVars && expandido ? vars.map(v => {
                      const vBaixo = v.estoque <= (p.quantidadeMinima || 5);
                      return (
                        <tr key={`var-${v.id}`} className="variante-row">
                          <td className="variante-indent" colSpan={1}><div className="variante-label"><span style={{ color: "var(--text2)", fontSize: 16 }}>↳</span><span className="variante-label-badge">{v.label}</span></div></td>
                          <td style={{ color: "var(--text2)", fontSize: 11 }}>—</td><td style={{ color: "var(--text2)", fontSize: 12 }}>—</td><td style={{ color: "var(--text2)", fontSize: 12 }}>—</td>
                          <td><span className={`badge ${v.estoque === 0 ? "badge-red" : vBaixo ? "badge-yellow" : "badge-green"}`}>{v.estoque} un.</span></td>
                          <td></td>
                          <td><div style={{ display: "flex", gap: 6 }}><button className="btn-icon" onClick={() => setEditandoVariante({ id: v.id, label: v.label, estoque: v.estoque })}><Icon name="edit" /></button><button className="btn-icon danger" onClick={async () => { await onRemoverVariante(v.id); toast("Variante removida"); }}><Icon name="trash" /></button></div></td>
                        </tr>
                      );
                    }) : [])
                  ];
                })}
              </tbody>
            </table>
          }
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? "Editar Produto" : "Novo Produto"} wide>
        <form onSubmit={submit}>
          <div className="form-grid form-grid-2">
            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label className="input-label">Foto do Produto</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border2)", flexShrink: 0, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {enviandoImagem ? <div className="spinner" style={{ width: 18, height: 18 }} /> : form.imagemUrl ? <img src={form.imagemUrl} alt="Prévia" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👕"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input type="file" accept="image/*" onChange={handleImagemChange} />
                  {form.imagemUrl && <button type="button" className="btn btn-sm btn-secondary" style={{ alignSelf: "flex-start" }} onClick={removerImagemSelecionada}>Remover foto</button>}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text2)", marginTop: 8, lineHeight: 1.5 }}>
                Envie a foto no tamanho original. Peças cadastradas antes desta versão
                precisam ter a foto enviada de novo para abrirem nítidas em tela cheia no site.
              </div>
            </div>
            <div className="input-group" style={{ gridColumn: "1 / -1" }}><label className="input-label">Nome *</label><input className="input" value={form.nome} onChange={e => set("nome", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">SKU</label><input className="input" value={form.sku} onChange={e => set("sku", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Descrição</label><input className="input" value={form.descricao} onChange={e => set("descricao", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Preço de Compra</label><input className="input" type="number" step="0.01" min="0" value={form.precoCompra} onChange={e => set("precoCompra", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Preço de Venda *</label><input className="input" type="number" step="0.01" min="0" value={form.precoVenda} onChange={e => set("precoVenda", e.target.value)} /></div>
            {margemForm !== null && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="margem-preview">
                  <div className="margem-item"><span className="margem-item-label">Custo</span><span className="margem-item-value" style={{ color: "var(--red)" }}>{formatBRL(pc)}</span></div>
                  <div style={{ color: "var(--border2)", fontSize: 20 }}>→</div>
                  <div className="margem-item"><span className="margem-item-label">Venda</span><span className="margem-item-value" style={{ color: "var(--green)" }}>{formatBRL(pv)}</span></div>
                  <div style={{ color: "var(--border2)", fontSize: 20 }}>→</div>
                  <div className="margem-item"><span className="margem-item-label">Lucro</span><span className="margem-item-value" style={{ color: pv >= pc ? "var(--green)" : "var(--red)" }}>{formatBRL(pv - pc)}</span></div>
                  <div style={{ marginLeft: "auto" }}><span className={`badge ${margemForm > 30 ? "badge-green" : margemForm > 10 ? "badge-gold" : "badge-red"}`} style={{ fontSize: 14, padding: "5px 12px" }}>{margemForm.toFixed(1)}%</span></div>
                </div>
              </div>
            )}
            <div className="input-group"><label className="input-label">Estoque padrão</label><input className="input" type="number" min="0" value={form.quantidadeEstoque} onChange={e => set("quantidadeEstoque", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Qtd. Mínima (alerta)</label><input className="input" type="number" min="0" value={form.quantidadeMinima} onChange={e => set("quantidadeMinima", e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando || enviandoImagem}>{salvando ? "Salvando..." : enviandoImagem ? "Preparando foto..." : (editando ? "Salvar" : "Adicionar")}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editandoVariante} onClose={() => setEditandoVariante(null)} title="Editar Variante">
        {editandoVariante && (
          <form onSubmit={salvarEdicaoVariante}>
            <div className="form-grid" style={{ gap: 14 }}>
              <div className="input-group"><label className="input-label">Label</label><input className="input" value={editandoVariante.label} onChange={e => setEditandoVariante(p => ({ ...p, label: e.target.value }))} /></div>
              <div className="input-group"><label className="input-label">Estoque</label><input className="input" type="number" min="0" value={editandoVariante.estoque} onChange={e => setEditandoVariante(p => ({ ...p, estoque: e.target.value }))} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditandoVariante(null)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!modalVariantes} onClose={() => setModalVariantes(null)} title={`Variantes — ${modalVariantes?.nome || ""}`} wide>
        {modalVariantes && (() => {
          const vars = ordenarVariantes(variantesProduto.filter(v => v.produtoPaiId === modalVariantes.id));
          return (
            <div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>Cada variante é uma combinação livre, ex: <strong style={{ color: "var(--text)" }}>P/Preto</strong>, <strong style={{ color: "var(--text)" }}>G/Azul</strong>.</div>
              {vars.length === 0
                ? <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text2)", fontSize: 13 }}>Nenhuma variante ainda.</div>
                : <div className="variante-list" style={{ marginBottom: 20 }}>
                  {vars.map(v => (
                    <div key={v.id} className="variante-item">
                      <span className="variante-label-badge" style={{ fontSize: 13, padding: "4px 12px" }}>{v.label}</span>
                      <span className="variante-item-estoque"><span className={`badge ${v.estoque === 0 ? "badge-red" : v.estoque <= 5 ? "badge-yellow" : "badge-green"}`}>{v.estoque} un.</span></span>
                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        <button className="btn-icon" onClick={() => setEditandoVariante({ id: v.id, label: v.label, estoque: v.estoque })}><Icon name="edit" /></button>
                        <button className="btn-icon danger" onClick={async () => { await onRemoverVariante(v.id); toast("Variante removida"); }}><Icon name="trash" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              }
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div className="input-label" style={{ marginBottom: 10 }}>Adicionar nova variante</div>
                <form onSubmit={salvarVariante}>
                  <div className="add-variante-row">
                    <div className="input-group" style={{ flex: 2 }}><label className="input-label">Label (ex: P/Preto)</label><input className="input" placeholder="P/Preto" value={novaVariante.label} onChange={e => setNovaVariante(p => ({ ...p, label: e.target.value }))} /></div>
                    <div className="input-group" style={{ flex: 1 }}><label className="input-label">Estoque</label><input className="input" type="number" min="0" placeholder="0" value={novaVariante.estoque} onChange={e => setNovaVariante(p => ({ ...p, estoque: e.target.value }))} /></div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end" }}><Icon name="plus" />Adicionar</button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remover Produto?" text="Todas as variantes também serão removidas." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Produto removido"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// CLIENTES
// ─────────────────────────────────────────────
function Clientes({ dados, onAdicionar, onRemover, onAtualizar }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });
  const clientes = useMemo(() => {
    const lista = [...(dados.clientes || [])].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "", "pt-BR", { sensitivity: "base" })
    );
    if (!busca.trim()) return lista;
    const q = busca.toLowerCase();
    return lista.filter(c =>
      c.nome?.toLowerCase().includes(q) ||
      c.telefone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  }, [dados.clientes, busca]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function abrirModal(c = null) {
    if (c) { setEditando(c.id); setForm({ nome: c.nome, telefone: c.telefone || "", email: c.email || "" }); }
    else { setEditando(null); setForm({ nome: "", telefone: "", email: "" }); }
    setModal(true);
  }
  function submit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return toast("Preencha o nome", "error");
    if (editando) { onAtualizar(editando, { ...form }); toast("Cliente atualizado"); }
    else { onAdicionar({ ...form }); toast("Cliente adicionado"); }
    setModal(false);
  }

  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Clientes</h1><p className="page-sub">Base de clientes — ordem alfabética</p></div><button className="btn btn-primary" onClick={() => abrirModal()}><Icon name="plus" /> Novo</button></div>
      <div style={{ marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 300 }} placeholder="🔍 Buscar cliente..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>
      <div className="card"><div className="table-wrap">
        {clientes.length === 0
          ? <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">{busca ? "Nenhum cliente encontrado" : "Nenhum cliente"}</div></div>
          : <table><thead><tr><th>Nome</th><th>Telefone</th><th>Email</th><th>Desde</th><th></th></tr></thead>
            <tbody>{clientes.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td style={{ color: "var(--text2)" }}>{c.telefone || "—"}</td>
                <td style={{ color: "var(--text2)" }}>{c.email || "—"}</td>
                <td style={{ color: "var(--text2)" }}>{formatData(c.dataCriacao)}</td>
                <td><div style={{ display: "flex", gap: 6 }}><button className="btn-icon" onClick={() => abrirModal(c)}><Icon name="edit" /></button><button className="btn-icon danger" onClick={() => setConfirmId(c.id)}><Icon name="trash" /></button></div></td>
              </tr>
            ))}</tbody></table>
        }
      </div></div>
      <Modal open={modal} onClose={() => setModal(false)} title={editando ? "Editar Cliente" : "Novo Cliente"}>
        <form onSubmit={submit}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="input-group"><label className="input-label">Nome *</label><input className="input" value={form.nome} onChange={e => set("nome", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Telefone</label><input className="input" value={form.telefone} onChange={e => set("telefone", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
          </div>
          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">{editando ? "Salvar" : "Adicionar"}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} title="Remover Cliente?" text="Ação irreversível." danger onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Removido"); }} onCancel={() => setConfirmId(null)} />
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
    onAdicionar({ ...form }); toast("Categoria adicionada");
    setModal(false); setForm({ nome: "", tipo: "receita", cor: "#3ecf8e" });
  }
  return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Categorias</h1></div><button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" /> Nova</button></div>
      <div className="card"><div className="table-wrap">
        {categorias.length === 0
          ? <div className="empty-state"><div className="empty-icon">🏷️</div><div className="empty-text">Nenhuma categoria</div></div>
          : <table><thead><tr><th>Nome</th><th>Tipo</th><th>Cor</th><th></th></tr></thead>
            <tbody>{categorias.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.nome}</td>
                <td><span className={`badge ${c.tipo === "receita" ? "badge-green" : "badge-red"}`}>{c.tipo}</span></td>
                <td><div style={{ width: 20, height: 20, borderRadius: 6, background: c.cor, border: "1px solid var(--border2)" }} /></td>
                <td><button className="btn-icon danger" onClick={() => setConfirmId(c.id)}><Icon name="trash" /></button></td>
              </tr>
            ))}</tbody></table>
        }
      </div></div>
      <Modal open={modal} onClose={() => setModal(false)} title="Nova Categoria">
        <form onSubmit={submit}>
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="input-group"><label className="input-label">Nome *</label><input className="input" value={form.nome} onChange={e => set("nome", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Tipo</label><select className="input" value={form.tipo} onChange={e => set("tipo", e.target.value)}><option value="receita">Receita</option><option value="despesa">Despesa</option></select></div>
            <div className="input-group"><label className="input-label">Cor</label><input className="input" type="color" value={form.cor} onChange={e => set("cor", e.target.value)} /></div>
          </div>
          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">Adicionar</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} title="Remover?" text="Irreversível." danger onConfirm={() => { onRemover(confirmId); setConfirmId(null); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPRAS — com Carrinho de Itens  ← NOVO
// ─────────────────────────────────────────────
function Compras({ compras, onAdicionar, onReceber, onRemover }) {
  const [modal, setModal] = useState(false);
  const [aba, setAba] = useState("pendentes");
  const [confirmId, setConfirmId] = useState(null);

  // Formulário principal do pedido
  const [form, setForm] = useState({ fornecedor: "", data: hojeLocal(), observacoes: "" });

  // Carrinho de itens
  const [itens, setItens] = useState([]);
  const [itemForm, setItemForm] = useState({ descricao: "", quantidade: "1", valorUnitario: "" });

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function setIF(k, v) { setItemForm(p => ({ ...p, [k]: v })); }

  const totalCarrinho = itens.reduce((s, i) => s + i.subtotal, 0);

  function adicionarItem(e) {
    e.preventDefault();
    if (!itemForm.descricao.trim()) return toast("Informe a descrição do item", "error");
    if (!itemForm.valorUnitario || parseFloat(itemForm.valorUnitario) <= 0) return toast("Valor unitário inválido", "error");
    const qtd = parseInt(itemForm.quantidade) || 1;
    const vu = parseFloat(itemForm.valorUnitario);
    setItens(p => [...p, { id: uid(), descricao: itemForm.descricao.trim(), quantidade: qtd, valorUnitario: vu, subtotal: qtd * vu }]);
    setItemForm({ descricao: "", quantidade: "1", valorUnitario: "" });
    toast("Item adicionado ao carrinho ✓");
  }

  function removerItem(id) { setItens(p => p.filter(i => i.id !== id)); }

  function fecharPedido() {
    if (!form.fornecedor.trim()) return toast("Informe o fornecedor", "error");
    if (itens.length === 0) return toast("Adicione pelo menos 1 item ao carrinho", "error");

    // Monta descrição dos itens para a observação
    const itensDesc = itens.map(i => `${i.descricao} (${i.quantidade}x ${formatBRL(i.valorUnitario)})`).join("; ");
    const obsCompleta = [form.observacoes.trim(), `Itens: ${itensDesc}`].filter(Boolean).join(" | ");

    onAdicionar({
      fornecedor: form.fornecedor.trim(),
      valor: totalCarrinho,
      data: form.data || hojeLocal(),
      observacoes: obsCompleta,
      itens: itens,
      status: "aguardando"
    });

    setForm({ fornecedor: "", data: hojeLocal(), observacoes: "" });
    setItens([]);
    setItemForm({ descricao: "", quantidade: "1", valorUnitario: "" });
    setModal(false);
    toast("Compra registrada! ✓");
  }

  const pendentes = compras.filter(c => c.status === "aguardando").sort((a, b) => new Date(b.data) - new Date(a.data));
  const historico = compras.filter(c => c.status === "recebido").sort((a, b) => new Date(b.dataRecebimento || b.data) - new Date(a.dataRecebimento || a.data));
  const totalPendente = pendentes.reduce((s, c) => s + c.valor, 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Compras</h1><p className="page-sub">Pedidos de mercadoria</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="cart" />Nova Compra</button>
      </div>
      {pendentes.length > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: "rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.04)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 24 }}>🛒</div>
            <div><div style={{ fontWeight: 700, fontSize: 14, color: "#a78bfa" }}>{pendentes.length} pedido{pendentes.length > 1 ? "s" : ""} aguardando</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>Total: <strong style={{ color: "var(--accent)" }}>{formatBRL(totalPendente)}</strong></div></div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={`btn btn-sm ${aba === "pendentes" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAba("pendentes")}>🕐 Aguardando {pendentes.length > 0 && `(${pendentes.length})`}</button>
        <button className={`btn btn-sm ${aba === "historico" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAba("historico")}>✅ Recebidos {historico.length > 0 && `(${historico.length})`}</button>
      </div>
      {aba === "pendentes" && (
        <div className="compras-pendentes-list">
          {pendentes.length === 0
            ? <div className="empty-state"><div className="empty-icon">🛒</div><div className="empty-text">Nenhuma compra pendente</div></div>
            : pendentes.map(c => (
              <div key={c.id} className="compra-card">
                <div style={{ fontSize: 28 }}>📦</div>
                <div className="compra-card-info">
                  <div className="compra-card-fornecedor">{c.fornecedor}</div>
                  <div className="compra-card-valor">{formatBRL(c.valor)}</div>
                  <div className="compra-card-meta">📅 {formatData(c.data)}</div>
                  {/* Itens do carrinho */}
                  {c.itens && c.itens.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {c.itens.map(i => (
                        <div key={i.id} style={{ fontSize: 12, color: "var(--text2)", display: "flex", gap: 10 }}>
                          <span style={{ color: "var(--text)" }}>• {i.descricao}</span>
                          <span>{i.quantidade}x {formatBRL(i.valorUnitario)}</span>
                          <span style={{ color: "var(--accent)", fontWeight: 700 }}>{formatBRL(i.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.observacoes && !c.itens && <div className="compra-card-obs">{c.observacoes}</div>}
                </div>
                <div className="compra-card-actions">
                  <button className="btn btn-sm btn-success" onClick={() => onReceber(c.id)}><Icon name="check" size={13} />Recebido</button>
                  <button className="btn-icon danger" onClick={() => setConfirmId(c.id)}><Icon name="trash" /></button>
                </div>
              </div>
            ))
          }
        </div>
      )}
      {aba === "historico" && (
        <div className="card"><div className="table-wrap">
          {historico.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhum recebimento</div></div>
            : <table><thead><tr><th>Pedido em</th><th>Fornecedor</th><th>Itens</th><th>Recebido em</th><th style={{ textAlign: "right" }}>Valor</th><th></th></tr></thead>
              <tbody>{historico.map(c => (
                <tr key={c.id}>
                  <td style={{ color: "var(--text2)", whiteSpace: "nowrap" }}>{formatData(c.data)}</td>
                  <td style={{ fontWeight: 600 }}>{c.fornecedor}</td>
                  <td style={{ fontSize: 11, color: "var(--text2)" }}>
                    {c.itens && c.itens.length > 0
                      ? c.itens.map(i => `${i.descricao} (${i.quantidade}x)`).join(", ")
                      : c.observacoes || "—"}
                  </td>
                  <td><span className="badge badge-green">✓ {formatData(c.dataRecebimento)}</span></td>
                  <td style={{ fontWeight: 700, color: "var(--accent)", textAlign: "right" }}>{formatBRL(c.valor)}</td>
                  <td><button className="btn-icon danger" onClick={() => setConfirmId(c.id)}><Icon name="trash" /></button></td>
                </tr>
              ))}</tbody></table>
          }
        </div></div>
      )}

      {/* MODAL — Nova Compra com Carrinho */}
      <Modal open={modal} onClose={() => { setModal(false); setItens([]); setForm({ fornecedor: "", data: hojeLocal(), observacoes: "" }); setItemForm({ descricao: "", quantidade: "1", valorUnitario: "" }); }} title="Nova Compra" wide>
        <div>
          {/* Dados do pedido */}
          <div className="form-grid form-grid-2" style={{ marginBottom: 20 }}>
            <div className="input-group"><label className="input-label">Fornecedor *</label><input className="input" placeholder="Ex: Fornecedor SP" value={form.fornecedor} onChange={e => setF("fornecedor", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Data do Pedido</label><input className="input" type="date" value={form.data} onChange={e => setF("data", e.target.value)} /></div>
            <div className="input-group" style={{ gridColumn: "1 / -1" }}><label className="input-label">Observações gerais</label><textarea className="input" value={form.observacoes} onChange={e => setF("observacoes", e.target.value)} style={{ minHeight: 60 }} /></div>
          </div>

          {/* CARRINHO DE ITENS */}
          <div className="cart-section">
            <div className="cart-section-title">🛒 Itens do Pedido</div>

            {/* Adicionar item */}
            <form onSubmit={adicionarItem}>
              <div className="cart-add-row">
                <div className="input-group">
                  <label className="input-label">Descrição do Item *</label>
                  <input className="input" placeholder="Ex: Camiseta Dry-Fit P/Preta" value={itemForm.descricao} onChange={e => setIF("descricao", e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Qtd.</label>
                  <input className="input" type="number" min="1" value={itemForm.quantidade} onChange={e => setIF("quantidade", e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Valor Unit. (R$)</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={itemForm.valorUnitario} onChange={e => setIF("valorUnitario", e.target.value)} />
                </div>
                <button type="submit" className="btn btn-info" style={{ alignSelf: "flex-end" }}>
                  <Icon name="plus" />Adicionar
                </button>
              </div>
            </form>

            {/* Lista de itens */}
            {itens.length === 0
              ? <div className="cart-empty">Nenhum item adicionado ainda. Preencha os campos acima e clique em <strong>Adicionar</strong>.</div>
              : <>
                {itens.map(i => (
                  <div key={i.id} className="cart-item-row">
                    <span className="cart-item-name">{i.descricao}</span>
                    <span className="cart-item-qty">{i.quantidade}x {formatBRL(i.valorUnitario)}</span>
                    <span className="cart-item-price">{formatBRL(i.subtotal)}</span>
                    <button className="btn-icon danger" onClick={() => removerItem(i.id)}><Icon name="trash" /></button>
                  </div>
                ))}
                <div className="cart-total-row">
                  <span className="cart-total-label">Total do Pedido ({itens.length} {itens.length === 1 ? "item" : "itens"})</span>
                  <span className="cart-total-value">{formatBRL(totalCarrinho)}</span>
                </div>
              </>
            }
          </div>

          <div className="warn-box" style={{ marginBottom: 14 }}>🛒 Esta compra não afeta o saldo nem o estoque automaticamente.</div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setModal(false); setItens([]); }}>Cancelar</button>
            <button className="btn btn-primary" onClick={fecharPedido} disabled={itens.length === 0 || !form.fornecedor.trim()}>
              <Icon name="check" />Registrar Compra {itens.length > 0 && `— ${formatBRL(totalCarrinho)}`}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remover Compra?" text="A compra será removida." danger onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Removida"); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// ENCOMENDAS
// ─────────────────────────────────────────────
function Encomendas({ encomendas, onAdicionar, onAtualizar, onRemover }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [aba, setAba] = useState("ativas");
  const [form, setForm] = useState({ cliente: "", telefone: "", produto: "", quantidade: "1", valorTotal: "", sinal: "0", dataEntrega: "", observacoes: "", status: "aguardando" });

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function abrirModal(enc = null) {
    if (enc) {
      setEditando(enc.id);
      setForm({ cliente: enc.cliente, telefone: enc.telefone || "", produto: enc.produto, quantidade: enc.quantidade, valorTotal: enc.valorTotal, sinal: enc.sinal || "0", dataEntrega: enc.dataEntrega || "", observacoes: enc.observacoes || "", status: enc.status });
    } else {
      setEditando(null);
      setForm({ cliente: "", telefone: "", produto: "", quantidade: "1", valorTotal: "", sinal: "0", dataEntrega: "", observacoes: "", status: "aguardando" });
    }
    setModal(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.cliente.trim()) return toast("Informe o nome do cliente", "error");
    if (!form.produto.trim()) return toast("Informe o produto", "error");
    if (!form.valorTotal || parseFloat(form.valorTotal) <= 0) return toast("Informe o valor total", "error");
    const payload = { cliente: form.cliente.trim(), telefone: form.telefone.trim(), produto: form.produto.trim(), quantidade: parseInt(form.quantidade) || 1, valorTotal: parseFloat(form.valorTotal), sinal: parseFloat(form.sinal) || 0, dataEntrega: form.dataEntrega || "", observacoes: form.observacoes.trim(), status: form.status };
    if (editando) { onAtualizar(editando, payload); toast("Encomenda atualizada ✓"); }
    else { onAdicionar(payload); toast("Encomenda registrada! ✓"); }
    setModal(false);
  }

  function avancarStatus(enc) {
    const proximo = enc.status === "aguardando" ? "pronto" : enc.status === "pronto" ? "entregue" : null;
    if (!proximo) return;
    onAtualizar(enc.id, { status: proximo, ...(proximo === "entregue" ? { dataEntregue: hojeLocal() } : {}) });
    toast(proximo === "pronto" ? "Marcado como pronto! 🎉" : "Entregue! ✅");
  }

  function gerarWhatsApp(enc) {
    if (!enc.telefone) return toast("Sem telefone cadastrado", "error");
    const restante = enc.valorTotal - (enc.sinal || 0);
    const fone = enc.telefone.replace(/\D/g, "");
    const msg = `Olá ${enc.cliente}! 😊\n\nSua encomenda está *pronta*! 🎉\n\n📦 *Produto:* ${enc.produto} (${enc.quantidade} un.)\n💰 *Valor total:* R$ ${enc.valorTotal.toFixed(2).replace(".", ",")}\n${enc.sinal > 0 ? `✅ *Sinal pago:* R$ ${enc.sinal.toFixed(2).replace(".", ",")}\n💵 *Restante:* R$ ${restante.toFixed(2).replace(".", ",")}\n` : ""}📍 FitMGwear\n\nAguardamos você! 🙌`;
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const STATUS_LABEL = { aguardando: "Aguardando", pronto: "Pronto p/ retirar", entregue: "Entregue" };
  const STATUS_BADGE = { aguardando: "badge-yellow", pronto: "badge-blue", entregue: "badge-green" };
  const STATUS_BTN = { aguardando: { label: "✅ Marcar Pronto", cls: "btn-info" }, pronto: { label: "📦 Marcar Entregue", cls: "btn-success" } };

  const hoje = hojeLocal();
  const ativas = encomendas.filter(e => e.status !== "entregue").sort((a, b) => {
    if (a.dataEntrega && b.dataEntrega) return new Date(a.dataEntrega) - new Date(b.dataEntrega);
    return new Date(b.criadoEm) - new Date(a.criadoEm);
  });
  const entregues = encomendas.filter(e => e.status === "entregue").sort((a, b) => new Date(b.dataEntregue || b.criadoEm) - new Date(a.dataEntregue || a.criadoEm));
  const atrasadas = ativas.filter(e => e.dataEntrega && e.dataEntrega < hoje);
  const totalAtivas = ativas.reduce((s, e) => s + e.valorTotal, 0);
  const totalSinais = ativas.reduce((s, e) => s + (e.sinal || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Encomendas</h1><p className="page-sub">Pedidos sob encomenda dos clientes</p></div>
        <button className="btn btn-primary" onClick={() => abrirModal()}><Icon name="plus" />Nova Encomenda</button>
      </div>

      {ativas.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          <div className="stat-card blue" style={{ padding: "18px 20px" }}><div className="stat-label">Encomendas Ativas</div><div className="stat-value" style={{ fontSize: 28 }}>{ativas.length}</div></div>
          <div className="stat-card gold" style={{ padding: "18px 20px" }}><div className="stat-label">A Receber</div><div className="stat-value" style={{ fontSize: 22 }}>{formatBRL(totalAtivas - totalSinais)}</div><div className="stat-sub">Sinais: {formatBRL(totalSinais)}</div></div>
          <div className={`stat-card ${atrasadas.length > 0 ? "red" : "green"}`} style={{ padding: "18px 20px" }}><div className="stat-label">Atrasadas</div><div className="stat-value" style={{ fontSize: 28 }}>{atrasadas.length}</div></div>
        </div>
      )}

      {atrasadas.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "rgba(240,96,96,0.3)", background: "rgba(240,96,96,0.04)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 22 }}>⚠️</div>
            <div><div style={{ fontWeight: 700, color: "var(--red)", fontSize: 13 }}>Encomendas atrasadas!</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>{atrasadas.map(e => e.cliente).join(", ")}</div></div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={`btn btn-sm ${aba === "ativas" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAba("ativas")}>🕐 Ativas {ativas.length > 0 && `(${ativas.length})`}</button>
        <button className={`btn btn-sm ${aba === "entregues" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAba("entregues")}>✅ Entregues {entregues.length > 0 && `(${entregues.length})`}</button>
      </div>

      {aba === "ativas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ativas.length === 0
            ? <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-text">Nenhuma encomenda ativa</div></div>
            : ativas.map(enc => {
              const restante = enc.valorTotal - (enc.sinal || 0);
              const atrasada = enc.dataEntrega && enc.dataEntrega < hoje;
              return (
                <div key={enc.id} className="compra-card" style={{ borderColor: atrasada ? "rgba(240,96,96,0.35)" : undefined }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>📦</div>
                  <div className="compra-card-info" style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{enc.cliente}</span>
                      {enc.telefone && <span style={{ fontSize: 12, color: "var(--text2)" }}>📱 {enc.telefone}</span>}
                      <span className={`badge ${STATUS_BADGE[enc.status]}`}>{STATUS_LABEL[enc.status]}</span>
                      {atrasada && <span className="badge badge-red">⚠ Atrasada</span>}
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "var(--accent)", marginTop: 2 }}>
                      {formatBRL(enc.valorTotal)}
                      {enc.sinal > 0 && <span style={{ fontSize: 13, color: "var(--green)", marginLeft: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>✓ Sinal: {formatBRL(enc.sinal)}</span>}
                      {restante > 0 && enc.sinal > 0 && <span style={{ fontSize: 13, color: "var(--yellow)", marginLeft: 8, fontFamily: "'DM Sans', sans-serif" }}>Restante: {formatBRL(restante)}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                      🛍️ {enc.produto} · {enc.quantidade} un.
                      {enc.dataEntrega && <span style={{ marginLeft: 10 }}>📅 Entrega: <strong style={{ color: atrasada ? "var(--red)" : "var(--text)" }}>{formatData(enc.dataEntrega)}</strong></span>}
                    </div>
                    {enc.observacoes && <div className="compra-card-obs">{enc.observacoes}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    {STATUS_BTN[enc.status] && <button className={`btn btn-sm ${STATUS_BTN[enc.status].cls}`} onClick={() => avancarStatus(enc)}>{STATUS_BTN[enc.status].label}</button>}
                    {enc.status === "pronto" && enc.telefone && (
                      <button className="btn btn-sm btn-whatsapp" onClick={() => gerarWhatsApp(enc)}>📲 WhatsApp</button>
                    )}
                    <button className="btn-icon" onClick={() => abrirModal(enc)}><Icon name="edit" /></button>
                    <button className="btn-icon danger" onClick={() => setConfirmId(enc.id)}><Icon name="trash" /></button>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {aba === "entregues" && (
        <div className="card"><div className="table-wrap">
          {entregues.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhuma entrega ainda</div></div>
            : <table><thead><tr><th>Cliente</th><th>Produto</th><th>Valor</th><th>Entregue em</th><th></th></tr></thead>
              <tbody>{entregues.map(enc => (
                <tr key={enc.id}>
                  <td style={{ fontWeight: 600 }}>{enc.cliente}<div style={{ fontSize: 11, color: "var(--text2)" }}>{enc.telefone}</div></td>
                  <td>{enc.produto} · {enc.quantidade} un.</td>
                  <td style={{ fontWeight: 700, color: "var(--accent)" }}>{formatBRL(enc.valorTotal)}</td>
                  <td><span className="badge badge-green">✓ {formatData(enc.dataEntregue)}</span></td>
                  <td><button className="btn-icon danger" onClick={() => setConfirmId(enc.id)}><Icon name="trash" /></button></td>
                </tr>
              ))}</tbody></table>
          }
        </div></div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? "Editar Encomenda" : "Nova Encomenda"} wide>
        <form onSubmit={submit}>
          <div className="form-grid form-grid-2" style={{ gap: 14 }}>
            <div className="input-group"><label className="input-label">Nome do Cliente *</label><input className="input" placeholder="Ex: Maria Silva" value={form.cliente} onChange={e => set("cliente", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Telefone / WhatsApp</label><input className="input" placeholder="(11) 99999-9999" value={form.telefone} onChange={e => set("telefone", e.target.value)} /></div>
            <div className="input-group" style={{ gridColumn: "1 / -1" }}><label className="input-label">Produto(s) Pedido(s) *</label><input className="input" placeholder="Ex: Camiseta Dry-Fit P/Preta + Short M/Azul" value={form.produto} onChange={e => set("produto", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Quantidade</label><input className="input" type="number" min="1" value={form.quantidade} onChange={e => set("quantidade", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Data de Entrega</label><input className="input" type="date" value={form.dataEntrega} onChange={e => set("dataEntrega", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Valor Total (R$) *</label><input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={form.valorTotal} onChange={e => set("valorTotal", e.target.value)} /></div>
            <div className="input-group">
              <label className="input-label">Sinal / Adiantamento (R$)</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0,00" value={form.sinal} onChange={e => set("sinal", e.target.value)} />
              {parseFloat(form.sinal) > 0 && parseFloat(form.valorTotal) > 0 && (
                <span style={{ fontSize: 11, color: "var(--green)", marginTop: 3 }}>Restante: {formatBRL(parseFloat(form.valorTotal) - parseFloat(form.sinal))}</span>
              )}
            </div>
            {editando && (
              <div className="input-group">
                <label className="input-label">Status</label>
                <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
                  <option value="aguardando">Aguardando</option>
                  <option value="pronto">Pronto p/ retirar</option>
                  <option value="entregue">Entregue</option>
                </select>
              </div>
            )}
            <div className="input-group" style={{ gridColumn: "1 / -1" }}><label className="input-label">Observações</label><textarea className="input" placeholder="Detalhes adicionais..." value={form.observacoes} onChange={e => set("observacoes", e.target.value)} style={{ minHeight: 70 }} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary"><Icon name="check" />{editando ? "Salvar" : "Registrar Encomenda"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remover Encomenda?" text="A encomenda será removida permanentemente." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Removida"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// FIADO / COBRANÇAS
// ─────────────────────────────────────────────
function Fiado({ fiados, onAdicionar, onPagar, onPagarParcial, onRemover, dados }) {
  const [modal, setModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [aba, setAba] = useState("pendentes");
  const [modalParcial, setModalParcial] = useState(null);
  const [valorParcial, setValorParcial] = useState("");

  // Dados do fiado (cliente, data, pagamento, obs)
  const [meta, setMeta] = useState({ nome: "", telefone: "", data: hojeLocal(), formaPagamento: "pix", observacoes: "" });
  // Carrinho de itens
  const [itens, setItens] = useState([]);

  const FORMA_LABEL = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão", transferencia: "Transferência" };
  const FORMA_EMOJI = { pix: "💠", dinheiro: "💵", cartao: "💳", transferencia: "🏦" };

  const estoqueReservado = useMemo(() => {
    const map = {};
    itens.forEach(i => {
      const key = i.varianteId || i.produtoId;
      map[key] = (map[key] || 0) + i.quantidade;
    });
    return map;
  }, [itens]);

  const totalCarrinho = itens.reduce((s, i) => s + i.subtotal, 0);

  function setM(k, v) { setMeta(p => ({ ...p, [k]: v })); }
  function removerItem(id) { setItens(p => p.filter(i => i.id !== id)); }

  function abrirModal() {
    setMeta({ nome: "", telefone: "", data: hojeLocal(), formaPagamento: "pix", observacoes: "" });
    setItens([]);
    setModal(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!meta.nome.trim()) return toast("Informe o nome do cliente", "error");
    if (itens.length === 0) return toast("Adicione pelo menos 1 item ao fiado", "error");

    // Monta descrição a partir dos itens
    const descricao = itens.map(i => `${i.label} (${i.quantidade}x)`).join(", ");

    onAdicionar({
      nome: meta.nome.trim(),
      telefone: meta.telefone.trim(),
      valor: totalCarrinho,
      data: meta.data || hojeLocal(),
      formaPagamento: meta.formaPagamento,
      observacoes: meta.observacoes.trim(),
      status: "pendente",
      itens: itens,
      // mantém compatibilidade com código legado (item único)
      produtoId: itens.length === 1 ? itens[0].produtoId : null,
      varianteId: itens.length === 1 ? itens[0].varianteId : null,
      quantidade: itens.reduce((s, i) => s + i.quantidade, 0),
    });

    setModal(false);
    toast("Fiado registrado! Estoque baixado ✓");
  }

  function gerarWhatsApp(f) {
    if (!f.telefone) return toast("Sem telefone cadastrado", "error");
    const fone = f.telefone.replace(/\D/g, "");
    const forma = FORMA_LABEL[f.formaPagamento] || f.formaPagamento;
    const emoji = FORMA_EMOJI[f.formaPagamento] || "💰";
    const msg = `Olá ${f.nome}! 😊\n\nPassando pra lembrar do valor que ficou em aberto aqui na *FitMGwear*.\n\n💰 *Valor:* R$ ${f.valor.toFixed(2).replace(".", ",")}\n${emoji} *Forma combinada:* ${forma}\n📅 *Data:* ${formatData(f.data)}\n${f.observacoes ? `📝 *Ref.:* ${f.observacoes}\n` : ""}\nQualquer dúvida, é só chamar! Obrigada 🙏`;
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const pendentes = fiados.filter(f => f.status === "pendente").sort((a, b) => new Date(a.data) - new Date(b.data));
  const pagos = fiados.filter(f => f.status === "pago").sort((a, b) => new Date(b.dataPagamento || b.criadoEm) - new Date(a.dataPagamento || a.criadoEm));
  const totalPendente = pendentes.reduce((s, f) => s + f.valor, 0);
  const totalRecebido = pagos.reduce((s, f) => s + f.valor, 0);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Fiado / Cobranças</h1><p className="page-sub">Controle de valores em aberto e lembretes de cobrança</p></div>
        <button className="btn btn-primary" onClick={abrirModal}><Icon name="plus" />Novo Fiado</button>
      </div>

      <div className="stats-grid-3">
        <div className="stat-card red"><div className="stat-label">Em Aberto</div><div className="stat-value">{formatBRL(totalPendente)}</div><div className="stat-sub">{pendentes.length} pessoa{pendentes.length !== 1 ? "s" : ""}</div></div>
        <div className="stat-card green"><div className="stat-label">Já Recebido</div><div className="stat-value">{formatBRL(totalRecebido)}</div><div className="stat-sub">{pagos.length} pagamento{pagos.length !== 1 ? "s" : ""}</div></div>
        <div className="stat-card gold"><div className="stat-label">Total Fiado</div><div className="stat-value">{formatBRL(totalPendente + totalRecebido)}</div></div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={`btn btn-sm ${aba === "pendentes" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAba("pendentes")}>💰 Em Aberto {pendentes.length > 0 && `(${pendentes.length})`}</button>
        <button className={`btn btn-sm ${aba === "pagos" ? "btn-primary" : "btn-secondary"}`} onClick={() => setAba("pagos")}>✅ Recebidos {pagos.length > 0 && `(${pagos.length})`}</button>
      </div>

      {aba === "pendentes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pendentes.length === 0
            ? <div className="empty-state"><div className="empty-icon">🤝</div><div className="empty-text">Nenhum fiado pendente</div></div>
            : pendentes.map(f => (
              <div key={f.id} className="compra-card">
                <div style={{ fontSize: 28, flexShrink: 0 }}>🤝</div>
                <div className="compra-card-info" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{f.nome}</span>
                    {f.telefone && <span style={{ fontSize: 12, color: "var(--text2)" }}>📱 {f.telefone}</span>}
                    <span className="badge badge-yellow">Pendente</span>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "var(--red)", marginTop: 2 }}>{formatBRL(f.valor)}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 3, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>📅 {formatData(f.data)}</span>
                    <span>{FORMA_EMOJI[f.formaPagamento]} {FORMA_LABEL[f.formaPagamento]}</span>
                  </div>
                  {/* Itens do carrinho */}
                  {f.itens && f.itens.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                      {f.itens.map((i, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: "var(--text2)", display: "flex", gap: 8 }}>
                          <span style={{ color: "var(--text)" }}>• {i.label}</span>
                          <span>{i.quantidade}x {formatBRL(i.precoUnit)}</span>
                          <span style={{ color: "var(--accent)", fontWeight: 700 }}>{formatBRL(i.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Histórico de pagamentos parciais */}
                  {f.historicoPagamentos && f.historicoPagamentos.length > 0 && (
                    <div style={{ marginTop: 6, borderLeft: "2px solid rgba(232,184,75,0.3)", paddingLeft: 8 }}>
                      <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Parcelas recebidas:</div>
                      {f.historicoPagamentos.map((p, i) => (
                        <div key={i} style={{ fontSize: 12, color: "var(--text2)", display: "flex", gap: 8 }}>
                          <span style={{ color: "var(--green)", fontWeight: 700 }}>{formatBRL(p.valor)}</span>
                          <span>em {formatData(p.data)}</span>
                        </div>
                      ))}
                      {f.totalPago > 0 && (
                        <div style={{ fontSize: 12, marginTop: 4, color: "var(--accent)", fontWeight: 700 }}>
                          Total já pago: {formatBRL(f.totalPago)}
                        </div>
                      )}
                    </div>
                  )}
                  {f.observacoes && <div className="compra-card-obs">{f.observacoes}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-sm btn-success" onClick={() => onPagar(f.id)}><Icon name="check" size={13} />Recebido</button>
                  <button className="btn btn-sm btn-info" onClick={() => { setModalParcial(f); setValorParcial(""); }}>💰 Parcial</button>
                  {f.telefone && <button className="btn btn-sm btn-whatsapp" onClick={() => gerarWhatsApp(f)}>📲 Cobrar</button>}
                  <button className="btn-icon danger" onClick={() => setConfirmId(f.id)}><Icon name="trash" /></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {aba === "pagos" && (
        <div className="card"><div className="table-wrap">
          {pagos.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">Nenhum pagamento</div></div>
            : <table><thead><tr><th>Nome</th><th>Valor</th><th>Forma</th><th>Pago em</th><th>Obs.</th><th></th></tr></thead>
              <tbody>{pagos.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.nome}<div style={{ fontSize: 11, color: "var(--text2)" }}>{f.telefone}</div></td>
                  <td style={{ fontWeight: 700, color: "var(--green)" }}>{formatBRL(f.totalPago || f.valor)}</td>
                  <td><span className="badge badge-blue">{FORMA_EMOJI[f.formaPagamento]} {FORMA_LABEL[f.formaPagamento]}</span></td>
                  <td><span className="badge badge-green">✓ {formatData(f.dataPagamento)}</span></td>
                  <td style={{ color: "var(--text2)", fontSize: 12 }}>{f.observacoes || "—"}</td>
                  <td><button className="btn-icon danger" onClick={() => setConfirmId(f.id)}><Icon name="trash" /></button></td>
                </tr>
              ))}</tbody></table>
          }
        </div></div>
      )}

      {/* MODAL — Novo Fiado com Carrinho */}
      <Modal open={modal} onClose={() => setModal(false)} title="Novo Fiado" wide>
        <form onSubmit={submit}>
          {/* Dados do cliente */}
          <div className="form-grid form-grid-2" style={{ marginBottom: 20 }}>
            <div className="input-group"><label className="input-label">Nome *</label><input className="input" placeholder="Ex: Ana Lima" value={meta.nome} onChange={e => setM("nome", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Telefone / WhatsApp</label><input className="input" placeholder="(11) 99999-9999" value={meta.telefone} onChange={e => setM("telefone", e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Data</label><input className="input" type="date" value={meta.data} onChange={e => setM("data", e.target.value)} /></div>
            <div className="input-group">
              <label className="input-label">Forma de Pagamento Combinada</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {[{ value: "pix", label: "💠 Pix" }, { value: "dinheiro", label: "💵 Dinheiro" }, { value: "cartao", label: "💳 Cartão" }, { value: "transferencia", label: "🏦 Transf." }].map(op => (
                  <div key={op.value} className={`tag-opt ${meta.formaPagamento === op.value ? "selected" : ""}`} onClick={() => setM("formaPagamento", op.value)}>{op.label}</div>
                ))}
              </div>
            </div>
            <div className="input-group" style={{ gridColumn: "1 / -1" }}><label className="input-label">Observações</label><textarea className="input" placeholder="Detalhes adicionais..." value={meta.observacoes} onChange={e => setM("observacoes", e.target.value)} style={{ minHeight: 50 }} /></div>
          </div>

          {/* Carrinho de itens */}
          <SeletorItemVenda dados={dados} onAdicionarItem={item => setItens(p => [...p, item])} estoqueReservado={estoqueReservado} />

          <div className="cart-section" style={{ marginTop: 0 }}>
            <div className="cart-section-title">🤝 Itens do Fiado ({itens.length})</div>
            {itens.length === 0
              ? <div className="cart-empty">Nenhum item ainda. Selecione um produto acima e clique em <strong>Adicionar ao Carrinho</strong>.</div>
              : <>
                {itens.map(i => (
                  <div key={i.id} className="cart-item-row">
                    <span className="cart-item-name">{i.label}</span>
                    <span className="cart-item-qty">{i.quantidade}x {formatBRL(i.precoUnit)}</span>
                    <span className="cart-item-price">{formatBRL(i.subtotal)}</span>
                    <button type="button" className="btn-icon danger" onClick={() => removerItem(i.id)}><Icon name="trash" /></button>
                  </div>
                ))}
                <div className="cart-total-row">
                  <span className="cart-total-label">Total do Fiado</span>
                  <span className="cart-total-value">{formatBRL(totalCarrinho)}</span>
                </div>
              </>
            }
          </div>

          <div className="info-box" style={{ marginTop: 14 }}>
            📦 O estoque será <strong>baixado imediatamente</strong>. O valor só entra no faturamento quando marcado como <strong>Recebido</strong>.
          </div>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={itens.length === 0 || !meta.nome.trim()}>
              <Icon name="check" />Registrar Fiado {itens.length > 0 && `— ${formatBRL(totalCarrinho)}`}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmId} title="Remover registro?" text="Permanentemente." danger
        onConfirm={() => { onRemover(confirmId); setConfirmId(null); toast("Removido"); }}
        onCancel={() => setConfirmId(null)} />

      {/* MODAL — Pagamento Parcial */}
      <Modal open={!!modalParcial} onClose={() => setModalParcial(null)} title={`💰 Receber Parcial — ${modalParcial?.nome || ""}`}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 4 }}>Valor total em aberto:</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "var(--red)" }}>
            {formatBRL(modalParcial?.valor || 0)}
          </div>
          {modalParcial?.totalPago > 0 && (
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
              Já recebido anteriormente: <strong style={{ color: "var(--green)" }}>{formatBRL(modalParcial.totalPago)}</strong>
            </div>
          )}
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label">Valor recebido agora (R$) *</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0.01"
            max={modalParcial?.valor}
            placeholder="0,00"
            value={valorParcial}
            onChange={e => setValorParcial(e.target.value)}
            autoFocus
          />
          {valorParcial && parseFloat(valorParcial) > 0 && parseFloat(valorParcial) < (modalParcial?.valor || 0) && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "rgba(77,166,255,0.07)", border: "1px solid rgba(77,166,255,0.2)", fontSize: 13 }}>
              Restará: <strong style={{ color: "var(--red)" }}>{formatBRL((modalParcial?.valor || 0) - parseFloat(valorParcial))}</strong>
            </div>
          )}
          {valorParcial && parseFloat(valorParcial) >= (modalParcial?.valor || 0) && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: "var(--radius-sm)", background: "rgba(62,207,142,0.07)", border: "1px solid rgba(62,207,142,0.2)", fontSize: 13, color: "var(--green)", fontWeight: 700 }}>
              ✓ Fiado será quitado completamente!
            </div>
          )}
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => setModalParcial(null)}>Cancelar</button>
          <button
            className="btn btn-success"
            disabled={!valorParcial || parseFloat(valorParcial) <= 0}
            onClick={() => {
              const v = parseFloat(valorParcial);
              if (!v || v <= 0) return toast("Informe um valor válido", "error");
              onPagarParcial(modalParcial.id, v);
              setModalParcial(null);
              setValorParcial("");
            }}
          >
            <Icon name="check" />Confirmar Recebimento
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// FOTOS DO SITE (carrossel, galeria e foto da dona)
// ─────────────────────────────────────────────
const SLIDES_CARROSSEL = [
  { ordem: 1, titulo: "Vista sua força" },
  { ordem: 2, titulo: "Design que encanta" },
  { ordem: 3, titulo: "Feito para treinar" },
  { ordem: 4, titulo: "Beleza e poder" },
  { ordem: 5, titulo: "Entrega todo Brasil" },
];

function FotosSite() {
  const [fotos, loadingFotos] = useCollection("siteFotos", FILTRO_FOTOS_SITE);
  const [enviando, setEnviando] = useState("");
  const [confirmRemover, setConfirmRemover] = useState(null);

  const carrossel = fotos.filter(f => f.tipo === "carrossel");
  const galeria = [...fotos.filter(f => f.tipo === "galeria")].sort((a, b) => (a.criadoEm || "").localeCompare(b.criadoEm || ""));
  const fotoDona = fotos.find(f => f.tipo === "dona");

  async function enviarFoto(tipo, ordem, file, chave) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Selecione um arquivo de imagem", "error");
    setEnviando(chave);
    try {
      // Carrossel aparece em tela cheia no site — precisa de mais resolução
      const maxLado = tipo === "carrossel" ? 1280 : 800;
      const imagem = await lerImagemComoBase64(file, maxLado, 0.8);
      const existente = tipo === "carrossel" ? carrossel.find(f => f.ordem === ordem) : tipo === "dona" ? fotoDona : null;
      const id = existente ? existente.id : uid();
      await setDoc(doc(db, "siteFotos", id), { id, tipo, ordem: ordem || 0, imagem, criadoEm: existente?.criadoEm || new Date().toISOString() });
      toast("Foto do site atualizada ✓");
    } catch (err) {
      toast("Erro ao enviar foto: " + (err.message || ""), "error");
    } finally {
      setEnviando("");
    }
  }

  async function enviarGaleria(files) {
    for (const file of files) await enviarFoto("galeria", 0, file, "galeria");
  }

  function BotaoUpload({ chave, tipo, ordem, temFoto, multiple }) {
    return (
      <>
        <input type="file" accept="image/*" multiple={!!multiple} style={{ display: "none" }} id={`sitefoto-${chave}`}
          onChange={e => {
            const files = [...(e.target.files || [])];
            e.target.value = "";
            if (!files.length) return;
            if (multiple) enviarGaleria(files);
            else enviarFoto(tipo, ordem, files[0], chave);
          }} />
        <label htmlFor={`sitefoto-${chave}`} className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
          {enviando === chave ? "Enviando..." : temFoto ? "Trocar" : multiple ? "Adicionar fotos" : "Enviar foto"}
        </label>
      </>
    );
  }

  function Slot({ foto, chave, tipo, ordem, titulo, alturaThumb = 110 }) {
    return (
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: alturaThumb, borderRadius: 6, overflow: "hidden", background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text2)", fontSize: 26 }}>
          {enviando === chave ? <div className="spinner" style={{ width: 20, height: 20 }} /> : foto?.imagem ? <img src={foto.imagem} alt={titulo || "Foto do site"} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📷"}
        </div>
        {titulo && <div style={{ fontSize: 11, color: "var(--text2)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{titulo}</div>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <BotaoUpload chave={chave} tipo={tipo} ordem={ordem} temFoto={!!foto} />
          {foto && <button className="btn btn-danger btn-sm" onClick={() => setConfirmRemover(foto.id)}>Remover</button>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Fotos do Site</h1><p className="page-sub">As fotos trocadas aqui aparecem no site da loja em tempo real</p></div>
      </div>

      {loadingFotos ? <div style={{ color: "var(--text2)", fontSize: 13, padding: "20px 0" }}>Carregando fotos...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Carrossel do Topo</div></div>
            <div className="card-body">
              <p style={{ fontSize: 12.5, color: "var(--text2)", margin: "0 0 14px" }}>São 5 fotos grandes que passam no topo do site. O título de cada quadro indica a frase que aparece por cima da foto. Prefira fotos na horizontal e com boa luz.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {SLIDES_CARROSSEL.map(s => (
                  <Slot key={s.ordem} foto={carrossel.find(f => f.ordem === s.ordem)} chave={`carrossel-${s.ordem}`} tipo="carrossel" ordem={s.ordem} titulo={`${s.ordem}. ${s.titulo}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Foto da Dona</div></div>
            <div className="card-body">
              <p style={{ fontSize: 12.5, color: "var(--text2)", margin: "0 0 14px" }}>Aparece na seção "Nossa História" do site. Prefira foto na vertical.</p>
              <div style={{ maxWidth: 220 }}>
                <Slot foto={fotoDona} chave="dona" tipo="dona" ordem={0} alturaThumb={200} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Galeria</div>
              <BotaoUpload chave="galeria" tipo="galeria" ordem={0} multiple />
            </div>
            <div className="card-body">
              <p style={{ fontSize: 12.5, color: "var(--text2)", margin: "0 0 14px" }}>Fotos que passam na faixa "Nossa Galeria" do site. Pode adicionar quantas quiser — o ideal são pelo menos 6.</p>
              {galeria.length === 0
                ? <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text2)", fontSize: 13 }}>Nenhuma foto na galeria ainda. Enquanto estiver vazia, o site mostra os ícones padrão.</div>
                : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                  {galeria.map(f => (
                    <div key={f.id} style={{ position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
                      <img src={f.imagem} alt="Foto da galeria" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
                      <button className="btn-icon danger" style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)" }} onClick={() => setConfirmRemover(f.id)}><Icon name="trash" /></button>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmRemover} title="Remover foto do site?" text="A foto some do site na hora. Você pode enviar outra quando quiser." danger
        onConfirm={async () => { await deleteDoc(doc(db, "siteFotos", confirmRemover)); setConfirmRemover(null); toast("Foto removida"); }}
        onCancel={() => setConfirmRemover(null)} />
    </div>
  );
}

const NAV_BASE = [
  { id: "painel", label: "Painel", icon: "dashboard", group: "Principal" },
  { id: "venda", label: "Nova Venda", icon: "sell", group: "Principal" },
  { id: "despesa", label: "Nova Despesa", icon: "expense", group: "Principal" },
  { id: "transacoes", label: "Transações", icon: "categories", group: "Dados" },
  { id: "estoque", label: "Estoque", icon: "stock", group: "Dados" },
  { id: "compras", label: "Compras", icon: "cart", group: "Dados" },
  { id: "encomendas", label: "Encomendas", icon: "inbox", group: "Dados" },
  { id: "fiado", label: "Fiado / Cobranças", icon: "warn", group: "Dados" },
  { id: "clientes", label: "Clientes", icon: "clients", group: "Dados" },
  { id: "categorias", label: "Categorias", icon: "categories", group: "Dados" },
  { id: "relatorio", label: "Relatório PDF", icon: "pdf", group: "Dados" },
];
// Endereço da vitrine — se o domínio mudar, é só trocar aqui
const SITE_URL = "https://fitmgwear-site.vercel.app/";
const NAV_DONO = [
  { id: "fotosite", label: "Fotos do Site", icon: "eye", group: "Admin" },
  { id: "versite", label: "Ver Site", icon: "external", group: "Admin", href: SITE_URL },
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
          <div><div className="logo-name">FITMGWEAR</div><div className="logo-sub">Gestão</div></div>
        </div>
        <nav className="sidebar-nav">
          {groups.map(g => (
            <div key={g}>
              <div className="nav-label">{g}</div>
              {navItems.filter(i => i.group === g).map(item => (
                item.href ? (
                  // link externo (vitrine) — abre em outra aba, não troca a página do ERP
                  <a key={item.id} className="nav-item" href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClose} style={{ textDecoration: "none" }}>
                    <Icon name={item.icon} size={16} />{item.label}
                  </a>
                ) : (
                  <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { onNavigate(item.id); onClose(); }}>
                    <Icon name={item.icon} size={16} />{item.label}
                  </div>
                )
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          {perfil && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 8, background: "var(--surface2)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: perfil.cargo === "dono" ? "rgba(232,184,75,0.2)" : "rgba(77,166,255,0.15)", color: perfil.cargo === "dono" ? "var(--accent)" : "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                {(perfil.nome || "?")[0].toUpperCase()}
              </div>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{perfil.nome}</div><div style={{ fontSize: 10, color: perfil.cargo === "dono" ? "var(--accent)" : "var(--blue)", textTransform: "capitalize" }}>{perfil.cargo}</div></div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", padding: "4px 12px 8px", fontSize: 11, color: "var(--text2)" }}>
            <Icon name="sync" size={12} /><span style={{ marginLeft: 6 }}>Firebase — tempo real</span><div className="sync-dot" />
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

// `filtros` deve ser uma constante de módulo (não recriar a cada render,
// senão a inscrição no Firestore é refeita a cada atualização de tela)
function useCollection(colName, filtros) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const alvo = filtros ? query(collection(db, colName), ...filtros) : collection(db, colName);
    const unsub = onSnapshot(alvo, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [colName, filtros]);
  return [items, loading];
}

// A tela "Fotos do Site" só cuida do carrossel, da galeria e da foto da dona —
// as fotos grandes dos produtos moram na mesma coleção e ficam de fora daqui.
const FILTRO_FOTOS_SITE = [where("tipo", "in", ["carrossel", "galeria", "dona"])];

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("painel");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  useEffect(() => {
    let unsubPerfil = null;
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (unsubPerfil) { unsubPerfil(); unsubPerfil = null; }
      setUsuario(u);
      if (u) {
        // Escuta o perfil do próprio usuário em tempo real. Se o perfil for
        // removido (ex: em "Usuários" > Remover), o acesso é revogado na hora,
        // mesmo que a pessoa já esteja com o sistema aberto.
        unsubPerfil = onSnapshot(
          doc(db, "usuarios", u.uid),
          (snap) => {
            if (!snap.exists()) {
              setPerfil(null);
              signOut(auth);
              return;
            }
            setPerfil({ id: snap.id, ...snap.data() });
            setPrimeiroAcesso(false);
            setAuthLoading(false);
          },
          () => setAuthLoading(false)
        );
      } else {
        setPerfil(null);
        try { const snap = await getDocs(collection(db, "usuarios")); setPrimeiroAcesso(snap.empty); } catch { setPrimeiroAcesso(false); }
        setAuthLoading(false);
      }
    });
    return () => { unsub(); if (unsubPerfil) unsubPerfil(); };
  }, []);

  const isDono = perfil?.cargo === "dono";

  const [transacoes, loadingT] = useCollection("transacoes");
  const [produtos, loadingP] = useCollection("produtos");
  const [clientes, loadingC] = useCollection("clientes");
  const [categorias, loadingCat] = useCollection("categorias");
  const [variantesProduto, loadingVP] = useCollection("variantesProduto");
  const [compras, loadingCo] = useCollection("compras");
  const [encomendas, loadingEn] = useCollection("encomendas");
  const [fiados, loadingFi] = useCollection("fiados");

  const loading = loadingT || loadingP || loadingC || loadingCat || loadingVP || loadingCo || loadingEn || loadingFi;

  useEffect(() => {
    if (!loadingCat && categorias.length === 0) {
      CATEGORIAS_PADRAO.forEach(c => setDoc(doc(db, "categorias", c.id), c));
    }
  }, [loadingCat, categorias.length]);

  const dados = { transacoes, produtos, clientes, categorias, variantesProduto, compras, encomendas, fiados };

  async function handleLogout() { await signOut(auth); setPage("painel"); }

  // Compras
  async function adicionarCompra(c) { const id = uid(); await setDoc(doc(db, "compras", id), { ...c, id, criadoEm: new Date().toISOString() }); }
  async function receberCompra(id) {
    const c = compras.find(x => x.id === id);
    if (c) await setDoc(doc(db, "compras", id), { ...c, status: "recebido", dataRecebimento: hojeLocal() });
    toast("Marcado como recebido! ✓");
  }
  async function removerCompra(id) { await deleteDoc(doc(db, "compras", id)); }

  // Encomendas
  async function adicionarEncomenda(e) { const id = uid(); await setDoc(doc(db, "encomendas", id), { ...e, id, criadoEm: new Date().toISOString() }); }
  async function atualizarEncomenda(id, upd) { const e = encomendas.find(x => x.id === id); if (e) await setDoc(doc(db, "encomendas", id), { ...e, ...upd }); }
  async function removerEncomenda(id) { await deleteDoc(doc(db, "encomendas", id)); }

  // Fiado
  async function adicionarFiado(f) {
    const id = uid();
    await setDoc(doc(db, "fiados", id), { ...f, id, criadoEm: new Date().toISOString() });
    // Baixa estoque de todos os itens do carrinho
    const itensFiado = f.itens && f.itens.length > 0 ? f.itens : [];
    for (const item of itensFiado) {
      if (item.varianteId) {
        const variante = variantesProduto.find(v => v.id === item.varianteId);
        if (variante) await setDoc(doc(db, "variantesProduto", variante.id), { ...variante, estoque: Math.max(0, variante.estoque - item.quantidade) });
      } else if (item.produtoId) {
        const prod = produtos.find(p => p.id === item.produtoId);
        if (prod) await setDoc(doc(db, "produtos", prod.id), { ...prod, quantidadeEstoque: Math.max(0, prod.quantidadeEstoque - item.quantidade) });
      }
    }
  }
  async function pagarFiado(id) {
    const f = fiados.find(x => x.id === id);
    if (!f) return;
    await setDoc(doc(db, "fiados", id), { ...f, status: "pago", dataPagamento: hojeLocal() });
    // Só entra no faturamento quando pago
    const tId = uid();
    let descricao;
    if (f.itens && f.itens.length > 0) {
      descricao = `Fiado recebido — ${f.nome} (${f.itens.map(i => `${i.quantidade}x ${i.label}`).join(", ")})`;
    } else {
      const nomeProd = f.produtoId ? (produtos.find(p => p.id === f.produtoId)?.nome || "") : "";
      descricao = nomeProd ? `Fiado recebido — ${f.nome} (${f.quantidade || 1}x ${nomeProd})` : `Fiado recebido — ${f.nome}`;
    }
    await setDoc(doc(db, "transacoes", tId), {
      id: tId, tipo: "venda", descricao, valor: f.valor,
      cliente: f.nome, data: hojeLocal(), observacoes: f.observacoes || "",
      quantidade: f.quantidade || 1, fiadoId: id,
    });
    toast("Marcado como pago! Valor adicionado ao faturamento ✓");
  }
  async function removerFiado(id) { await deleteDoc(doc(db, "fiados", id)); }

  async function pagarParcialFiado(id, valorPago) {
    const f = fiados.find(x => x.id === id);
    if (!f) return;
    const valorRestante = Math.max(0, f.valor - valorPago);
    const totalJaPago = (f.totalPago || 0) + valorPago;

    // Atualiza o fiado — abate o valor, registra histórico de parcelas
    const historico = f.historicoPagamentos || [];
    historico.push({ valor: valorPago, data: hojeLocal() });

    if (valorRestante <= 0) {
      // Quitou tudo — marca como pago
      await setDoc(doc(db, "fiados", id), { ...f, status: "pago", valor: 0, totalPago: totalJaPago, historicoPagamentos: historico, dataPagamento: hojeLocal() });
    } else {
      // Ainda tem saldo — atualiza valor restante
      await setDoc(doc(db, "fiados", id), { ...f, valor: valorRestante, totalPago: totalJaPago, historicoPagamentos: historico });
    }

    // Registra a parcela como transação no faturamento
    const tId = uid();
    const descricao = `Fiado parcial recebido — ${f.nome} (${valorRestante > 0 ? `resta ${formatBRL(valorRestante)}` : "quitado"})`;
    await setDoc(doc(db, "transacoes", tId), {
      id: tId, tipo: "venda", descricao, valor: valorPago,
      cliente: f.nome, data: hojeLocal(), observacoes: f.observacoes || "",
      quantidade: 1, fiadoId: id,
    });

    if (valorRestante <= 0) {
      toast("Fiado quitado! Valor adicionado ao faturamento ✓");
    } else {
      toast(`Parcial de ${formatBRL(valorPago)} recebido! Resta ${formatBRL(valorRestante)} ✓`);
    }
  }

  // Venda com carrinho (múltiplos itens)
  async function adicionarVendaCarrinho(payload) {
    const { itens, descricao, valor, cliente, categoria, data, observacoes } = payload;
    // Baixa o estoque de cada item
    for (const item of itens) {
      if (item.varianteId) {
        const variante = variantesProduto.find(v => v.id === item.varianteId);
        if (variante) await setDoc(doc(db, "variantesProduto", variante.id), { ...variante, estoque: Math.max(0, variante.estoque - item.quantidade) });
      } else if (item.produtoId) {
        const prod = produtos.find(p => p.id === item.produtoId);
        if (prod) await setDoc(doc(db, "produtos", prod.id), { ...prod, quantidadeEstoque: Math.max(0, prod.quantidadeEstoque - item.quantidade) });
      }
    }
    // Registra uma única transação com a descrição completa
    const id = uid();
    await setDoc(doc(db, "transacoes", id), {
      id, tipo: "venda", descricao, valor, cliente: cliente || "", categoria: categoria || "",
      data: data || hojeLocal(), observacoes: observacoes || "",
      quantidade: itens.reduce((s, i) => s + i.quantidade, 0),
      itens,
    });
    toast(`Venda finalizada! ${itens.length} item(s) — ${formatBRL(valor)} ✓`);
    setPage("transacoes");
  }

  // Transações
  async function adicionarTransacao(t) {
    const id = uid();
    const novaT = { ...t, id, data: t.data || hojeLocal() };
    if (t.produtoId && t.tipo === "venda") {
      if (t.varianteId) {
        const variante = variantesProduto.find(v => v.id === t.varianteId);
        if (variante) await setDoc(doc(db, "variantesProduto", variante.id), { ...variante, estoque: Math.max(0, variante.estoque - t.quantidade) });
      } else {
        const prod = produtos.find(p => p.id === t.produtoId);
        if (prod) await setDoc(doc(db, "produtos", prod.id), { ...prod, quantidadeEstoque: Math.max(0, prod.quantidadeEstoque - t.quantidade) });
      }
    }
    await setDoc(doc(db, "transacoes", id), novaT);
    toast(t.tipo === "venda" ? "Venda registrada! ✓" : "Despesa registrada! ✓");
    setPage("transacoes");
  }
  async function removerTransacao(id) { await deleteDoc(doc(db, "transacoes", id)); }

  // Clientes
  async function adicionarCliente(c) { const id = uid(); await setDoc(doc(db, "clientes", id), { ...c, id, dataCriacao: new Date().toISOString() }); }
  async function removerCliente(id) { await deleteDoc(doc(db, "clientes", id)); }
  async function atualizarCliente(id, upd) { const c = clientes.find(x => x.id === id); if (c) await setDoc(doc(db, "clientes", id), { ...c, ...upd }); }

  // Categorias
  async function adicionarCategoria(c) { const id = uid(); await setDoc(doc(db, "categorias", id), { ...c, id }); }
  async function removerCategoria(id) { await deleteDoc(doc(db, "categorias", id)); }

  // Produtos
  // A foto grande fica fora do produto (em siteFotos, id "prod_<id>") porque a
  // vitrine baixa TODOS os produtos de uma vez — só a miniatura pode viajar junto.
  // O site busca a versão grande só quando o cliente abre a peça em tela cheia.
  async function salvarFotoGrande(produtoId, imagemGrande) {
    const ref = doc(db, "siteFotos", `prod_${produtoId}`);
    if (imagemGrande) {
      await setDoc(ref, { id: `prod_${produtoId}`, tipo: "produto", produtoId, imagem: imagemGrande, criadoEm: new Date().toISOString() });
    } else {
      await deleteDoc(ref).catch(() => {});
    }
  }
  async function adicionarProduto(p) {
    const { imagemGrande, ...dados } = p;
    const id = uid();
    await setDoc(doc(db, "produtos", id), { ...dados, id, dataCriacao: new Date().toISOString() });
    if (imagemGrande !== undefined) await salvarFotoGrande(id, imagemGrande);
  }
  async function removerProduto(id) {
    await deleteDoc(doc(db, "produtos", id));
    const vars = variantesProduto.filter(v => v.produtoPaiId === id);
    for (const v of vars) await deleteDoc(doc(db, "variantesProduto", v.id));
    await deleteDoc(doc(db, "siteFotos", `prod_${id}`)).catch(() => {});
  }
  async function atualizarProduto(id, upd) {
    const { imagemGrande, ...dados } = upd;
    const p = produtos.find(x => x.id === id);
    if (p) await setDoc(doc(db, "produtos", id), { ...p, ...dados });
    if (imagemGrande !== undefined) await salvarFotoGrande(id, imagemGrande);
  }

  // Variantes
  async function adicionarVariante(v) { const id = uid(); await setDoc(doc(db, "variantesProduto", id), { ...v, id, criadoEm: new Date().toISOString() }); }
  async function removerVariante(id) { await deleteDoc(doc(db, "variantesProduto", id)); }
  async function atualizarVariante(id, upd) { const v = variantesProduto.find(x => x.id === id); if (v) await setDoc(doc(db, "variantesProduto", id), { ...v, ...upd }); }

  if (authLoading) return (<><style>{CSS}</style><SplashScreen /></>);
  if (!usuario) return (<><style>{CSS}</style><LoginScreen primeiroAcesso={primeiroAcesso} /><ToastContainer /></>);
  if (loading) return (<><style>{CSS}</style><SplashScreen /></>);

  function renderPage() {
    if (page === "painel") return <Dashboard dados={dados} />;
    if (page === "venda") return (
      <div>
        <div className="page-header"><div><h1 className="page-title">Nova Venda</h1><p className="page-sub">Monte o carrinho e finalize a venda</p></div></div>
        <CarrinhoVenda dados={dados} onSalvar={adicionarVendaCarrinho} onCancelar={() => setPage("painel")} />
      </div>
    );
    if (page === "despesa") return (
      <div>
        <div className="page-header"><div><h1 className="page-title">Registrar Despesa</h1><p className="page-sub">Adicione uma nova despesa</p></div></div>
        <div className="card"><div className="card-body"><FormTransacao tipo="despesa" dados={dados} onSalvar={adicionarTransacao} onCancelar={() => setPage("painel")} /></div></div>
      </div>
    );
    if (page === "transacoes") return <Transacoes dados={dados} onRemover={removerTransacao} />;
    if (page === "estoque") return <Estoque dados={dados} onAdicionar={adicionarProduto} onRemover={removerProduto} onAtualizar={atualizarProduto} onAdicionarVariante={adicionarVariante} onRemoverVariante={removerVariante} onAtualizarVariante={atualizarVariante} />;
    if (page === "clientes") return <Clientes dados={dados} onAdicionar={adicionarCliente} onRemover={removerCliente} onAtualizar={atualizarCliente} />;
    if (page === "categorias") return <Categorias dados={dados} onAdicionar={adicionarCategoria} onRemover={removerCategoria} />;
    if (page === "relatorio") return <RelatorioPDF dados={dados} />;
    if (page === "compras") return <Compras compras={compras} onAdicionar={adicionarCompra} onReceber={receberCompra} onRemover={removerCompra} />;
    if (page === "encomendas") return <Encomendas encomendas={encomendas} onAdicionar={adicionarEncomenda} onAtualizar={atualizarEncomenda} onRemover={removerEncomenda} />;
    if (page === "fiado") return <Fiado fiados={fiados} onAdicionar={adicionarFiado} onPagar={pagarFiado} onPagarParcial={pagarParcialFiado} onRemover={removerFiado} dados={dados} />;
    if (page === "fotosite" && isDono) return <FotosSite />;
    if (page === "usuarios" && isDono) return <GerenciarUsuarios usuarioAtual={usuario} />;
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="mobile-navbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Icon name="menu" size={18} /></button>
          <div className="mobile-logo">
            <div className="mobile-logo-img"><img src={logoImg} alt="Logo" /></div>
            <span className="mobile-logo-name">FITMGWEAR</span>
          </div>
        </div>
        <Sidebar page={page} onNavigate={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} perfil={perfil} isDono={isDono} />
        <main className="main"><div className="page">{renderPage()}</div></main>
      </div>
      <ToastContainer />
    </>
  );
}
