import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import ChannelCard from "./components/ChannelCard.jsx";
import EngineCard from "./components/EngineCard.jsx";
import CommandCard from "./components/CommandCard.jsx";
import FeedCard from "./components/FeedCard.jsx";
import Footer from "./components/Footer.jsx";
import { useBrowserVoices } from "./hooks/useBrowserVoices.js";
import { useSpeechQueue } from "./hooks/useSpeechQueue.js";
import { useKickChat } from "./hooks/useKickChat.js";
import { findSlot, parseCommand, stripEmotes } from "./lib/commands.js";
import { resolveChatroom } from "./lib/resolveChannel.js";
import { EL_VOICES } from "./lib/constants.js";
import { store } from "./lib/store.js";

function loadInitialSlots() {
  try {
    const raw = store.get("slots");
    const parsed = raw ? JSON.parse(raw) : [];
    if (parsed.length) return parsed;
  } catch {
    /* ignore malformed local data */
  }
  return [{ num: "1", browserURI: "", elId: "" }];
}

export default function App() {
  // ---- canal / conexión ----
  const [channelInput, setChannelInput] = useState(() => store.get("channel") || "");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatusState] = useState({ kind: "", text: "Desconectado" });
  const [corsBanner, setCorsBanner] = useState({ show: false, apiUrl: "" });

  const setStatus = useCallback((kind, text) => setStatusState({ kind, text }), []);

  // ---- motor de voz ----
  const [engine, setEngine] = useState("browser");
  const [apiKey, setApiKey] = useState(() => store.get("el_key") || "");
  const [elVoices, setElVoices] = useState([]);
  const [elStatus, setElStatus] = useState({
    text: "Pega tu key y pulsa «Cargar voces» para traer tus voces clonadas.",
    color: "",
  });
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [vol, setVol] = useState(1);

  // ---- comando ----
  const [prefix, setPrefix] = useState("!voz");
  const [onlyCmd, setOnlyCmd] = useState(true);

  // ---- voces / slots ----
  const browserVoices = useBrowserVoices();
  const [slots, setSlots] = useState(loadInitialSlots);

  // ---- feed ----
  const [feed, setFeed] = useState([]);
  const [readCount, setReadCount] = useState(0);
  const feedIdRef = useRef(0);

  // refs "en vivo" para que la cola de voz y el socket siempre lean el valor actual
  // sin tener que reconectar o recrear callbacks en cada render.
  const engineRef = useRef(engine);
  engineRef.current = engine;
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const pitchRef = useRef(pitch);
  pitchRef.current = pitch;
  const volRef = useRef(vol);
  volRef.current = vol;
  const browserVoicesRef = useRef(browserVoices);
  browserVoicesRef.current = browserVoices;

  const { speak, skip, stopAll, speakingId } = useSpeechQueue({
    engineRef,
    rateRef,
    pitchRef,
    volRef,
    browserVoicesRef,
  });

  // ---- persistencia ----
  useEffect(() => {
    store.set("slots", JSON.stringify(slots));
  }, [slots]);

  // asigna una voz por defecto a los slots que aún no tienen una, en cuanto hay voces cargadas
  useEffect(() => {
    if (!browserVoices.length) return;
    setSlots((s) => s.map((slot) => (slot.browserURI ? slot : { ...slot, browserURI: browserVoices[0].voiceURI })));
  }, [browserVoices]);

  useEffect(() => {
    if (!elVoices.length) return;
    setSlots((s) => s.map((slot) => (slot.elId ? slot : { ...slot, elId: elVoices[0].voice_id })));
  }, [elVoices]);

  const addToFeed = useCallback((username, content, color, kind, badge) => {
    const id = ++feedIdRef.current;
    setFeed((f) => {
      const next = [...f, { id, username, content, color, kind, badge }];
      return next.length > 120 ? next.slice(next.length - 120) : next;
    });
    return id;
  }, []);

  // el handler de mensajes vive en un ref: siempre usa el prefix/slots/engine más recientes
  // sin forzar al hook de websocket a reconectar cuando cambian.
  const onMessageRef = useRef(() => {});
  onMessageRef.current = (d) => {
    const username = d.sender?.username || "alguien";
    const color = d.sender?.identity?.color;
    const content = d.content || "";
    const parsed = parseCommand(content, prefix, onlyCmd);
    if (!parsed) {
      addToFeed(username, content, color, "plain");
      return;
    }
    const text = stripEmotes(parsed.text);
    if (!text) {
      addToFeed(username, content, color, "plain");
      return;
    }
    const slot = findSlot(slots, parsed.num);
    const badge = parsed.isCmd ? "voz " + (slot ? slot.num : "?") : null;
    const id = addToFeed(username, parsed.isCmd ? text : content, color, parsed.isCmd ? "cmd" : "", badge);
    speak(text, slot, id);
    setReadCount((c) => c + 1);
  };

  const { connect, disconnect } = useKickChat({ onMessageRef, onStatus: setStatus });

  // ---- acciones: canal ----
  async function handleConnect() {
    const v = channelInput.trim();
    if (!v) return;
    store.set("channel", v);
    setConnecting(true);
    setStatus("wait", "Buscando canal…");
    const { id, apiUrl } = await resolveChatroom(v);
    if (!id) {
      setStatus("err", "No encontrado");
      setCorsBanner({ show: true, apiUrl });
      setConnecting(false);
      return;
    }
    setConnected(true);
    setConnecting(false);
    connect(id);
  }

  function handleDisconnect() {
    disconnect();
    window.speechSynthesis?.cancel();
    stopAll();
    setConnected(false);
  }

  // ---- acciones: ElevenLabs ----
  async function handleLoadVoices() {
    const key = apiKey.trim();
    if (!key) return;
    store.set("el_key", key);
    setElStatus({ text: "Cargando…", color: "var(--amber)" });
    try {
      const r = await fetch(EL_VOICES, { headers: { "xi-api-key": key } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      const voices = (data.voices || []).map((v) => ({ voice_id: v.voice_id, name: v.name }));
      setElVoices(voices);
      setElStatus({ text: `${voices.length} voces cargadas ✓`, color: "var(--kick)" });
    } catch {
      setElStatus({
        text:
          "No se pudo cargar (¿key mal o bloqueo CORS del navegador?). Si el error es de CORS, hace falta un mini-proxy — pídemelo.",
        color: "var(--red)",
      });
    }
  }

  // ---- acciones: slots ----
  function handleSlotNumChange(i, value) {
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, num: value.replace(/\D/g, "") } : slot)));
  }
  function handleSlotVoiceChange(i, value) {
    setSlots((s) =>
      s.map((slot, idx) => {
        if (idx !== i) return slot;
        return engine === "browser" ? { ...slot, browserURI: value } : { ...slot, elId: value };
      })
    );
  }
  function handleSlotDelete(i) {
    setSlots((s) => s.filter((_, idx) => idx !== i));
  }
  function handleSlotAdd() {
    setSlots((s) => {
      const nextNum = (s.reduce((m, x) => Math.max(m, parseInt(x.num, 10) || 0), 0) + 1).toString();
      return [...s, { num: nextNum, browserURI: browserVoices[0]?.voiceURI || "", elId: elVoices[0]?.voice_id || "" }];
    });
  }
  function handleSlotTest(slot) {
    speak("Así sueno con esta voz.", slot, null);
  }

  return (
    <div className="wrap">
      <Header status={status} />

      <div className="grid">
        <div className="col">
          <ChannelCard
            channelInput={channelInput}
            setChannelInput={setChannelInput}
            connected={connected}
            connecting={connecting}
            corsBanner={corsBanner}
            onCloseBanner={() => setCorsBanner((b) => ({ ...b, show: false }))}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <EngineCard
            engine={engine}
            setEngine={setEngine}
            apiKey={apiKey}
            setApiKey={setApiKey}
            elStatus={elStatus}
            onLoadVoices={handleLoadVoices}
            rate={rate}
            setRate={setRate}
            pitch={pitch}
            setPitch={setPitch}
            vol={vol}
            setVol={setVol}
          />
        </div>

        <div className="col">
          <CommandCard
            prefix={prefix}
            setPrefix={setPrefix}
            onlyCmd={onlyCmd}
            setOnlyCmd={setOnlyCmd}
            slots={slots}
            engine={engine}
            browserVoices={browserVoices}
            elVoices={elVoices}
            onSlotNumChange={handleSlotNumChange}
            onSlotVoiceChange={handleSlotVoiceChange}
            onSlotDelete={handleSlotDelete}
            onSlotTest={handleSlotTest}
            onSlotAdd={handleSlotAdd}
          />
          <FeedCard feed={feed} readCount={readCount} speakingId={speakingId} onSkip={skip} onStop={stopAll} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
