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
