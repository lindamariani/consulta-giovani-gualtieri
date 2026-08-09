import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Check,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

type Court = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

function getToday() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatItalianDate(
  value: string
) {
  if (!value) {
    return "";
  }

  return new Date(
    `${value}T12:00:00`
  ).toLocaleDateString(
    "it-IT",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function getDaysCount(
  startDate: string,
  endDate: string
) {
  if (
    !startDate ||
    !endDate
  ) {
    return 0;
  }

  const start =
    new Date(
      `${startDate}T12:00:00`
    );

  const end =
    new Date(
      `${endDate}T12:00:00`
    );

  const difference =
    end.getTime() -
    start.getTime();

  if (difference < 0) {
    return 0;
  }

  return (
    Math.floor(
      difference /
        (1000 *
          60 *
          60 *
          24)
    ) + 1
  );
}

function OwnerCourtBlockPage() {
  const navigate =
    useNavigate();

  const [courts, setCourts] =
    useState<Court[]>([]);

  const [
    selectedCourtId,
    setSelectedCourtId,
  ] =
    useState("");

  const [
    startDate,
    setStartDate,
  ] =
    useState(getToday());

  const [
    endDate,
    setEndDate,
  ] =
    useState(getToday());

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  useEffect(() => {
    const loadCourts =
      async () => {
        setLoading(true);

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          navigate(
            "/owner/login"
          );

          return;
        }

        const {
          data: profile,
          error:
            profileError,
        } =
          await supabase
            .from("profiles")
            .select("role")
            .eq(
              "id",
              user.id
            )
            .single();

        if (
          profileError ||
          profile?.role !==
            "owner"
        ) {
          await supabase.auth.signOut();

          navigate(
            "/owner/login"
          );

          return;
        }

        const {
          data,
          error:
            courtError,
        } =
          await supabase
            .from("courts")
            .select(
              "id, name, slug, active"
            )
            .eq(
              "active",
              true
            )
            .order("name");

        if (courtError) {
          console.error(
            courtError
          );

          setError(
            "Non riesco a caricare i campi."
          );

          setLoading(false);

          return;
        }

        const rows =
          (data ??
            []) as Court[];

        setCourts(
          rows
        );

        if (
          rows.length > 0
        ) {
          setSelectedCourtId(
            rows[0].id
          );
        }

        setLoading(false);
      };

    loadCourts();
  }, [navigate]);

  const selectedCourt =
    courts.find(
      (court) =>
        court.id ===
        selectedCourtId
    ) ?? null;

  const daysCount =
    getDaysCount(
      startDate,
      endDate
    );

  const canSave =
    Boolean(
      selectedCourtId &&
        startDate &&
        endDate &&
        endDate >=
          startDate
    );

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO CAMPI...
      </main>
    );
  }

  return (
    <main className="owner-court-block-page">
      <div className="container owner-court-block-container">

        <div className="owner-events-topbar">
          <Link
            to="/owner/prenotazioni"
            className="owner-events-back"
          >
            <ArrowLeft
              size={17}
            />

            Prenotazioni
          </Link>

          <span>
            CONSULTA /
            BLOCCA CAMPO
          </span>
        </div>

        <div className="owner-court-block-heading">
          <div>
            <span>
              CAMPI SPORTIVI
            </span>

            <h1>
              BLOCCA
              <br />
              IL CAMPO.
            </h1>

            <p>
              Scegli il campo e
              uno o più giorni.
              Durante quei giorni
              il campo non sarà
              prenotabile dalle
              08:00 alle 23:00.
            </p>
          </div>

          <div className="owner-court-block-icon">
            <Ban
              size={46}
            />
          </div>
        </div>

        <form
          className="owner-court-block-form"
          onSubmit={async (
            event
          ) => {
            event.preventDefault();

            setError("");
            setSuccess("");

            if (
              !selectedCourtId
            ) {
              setError(
                "Seleziona un campo."
              );

              return;
            }

            if (
              !startDate ||
              !endDate
            ) {
              setError(
                "Seleziona il periodo da bloccare."
              );

              return;
            }

            if (
              endDate <
              startDate
            ) {
              setError(
                "La data finale non può essere precedente alla data iniziale."
              );

              return;
            }

            setSaving(true);

            const {
              error:
                blockError,
            } =
              await supabase.rpc(
                "create_court_day_blocks",
                {
                  p_court_id:
                    selectedCourtId,

                  p_start_date:
                    startDate,

                  p_end_date:
                    endDate,

                  p_reason:
                    reason.trim() ||
                    null,
                }
              );

            if (
              blockError
            ) {
              console.error(
                blockError
              );

              const message =
                blockError.message ??
                "";

              if (
                message.includes(
                  "BOOKING_EXISTS_ON_DATE"
                )
              ) {
                const match =
                  message.match(
                    /\d{4}-\d{2}-\d{2}/
                  );

                if (match) {
                  setError(
                    `Non puoi bloccare tutto il periodo: il ${formatItalianDate(
                      match[0]
                    )} c'è già almeno una prenotazione.`
                  );
                } else {
                  setError(
                    "Non puoi bloccare questo periodo perché contiene già almeno una prenotazione."
                  );
                }
              } else if (
                message.includes(
                  "BLOCK_ALREADY_EXISTS_ON_DATE"
                )
              ) {
                const match =
                  message.match(
                    /\d{4}-\d{2}-\d{2}/
                  );

                if (match) {
                  setError(
                    `Il ${formatItalianDate(
                      match[0]
                    )} risulta già bloccato.`
                  );
                } else {
                  setError(
                    "Uno dei giorni selezionati risulta già bloccato."
                  );
                }
              } else if (
                message.includes(
                  "INVALID_DATE_RANGE"
                )
              ) {
                setError(
                  "Il periodo selezionato non è valido."
                );
              } else if (
                message.includes(
                  "PAST_DATE"
                )
              ) {
                setError(
                  "Non puoi bloccare una data passata."
                );
              } else if (
                message.includes(
                  "NOT_AUTHORIZED"
                )
              ) {
                setError(
                  "Il tuo account non è autorizzato a bloccare i campi."
                );
              } else {
                setError(
                  "Errore durante il blocco del campo."
                );
              }

              setSaving(false);

              return;
            }

            const courtName =
              selectedCourt?.name ??
              "Campo";

            if (
              daysCount === 1
            ) {
              setSuccess(
                `${courtName} bloccato per ${formatItalianDate(
                  startDate
                )}.`
              );
            } else {
              setSuccess(
                `${courtName} bloccato per ${daysCount} giorni, dal ${formatItalianDate(
                  startDate
                )} al ${formatItalianDate(
                  endDate
                )}.`
              );
            }

            setReason("");

            setSaving(false);
          }}
        >

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              01
            </div>

            <div className="owner-form-section-content">
              <small>
                CAMPO
              </small>

              <h2>
                QUALE CAMPO?
              </h2>

              <div className="owner-court-choice-grid">
                {courts.map(
                  (court) => (
                    <button
                      type="button"
                      key={
                        court.id
                      }
                      className={
                        selectedCourtId ===
                        court.id
                          ? "selected"
                          : ""
                      }
                      onClick={() => {
                        setSelectedCourtId(
                          court.id
                        );

                        setSuccess("");
                        setError("");
                      }}
                    >
                      <span>
                        {
                          court.name
                        }
                      </span>

                      {selectedCourtId ===
                        court.id && (
                        <Check
                          size={20}
                        />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              02
            </div>

            <div className="owner-form-section-content">
              <small>
                PERIODO
              </small>

              <h2>
                QUALI GIORNI?
              </h2>

              <p className="owner-block-period-description">
                Se vuoi bloccare
                un solo giorno,
                inserisci la stessa
                data sia in
                <strong> Dal </strong>
                che in
                <strong> Al</strong>.
              </p>

              <div className="owner-block-date-grid">

                <label>
                  <span>
                    Dal *
                  </span>

                  <div className="owner-block-input-icon">
                    <CalendarDays
                      size={20}
                    />

                    <input
                      type="date"
                      required
                      min={
                        getToday()
                      }
                      value={
                        startDate
                      }
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        setStartDate(
                          value
                        );

                        if (
                          endDate <
                          value
                        ) {
                          setEndDate(
                            value
                          );
                        }

                        setSuccess("");
                        setError("");
                      }}
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Al *
                  </span>

                  <div className="owner-block-input-icon">
                    <CalendarDays
                      size={20}
                    />

                    <input
                      type="date"
                      required
                      min={
                        startDate
                      }
                      value={
                        endDate
                      }
                      onChange={(event) => {
                        setEndDate(
                          event.target.value
                        );

                        setSuccess("");
                        setError("");
                      }}
                    />
                  </div>
                </label>

              </div>

              {canSave && (
                <div className="owner-block-period-summary">
                  <div>
                    <span>
                      PERIODO SELEZIONATO
                    </span>

                    <strong>
                      {daysCount === 1
                        ? formatItalianDate(
                            startDate
                          )
                        : `${formatItalianDate(
                            startDate
                          )} → ${formatItalianDate(
                            endDate
                          )}`}
                    </strong>
                  </div>

                  <div className="owner-block-days-badge">
                    <strong>
                      {
                        daysCount
                      }
                    </strong>

                    <span>
                      {daysCount === 1
                        ? "GIORNO"
                        : "GIORNI"}
                    </span>
                  </div>
                </div>
              )}

              <div className="owner-court-hours-note">
                <Ban
                  size={17}
                />

                <span>
                  Il campo sarà
                  completamente
                  non prenotabile 
                  per tutti i giorni
                  selezionati.
                </span>
              </div>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              03
            </div>

            <div className="owner-form-section-content">
              <small>
                MOTIVO
              </small>

              <h2>
                PERCHÉ?
              </h2>

              <label>
                <span>
                  Motivo
                  facoltativo
                </span>

                <textarea
                  value={
                    reason
                  }
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder="Es. Festa del Pesce, manutenzione, torneo..."
                />
              </label>
            </div>
          </section>

          {error && (
            <div className="owner-event-form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="owner-block-success">
              <Check
                size={22}
              />

              <div>
                <strong>
                  CAMPO BLOCCATO.
                </strong>

                <span>
                  {
                    success
                  }
                </span>
              </div>
            </div>
          )}

          <div className="owner-form-footer">
            <Link
              to="/owner/prenotazioni"
              className="button button-outline"
            >
              Annulla
            </Link>

            <button
              type="submit"
              className="owner-save-event"
              disabled={
                !canSave ||
                saving
              }
            >
              <Ban
                size={21}
              />

              {saving
                ? "BLOCCO IN CORSO..."
                : daysCount > 1
                ? `BLOCCA ${daysCount} GIORNI`
                : "BLOCCA GIORNO"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

export default OwnerCourtBlockPage;