// Resuelve un nombre de canal ("xqc") o ID ("668") al ID numérico de chatroom que usa Pusher.
export async function resolveChatroom(value) {
  const v = value.trim().replace(/^kick\.com\//i, "").replace(/^@/, "");

  if (/^\d+$/.test(v)) return { id: parseInt(v, 10), apiUrl: null };

  const apiUrl = `https://kick.com/api/v2/channels/${encodeURIComponent(v)}`;
  try {
    const r = await fetch(apiUrl);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    if (d?.chatroom?.id) return { id: d.chatroom.id, apiUrl: null };
    throw new Error("sin chatroom");
  } catch {
    // Probablemente CORS del navegador: dejamos el enlace para que el usuario lo resuelva a mano.
    return { id: null, apiUrl };
  }
}
