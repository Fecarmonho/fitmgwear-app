import { handleUpload } from "@vercel/blob/client";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Primeira função de servidor deste projeto (até aqui era só o site
// estático + Firestore direto do navegador). Existe só pra autorizar o
// envio de vídeo pro Vercel Blob — o arquivo em si vai direto do
// navegador pro Blob, essa rota só confere quem está pedindo.
function initAdmin() {
  if (getApps().length) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // No painel da Vercel a quebra de linha da chave vira "\n" literal.
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

const VIDEO_MAX_MB = 50;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  try {
    initAdmin();

    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) throw new Error("Não autenticado.");

    const decoded = await getAuth().verifyIdToken(idToken);
    const perfilSnap = await getFirestore().doc(`usuarios/${decoded.uid}`).get();
    if (!perfilSnap.exists || perfilSnap.data().cargo !== "dono") {
      throw new Error("Sem permissão pra enviar vídeo.");
    }

    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
        addRandomSuffix: true,
        maximumSizeInBytes: VIDEO_MAX_MB * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });

    res.status(200).json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Erro ao autorizar upload." });
  }
}
