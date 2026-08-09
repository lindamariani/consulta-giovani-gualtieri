import {
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";

import type { EventRecord } from "../types/event";

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

function formatDate(
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

function HomeEvents() {
  const [events, setEvents] =
    useState<EventRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadEvents =
      async () => {
        const today =
          getLocalDateString();

        const {
          data,
          error,
        } = await supabase
          .from("events")
          .select("*")
          .eq(
            "published",
            true
          )
          .gte(
            "event_date",
            today
          )
          .order(
            "event_date",
            {
              ascending: true,
            }
          )
          .limit(3);

        if (error) {
          console.error(
            error
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

  return (
    <section
      className="section events-section"
      id="eventi"
    >
      <div className="container">
        <div className="section-header section-header-events">
          <div>
            <span className="section-index">
              01
            </span>

            <span className="eyebrow">
              Agenda
            </span>

            <h2>
              Cosa succede
              <br />
              <span>
                a Gualtieri?
              </span>
            </h2>
          </div>

          <Link
            to="/eventi"
            className="section-link"
          >
            Tutti gli eventi

            <ArrowRight
              size={17}
            />
          </Link>
        </div>

        {loading && (
          <div className="home-events-loading">
            CARICAMENTO EVENTI...
          </div>
        )}

        {!loading &&
          events.length === 0 && (
            <div className="home-events-empty">
              <span>
                PER ORA È TUTTO
                TRANQUILLO.
              </span>

              <strong>
                MA TORNA A
                TROVARCI.
              </strong>
            </div>
          )}

        {!loading &&
          events.length > 0 && (
            <div className="events-grid">
              {events.map(
                (
                  event,
                  index
                ) => (
                  <Link
                    key={
                      event.id
                    }
                    to={`/eventi/${event.slug}`}
                    className={`event-poster event-poster-${event.theme}`}
                  >
                    <div className="event-poster-top">
                      <span className="event-source">
                        {
                          event.organizer
                        }
                      </span>

                      <span className="event-number">
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    <div className="event-poster-graphic">
                      {event.cover_url ? (
                        <img
                          src={
                            event.cover_url
                          }
                          alt={
                            event.title
                          }
                          className="home-event-cover"
                        />
                      ) : (
                        <>
                          <div className="graphic-star">
                            <span>
                              {
                                event.category
                              }
                            </span>
                          </div>

                          <div className="graphic-ball" />
                        </>
                      )}
                    </div>

                    <div className="event-poster-bottom">
                      <span className="event-date">
                        {formatDate(
                          event.event_date
                        )}
                      </span>

                      <h3>
                        {
                          event.title
                        }
                      </h3>

                      <div className="event-info">
                        {event.start_time && (
                          <span>
                            <Clock
                              size={
                                14
                              }
                            />

                            {event.start_time.slice(
                              0,
                              5
                            )}
                          </span>
                        )}

                        {event.location && (
                          <span>
                            <MapPin
                              size={
                                14
                              }
                            />

                            {
                              event.location
                            }
                          </span>
                        )}
                      </div>

                      <div className="poster-arrow">
                        <ArrowRight
                          size={20}
                        />
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
      </div>
    </section>
  );
}

export default HomeEvents;