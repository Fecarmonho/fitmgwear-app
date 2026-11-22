export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function lerImagemComoBase64(file, maxLado = 480, qualidade = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!file.type || !file.type.startsWith("image/")) return reject(new Error("Arquivo não é uma imagem"));
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxLado || height > maxLado) {
          if (width > height) { height = Math.round(height * (maxLado / width)); width = maxLado; }
          else { width = Math.round(width * (maxLado / height)); height = maxLado; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatBRL(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

export function formatData(iso) {
  if (!iso) return "";
  const partes = iso.slice(0, 10).split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function hojeLocal() {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// ─────────────────────────────────────────────
// PRECIFICAÇÃO
// ─────────────────────────────────────────────
// Margem e markup NÃO são a mesma coisa, e trocar um pelo outro é o erro de
// conta mais comum no varejo:
//   margem = lucro ÷ preço de VENDA   → quanto sobra de cada real que entra
//   markup = lucro ÷ preço de COMPRA  → por quanto o custo foi multiplicado
// Ex.: custo 0,89 e venda 2,00 → lucro 1,11 → margem 55,5% / markup 124,7%.
// Quem lê o markup achando que é margem imagina ganhar o dobro do que ganha.
export function calcPreco(custo, venda) {
  const c = Number(custo) || 0;
  const v = Number(venda) || 0;
  const lucro = v - c;
  return {
    lucro,
    margem: v > 0 ? (lucro / v) * 100 : null,
    markup: c > 0 ? (lucro / c) * 100 : null,
  };
}

// Faixas usadas para colorir os indicadores de margem no app inteiro.
// São referência de varejo de moda — ajuste aos números do seu negócio.
export const FAIXAS_MARGEM = { boa: 50, media: 30 };

export function faixaMargem(margem) {
  if (margem === null || margem === undefined || Number.isNaN(margem)) return "neutra";
  if (margem >= FAIXAS_MARGEM.boa) return "boa";
  if (margem >= FAIXAS_MARGEM.media) return "media";
  return "baixa";
}

// Classe de badge correspondente, para as telas em React
export function badgeMargem(margem) {
  const f = faixaMargem(margem);
  return f === "boa" ? "badge-green" : f === "media" ? "badge-gold" : "badge-red";
}

// Cores cruas, para o HTML dos relatórios impressos
export function coresMargem(margem) {
  const f = faixaMargem(margem);
  if (f === "boa") return { fundo: "#dcfce7", texto: "#16a34a" };
  if (f === "media") return { fundo: "#fef9c3", texto: "#d97706" };
  if (f === "baixa") return { fundo: "#fee2e2", texto: "#dc2626" };
  return { fundo: "#f3f4f6", texto: "#9ca3af" };
}

// ─────────────────────────────────────────────
// ORDENAÇÃO DE VARIANTES (Tamanho/Cor)
// ─────────────────────────────────────────────
export const ORDEM_TAMANHOS = ["PP", "P", "M", "G", "GG", "GG1", "GG2", "GG3", "XG", "XGG", "EG", "EGG", "EXG", "EXGG", "U", "UNICO", "ÚNICO"];

export function tamanhoRank(tam) {
  const t = (tam || "").trim().toUpperCase();
  const idx = ORDEM_TAMANHOS.indexOf(t);
  if (idx !== -1) return idx;
  if (/^\d+$/.test(t)) return 1000 + parseInt(t, 10); // numeração (ex: 36, 38, 40...)
  return 2000; // tamanhos não reconhecidos vão por último
}

export function compararTamanhos(a, b) {
  const ra = tamanhoRank(a), rb = tamanhoRank(b);
  if (ra !== rb) return ra - rb;
  return (a || "").localeCompare(b || "", "pt-BR", { sensitivity: "base" });
}

export function partesVariante(label) {
  const partes = (label || "").split("/").map(s => s.trim());
  const [tam, ...corParts] = partes;
  return { tam: tam || "", cor: corParts.join("/") };
}

export function ordenarVariantes(vars) {
  return [...vars].sort((a, b) => {
    const pa = partesVariante(a.label);
    const pb = partesVariante(b.label);
    const cmpCor = pa.cor.localeCompare(pb.cor, "pt-BR", { sensitivity: "base" });
    if (cmpCor !== 0) return cmpCor;
    return compararTamanhos(pa.tam, pb.tam);
  });
}
