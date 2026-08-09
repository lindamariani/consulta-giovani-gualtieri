import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  KeyRound,
  LockKeyhole,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

function OwnerSetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [checkingSession, setCheckingSession] =
    useState(true);
  const [hasSession, setHasSession] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [success, setSuccess] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setHasSession(Boolean(session));
      setCheckingSession(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setHasSession(Boolean(session));
        setCheckingSession(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const canSubmit =
    password.length >= 8 &&
    password === confirmPassword &&
    !loading;

  if (checkingSession) {
    return (
      <main className="owner-login-page">
        <div className="owner-login-grid" />

        <div className="container owner-login-container">
          <div className="owner-login-layout">
            <div className="owner-login-heading">
              <span>AREA RISERVATA</span>

              <h1>
                UN
                <br />
                <em>ATTIMO.</em>
              </h1>

              <p>
                Stiamo verificando il tuo invito.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="owner-login-page">
        <div className="owner-login-grid" />

        <div className="container owner-login-container">
          <div className="owner-login-layout">
            <div className="owner-login-heading">
              <span>INVITO OWNER</span>

              <h1>
                LINK
                <br />
                <em>NON VALIDO.</em>
              </h1>

              <p>
                L'invito potrebbe essere scaduto oppure già
                utilizzato. Chiedi alla Consulta di inviartene
                uno nuovo.
              </p>
            </div>

            <div className="owner-login-card">
              <div className="owner-login-icon">
                <LockKeyhole size={29} />
              </div>

              <div className="owner-login-card-title">
                <small>ACCESSO</small>

                <strong>
                  TORNA ALLA
                  <br />
                  PAGINA LOGIN
                </strong>
              </div>

              <Link
                to="/owner/login"
                className="button button-blue"
              >
                Vai al login
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="owner-login-page">
        <div className="owner-login-grid" />

        <div className="container owner-login-container">
          <div className="owner-login-layout">
            <div className="owner-login-heading">
              <span>ACCOUNT ATTIVATO</span>

              <h1>
                TUTTO
                <br />
                <em>FATTO.</em>
              </h1>

              <p>
                La password è stata impostata. Ora puoi
                accedere all'area riservata della Consulta.
              </p>
            </div>

            <div className="owner-login-card">
              <div className="owner-login-icon">
                <Check size={29} />
              </div>

              <div className="owner-login-card-title">
                <small>PRIMO ACCESSO COMPLETATO</small>

                <strong>
                  ENTRA NELLA
                  <br />
                  DASHBOARD
                </strong>
              </div>

              <button
                type="button"
                onClick={() => navigate("/owner")}
              >
                <span>CONTINUA</span>
                <ArrowRight size={23} />
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-login-page">
      <div className="owner-login-grid" />

      <div className="container owner-login-container">
        <div className="owner-login-layout">
          <div className="owner-login-heading">
            <span>PRIMO ACCESSO</span>

            <h1>
              CREA
              <br />
              <em>LA PASSWORD.</em>
            </h1>

            <p>
              Sei stato invitato nell'area riservata della
              Consulta. Scegli una password di almeno 8
              caratteri: la userai per i prossimi accessi.
            </p>
          </div>

          <form
            className="owner-login-card"
            onSubmit={async (event) => {
              event.preventDefault();

              setError("");

              if (password.length < 8) {
                setError(
                  "La password deve avere almeno 8 caratteri."
                );
                return;
              }

              if (password !== confirmPassword) {
                setError(
                  "Le due password non coincidono."
                );
                return;
              }

              setLoading(true);

              const {
                error: updateError,
              } = await supabase.auth.updateUser({
                password,
              });

              if (updateError) {
                console.error(updateError);

                setError(
                  "Non siamo riusciti a impostare la password. Riapri il link di invito o chiedi un nuovo invito."
                );
                setLoading(false);
                return;
              }

              setLoading(false);
              setSuccess(true);
            }}
          >
            <div className="owner-login-icon">
              <KeyRound size={29} />
            </div>

            <div className="owner-login-card-title">
              <small>NUOVO OWNER</small>

              <strong>
                IMPOSTA
                <br />
                LA PASSWORD
              </strong>
            </div>

            <label>
              <span>Nuova password</span>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Almeno 8 caratteri"
              />
            </label>

            <label>
              <span>Conferma password</span>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Ripeti la password"
              />
            </label>

            {error && (
              <div className="owner-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
            >
              <span>
                {loading
                  ? "SALVATAGGIO..."
                  : "IMPOSTA PASSWORD"}
              </span>

              <ArrowRight size={23} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default OwnerSetPasswordPage;
