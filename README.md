# Kick TTS · Comandos de voz (React)

Versión en React + Vite del panel original de un solo archivo HTML
(`kick-tts-comandos.html`). Misma funcionalidad, mismo diseño, ahora
como un proyecto con componentes y build real.

## Qué hace

Se conecta al chat en vivo de un canal de Kick (WebSocket público de
Pusher, sin backend) e interpreta comandos como:

```
!voz 2 hola qué tal
```

y lee el texto en voz alta con la voz asignada al número `2`, usando
la voz del navegador (gratis) o la API de ElevenLabs (tu propia key).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (por defecto `http://localhost:5173`).

```bash
npm run build   # build de producción en dist/
npm run lint    # oxlint
```

## Estructura

```
src/
  lib/            parsing de comandos, resolver de canal, storage, constantes
  hooks/
    useBrowserVoices.js   voces de Web Speech API
    useSpeechQueue.js     cola de reproducción (navegador + ElevenLabs)
    useKickChat.js        WebSocket a Kick, reconexión con backoff
  components/     una tarjeta de la UI por componente (Canal, Motor,
                  Comando+voces, Feed en vivo)
  App.jsx         conecta el estado con los componentes
  styles.css      mismo tema oscuro del original, portado 1:1
```

## Notas heredadas del original

- **Sin backend.** La API key de ElevenLabs se guarda solo en
  `localStorage` del navegador y las llamadas salen directo desde el
  cliente — mismo límite de CORS que tenía el HTML original si
  ElevenLabs llega a bloquear la petición desde el navegador.
- **Resolución de canal:** si `kick.com/api/v2/...` no responde por
  CORS, se muestra el mismo aviso para pegar el ID de chatroom a mano.
- No hay pruebas automatizadas; se verificó manualmente con
  Playwright que la UI carga, cambia de motor de voz y añade slots sin
  errores de consola.
