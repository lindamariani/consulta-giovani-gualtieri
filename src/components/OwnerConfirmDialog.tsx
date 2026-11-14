import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ArrowRight, X } from "lucide-react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
};

/**
 * Mostra una conferma personalizzata e restituisce l'esito come Promise<boolean>.
 * È pensato per sostituire window.confirm senza cambiare le operazioni esistenti.
 * Includere `dialog` una volta nel JSX della pagina.
 */
export function useOwnerConfirm() {
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);
  const cancelButton = useRef<HTMLButtonElement | null>(null);
  const confirmButton = useRef<HTMLButtonElement | null>(null);

  const finish = useCallback((confirmed: boolean) => {
    const resolve = resolver.current;
    resolver.current = null;
    setPending(null);
    resolve?.(confirmed);
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    // Una sola conferma aperta per pagina alla volta.
    if (resolver.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setPending(options);
    });
  }, []);

  useEffect(() => {
    // Se si cambia pagina con il dialogo aperto, annulla l'azione sospesa.
    return () => {
      resolver.current?.(false);
      resolver.current = null;
    };
  }, []);

  useEffect(() => {
    if (!pending) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
      }
      if (event.key === "Tab") {
        // Il popup contiene due pulsanti: il focus non deve uscire dal dialogo.
        if (event.shiftKey && document.activeElement === cancelButton.current) {
          event.preventDefault();
          confirmButton.current?.focus();
        } else if (!event.shiftKey && document.activeElement === confirmButton.current) {
          event.preventDefault();
          cancelButton.current?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [pending, finish]);

  const dialog = pending
    ? createPortal(
        <div
          className="owner-confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) finish(false);
          }}
        >
          <section
            className="owner-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="owner-confirm-title"
            aria-describedby="owner-confirm-description"
          >
            <div className="owner-confirm-topbar">
              <span>CONSULTA / CONFERMA</span>
              <button
                type="button"
                className="owner-confirm-close"
                onClick={() => finish(false)}
                aria-label="Chiudi senza confermare"
                tabIndex={-1}
              >
                <X size={21} />
              </button>
            </div>
            <div className={`owner-confirm-symbol owner-confirm-symbol-${pending.variant ?? "danger"}`}>
              <AlertTriangle size={30} strokeWidth={2} aria-hidden="true" />
            </div>
            <h2 id="owner-confirm-title">{pending.title}</h2>
            <p id="owner-confirm-description">{pending.message}</p>
            <div className="owner-confirm-actions">
              <button
                type="button"
                className="owner-confirm-cancel"
                ref={cancelButton}
                onClick={() => finish(false)}
              >
                {pending.cancelLabel ?? "ANNULLA"}
              </button>
              <button
                type="button"
                className={`owner-confirm-accept owner-confirm-accept-${pending.variant ?? "danger"}`}
                ref={confirmButton}
                onClick={() => finish(true)}
              >
                {pending.confirmLabel ?? "SÌ, ELIMINA"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>,
        document.body
      )
    : null;

  return { confirm, dialog };
}
