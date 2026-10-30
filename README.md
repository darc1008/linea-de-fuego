# Línea de Fuego

Shooter lateral para móvil. Eliges personaje, arma y misión, y avanzas por seis países.

## Jugar en el navegador

```bash
npm install
node scripts/restore-art.mjs
npm run dev
```

`restore-art.mjs` reconstruye los dibujos a partir de los archivos `.b64`. Sin ese paso el juego igual corre, con figuras de reserva.

Abre el puerto 8080. En el móvil, un toque en el arma deja el disparo fijo para saltar sin soltar el gatillo.

## Controles

- Pad izquierdo: mover y apuntar
- Arma: un toque lo deja fijo, otro toque lo para. Mantener dispara solo mientras está pulsada
- Salto, granada y pausa a la derecha

## Android

El proyecto está en `android/`. No se incluye la clave de firma. Para generar el APK hace falta un keystore propio y el SDK de Android. Las contraseñas se leen de `LINEA_STORE_PASSWORD` y `LINEA_KEY_PASSWORD`.
