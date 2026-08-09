import { useEffect, useState } from "react";
import {
  ArrowRight,
  LoaderCircle,
  MailCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { EmailOtpType } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

function OwnerInviteConfirmPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const confirmInvite = async () => {
      const params =
        new URLSearchParams(window.location.search);

      const tokenHash =
        params.get("token_hash");

      const type =
        params.get("type") as EmailOtpType | null;

      if (!tokenHash || type !== "invite") {
        if (active) {
          setError(
            "Il link di invito non è valido."
          );
        }
        return;
      }

      const { error: verifyError } =
        await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

      if (verifyError) {
        console.error(verifyError);

        if (active) {
          setError(
            "L'invito è scaduto oppure è già stato utilizzato. Chiedi un nuovo invito."
          );
        }
        return;
      }

      if (active) {
        navigate(
          "/imposta-password",
          { replace: true }
        );
      }
    };

    confirmInvite();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="owner-login-page">
      <div className="owner-login-grid" />

      <div className="container owner-login-container">
        <div className="owner-login-layout">
          <div className="owner-login-heading">
            <span>INVITO OWNER</span>

            <h1>
              {error ? (
                <>
                  LINK
                  <br />
                  <em>SCADUTO.</em>
                </>
              ) : (
                <>
                  QUASI
                  <br />
                  <em>FATTO.</em>
                </>
              )}
            </h1>

            <p>
              {error
                ? error
                : "Stiamo verificando il tuo invito alla Consulta."}
            </p>
          </div>

          <div className="owner-login-card">
            <div className="owner-login-icon">
              {error ? (
                <MailCheck size={29} />
              ) : (
                <LoaderCircle size={29} />
              )}
            </div>

            <div className="owner-login-card-title">
              <small>
                {error
                  ? "INVITO NON DISPONIBILE"
                  : "VERIFICA IN CORSO"}
              </small>

              <strong>
                {error ? (
                  <>
                    TORNA AL
                    <br />
                    SITO
                  </>
                ) : (
                  <>
                    ATTENDI
                    <br />
                    UN MOMENTO
                  </>
                )}
              </strong>
            </div>

            {error && (
              <Link
                to="/"
                className="button button-blue"
              >
                Torna al sito
                <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default OwnerInviteConfirmPage;
