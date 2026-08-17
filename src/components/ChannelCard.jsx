export default function ChannelCard({
  channelInput,
  setChannelInput,
  connected,
  connecting,
  corsBanner,
  onCloseBanner,
  onConnect,
  onDisconnect,
}) {
  return (
    <div className="card">
      <div className="eyebrow">
        <span className="n">01</span> Canal
      </div>
      <h2>Conecta tu chat</h2>

      <div className={"banner" + (corsBanner.show ? " show" : "")}>
        <div>
          <b>No pude resolver el canal solo.</b> Abre{" "}
          <a href={corsBanner.apiUrl || "#"} target="_blank" rel="noreferrer">
            este enlace
          </a>
          , busca <code>"chatroom"</code> y copia el número de <code>id</code>. Pégalo abajo.
        </div>
        <span className="x" onClick={onCloseBanner}>
          ×
        </span>
      </div>

      <label htmlFor="channelInput">Nombre del canal o ID del chatroom</label>
      <input
        type="text"
        id="channelInput"
        placeholder="p. ej. xqc  ·  o  ·  668"
        autoComplete="off"
        value={channelInput}
        disabled={connected}
        onChange={(e) => setChannelInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !connected) onConnect();
        }}
      />
      <div className="hint">
        El nombre que va después de <code>kick.com/</code>, o el ID numérico si ya lo tienes.
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        {!connected && (
          <button className="btn btn-primary" style={{ flex: 2 }} disabled={connecting} onClick={onConnect}>
            Conectar
          </button>
        )}
        {connected && (
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={onDisconnect}>
            Desconectar
          </button>
        )}
      </div>
    </div>
  );
}
