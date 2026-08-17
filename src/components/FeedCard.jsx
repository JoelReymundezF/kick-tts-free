import { useEffect, useRef } from "react";

export default function FeedCard({ feed, readCount, speakingId, onSkip, onStop }) {
  const feedRef = useRef(null);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [feed]);

  return (
    <div className="card feed-card">
      <div className="feed-head">
        <div className="eyebrow" style={{ marginBottom: 0 }}>
          <span className="n">04</span> En vivo
        </div>
        <div className="counter">
          {readCount}
          {readCount === 1 ? " leído" : " leídos"}
        </div>
      </div>

      <div className="feed" ref={feedRef}>
        {!feed.length && (
          <div className="feed-empty">
            <div className="big">Esperando comandos</div>
            <div>Conecta el canal. Cuando alguien use el comando, aparecerá aquí.</div>
          </div>
        )}
        {feed.map((m) => (
          <div
            key={m.id}
            className={"msg " + m.kind + (m.id === speakingId ? " speaking" : "")}
          >
            {m.badge && <span className="badge">{m.badge}</span>}
            <span className="u" style={{ color: m.color || "var(--kick)" }}>
              {m.username}
            </span>
            <span className="t">{m.content}</span>
          </div>
        ))}
      </div>

      <div className="feed-foot">
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onSkip}>
          Saltar actual
        </button>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={onStop}>
          Silenciar todo
        </button>
      </div>
    </div>
  );
}
