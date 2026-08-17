import VoiceSlots from "./VoiceSlots.jsx";

export default function CommandCard({
  prefix,
  setPrefix,
  onlyCmd,
  setOnlyCmd,
  slots,
  engine,
  browserVoices,
  elVoices,
  onSlotNumChange,
  onSlotVoiceChange,
  onSlotDelete,
  onSlotTest,
  onSlotAdd,
}) {
  return (
    <div className="card">
      <div className="eyebrow">
        <span className="n">03</span> Comando y voces
      </div>
      <h2>Qué activa la lectura</h2>

      <div className="row" style={{ alignItems: "flex-end" }}>
        <div style={{ flex: 2 }}>
          <label htmlFor="prefix">Palabra del comando</label>
          <input
            type="text"
            id="prefix"
            autoComplete="off"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ opacity: 0 }}>.</label>
          <label className="sw" style={{ marginBottom: 9 }}>
            <input type="checkbox" checked={onlyCmd} onChange={(e) => setOnlyCmd(e.target.checked)} />
            <span className="track"></span>
          </label>
          <div className="hint" style={{ marginTop: 0 }}>
            Solo comandos
          </div>
        </div>
      </div>

      <div className="cmd-preview">
        Tu chat escribe: <b>{prefix || "!voz"}</b> <b style={{ color: "var(--amber)" }}>2</b> hola qué tal → lee
        «hola qué tal» con la voz <b style={{ color: "var(--amber)" }}>2</b>
      </div>

      <label style={{ marginTop: 18 }}>Voces disponibles</label>
      <VoiceSlots
        slots={slots}
        engine={engine}
        browserVoices={browserVoices}
        elVoices={elVoices}
        onNumChange={onSlotNumChange}
        onVoiceChange={onSlotVoiceChange}
        onDelete={onSlotDelete}
        onTest={onSlotTest}
        onAdd={onSlotAdd}
      />
      <div className="hint">
        El número de la izquierda es el que tu chat usa en el comando. Si escriben <code>!voz</code> sin número, se
        usa la primera.
      </div>
    </div>
  );
}
