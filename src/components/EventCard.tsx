import {
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

import type { EventRecord } from "../types/event";

type EventCardProps = {
  event: EventRecord;
};

function formatEventDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  const day = parsed
    .toLocaleDateString("it-IT", {
      day: "2-digit",
    })
    .toUpperCase();

  const month = parsed
    .toLocaleDateString("it-IT", {
      month: "short",
    })
    .replace(".", "")
    .toUpperCase();

  return `${day} ${month}`;
}

function EventCard({
  event,
}: EventCardProps) {
  const displayDate =
    formatEventDate(event.event_date);

  const dayNumber =
    displayDate.split(" ")[0];

  return (
    <Link
      to={`/eventi/${event.slug}`}
      className={`event-list-card event-theme-${event.theme}`}
    >
      <div className="event-list-top">
        <span>
          {event.organizer}
        </span>

        <span>
          {displayDate}
        </span>
      </div>

      <div className="event-list-visual">
        {event.cover_url ? (
          <img
            src={event.cover_url}
            alt={event.title}
            className="event-list-cover"
          />
        ) : (
          <>
            <span className="event-list-big-number">
              {dayNumber}
            </span>

            <div className="event-list-shape">
              ✦
            </div>
          </>
        )}
      </div>

      <div className="event-list-content">
        <div className="event-list-meta">
          {event.start_time && (
            <span>
              <Clock size={14} />

              {event.start_time.slice(
                0,
                5
              )}
            </span>
          )}

          {event.location && (
            <span>
              <MapPin size={14} />

              {event.location}
            </span>
          )}
        </div>

        <h3>
          {event.title}
        </h3>

        {event.short_description && (
          <p>
            {
              event.short_description
            }
          </p>
        )}

        <div className="event-list-arrow">
          <ArrowRight size={21} />
        </div>
      </div>
    </Link>
  );
}

export default EventCard;