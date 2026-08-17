export default function EngineCard({
  engine,
  setEngine,
  apiKey,
  setApiKey,
  elStatus,
  onLoadVoices,
  rate,
  setRate,
  pitch,
  setPitch,
  vol,
  setVol,
}) {
  return (
    <div className="card">
      <div className="eyebrow">
        <span className="n">02</span> Motor de voz
      </div>
      <h2>De dónde salen las voces</h2>

      <div className="seg">
        <button className={engine === "browser" ? "on" : ""} onClick={() => setEngine("browser")}>
          Navegador · gratis
        </button>
        <button className={engine === "el" ? "on" : ""} onClick={() => setEngine("el")}>
          ElevenLabs · API
        </button>
      </div>

      <div className={"el-box" + (engine === "el" ? " show" : "")}>
        <label htmlFor="apiKey">API key de ElevenLabs</label>
        <div className="row">
          <input
            type="password"
            id="apiKey"
            placeholder="sk_..."
            autoComplete="off"
            style={{ flex: 2 }}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={onLoadVoices}>
            Cargar voces
          </button>
        </div>
        <div className="hint" style={{ color: elStatus.color || undefined }}>
          {elStatus.text}
        </div>
      </div>

      <div className="fader" style={{ marginTop: 6 }}>
        <div className="flabel">
          <span>Velocidad</span>
          <span className="val">{rate.toFixed(1)}×</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
      </div>

      {engine !== "el" && (
        <div className="fader">
          <div className="flabel">
            <span>Tono</span>
            <span className="val">{pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
          />
        </div>
      )}

      <div className="fader">
        <div className="flabel">
          <span>Volumen</span>
          <span className="val">{Math.round(vol * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={vol}
          onChange={(e) => setVol(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
