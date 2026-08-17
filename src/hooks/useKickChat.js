import { useCallback, useRef } from "react";
import { CHAT_EVENT, PUSHER_URL } from "../lib/constants";

// Conexión al Pusher público de Kick: reconecta con backoff y hace ping-pong.
// `onMessageRef`/`onStatus` se leen vía ref para no tener que recrear el socket
// cada vez que cambian los ajustes de la UI (comando, slots, etc).
export function useKickChat({ onMessageRef, onStatus }) {
  const wsRef = useRef(null);
  const manualCloseRef = useRef(false);
  const reconnectDelayRef = useRef(1000);
  const keepAliveRef = useRef(null);
  const chatroomIdRef = useRef(null);
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const startKeepAlive = useCallback(() => {
    stopKeepAlive();
    // Evita que Chrome pause la síntesis de voz tras ~15s de inactividad de foco.
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, [stopKeepAlive]);

  const connectWS = useCallback(() => {
    manualCloseRef.current = false;
    onStatusRef.current("wait", "Conectando…");
    const ws = new WebSocket(PUSHER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: "pusher:subscribe",
          data: { auth: "", channel: `chatrooms.${chatroomIdRef.current}.v2` },
        })
      );
    };

    ws.onmessage = (ev) => {
      let f;
      try {
        f = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (f.event === "pusher:connection_established") {
        onStatusRef.current("live", "En vivo · " + chatroomIdRef.current);
        reconnectDelayRef.current = 1000;
        startKeepAlive();
        return;
      }
      if (f.event === "pusher:ping") {
        ws.send(JSON.stringify({ event: "pusher:pong", data: {} }));
        return;
      }
      if (f.event === CHAT_EVENT) {
        let d;
        try {
          d = JSON.parse(f.data);
        } catch {
          return;
        }
        onMessageRef.current(d);
      }
    };

    ws.onerror = () => onStatusRef.current("err", "Error de conexión");

    ws.onclose = () => {
      stopKeepAlive();
      if (manualCloseRef.current) {
        onStatusRef.current("", "Desconectado");
        return;
      }
      onStatusRef.current("wait", "Reconectando…");
      const delay = reconnectDelayRef.current + Math.random() * 800;
      reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 15000);
      setTimeout(() => {
        if (!manualCloseRef.current) connectWS();
      }, delay);
    };
  }, [onMessageRef, startKeepAlive, stopKeepAlive]);

  const connect = useCallback(
    (chatroomId) => {
      chatroomIdRef.current = chatroomId;
      connectWS();
    },
    [connectWS]
  );

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    wsRef.current?.close();
    stopKeepAlive();
    onStatusRef.current("", "Desconectado");
  }, [stopKeepAlive]);

  return { connect, disconnect };
}
