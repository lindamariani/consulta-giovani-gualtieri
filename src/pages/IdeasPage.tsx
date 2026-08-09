import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type IdeaCategory =
  | "evento"
  | "sport"
  | "musica"
  | "cultura"
  | "paese"
  | "altro";

function IdeasPage() {
  const [category, setCategory] =
    useState<IdeaCategory>("evento");

  const [idea, setIdea] = useState("");
  const [ageRange, setAgeRange] =
    useState("");

  const [anonymous, setAnonymous] =
    useState(true);

  const [name, setName] = useState("");
  const [contact, setContact] =
    useState("");

  const [allowPublish, setAllowPublish] =
    useState(false);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const canSend =
    idea.trim().length >= 10 && !sending;

  const handleSubmit = async () => {
    if (!canSend) return;

    setSending(true);
    setError("");

    const { error: submitError } =
      await supabase.rpc("submit_idea", {
        p_category: category,
        p_idea: idea.trim(),
        p_age_range: ageRange || null,
        p_anonymous: anonymous,
        p_sender_name: anonymous
          ? null
          : name.trim() || null,
        p_contact: anonymous
          ? null
          : contact.trim() || null,
        p_allow_publish: allowPublish,
      });

    if (submitError) {
      console.error(submitError);

      const message =
        submitError.message ?? "";

      if (message.includes("IDEA_TOO_SHORT")) {
        setError("Scrivi almeno 10 caratteri.");
      } else if (
        message.includes("INVALID_CATEGORY")
      ) {
        setError(
          "La categoria selezionata non è valida."
        );
      } else {
        setError(
          "Non siamo riusciti a inviare l'idea. Riprova tra poco."
        );
      }

      setSending(false);
      return;
    }

    setSending(false);
    setSent(true);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  if (sent) {
    return (
      <main className="idea-success-page">
        <div className="idea-success-pattern" />

        <div className="container idea-success-container">
          <div className="idea-success-icon">
            <Check size={50} strokeWidth={3} />
          </div>

          <span className="idea-success-label">
            IDEA INVIATA
          </span>

          <h1>
            GRAZIE.
            <br />
            <span>ORA CI PENSIAMO NOI.</span>
          </h1>

          <p>
            La tua proposta è arrivata alla Consulta.
            {anonymous
              ? " Non hai lasciato nessun dato personale."
              : " Se necessario potranno ricontattarti tramite il recapito che hai indicato."}
          </p>

          <div className="idea-success-card">
            <small>LA TUA IDEA</small>

            <strong>
              “{idea}”
            </strong>

            <span>
              Categoria: {category}
            </span>
          </div>

          <div className="idea-success-actions">
            <button
              className="button button-blue"
              onClick={() => {
                setSent(false);
                setCategory("evento");
                setIdea("");
                setAgeRange("");
                setAnonymous(true);
                setName("");
                setContact("");
                setAllowPublish(false);
                setError("");
              }}
            >
              Invia un'altra idea
            </button>

            <Link
              to="/"
              className="button button-outline"
            >
              Torna alla Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ideas-page">
      {/* HERO */}

      <section className="ideas-page-hero">
        <div className="ideas-page-question">
          ?
        </div>

        <div className="container">
          <Link
            to="/"
            className="ideas-back"
          >
            <ArrowLeft size={17} />
            Home
          </Link>

          <div className="ideas-page-heading">
            <div>
              <span className="ideas-page-kicker">
                <Lightbulb size={16} />
                DICCI LA TUA
              </span>

              <h1>
                HAI
                <br />
                <span>UN'IDEA?</span>
              </h1>
            </div>

            <div className="ideas-page-intro">
              <Sparkles size={30} />

              <p>
                Dicci cosa ti piacerebbe vedere a
                Gualtieri. Un evento, un torneo, una
                serata, un'attività o qualsiasi altra
                cosa.
              </p>

              <strong>
                Puoi farlo anche in modo completamente
                anonimo.
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}

      <section className="idea-form-section">
        <div className="container idea-form-layout">
          <div className="idea-form-main">
            {/* CATEGORY */}

            <div className="idea-form-block">
              <div className="idea-block-heading">
                <span>01</span>

                <div>
                  <small>
                    DI COSA PARLIAMO?
                  </small>

                  <h2>
                    SCEGLI UNA CATEGORIA
                  </h2>
                </div>
              </div>

              <div className="idea-category-grid">
                <button
                  className={
                    category === "evento"
                      ? "idea-category selected"
                      : "idea-category"
                  }
                  onClick={() =>
                    setCategory("evento")
                  }
                >
                  <span>01</span>
                  <strong>EVENTI</strong>
                </button>

                <button
                  className={
                    category === "sport"
                      ? "idea-category selected"
                      : "idea-category"
                  }
                  onClick={() =>
                    setCategory("sport")
                  }
                >
                  <span>02</span>
                  <strong>SPORT</strong>
                </button>

                <button
                  className={
                    category === "musica"
                      ? "idea-category selected"
                      : "idea-category"
                  }
                  onClick={() =>
                    setCategory("musica")
                  }
                >
                  <span>03</span>
                  <strong>MUSICA</strong>
                </button>

                <button
                  className={
                    category === "cultura"
                      ? "idea-category selected"
                      : "idea-category"
                  }
                  onClick={() =>
                    setCategory("cultura")
                  }
                >
                  <span>04</span>
                  <strong>CULTURA</strong>
                </button>

                <button
                  className={
                    category === "paese"
                      ? "idea-category selected"
                      : "idea-category"
                  }
                  onClick={() =>
                    setCategory("paese")
                  }
                >
                  <span>05</span>
                  <strong>GUALTIERI</strong>
                </button>

                <button
                  className={
                    category === "altro"
                      ? "idea-category selected"
                      : "idea-category"
                  }
                  onClick={() =>
                    setCategory("altro")
                  }
                >
                  <span>06</span>
                  <strong>ALTRO</strong>
                </button>
              </div>
            </div>

            {/* IDEA */}

            <div className="idea-form-block">
              <div className="idea-block-heading">
                <span>02</span>

                <div>
                  <small>
                    VAI
                  </small>

                  <h2>
                    RACCONTACI L'IDEA
                  </h2>
                </div>
              </div>

              <div className="idea-textarea-wrapper">
                <textarea
                  value={idea}
                  onChange={(e) =>
                    setIdea(e.target.value)
                  }
                  maxLength={700}
                  placeholder="Tipo: sarebbe bello fare un cinema all'aperto quest'estate..."
                />

                <div className="idea-textarea-bottom">
                  <span>
                    Minimo 10 caratteri
                  </span>

                  <span>
                    {idea.length}/700
                  </span>
                </div>
              </div>
            </div>

            {/* AGE */}

            <div className="idea-form-block">
              <div className="idea-block-heading">
                <span>03</span>

                <div>
                  <small>
                    FACOLTATIVO
                  </small>

                  <h2>
                    QUANTI ANNI HAI?
                  </h2>
                </div>
              </div>

              <p className="idea-helper">
                Non ci serve sapere chi sei. Questa
                informazione ci aiuta solo a capire a
                quale fascia d'età interessa una
                proposta.
              </p>

              <div className="idea-age-options">
                {[
                  "15-18",
                  "19-24",
                  "25-30",
                  "30+",
                  "Preferisco non dirlo",
                ].map((age) => (
                  <button
                    key={age}
                    className={
                      ageRange === age
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setAgeRange(age)
                    }
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* ANONYMOUS */}

            <div className="idea-form-block">
              <div className="idea-block-heading">
                <span>04</span>

                <div>
                  <small>
                    PRIVACY
                  </small>

                  <h2>
                    VUOI RESTARE ANONIMO?
                  </h2>
                </div>
              </div>

              <div className="anonymous-choice">
                <button
                  className={
                    anonymous
                      ? "anonymous-card selected"
                      : "anonymous-card"
                  }
                  onClick={() =>
                    setAnonymous(true)
                  }
                >
                  <div className="anonymous-card-check">
                    {anonymous && (
                      <Check size={20} />
                    )}
                  </div>

                  <strong>
                    SÌ, ANONIMO
                  </strong>

                  <p>
                    Non chiediamo nome, email o numero di
                    telefono.
                  </p>
                </button>

                <button
                  className={
                    !anonymous
                      ? "anonymous-card anonymous-card-contact selected"
                      : "anonymous-card anonymous-card-contact"
                  }
                  onClick={() =>
                    setAnonymous(false)
                  }
                >
                  <div className="anonymous-card-check">
                    {!anonymous && (
                      <Check size={20} />
                    )}
                  </div>

                  <strong>
                    POTETE CONTATTARMI
                  </strong>

                  <p>
                    Lascia un recapito se vuoi essere
                    ricontattato.
                  </p>
                </button>
              </div>

              {!anonymous && (
                <div className="idea-contact-fields">
                  <label>
                    <span>Nome</span>

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Come ti chiami?"
                    />
                  </label>

                  <label>
                    <span>
                      Email o telefono
                    </span>

                    <input
                      value={contact}
                      onChange={(e) =>
                        setContact(
                          e.target.value
                        )
                      }
                      placeholder="Come possiamo contattarti?"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* PUBLIC */}

            <div className="idea-form-block">
              <div className="idea-block-heading">
                <span>05</span>

                <div>
                  <small>
                    FACOLTATIVO
                  </small>

                  <h2>
                    POSSIAMO CONDIVIDERLA?
                  </h2>
                </div>
              </div>

              <button
                className={
                  allowPublish
                    ? "idea-publish-option selected"
                    : "idea-publish-option"
                }
                onClick={() =>
                  setAllowPublish(
                    !allowPublish
                  )
                }
              >
                <div className="publish-check">
                  {allowPublish && (
                    <Check size={19} />
                  )}
                </div>

                <div>
                  <strong>
                    Sì, potete pubblicare la mia idea
                  </strong>

                  <p>
                    La Consulta potrà mostrarla sul sito
                    in forma anonima, anche se hai scelto
                    di lasciare i tuoi contatti.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SUMMARY */}

          <aside className="idea-summary">
            <div className="idea-summary-top">
              <MessageCircle size={25} />

              <span>
                LA TUA PROPOSTA
              </span>
            </div>

            <div className="idea-summary-content">
              <div>
                <small>
                  CATEGORIA
                </small>

                <strong>
                  {category}
                </strong>
              </div>

              <div>
                <small>
                  ETÀ
                </small>

                <strong>
                  {ageRange || "—"}
                </strong>
              </div>

              <div>
                <small>
                  INVIO
                </small>

                <strong>
                  {anonymous
                    ? "Anonimo"
                    : "Con contatto"}
                </strong>
              </div>

              <div>
                <small>
                  PUBBLICABILE
                </small>

                <strong>
                  {allowPublish
                    ? "Sì"
                    : "No"}
                </strong>
              </div>
            </div>

            <div className="idea-summary-preview">
              <small>
                IDEA
              </small>

              <p>
                {idea.trim() ||
                  "La tua idea apparirà qui mentre la scrivi."}
              </p>
            </div>

            {error && (
              <div className="idea-send-error">
                {error}
              </div>
            )}

            <button
              type="button"
              className="idea-send-button"
              disabled={!canSend}
              onClick={handleSubmit}
            >
              <span>
                {sending ? (
                  <>
                    INVIO
                    <br />
                    IN CORSO...
                  </>
                ) : (
                  <>
                    INVIA
                    <br />
                    L'IDEA
                  </>
                )}
              </span>

              <ArrowRight size={28} />
            </button>

            {!canSend && !sending && (
              <div className="idea-send-note">
                Scrivi almeno 10 caratteri per
                inviare.
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default IdeasPage;