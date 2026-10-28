# Starssenger — Código fuente separado (para auditoría)

Esta es la MISMA app que index.html, pero con todo el código SEPARADO por componentes,
para poder revisar y cotejar cada pieza por separado. Cargan en orden desde index.html.

## Estructura
- index.html .......... estructura (HTML) + referencias a CSS y JS
- css/styles.css ...... todos los estilos
- js/00-logo.js ....... logo (imagen base64, aislado para no ensuciar la lectura)
- js/01-protocolo-keystream.js . CIFRADO PROPIO: keystream (eyb+mf+fibo1+mapa logístico), enc/dec, encBytes/decBytes
- js/02-protocolo-x25519.js .... intercambio de clave real X25519 (Web Crypto API)
- js/03-estado.js ..... estado global y almacenamiento local (localStorage)
- js/04-helpers.js .... utilidades
- js/05-conversaciones.js ...... manejo de chats/grupos (topics)
- js/06-pantallas-perfil.js .... navegación de pantallas + Perfil (6 pantallas)
- js/07-chat.js ....... mensajes: enviar/recibir/dibujar, editar, borrar, tildes (✓/✓✓)
- js/08-medios-voz-foto-push.js  notas de voz, fotos y notificaciones push (cliente)
- js/09-transporte-mqtt.js ..... transporte por MQTT (broker EMQX, WebSocket)
- js/10-llamadas-webrtc.js ..... llamadas voz/video (WebRTC) + cifrado por cuadro + contador de claves
- js/11-onboarding-ajustes.js .. alta, perfil, modo Blindado, color de tildes, restablecer/borrar
- js/12-modales-contactos.js ... contactos, grupos, ficha, compartir número
- js/13-arranque.js ... arranque (boot)
- sw.js ............... Service Worker (PWA + push en segundo plano)
- manifest.json ....... manifiesto PWA
- netlify.toml ........ configuración de hosting
- netlify/functions/send-push.js . función serverless que envía las notificaciones push

## Lenguajes
HTML5 · CSS3 · JavaScript (vanilla). Sin frameworks. Criptografía: Web Crypto API (X25519)
+ motor de keystream propio en JavaScript. Transporte: MQTT. Llamadas: WebRTC. Hosting: Netlify.

## Nota de seguridad
La clave privada X25519 se genera y queda en el dispositivo (localStorage); nunca sale.
El transporte (MQTT) solo mueve contenido cifrado; no hay backend que lo descifre.
