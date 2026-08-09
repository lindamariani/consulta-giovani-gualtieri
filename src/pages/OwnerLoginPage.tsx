import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

function OwnerLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="owner-login-page">
      <div className="owner-login-grid" />

      <div className="container owner-login-container">
        <Link to="/" className="owner-login-back">
          <ArrowLeft size={17} />
          Torna al sito
        </Link>

        <div className="owner-login-layout">
          <div className="owner-login-heading">
            <span>AREA RISERVATA</span>

            <h1>
              CIAO,
              <br />
              <em>CONSULTA.</em>
            </h1>

            <p>
              Da qui potete gestire eventi, foto,
              prenotazioni e proposte ricevute dal sito.
            </p>
          </div>

          <form
            className="owner-login-card"
            onSubmit={async (event) => {
              event.preventDefault();

              setError("");
              setLoading(true);

              const {
                data,
                error: loginError,
              } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (loginError) {
                console.error(loginError);

                setError(
                  "Email o password non corrette."
                );

                setLoading(false);
                return;
              }

              if (!data.user) {
                setError(
                  "Impossibile effettuare l'accesso."
                );

                setLoading(false);
                return;
              }

              const {
                data: profile,
                error: profileError,
              } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

              if (profileError) {
                console.error(profileError);
              }

              if (
                profileError ||
                !profile ||
                profile.role !== "owner"
              ) {
                await supabase.auth.signOut();

                setError(
                  "Questo account non è autorizzato ad accedere all'area Consulta."
                );

                setLoading(false);
                return;
              }

              navigate("/owner");
            }}
          >
            <div className="owner-login-icon">
              <LockKeyhole size={29} />
            </div>

            <div className="owner-login-card-title">
              <small>ACCESSO OWNER</small>

              <strong>
                ENTRA NELLA
                <br />
                DASHBOARD
              </strong>
            </div>

            <label>
              <span>Email</span>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="nome@email.it"
              />
            </label>

            <label>
              <span>Password</span>

              <input
                type="password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
              />
            </label>

            {error && (
              <div className="owner-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "ACCESSO..."
                  : "ENTRA"}
              </span>

              <ArrowRight size={23} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default OwnerLoginPage;