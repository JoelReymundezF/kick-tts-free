export default function VoiceSlots({
  slots,
  engine,
  browserVoices,
  elVoices,
  onNumChange,
  onVoiceChange,
  onDelete,
  onTest,
  onAdd,
}) {
  return (
    <>
      {slots.map((slot, i) => (
        <div className="slot" key={i}>
          <div className="num">
            <input
              type="text"
              inputMode="numeric"
              value={slot.num}
              onChange={(e) => onNumChange(i, e.target.value)}
            />
          </div>

          <div className="vsel">
            {engine === "browser" ? (
              <select value={slot.browserURI || ""} onChange={(e) => onVoiceChange(i, e.target.value)}>
                {!browserVoices.length && <option>Cargando voces…</option>}
                {browserVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} — {v.lang}
                  </option>
                ))}
              </select>
            ) : (
              <select value={slot.elId || ""} onChange={(e) => onVoiceChange(i, e.target.value)}>
                {!elVoices.length && <option>Carga tus voces arriba…</option>}
                {elVoices.map((v) => (
                  <option key={v.voice_id} value={v.voice_id}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="acts">
            <button className="icon-btn" title="Probar" onClick={() => onTest(slot)}>
              ▶
            </button>
            <button className="icon-btn del" title="Borrar" onClick={() => onDelete(i)}>
              ✕
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 4 }} onClick={onAdd}>
        + Añadir voz
      </button>
    </>
  );
}
