import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

function OwnerSettingsPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/owner/login", {
          replace: true,
        });
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile ||
        profile.role !== "owner"
      ) {
        await supabase.auth.signOut();

        navigate("/owner/login", {
          replace: true,
        });
        return;
      }

      setEmail(user.email ?? "");
      setLoading(false);
    };

    loadUser();
  }, [navigate]);

  const canSave =
    password.length >= 8 &&
    password === confirmPassword &&
    !saving;

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO IMPOSTAZIONI...
      </main>
    );
  }

  return (
    <main className="owner-settings-page">
      <div className="container owner-settings-container">
        <div className="owner-events-topbar">
          <Link
            to="/owner"
            className="owner-events-back"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <span>
            CONSULTA / IMPOSTAZIONI
          </span>
        </div>

        <div className="owner-settings-heading">
          <div>
            <span>ACCOUNT OWNER</span>

            <h1>
              IMPOSTA
              <br />
              ZIONI.
            </h1>

            <p>
              Qui puoi controllare l'account con cui
              accedi all'area riservata e cambiare
              la tua password.
            </p>
          </div>

          <div className="owner-settings-badge">
            <LockKeyhole size={32} />

            <strong>
              AREA
              <br />
              SICURA
            </strong>
          </div>
        </div>

        <div className="owner-settings-grid">
          <section className="owner-settings-card">
            <div className="owner-settings-card-title">
              <span>01</span>

              <div>
                <small>IL TUO ACCOUNT</small>
                <h2>EMAIL</h2>
              </div>
            </div>

            <div className="owner-settings-email">
              <Mail size={20} />
              <span>{email}</span>
            </div>

            <p className="owner-settings-note">
              L'email è quella usata per accedere
              all'area owner.
            </p>
          </section>

          <section className="owner-settings-card owner-settings-password-card">
            <div className="owner-settings-card-title">
              <span>02</span>

              <div>
                <small>SICUREZZA</small>
                <h2>CAMBIA PASSWORD</h2>
              </div>
            </div>

            <form
              className="owner-settings-form"
              onSubmit={async (event) => {
                event.preventDefault();

                setError("");
                setSuccess("");

                if (password.length < 8) {
                  setError(
                    "La nuova password deve avere almeno 8 caratteri."
                  );
                  return;
                }

                if (
                  password !== confirmPassword
                ) {
                  setError(
                    "Le due password non coincidono."
                  );
                  return;
                }

                setSaving(true);

                const {
                  error: updateError,
                } =
                  await supabase.auth.updateUser({
                    password,
                  });

                if (updateError) {
                  console.error(updateError);

                  setError(
                    "Non siamo riusciti a cambiare la password. Riprova."
                  );
                  setSaving(false);
                  return;
                }

                setPassword("");
                setConfirmPassword("");

                setSuccess(
                  "Password aggiornata correttamente."
                );

                setSaving(false);
              }}
            >
              <label>
                <span>Nuova password</span>

                <div className="owner-settings-input-wrap">
                  <KeyRound size={18} />

                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      );
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Almeno 8 caratteri"
                  />
                </div>
              </label>

              <label>
                <span>Conferma password</span>

                <div className="owner-settings-input-wrap">
                  <KeyRound size={18} />

                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Ripeti la password"
                  />
                </div>
              </label>

              {error && (
                <div className="owner-settings-message owner-settings-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="owner-settings-message owner-settings-success">
                  <Check size={18} />
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="owner-settings-save"
                disabled={!canSave}
              >
                <span>
                  {saving
                    ? "SALVATAGGIO..."
                    : "SALVA NUOVA PASSWORD"}
                </span>

                <ArrowRight size={22} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default OwnerSettingsPage;
