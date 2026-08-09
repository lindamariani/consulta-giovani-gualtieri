import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  Image
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import type { EventRecord } from "../types/event";

function OwnerEventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/owner/login");
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", {
          ascending: false,
        });

      if (error) {
        setError(
          "Non riesco a caricare gli eventi."
        );

        console.error(error);

        setLoading(false);
        return;
      }

      setEvents(data ?? []);

      setLoading(false);
    };

    loadEvents();
  }, [navigate]);

  const filteredEvents = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return events;
    }

    return events.filter((event) => {
      return (
        event.title
          .toLowerCase()
          .includes(value) ||
        event.organizer
          .toLowerCase()
          .includes(value) ||
        event.location
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [events, search]);

  const futureEvents = useMemo(() => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    return filteredEvents.filter(
      (event) =>
        event.event_date >= today
    );
  }, [filteredEvents]);

  const pastEvents = useMemo(() => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    return filteredEvents.filter(
      (event) =>
        event.event_date < today
    );
  }, [filteredEvents]);

  const handleDelete = async (
    event: EventRecord
  ) => {
    const confirmed =
      window.confirm(
        `Vuoi davvero eliminare "${event.title}"?`
      );

    if (!confirmed) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (error) {
      alert(
        "Errore durante l'eliminazione."
      );

      console.error(error);

      return;
    }

    setEvents((current) =>
      current.filter(
        (item) =>
          item.id !== event.id
      )
    );
  };

  const togglePublished = async (
    event: EventRecord
  ) => {
    const newValue =
      !event.published;

    const { error } = await supabase
      .from("events")
      .update({
        published: newValue,
      })
      .eq("id", event.id);

    if (error) {
      alert(
        "Errore durante la modifica."
      );

      console.error(error);

      return;
    }

    setEvents((current) =>
      current.map((item) =>
        item.id === event.id
          ? {
              ...item,
              published: newValue,
            }
          : item
      )
    );
  };

  const renderEvent = (
    event: EventRecord
  ) => (
    <article
      key={event.id}
      className={`owner-event-row owner-event-${event.theme}`}
    >
      <div className="owner-event-date">
        <span>
          {new Date(
            `${event.event_date}T12:00:00`
          ).toLocaleDateString(
            "it-IT",
            {
              day: "2-digit",
            }
          )}
        </span>

        <small>
          {new Date(
            `${event.event_date}T12:00:00`
          )
            .toLocaleDateString(
              "it-IT",
              {
                month: "short",
              }
            )
            .replace(".", "")
            .toUpperCase()}
        </small>
      </div>

      <div className="owner-event-main">
        <div className="owner-event-labels">
          <span>
            {event.organizer}
          </span>

          <span>
            {event.category}
          </span>

          {!event.published && (
            <span className="owner-event-draft">
              NASCOSTO
            </span>
          )}
        </div>

        <h3>{event.title}</h3>

        <p>
          {event.location ||
            "Luogo non indicato"}
          {event.start_time &&
            ` · ${event.start_time.slice(
              0,
              5
            )}`}
        </p>
      </div>

      <div className="owner-event-actions">
        <button
          title={
            event.published
              ? "Nascondi"
              : "Pubblica"
          }
          onClick={() =>
            togglePublished(event)
          }
        >
          {event.published ? (
            <Eye size={18} />
          ) : (
            <EyeOff size={18} />
          )}
        </button>

        <button
          title="Modifica"
          onClick={() =>
            navigate(
              `/owner/eventi/${event.id}`
            )
          }
        >
          <Edit3 size={18} />
        </button>

        <button
          className="owner-event-delete"
          title="Elimina"
          onClick={() =>
            handleDelete(event)
          }
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO EVENTI...
      </main>
    );
  }

  return (
    <main className="owner-events-page">
      <div className="container owner-events-container">
        <div className="owner-events-topbar">
          <Link
            to="/owner"
            className="owner-events-back"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <span>
            CONSULTA / EVENTI
          </span>
        </div>

        <div className="owner-events-heading">
          <div>
            <span>GESTIONE</span>

            <h1>
              EVENTI.
            </h1>

            <p>
              Aggiungi, modifica,
              pubblica o elimina gli
              eventi del sito.
            </p>
          </div>

          <Link
            to="/owner/eventi/nuovo"
            className="owner-new-event"
          >
            <Plus size={28} />

            <strong>
              NUOVO
              <br />
              EVENTO
            </strong>
          </Link>
        </div>

        <div className="owner-events-toolbar">
          <div className="owner-events-search">
            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Cerca evento..."
            />
          </div>

          <div className="owner-events-count">
            <CalendarDays
              size={18}
            />

            {events.length} EVENTI
          </div>
        </div>

        {error && (
          <div className="owner-events-error">
            {error}
          </div>
        )}

        <section className="owner-event-section">
          <div className="owner-event-section-title">
            <span>01</span>

            <div>
              <small>
                IN PROGRAMMA
              </small>

              <h2>
                PROSSIMI EVENTI
              </h2>
            </div>
          </div>

          <div className="owner-event-list">
            {futureEvents.length >
            0 ? (
              futureEvents.map(
                renderEvent
              )
            ) : (
              <div className="owner-events-empty">
                Nessun evento futuro.
              </div>
            )}
          </div>
        </section>

        <section className="owner-event-section">
          <div className="owner-event-section-title">
            <span>02</span>

            <div>
              <small>
                ARCHIVIO
              </small>

              <h2>
                EVENTI PASSATI
              </h2>
            </div>
          </div>

          <div className="owner-event-list">
            {pastEvents.length >
            0 ? (
              pastEvents.map(
                renderEvent
              )
            ) : (
              <div className="owner-events-empty">
                Nessun evento passato.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default OwnerEventsPage;