import {
  ArrowLeft,
  Check,
  ImagePlus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import type {
  EventCategory,
  EventTheme,
} from "../types/event";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function OwnerEventFormPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const editing = Boolean(id);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [uploadingPoster, setUploadingPoster] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [
    shortDescription,
    setShortDescription,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [date, setDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [organizer, setOrganizer] =
    useState("Consulta Giovani");

  const [category, setCategory] =
    useState<EventCategory>("consulta");

  const [theme, setTheme] =
    useState<EventTheme>("green");

  const [published, setPublished] =
    useState(true);

  const [coverUrl, setCoverUrl] =
    useState<string | null>(null);

  const [
    coverStoragePath,
    setCoverStoragePath,
  ] =
    useState<string | null>(null);

  const [
    originalCoverStoragePath,
    setOriginalCoverStoragePath,
  ] =
    useState<string | null>(null);

  const [
    removeCurrentPoster,
    setRemoveCurrentPoster,
  ] =
    useState(false);

  const [posterFile, setPosterFile] =
    useState<File | null>(null);

  const [posterPreview, setPosterPreview] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!editing || !id) {
      return;
    }

    const loadEvent = async () => {
      const { data, error } =
        await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

      if (error || !data) {
        setError(
          "Evento non trovato."
        );

        setLoading(false);
        return;
      }

      setTitle(data.title);

      setShortDescription(
        data.short_description ?? ""
      );

      setDescription(
        data.description ?? ""
      );

      setDate(data.event_date);

      setStartTime(
        data.start_time
          ? data.start_time.slice(0, 5)
          : ""
      );

      setEndTime(
        data.end_time
          ? data.end_time.slice(0, 5)
          : ""
      );

      setLocation(
        data.location ?? ""
      );

      setOrganizer(
        data.organizer
      );

      setCategory(
        data.category
      );

      setTheme(
        data.theme
      );

      setPublished(
        data.published
      );

      setCoverUrl(
        data.cover_url ?? null
      );

      setCoverStoragePath(
        data.cover_storage_path ??
        null
      );

      setOriginalCoverStoragePath(
        data.cover_storage_path ??
        null
      );

      setPosterPreview(
        data.cover_url ?? null
      );

      setLoading(false);
    };

    loadEvent();
  }, [editing, id]);

  const handlePosterChange = (
    file: File | null
  ) => {
    if (!file) return;

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setError(
        "La locandina deve essere JPG, PNG oppure WebP."
      );

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "La locandina non può superare 10 MB."
      );

      return;
    }

    setError("");

    setPosterFile(file);

    setRemoveCurrentPoster(
      false
    );

    const preview =
      URL.createObjectURL(file);

    setPosterPreview(preview);
  };

  const uploadPoster =
    async (
      eventSlug: string
    ) => {
      if (
        removeCurrentPoster &&
        !posterFile
      ) {
        return {
          url: null,
          path: null,
        };
      }

      if (!posterFile) {
        return {
          url: coverUrl,
          path:
            coverStoragePath,
        };
      }

      setUploadingPoster(true);

      const extension =
        posterFile.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `${eventSlug}/${crypto.randomUUID()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("event-posters")
        .upload(
          filePath,
          posterFile,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          uploadError
        );

        setUploadingPoster(
          false
        );

        throw new Error(
          "Errore durante il caricamento della locandina."
        );
      }

      const { data } =
        supabase.storage
          .from(
            "event-posters"
          )
          .getPublicUrl(
            filePath
          );

      setUploadingPoster(
        false
      );

      return {
        url:
          data.publicUrl,
        path:
          filePath,
      };
    };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !title.trim() ||
      !date ||
      !organizer.trim()
    ) {
      setError(
        "Titolo, data e organizzatore sono obbligatori."
      );

      return;
    }

    if (
      startTime &&
      endTime &&
      endTime <= startTime
    ) {
      setError(
        "L'orario di fine deve essere successivo all'orario di inizio."
      );

      return;
    }

    setSaving(true);
    setError("");

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      navigate("/owner/login");
      return;
    }

    const slug =
      createSlug(title);

    let newlyUploadedPath:
      string | null = null;

    try {
      const finalPoster =
        await uploadPoster(
          slug
        );

      if (
        posterFile &&
        finalPoster.path
      ) {
        newlyUploadedPath =
          finalPoster.path;
      }

      const eventData = {
        slug,

        title:
          title.trim(),

        short_description:
          shortDescription.trim() ||
          null,

        description:
          description.trim() ||
          null,

        event_date:
          date,

        start_time:
          startTime || null,

        end_time:
          endTime || null,

        location:
          location.trim() ||
          null,

        organizer:
          organizer.trim(),

        category,

        theme,

        published,

        cover_url:
          finalPoster.url,

        cover_storage_path:
          finalPoster.path,

        created_by:
          user.id,
      };

      if (editing && id) {
        const {
          error:
            updateError,
        } =
          await supabase
            .from("events")
            .update(
              eventData
            )
            .eq("id", id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const {
          error:
            insertError,
        } =
          await supabase
            .from("events")
            .insert(
              eventData
            );

        if (insertError) {
          throw insertError;
        }
      }

      if (
        editing &&
        originalCoverStoragePath &&
        originalCoverStoragePath !==
          finalPoster.path
      ) {
        const {
          error:
            oldPosterDeleteError,
        } =
          await supabase.storage
            .from(
              "event-posters"
            )
            .remove([
              originalCoverStoragePath,
            ]);

        if (
          oldPosterDeleteError
        ) {
          console.error(
            "Evento salvato, ma non sono riuscito a cancellare la vecchia locandina:",
            oldPosterDeleteError
          );
        }
      }

      navigate(
        "/owner/eventi"
      );
    } catch (err) {
      console.error(err);

      if (
        newlyUploadedPath &&
        newlyUploadedPath !==
          originalCoverStoragePath
      ) {
        const {
          error:
            cleanupError,
        } =
          await supabase.storage
            .from(
              "event-posters"
            )
            .remove([
              newlyUploadedPath,
            ]);

        if (cleanupError) {
          console.error(
            "Errore pulizia nuova locandina:",
            cleanupError
          );
        }
      }

      setError(
        "Errore durante il salvataggio dell'evento."
      );

      setSaving(false);
      setUploadingPoster(false);
    }
  };

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO...
      </main>
    );
  }

  return (
    <main className="owner-event-form-page">
      <div className="container owner-event-form-container">
        <div className="owner-events-topbar">
          <Link
            to="/owner/eventi"
            className="owner-events-back"
          >
            <ArrowLeft size={17} />
            Eventi
          </Link>

          <span>
            {editing
              ? "MODIFICA EVENTO"
              : "NUOVO EVENTO"}
          </span>
        </div>

        <div className="owner-event-form-heading">
          <span>
            {editing
              ? "EDIT"
              : "CREATE"}
          </span>

          <h1>
            {editing
              ? "MODIFICA."
              : "NUOVO EVENTO."}
          </h1>
        </div>

        <form
          className="owner-event-form"
          onSubmit={handleSubmit}
        >
          <section className="owner-form-section">
            <div className="owner-form-section-number">
              01
            </div>

            <div className="owner-form-section-content">
              <small>
                INFORMAZIONI BASE
              </small>

              <h2>
                COSA SUCCEDE?
              </h2>

              <label>
                <span>
                  Titolo *
                </span>

                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Aperitivo sotto le stelle"
                />
              </label>

              <label>
                <span>
                  Descrizione breve
                </span>

                <textarea
                  value={
                    shortDescription
                  }
                  onChange={(e) =>
                    setShortDescription(
                      e.target.value
                    )
                  }
                  maxLength={180}
                  placeholder="Una breve frase che apparirà nelle card..."
                />

                <small>
                  {
                    shortDescription.length
                  }
                  /180
                </small>
              </label>

              <label>
                <span>
                  Descrizione completa
                </span>

                <textarea
                  className="owner-form-big-textarea"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Racconta l'evento..."
                />
              </label>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              02
            </div>

            <div className="owner-form-section-content">
              <small>
                LOCANDINA
              </small>

              <h2>
                CARICA IL POSTER.
              </h2>

              <p className="owner-poster-help">
                Meglio un'immagine verticale.
                Il sito mantiene automaticamente
                le proporzioni da locandina.
              </p>

              <div className="owner-poster-layout">
                <label className="owner-poster-upload">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handlePosterChange(
                        event
                          .target
                          .files?.[0] ??
                          null
                      )
                    }
                  />

                  <ImagePlus
                    size={35}
                  />

                  <strong>
                    CARICA
                    <br />
                    LOCANDINA
                  </strong>

                  <span>
                    JPG · PNG · WEBP
                  </span>
                </label>

                <div className="owner-poster-preview">
                  {posterPreview ? (
                    <>
                      <img
                        src={
                          posterPreview
                        }
                        alt="Anteprima locandina"
                      />

                      <button
                        type="button"
                        className="owner-remove-poster"
                        onClick={() => {
                          setPosterFile(
                            null
                          );

                          setPosterPreview(
                            null
                          );

                          setCoverUrl(
                            null
                          );

                          setCoverStoragePath(
                            null
                          );

                          setRemoveCurrentPoster(
                            true
                          );
                        }}
                      >
                        <Trash2
                          size={17}
                        />

                        Rimuovi
                      </button>
                    </>
                  ) : (
                    <div className="owner-poster-placeholder">
                      <Upload
                        size={30}
                      />

                      <span>
                        ANTEPRIMA
                        <br />
                        LOCANDINA
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              03
            </div>

            <div className="owner-form-section-content">
              <small>
                DATA E LUOGO
              </small>

              <h2>
                QUANDO E DOVE?
              </h2>

              <div className="owner-form-grid">
                <label>
                  <span>
                    Data *
                  </span>

                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) =>
                      setDate(
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Ora inizio
                  </span>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Ora fine
                  </span>

                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) =>
                      setEndTime(
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>

              <label>
                <span>
                  Luogo
                </span>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  placeholder="Piazza Bentivoglio"
                />
              </label>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              04
            </div>

            <div className="owner-form-section-content">
              <small>
                CHI LO ORGANIZZA?
              </small>

              <h2>
                ORGANIZZATORE.
              </h2>

              <label>
                <span>
                  Organizzatore *
                </span>

                <input
                  type="text"
                  required
                  value={organizer}
                  onChange={(e) =>
                    setOrganizer(
                      e.target.value
                    )
                  }
                  placeholder="Consulta Giovani"
                />
              </label>

              <div className="owner-option-title">
                Categoria
              </div>

              <div className="owner-choice-grid">
                {(
                  [
                    "consulta",
                    "comune",
                    "territorio",
                  ] as EventCategory[]
                ).map(
                  (value) => (
                    <button
                      type="button"
                      key={value}
                      className={
                        category ===
                        value
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setCategory(
                          value
                        )
                      }
                    >
                      {value}
                    </button>
                  )
                )}
              </div>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              05
            </div>

            <div className="owner-form-section-content">
              <small>
                ASPETTO
              </small>

              <h2>
                COLORE EVENTO.
              </h2>

              <div className="owner-theme-grid">
                {(
                  [
                    "green",
                    "lilac",
                    "yellow",
                    "pink",
                    "blue",
                    "cyan",
                  ] as EventTheme[]
                ).map(
                  (value) => (
                    <button
                      type="button"
                      key={value}
                      className={`owner-theme-option owner-theme-${value} ${
                        theme ===
                        value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setTheme(
                          value
                        )
                      }
                    >
                      {theme ===
                        value && (
                        <Check
                          size={20}
                        />
                      )}

                      <span>
                        {value}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section-number">
              06
            </div>

            <div className="owner-form-section-content">
              <small>
                PUBBLICAZIONE
              </small>

              <h2>
                È VISIBILE?
              </h2>

              <button
                type="button"
                className={`owner-publish-toggle ${
                  published
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPublished(
                    !published
                  )
                }
              >
                <div>
                  {published && (
                    <Check
                      size={19}
                    />
                  )}
                </div>

                <span>
                  <strong>
                    {published
                      ? "PUBBLICATO"
                      : "NASCOSTO"}
                  </strong>

                  <small>
                    {published
                      ? "L'evento sarà visibile sul sito."
                      : "L'evento rimane salvato ma non compare pubblicamente."}
                  </small>
                </span>
              </button>
            </div>
          </section>

          {error && (
            <div className="owner-event-form-error">
              {error}
            </div>
          )}

          <div className="owner-form-footer">
            <Link
              to="/owner/eventi"
              className="button button-outline"
            >
              Annulla
            </Link>

            <button
              type="submit"
              className="owner-save-event"
              disabled={
                saving ||
                uploadingPoster
              }
            >
              <Save size={22} />

              {uploadingPoster
                ? "CARICAMENTO LOCANDINA..."
                : saving
                ? "SALVATAGGIO..."
                : editing
                ? "SALVA MODIFICHE"
                : "CREA EVENTO"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default OwnerEventFormPage;