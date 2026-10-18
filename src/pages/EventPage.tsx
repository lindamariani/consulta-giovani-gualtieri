import {
    ArrowLeft,
    ExternalLink,
    CalendarDays,
    Clock,
    MapPin,
    Share2,
} from "lucide-react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabase";
import { AddToCalendarButton } from "add-to-calendar-button-react";

import EventGalleryMedia from "../components/EventGalleryMedia";

import type {
    EventMediaRecord,
    EventRecord,
} from "../types/event";

function formatEventDate(
    date: string
) {
    return new Date(
        `${date}T12:00:00`
    )
        .toLocaleDateString(
            "it-IT",
            {
                day: "2-digit",
                month: "short",
            }
        )
        .replace(".", "")
        .toUpperCase();
}

function getLocalDateString() {
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

function EventPage() {
    const [media, setMedia] =
        useState<EventMediaRecord[]>([]);

    const { id } =
        useParams();

    const [
        event,
        setEvent,
    ] =
        useState<EventRecord | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    const [notFound, setNotFound] =
        useState(false);

    useEffect(() => {
        if (!id) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        const loadEvent = async () => {
            setLoading(true);
            setNotFound(false);

            const {
                data,
                error,
            } = await supabase
                .from("events")
                .select("*")
                .eq("slug", id)
                .eq("published", true)
                .maybeSingle();

            if (error || !data) {
                if (error) {
                    console.error(error);
                }

                setNotFound(true);
                setLoading(false);

                return;
            }

            setEvent(
                data as EventRecord
            );

            // Carica foto e video della gallery
            const {
                data: mediaData,
                error: mediaError,
            } = await supabase
                .from("event_photos")
                .select(
                    "id, event_id, image_url, storage_path, caption, sort_order, created_at, media_type, width, height, aspect_ratio, orientation"
                )
                .eq(
                    "event_id",
                    data.id
                )
                .order(
                    "sort_order",
                    {
                        ascending: true,
                    }
                );

            if (mediaError) {
                console.error(
                    mediaError
                );
            }

            setMedia(
                (mediaData ?? []) as EventMediaRecord[]
            );

            setLoading(false);
        };

        loadEvent();
    }, [id]);

    if (loading) {
        return (
            <main className="owner-loading">
                CARICAMENTO EVENTO...
            </main>
        );
    }

    if (
        notFound ||
        !event
    ) {
        return (
            <main className="event-not-found">
                <div className="container">
                    <span>404</span>

                    <h1>
                        EVENTO SPARITO.
                    </h1>

                    <p>
                        L'evento non esiste
                        oppure non è
                        pubblicato.
                    </p>

                    <Link
                        to="/eventi"
                        className="button button-blue"
                    >
                        Torna agli eventi
                    </Link>
                </div>
            </main>
        );
    }

    const displayDate =
        formatEventDate(
            event.event_date
        );

    const isPast =
        event.event_date <
        getLocalDateString();

    const handleShare =
        async () => {
            if (
                navigator.share
            ) {
                try {
                    await navigator.share(
                        {
                            title:
                                event.title,

                            text:
                                event.short_description ??
                                event.title,

                            url:
                                window.location.href,
                        }
                    );
                } catch {
                    // Utente ha chiuso
                    // la finestra di condivisione.
                }

                return;
            }

            try {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert(
                    "Link copiato!"
                );
            } catch {
                alert(
                    "Non riesco a copiare il link."
                );
            }
        };

    return (
        <main
            className={`event-detail event-detail-${event.theme}`}
        >
            <section className="event-detail-hero">
                <div className="container">
                    <div className="event-detail-nav">
                        <Link to="/eventi">
                            <ArrowLeft
                                size={17}
                            />
                            Tutti gli eventi
                        </Link>

                        <button
                            onClick={
                                handleShare
                            }
                        >
                            <Share2
                                size={17}
                            />
                            Condividi
                        </button>
                    </div>

                    <div className="event-detail-heading">
                        <div className="event-detail-title">
                            <span className="event-detail-organizer">
                                {
                                    event.organizer
                                }
                            </span>

                            <h1>
                                {event.title}
                            </h1>
                        </div>

                        <div className="event-detail-date">
                            <span>
                                {displayDate}
                            </span>

                            <strong>
                                {event.start_time
                                    ? event.start_time.slice(
                                        0,
                                        5
                                    )
                                    : "—"}
                            </strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="event-cover-section">
                <div className="container">
                    {event.cover_url ? (
                        <div className="event-cover-real">
                            <img
                                src={
                                    event.cover_url
                                }
                                alt={
                                    event.title
                                }
                            />
                        </div>
                    ) : (
                        <div className="event-cover-placeholder">
                            <span>
                                LOCANDINA / FOTO
                                EVENTO
                            </span>

                            <div className="event-cover-star">
                                ✦
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="event-information-section">
                <div className="container event-information-grid">
                    <div className="event-description">
                        <span className="eyebrow">
                            L'evento
                        </span>

                        <h2>
                            CI VEDIAMO LÌ.
                        </h2>

                        {event.description ? (
                            <p>
                                {
                                    event.description
                                }
                            </p>
                        ) : (
                            <p>
                                Tutte le
                                informazioni
                                sull'evento
                                arriveranno presto.
                            </p>
                        )}
                    </div>

                    <aside className="event-info-panel">
                        <div className="event-info-row">
                            <CalendarDays
                                size={23}
                            />

                            <div>
                                <small>
                                    Quando
                                </small>

                                <strong>
                                    {displayDate}
                                </strong>
                            </div>
                        </div>

                        {event.start_time && (
                            <div className="event-info-row">
                                <Clock
                                    size={23}
                                />

                                <div>
                                    <small>
                                        Ora
                                    </small>

                                    <strong>
                                        {
                                            event.start_time.slice(
                                                0,
                                                5
                                            )
                                        }

                                        {event.end_time &&
                                            ` — ${event.end_time.slice(
                                                0,
                                                5
                                            )}`}
                                    </strong>
                                </div>
                            </div>
                        )}

                        {event.location && (
                            <div className="event-info-row">
                                <MapPin
                                    size={23}
                                />

                                <div>
                                    <small>
                                        Dove
                                    </small>

                                    <strong>
                                        {
                                            event.location
                                        }
                                    </strong>
                                </div>
                            </div>
                        )}

                        {!isPast && (
                            <div className="event-calendar-actions">
                                <span className="event-calendar-label">NON PERDERTI L'EVENTO</span>
                                <AddToCalendarButton
                                    name={event.title}
                                    description={[event.description || event.short_description || "", `Organizzato da ${event.organizer}`, window.location.href].filter(Boolean).join("\n\n")}
                                    startDate={event.event_date}
                                    endDate={event.end_time && event.start_time && event.end_time.slice(0, 5) <= event.start_time.slice(0, 5)
                                        ? (() => { const d = new Date(`${event.event_date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); })()
                                        : event.event_date}
                                    startTime={event.start_time?.slice(0, 5)}
                                    endTime={event.end_time?.slice(0, 5)}
                                    timeZone="Europe/Rome"
                                    location={event.location || "Gualtieri (RE)"}
                                    options={["Apple", "Google", "Outlook.com", "Microsoft365", "iCal"]}
                                    label="Aggiungi al calendario"
                                    language="it"
                                    hideBranding={true}
                                    buttonStyle="flat"
                                    trigger="click"
                                    listStyle="dropdown"
                                    hideBackground={true}
                                    size="3"
                                />
                            </div>
                        )}

                        <div className="event-organizer-box">
                            <small>
                                Organizzato da
                            </small>

                            <strong>
                                {
                                    event.organizer
                                }
                            </strong>
                        </div>
                    </aside>
                </div>
            </section>

            {isPast && (
                <section className="event-gallery-section">
                    <div className="container">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                            <div className="event-gallery-heading">
                                <span>
                                    CAMERA ROLL
                                </span>

                                <h2>
                                    COM'È
                                    <br />
                                    ANDATA?
                                </h2>
                            </div>

                            <a
                                href="https://drive.google.com/drive/folders/11xcOWS4Cgj0Yv5rv9UUAGiZlH1nPVWXo?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button button-blue"
                            >
                                Scarica foto e video originali
                                <ExternalLink size={18} />
                            </a>
                        </div>

                        {media.length > 0 ? (
                            <div className="event-media-grid">
                                {media.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <EventGalleryMedia
                                            key={
                                                item.id
                                            }
                                            media={
                                                item
                                            }
                                            index={
                                                index
                                            }
                                            eventTitle={
                                                event.title
                                            }
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="event-gallery-empty">
                                <span>✦</span>

                                <h3>
                                    MEDIA IN ARRIVO.
                                </h3>

                                <p>
                                    Quando la Consulta
                                    caricherà foto e video
                                    dell'evento,
                                    compariranno qui.
                                </p>
                            </div>
                        )}

                    </div>
                </section>
            )}
        </main>
    );
}

export default EventPage;