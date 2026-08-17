import { useCallback, useRef, useState } from "react";
import { EL_MODEL, EL_TTS } from "../lib/constants";
import { store } from "../lib/store";

// Cola unificada de reproducción: intercala voz del navegador y ElevenLabs,
// leyendo siempre un mensaje a la vez en el orden en que llegaron.
export function useSpeechQueue({ engineRef, rateRef, pitchRef, volRef, browserVoicesRef }) {
  const queueRef = useRef([]);
  const playingRef = useRef(false);
  const [speakingId, setSpeakingId] = useState(null);

  const speakBrowser = useCallback(
    (text, uri) =>
      new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        const v = browserVoicesRef.current.find((x) => x.voiceURI === uri);
        if (v) u.voice = v;
        u.rate = rateRef.current;
        u.pitch = pitchRef.current;
        u.volume = volRef.current;
        u.onend = u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      }),
    [browserVoicesRef, rateRef, pitchRef, volRef]
  );

  const speakEL = useCallback(
    async (text, voiceId) => {
      const key = store.get("el_key") || "";
      const r = await fetch(EL_TTS + voiceId, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: EL_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!r.ok) throw new Error("EL " + r.status);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = volRef.current;
      audio.playbackRate = rateRef.current;
      await new Promise((resolve) => {
        audio.onended = audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.play().catch(() => resolve());
      });
    },
    [rateRef, volRef]
  );

  const playNext = useCallback(async () => {
    if (!queueRef.current.length) {
      playingRef.current = false;
      setSpeakingId(null);
      return;
    }
    playingRef.current = true;
    const { job, id } = queueRef.current.shift();
    setSpeakingId(id);
    try {
      await job();
    } catch (e) {
      console.error(e);
    }
    setSpeakingId(null);
    playNext();
  }, []);

  const enqueue = useCallback(
    (job, id) => {
      queueRef.current.push({ job, id });
      if (!playingRef.current) playNext();
    },
    [playNext]
  );

  const speak = useCallback(
    (text, slot, id) => {
      if (!text) return;
      if (engineRef.current === "el") {
        const voiceId = slot?.elId;
        if (!voiceId) return;
        enqueue(() => speakEL(text, voiceId), id);
      } else {
        const uri = slot?.browserURI;
        enqueue(() => speakBrowser(text, uri), id);
      }
    },
    [engineRef, enqueue, speakEL, speakBrowser]
  );

  const skip = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  const stopAll = useCallback(() => {
    window.speechSynthesis?.cancel();
    queueRef.current = [];
    playingRef.current = false;
    setSpeakingId(null);
  }, []);

  return { speak, skip, stopAll, speakingId };
}
