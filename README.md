# Línea de Fuego

Shooter lateral para móvil. Eliges personaje, arma y misión, y avanzas por seis países.

## Jugar en el navegador

```bash
npm install
npm run dev
```

Los dibujos ya están en `public/game/`. Si en algún momento solo tienes archivos `.b64`, `node scripts/restore-art.mjs` los reconstruye y no pisa un dibujo que ya sea más grande.

Abre el puerto 8080. En el móvil, un toque en el arma deja el disparo fijo para saltar sin soltar el gatillo.

## Controles

- Pad izquierdo: mover y apuntar
- Arma: un toque lo deja fijo, otro toque lo para. Mantener dispara solo mientras está pulsada
- Salto, granada y pausa a la derecha

## Android

El proyecto está en `android/`. No se incluye la clave de firma. Para generar el APK hace falta un keystore propio y el SDK de Android. Las contraseñas se leen de `LINEA_STORE_PASSWORD` y `LINEA_KEY_PASSWORD`.
