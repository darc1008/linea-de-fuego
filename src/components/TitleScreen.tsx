import { SoundButton } from "./ui-bits";

export function Title({ onEnter, sound, onSound }: { onEnter: () => void; sound: boolean; onSound: () => void }) {
  return (
    <section className="flex h-dvh flex-col overflow-hidden">
      <div className="relative h-[32%] min-h-0 overflow-hidden">
        <img src="/game/bg-mexico.jpg" alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/30 to-transparent" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 px-4 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent">OPERACIÓN HEMISFERIO</p>
          <SoundButton on={sound} onClick={onSound} />
        </div>
        <h1 className="font-display text-[clamp(2.4rem,9vh,4.2rem)] leading-none tracking-wide">
          LÍNEA
          <br />
          DE FUEGO
        </h1>
        <p className="line-clamp-2 text-sm text-muted">Seis países. Elige operativo, arma y misión, y no sueltes el gatillo.</p>
        <button
          type="button"
          onClick={onEnter}
          className="inline-flex h-12 items-center justify-center bg-primary font-display text-2xl tracking-wide text-fg"
        >
          Entrar al frente
        </button>
        <a
          href="/descargas/Linea-de-Fuego.apk"
          download="Linea-de-Fuego.apk"
          className="inline-flex h-10 items-center justify-center border border-accent font-display text-lg tracking-wide text-accent"
        >
          Descargar APK
        </a>
      </div>
    </section>
  );
}

