import { type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";

export function RoundButton({
  label,
  className,
  style,
  editing,
  children,
  onDown,
  onUp,
  onEditDown,
  onEditMove,
  onEditUp,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  buttonRef,
}: {
  label: string;
  className: string;
  style: CSSProperties;
  editing: boolean;
  children: ReactNode;
  onDown?: () => void;
  onUp?: () => void;
  onEditDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onEditMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onEditUp: () => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      className={className}
      style={style}
      onPointerDown={(event) => {
        if (onPointerDown) {
          onPointerDown(event);
          return;
        }
        if (editing) {
          onEditDown(event);
          return;
        }
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onDown?.();
      }}
      onPointerMove={(event) => {
        if (onPointerMove) {
          onPointerMove(event);
          return;
        }
        if (editing) onEditMove(event);
      }}
      onPointerUp={(event) => {
        if (onPointerUp) {
          onPointerUp(event);
          return;
        }
        onEditUp();
        if (!editing) onUp?.();
      }}
      onPointerCancel={(event) => {
        if (onPointerUp) {
          onPointerUp(event);
          return;
        }
        onEditUp();
        if (!editing) onUp?.();
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}

export function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="3" y="2" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="11" y="2" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

export function IconGun({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 28h12l2-6h8v5h24l4 3v4H46l-2 4h-8l-2-4H20l-3 10h-8l3-10H4v-6zm22 1v3h8v-3h-8z"
      />
      <path fill="currentColor" d="M22 36h8l-1 12h-6l-1-12z" />
    </svg>
  );
}

export function IconRun({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="36" cy="10" r="6" fill="currentColor" />
      <path
        fill="currentColor"
        d="M33 17 22 26l3.2 3.2 8-6 .4 8-9 4 2.4 4.2 11-4.2 2 12h4.6l-2.6-14 8 3.2 2.2-4.4-9.6-4 .2-6 7 2.6 2.6-4.2L40 16l-7 1z"
      />
      <path d="M10 58h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

export function IconGrenade() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M13 3l2 2-1.2 1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="13" r="6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 8v10M6 13h8M7.2 10.2l5.6 5.6M7.2 15.8l5.6-5.6" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

