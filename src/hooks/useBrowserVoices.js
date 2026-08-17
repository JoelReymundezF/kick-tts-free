import { useEffect, useState } from "react";

// Expone las voces de Web Speech API, con las voces en español primero.
export function useBrowserVoices() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    function load() {
      const list = window.speechSynthesis.getVoices();
      if (!list.length) return;
      const sorted = [...list].sort((a, b) => {
        const es = (v) => (v.lang.toLowerCase().startsWith("es") ? 0 : 1);
        return es(a) - es(b) || a.name.localeCompare(b.name);
      });
      setVoices(sorted);
    }

    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return voices;
}
