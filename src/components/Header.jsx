export default function Header({ status }) {
  return (
    <header>
      <div className="brand">
        <div className="logo">TTS</div>
        <div>
          <h1>Comandos de voz para Kick</h1>
          <div className="sub">
            Tu chat escribe <code className="k" style={{ fontSize: 11 }}>!voz 1 hola</code> y el bot lo lee
          </div>
        </div>
      </div>
      <div className={"status" + (status.kind ? " " + status.kind : "")}>
        <span className="dot"></span>
        <span>{status.text}</span>
      </div>
    </header>
  );
}
