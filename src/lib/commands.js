// Interpreta un mensaje de chat como comando de voz.
// "!voz 2 hola qué tal" -> { isCmd:true, num:"2", text:"hola qué tal" }
export function parseCommand(content, prefix, onlyCmd) {
  const p = (prefix || "!voz").trim();
  const t = content.trim();

  if (t.toLowerCase().startsWith(p.toLowerCase())) {
    const rest = t.slice(p.length).trim();
    const m = rest.match(/^(\d+)\s+([\s\S]+)$/); // "2 hola" -> num + texto
    if (m) return { isCmd: true, num: m[1], text: m[2].trim() };
    if (rest) return { isCmd: true, num: null, text: rest };
    return { isCmd: true, num: null, text: "" };
  }

  if (onlyCmd) return null; // sin comando y modo estricto -> ignorar
  return { isCmd: false, num: null, text: t }; // modo libre: leer todo
}

// Limpia los tokens de emote de Kick: [emote:123:nombre] -> nombre
export function stripEmotes(text) {
  return text
    .replace(/\[emote:\d+:([^\]]*)\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function findSlot(slots, num) {
  if (num == null) return slots[0] || null;
  return slots.find((s) => parseInt(s.num, 10) === parseInt(num, 10)) || slots[0] || null;
}
