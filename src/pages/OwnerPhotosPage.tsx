import {
  ArrowLeft,
  Image,
  Images,
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

type EventPhotoSummary = {
  id: string;
  title: string;
  event_date: string;
  cover_url: string | null;
  photoCount: number;
};

function formatDate(
  date: string
) {
  return new Date(
    `${date}T12:00:00`
  ).toLocaleDateString(
    "it-IT",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function OwnerPhotosPage() {
  const navigate =
    useNavigate();

  const [
    events,
    setEvents,
  ] =
    useState<EventPhotoSummary[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    const loadPhotosHub =
      async () => {
        setLoading(true);
        setError("");

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
          data:
            eventData,
          error:
            eventError,
        } =
          await supabase
            .from("events")
            .select(
              "id, title, event_date, cover_url"
            )
            .order(
              "event_date",
              {
                ascending:
                  false,
              }
            );

        if (
          eventError
        ) {
          console.error(
            eventError
          );

          setError(
            "Non riesco a caricare gli eventi."
          );

          setLoading(
            false
          );

          return;
        }

        const {
          data:
            photoData,
          error:
            photoError,
        } =
          await supabase
            .from(
              "event_photos"
            )
            .select(
              "event_id"
            );

        if (
          photoError
        ) {
          console.error(
            photoError
          );

          setError(
            "Non riesco a caricare le foto."
          );

          setLoading(
            false
          );

          return;
        }

        const counts =
          new Map<
            string,
            number
          >();

        for (
          const photo of
          photoData ?? []
        ) {
          const current =
            counts.get(
              photo.event_id
            ) ?? 0;

          counts.set(
            photo.event_id,
            current + 1
          );
        }

        const rows =
          (
            eventData ?? []
          ).map(
            (event) => ({
              ...event,

              photoCount:
                counts.get(
                  event.id
                ) ?? 0,
            })
          );

        setEvents(
          rows as EventPhotoSummary[]
        );

        setLoading(
          false
        );
      };

    loadPhotosHub();
  }, [navigate]);

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO FOTO...
      </main>
    );
  }

  return (
    <main className="owner-photos-page">
      <div className="container owner-photos-container">

        <div className="owner-events-topbar">
          <Link
            to="/owner"
            className="owner-events-back"
          >
            <ArrowLeft
              size={17}
            />

            Dashboard
          </Link>

          <span>
            CONSULTA / FOTO
          </span>
        </div>

        <div className="owner-photos-heading">
          <div>
            <span>
              GALLERY EVENTI
            </span>

            <h1>
              FOTO.
            </h1>

            <p>
              Gestisci le gallery
              degli eventi della
              Consulta.
            </p>
          </div>

          <div className="owner-photos-counter">
            <Images
              size={31}
            />

            <strong>
              {
                events.reduce(
                  (
                    total,
                    event
                  ) =>
                    total +
                    event.photoCount,
                  0
                )
              }
            </strong>

            <span>
              FOTO TOTALI
            </span>
          </div>
        </div>

        {error && (
          <div className="owner-event-form-error">
            {error}
          </div>
        )}

        {events.length ===
        0 ? (
          <div className="owner-photos-empty">
            <Image
              size={46}
            />

            <strong>
              NESSUN EVENTO.
            </strong>

            <span>
              Crea prima un
              evento per poter
              caricare le foto.
            </span>
          </div>
        ) : (
          <div className="owner-photos-grid">
            {events.map(
              (event) => (
                <article
                  key={
                    event.id
                  }
                  className="owner-photo-event-card"
                >
                  <div className="owner-photo-event-cover">
                    {event.cover_url ? (
                      <img
                        src={
                          event.cover_url
                        }
                        alt={
                          event.title
                        }
                      />
                    ) : (
                      <div className="owner-photo-event-placeholder">
                        <Image
                          size={42}
                        />
                      </div>
                    )}
                  </div>

                  <div className="owner-photo-event-content">
                    <span>
                      {
                        formatDate(
                          event.event_date
                        )
                      }
                    </span>

                    <h2>
                      {
                        event.title
                      }
                    </h2>

                    <div className="owner-photo-event-bottom">
                      <strong>
                        {
                          event.photoCount
                        }{" "}
                        {event.photoCount ===
                        1
                          ? "FOTO"
                          : "FOTO"}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/owner/eventi/${event.id}/foto`
                          )
                        }
                      >
                        {event.photoCount ===
                        0
                          ? "CARICA FOTO"
                          : "GESTISCI FOTO"}
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default OwnerPhotosPage;