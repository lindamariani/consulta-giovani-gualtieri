import {
  ArrowLeft,
  Film,
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

type EventMediaSummary = {
  id: string;
  title: string;
  event_date: string;
  cover_url: string | null;
  mediaCount: number;
  videoCount: number;
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
    useState<
      EventMediaSummary[]
    >([]);

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
    const loadMediaHub =
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
          data:
            profile,
          error:
            profileError,
        } =
          await supabase
            .from(
              "profiles"
            )
            .select(
              "role"
            )
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
            .from(
              "events"
            )
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

        if (eventError) {
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
            mediaData,
          error:
            mediaError,
        } =
          await supabase
            .from(
              "event_photos"
            )
            .select(
              "event_id, media_type"
            );

        if (mediaError) {
          console.error(
            mediaError
          );

          setError(
            "Non riesco a caricare i media."
          );

          setLoading(
            false
          );

          return;
        }

        const mediaCounts =
          new Map<
            string,
            number
          >();

        const videoCounts =
          new Map<
            string,
            number
          >();

        for (
          const item of
          mediaData ?? []
        ) {
          mediaCounts.set(
            item.event_id,
            (mediaCounts.get(
              item.event_id
            ) ?? 0) + 1
          );

          if (
            item.media_type ===
            "video"
          ) {
            videoCounts.set(
              item.event_id,
              (videoCounts.get(
                item.event_id
              ) ?? 0) + 1
            );
          }
        }

        const rows =
          (
            eventData ?? []
          ).map(
            (event) => ({
              ...event,

              mediaCount:
                mediaCounts.get(
                  event.id
                ) ?? 0,

              videoCount:
                videoCounts.get(
                  event.id
                ) ?? 0,
            })
          );

        setEvents(
          rows as EventMediaSummary[]
        );

        setLoading(
          false
        );
      };

    loadMediaHub();
  }, [navigate]);

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO MEDIA...
      </main>
    );
  }

  const totalMedia =
    events.reduce(
      (
        total,
        event
      ) =>
        total +
        event.mediaCount,
      0
    );

  const totalVideos =
    events.reduce(
      (
        total,
        event
      ) =>
        total +
        event.videoCount,
      0
    );

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
            CONSULTA / MEDIA
          </span>
        </div>

        <div className="owner-photos-heading">
          <div>
            <span>
              GALLERY EVENTI
            </span>

            <h1>
              MEDIA.
            </h1>

            <p>
              Gestisci foto e video
              delle gallery degli
              eventi della Consulta.
            </p>
          </div>

          <div className="owner-photos-counter">
            <Images
              size={31}
            />

            <strong>
              {totalMedia}
            </strong>

            <span>
              MEDIA TOTALI ·{" "}
              {totalVideos} VIDEO
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
              caricare foto e video.
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
                        <Film
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
                          event.mediaCount
                        }{" "}
                        MEDIA
                        {event.videoCount >
                          0 &&
                          ` · ${event.videoCount} VIDEO`}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/owner/eventi/${event.id}/media`
                          )
                        }
                      >
                        {event.mediaCount ===
                        0
                          ? "CARICA MEDIA"
                          : "GESTISCI MEDIA"}
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
