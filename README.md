# Línea de Fuego

Shooter lateral estilo Contra para móvil. Eliges personaje, arma y misión, y avanzas por seis países.

## Jugar en el navegador

After clone, run `node scripts/restore-art.mjs` before `npm run dev` so the sprites exist.

```bash
npm install
node scripts/restore-art.mjs
npm run dev
```

Abre el puerto 8080. En el móvil, un toque en el arma deja el disparo fijo para saltar sin soltar el gatillo.

## Controles

- Pad izquierdo: mover y apuntar
- Arma: un toque lo deja fijo, otro toque lo para. Mantener dispara solo mientras está pulsada
- Salto, granada y pausa a la derecha

## Android

El proyecto está en `android/`. No se incluye la clave de firma. Para generar el APK hace falta un keystore propio y el SDK de Android. Las contraseñas de firma se leen de las variables `LINEA_STORE_PASSWORD` y `LINEA_KEY_PASSWORD`.
