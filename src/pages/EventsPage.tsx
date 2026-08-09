import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

import EventCard from "../components/EventCard";

import { supabase } from "../lib/supabase";

import type {
    EventCategory,
    EventRecord,
} from "../types/event";

type Filter =
    | "all"
    | EventCategory;

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

function EventsPage() {
    const [events, setEvents] =
        useState<EventRecord[]>([]);

    const [filter, setFilter] =
        useState<Filter>("all");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadEvents =
            async () => {
                setLoading(true);
                setError("");

                const {
                    data,
                    error: loadError,
                } = await supabase
                    .from("events")
                    .select("*")
                    .eq(
                        "published",
                        true
                    )
                    .order(
                        "event_date",
                        {
                            ascending: true,
                        }
                    );

                if (loadError) {
                    console.error(
                        loadError
                    );

                    setError(
                        "Non riesco a caricare gli eventi."
                    );

                    setLoading(false);
                    return;
                }

                setEvents(
                    (data ??
                        []) as EventRecord[]
                );

                setLoading(false);
            };

        loadEvents();
    }, []);

    const today =
        getLocalDateString();

    const futureEvents =
        useMemo(() => {
            return events.filter(
                (event) => {
                    const matchesCategory =
                        filter === "all" ||
                        event.category ===
                        filter;

                    return (
                        event.event_date >=
                        today &&
                        matchesCategory
                    );
                }
            );
        }, [
            events,
            filter,
            today,
        ]);

    const pastEvents =
        useMemo(() => {
            return events
                .filter((event) => {
                    const matchesCategory =
                        filter === "all" ||
                        event.category ===
                        filter;

                    return (
                        event.event_date <
                        today &&
                        matchesCategory
                    );
                })
                .sort((a, b) =>
                    b.event_date.localeCompare(
                        a.event_date
                    )
                );
        }, [
            events,
            filter,
            today,
        ]);

    return (
        <main className="events-page">
            <section className="events-page-hero">
                <div className="events-page-word">
                    EVENTI
                </div>

                <div className="container">
                    <Link
                        to="/"
                        className="back-link"
                    >
                        <ArrowLeft
                            size={17}
                        />
                        Home
                    </Link>

                    <div className="events-page-heading">
                        <div>
                            <span className="events-page-kicker">
                                <Sparkles
                                    size={15}
                                />
                                Agenda Gualtieri
                            </span>

                            <h1>
                                CHE SI FA?
                            </h1>
                        </div>

                        <p>
                            Eventi della Consulta,
                            iniziative del Comune e
                            appuntamenti del
                            territorio. Tutto nello
                            stesso posto.
                        </p>
                    </div>
                </div>
            </section>

            <section className="events-filter-section">
                <div className="container">
                    <div className="events-filters">
                        <button
                            className={
                                filter === "all"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter("all")
                            }
                        >
                            Tutti
                        </button>

                        <button
                            className={
                                filter ===
                                    "consulta"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "consulta"
                                )
                            }
                        >
                            Consulta
                        </button>

                        <button
                            className={
                                filter ===
                                    "comune"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "comune"
                                )
                            }
                        >
                            Comune
                        </button>

                        <button
                            className={
                                filter ===
                                    "territorio"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    "territorio"
                                )
                            }
                        >
                            Territorio
                        </button>
                    </div>
                </div>
            </section>

            <section className="events-list-section">
                <div className="container">
                    <div className="events-list-heading">
                        <span>01</span>

                        <div>
                            <small>
                                IN AGENDA
                            </small>

                            <h2>
                                PROSSIMI EVENTI
                            </h2>
                        </div>
                    </div>

                    {loading && (
                        <div className="events-loading">
                            CARICAMENTO EVENTI...
                        </div>
                    )}

                    {!loading &&
                        error && (
                            <div className="events-error">
                                {error}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        futureEvents.length >
                        0 && (
                            <div className="events-list-grid">
                                {futureEvents.map(
                                    (event) => (
                                        <EventCard
                                            key={
                                                event.id
                                            }
                                            event={
                                                event
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        futureEvents.length ===
                        0 && (
                            <div className="events-empty">
                                <span>
                                    ¯\_(ツ)_/¯
                                </span>

                                <h3>
                                    PER ORA NIENTE.
                                </h3>

                                <p>
                                    Non ci sono eventi
                                    di questa categoria
                                    in programma.
                                </p>
                            </div>
                        )}
                </div>
            </section>

            <section
                id="passati"
                className="past-events-section"
            >
                <div className="container">
                    <div className="events-list-heading">
                        <span>02</span>

                        <div>
                            <small>
                                CAMERA ROLL
                            </small>

                            <h2>
                                È GIÀ SUCCESSO
                            </h2>
                        </div>
                    </div>

                    {!loading &&
                        !error &&
                        pastEvents.length >
                        0 && (
                            <div className="events-list-grid">
                                {pastEvents.map(
                                    (event) => (
                                        <EventCard
                                            key={
                                                event.id
                                            }
                                            event={
                                                event
                                            }
                                        />
                                    )
                                )}
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        pastEvents.length ===
                        0 && (
                            <div className="events-empty events-empty-light">
                                <span>✦</span>

                                <h3>
                                    NESSUN EVENTO
                                    PASSATO.
                                </h3>
                            </div>
                        )}
                </div>
            </section>
        </main>
    );
}

export default EventsPage;