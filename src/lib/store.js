// Almacenamiento tolerante: usa localStorage si está disponible, si no cae a memoria.
const mem = {};

export const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return key in mem ? mem[key] : null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      mem[key] = value;
    }
  },
};
