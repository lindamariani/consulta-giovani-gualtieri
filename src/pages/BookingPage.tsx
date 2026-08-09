import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Trophy,
  UserRound,
  Volleyball,
} from "lucide-react";

import { Link, useSearchParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

type Sport =
  | "beach-volley"
  | "tennis";

type Court = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  opening_time: string;
  closing_time: string;
};

type BusyTime = {
  start_time: string;
  end_time: string;
  source: string;
};

type BlockedDate = {
  blocked_date: string;
};

type DayOption = {
  label: string;
  number: string;
  month: string;
  fullDate: string;
  databaseDate: string;
};

function formatDatabaseDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDays(
  startDate: Date
): DayOption[] {
  const formatterDay =
    new Intl.DateTimeFormat(
      "it-IT",
      {
        weekday: "short",
      }
    );

  const formatterMonth =
    new Intl.DateTimeFormat(
      "it-IT",
      {
        month: "short",
      }
    );

  const formatterFull =
    new Intl.DateTimeFormat(
      "it-IT",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    );

  return Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(
        startDate
      );

      date.setDate(
        startDate.getDate() +
          index
      );

      return {
        label:
          formatterDay
            .format(date)
            .replace(".", "")
            .toUpperCase(),

        number: String(
          date.getDate()
        ).padStart(2, "0"),

        month:
          formatterMonth
            .format(date)
            .replace(".", "")
            .toUpperCase(),

        fullDate:
          formatterFull.format(
            date
          ),

        databaseDate:
          formatDatabaseDate(
            date
          ),
      };
    }
  );
}

function timeToMinutes(
  time: string
) {
  const [
    hours,
    minutes,
  ] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function minutesToTime(
  minutes: number
) {
  const hours =
    Math.floor(
      minutes / 60
    );

  const remaining =
    minutes % 60;

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    remaining
  ).padStart(
    2,
    "0"
  )}`;
}

function formatDuration(
  minutes: number
) {
  const hours =
    Math.floor(
      minutes / 60
    );

  const remaining =
    minutes % 60;

  if (hours === 0) {
    return `${remaining} min`;
  }

  if (
    remaining === 0
  ) {
    return hours === 1
      ? "1 ora"
      : `${hours} ore`;
  }

  return `${hours}h ${remaining}min`;
}

function BookingPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const requestedCourt =
    searchParams.get("campo");

  const initialSport: Sport =
    requestedCourt === "tennis"
      ? "tennis"
      : "beach-volley";

  const today = useMemo(
    () => {
      const date =
        new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      return date;
    },
    []
  );

  const [
    weekStart,
    setWeekStart,
  ] = useState(today);

  const days = useMemo(
    () =>
      createDays(
        weekStart
      ),
    [weekStart]
  );

  const [
    selectedDay,
    setSelectedDay,
  ] = useState(0);

  const [courts, setCourts] =
    useState<Court[]>([]);

  const [
    selectedSport,
    setSelectedSport,
  ] =
    useState<Sport>(
      initialSport
    );

  useEffect(() => {
    if (
      requestedCourt === "tennis" ||
      requestedCourt === "beach-volley"
    ) {
      setSelectedSport(
        requestedCourt
      );
    }
  }, [requestedCourt]);

  const [
    busyTimes,
    setBusyTimes,
  ] =
    useState<BusyTime[]>(
      []
    );

  const [
    blockedDates,
    setBlockedDates,
  ] =
    useState<string[]>(
      []
    );

  const [
    loadingAvailability,
    setLoadingAvailability,
  ] = useState(false);

  const [
    startTime,
    setStartTime,
  ] =
    useState<string | null>(
      null
    );

  const [
    endTime,
    setEndTime,
  ] =
    useState<string | null>(
      null
    );

  const [name, setName] =
    useState("");

  const [surname, setSurname] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [
    confirmed,
    setConfirmed,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadCourts =
      async () => {
        const {
          data,
          error:
            courtsError,
        } = await supabase
          .from("courts")
          .select("*")
          .eq(
            "active",
            true
          )
          .order("name");

        if (courtsError) {
          console.error(
            courtsError
          );

          setError(
            "Non riesco a caricare i campi."
          );

          return;
        }

        setCourts(
          (data ??
            []) as Court[]
        );
      };

    loadCourts();
  }, []);

  const selectedCourt =
    useMemo(() => {
      return (
        courts.find(
          (court) =>
            court.slug ===
            selectedSport
        ) ?? null
      );
    }, [
      courts,
      selectedSport,
    ]);

  useEffect(() => {
    if (
      !selectedCourt ||
      days.length === 0
    ) {
      setBlockedDates([]);
      return;
    }

    const loadBlockedDates =
      async () => {
        const firstDay =
          days[0].databaseDate;

        const lastDay =
          days[
            days.length - 1
          ].databaseDate;

        const {
          data,
          error:
            blockedDatesError,
        } = await supabase.rpc(
          "get_court_blocked_dates",
          {
            p_court_id:
              selectedCourt.id,

            p_start_date:
              firstDay,

            p_end_date:
              lastDay,
          }
        );

        if (
          blockedDatesError
        ) {
          console.error(
            blockedDatesError
          );

          setBlockedDates([]);

          return;
        }

        const dates =
          (
            (data ??
              []) as BlockedDate[]
          ).map(
            (item) =>
              item.blocked_date
          );

        setBlockedDates(
          dates
        );
      };

    loadBlockedDates();
  }, [
    selectedCourt,
    days,
  ]);

  useEffect(() => {
    const currentDay =
      days[selectedDay];

    if (
      !currentDay ||
      !blockedDates.includes(
        currentDay.databaseDate
      )
    ) {
      return;
    }

    const firstAvailableIndex =
      days.findIndex(
        (day) =>
          !blockedDates.includes(
            day.databaseDate
          )
      );

    if (
      firstAvailableIndex !==
      -1
    ) {
      setSelectedDay(
        firstAvailableIndex
      );
    }

    setStartTime(null);
    setEndTime(null);
  }, [
    blockedDates,
    days,
    selectedDay,
  ]);

  const selectedDate =
    days[selectedDay];

  const selectedDateIsBlocked =
    selectedDate
      ? blockedDates.includes(
          selectedDate.databaseDate
        )
      : false;

  useEffect(() => {
    if (
      !selectedCourt ||
      !selectedDate ||
      selectedDateIsBlocked
    ) {
      if (
        selectedDateIsBlocked
      ) {
        setBusyTimes([]);
        setStartTime(null);
        setEndTime(null);
      }

      return;
    }

    const loadBusyTimes =
      async () => {
        setLoadingAvailability(
          true
        );

        setError("");

        setStartTime(null);
        setEndTime(null);

        const {
          data,
          error:
            busyError,
        } =
          await supabase.rpc(
            "get_court_busy_times",
            {
              p_court_id:
                selectedCourt.id,

              p_booking_date:
                selectedDate.databaseDate,
            }
          );

        if (busyError) {
          console.error(
            busyError
          );

          setError(
            "Non riesco a caricare la disponibilità."
          );

          setBusyTimes([]);
          setLoadingAvailability(
            false
          );

          return;
        }

        setBusyTimes(
          (data ??
            []) as BusyTime[]
        );

        setLoadingAvailability(
          false
        );
      };

    loadBusyTimes();
  }, [
    selectedCourt,
    selectedDate,
    selectedDateIsBlocked,
  ]);

  const openingMinutes =
    selectedCourt
      ? timeToMinutes(
          selectedCourt.opening_time
        )
      : 8 * 60;

  const closingMinutes =
    selectedCourt
      ? timeToMinutes(
          selectedCourt.closing_time
        )
      : 23 * 60;

  const startOptions =
    useMemo(() => {
      const options: string[] =
        [];

      for (
        let minute =
          openingMinutes;
        minute <
        closingMinutes;
        minute += 30
      ) {
        const isBusy =
          busyTimes.some(
            (busy) => {
              const busyStart =
                timeToMinutes(
                  busy.start_time
                );

              const busyEnd =
                timeToMinutes(
                  busy.end_time
                );

              return (
                minute >=
                  busyStart &&
                minute <
                  busyEnd
              );
            }
          );

        if (!isBusy) {
          options.push(
            minutesToTime(
              minute
            )
          );
        }
      }

      return options;
    }, [
      busyTimes,
      openingMinutes,
      closingMinutes,
    ]);

  const endOptions =
    useMemo(() => {
      if (!startTime) {
        return [];
      }

      const startMinutes =
        timeToMinutes(
          startTime
        );

      const options: string[] =
        [];

      for (
        let minute =
          startMinutes + 30;
        minute <=
        closingMinutes;
        minute += 30
      ) {
        const overlaps =
          busyTimes.some(
            (busy) => {
              const busyStart =
                timeToMinutes(
                  busy.start_time
                );

              const busyEnd =
                timeToMinutes(
                  busy.end_time
                );

              return (
                startMinutes <
                  busyEnd &&
                minute >
                  busyStart
              );
            }
          );

        if (overlaps) {
          break;
        }

        options.push(
          minutesToTime(
            minute
          )
        );
      }

      return options;
    }, [
      startTime,
      busyTimes,
      closingMinutes,
    ]);

  const durationMinutes =
    startTime && endTime
      ? timeToMinutes(
          endTime
        ) -
        timeToMinutes(
          startTime
        )
      : 0;

  const durationLabel =
    durationMinutes > 0
      ? formatDuration(
          durationMinutes
        )
      : "—";

  const canConfirm =
    Boolean(
      selectedCourt &&
        selectedDate &&
        !selectedDateIsBlocked &&
        startTime &&
        endTime &&
        name.trim() &&
        surname.trim() &&
        phone.trim()
    );

  const changeSport = (
    sport: Sport
  ) => {
    setSelectedSport(
      sport
    );

    setSearchParams(
      { campo: sport },
      { replace: true }
    );

    setStartTime(null);
    setEndTime(null);
  };

  const changeWeek = (
    amount: number
  ) => {
    const newDate =
      new Date(
        weekStart
      );

    newDate.setDate(
      weekStart.getDate() +
        amount * 7
    );

    if (
      newDate < today
    ) {
      return;
    }

    setWeekStart(
      newDate
    );

    setSelectedDay(0);
    setStartTime(null);
    setEndTime(null);
  };

  const handleConfirm =
    async () => {
      if (
        !canConfirm ||
        !selectedCourt ||
        !selectedDate ||
        !startTime ||
        !endTime
      ) {
        return;
      }

      setSaving(true);
      setError("");

      const {
        error:
          bookingError,
      } =
        await supabase.rpc(
          "create_court_booking",
          {
            p_court_id:
              selectedCourt.id,

            p_booking_date:
              selectedDate.databaseDate,

            p_start_time:
              startTime,

            p_end_time:
              endTime,

            p_customer_name:
              name.trim(),

            p_customer_surname:
              surname.trim(),

            p_phone:
              phone.trim(),

            p_email:
              email.trim() ||
              null,
          }
        );

      if (bookingError) {
        console.error(
          bookingError
        );

        const message =
          bookingError.message ??
          "";

        if (
          message.includes(
            "BOOKING_OVERLAP"
          )
        ) {
          setError(
            "Qualcuno ha appena prenotato questa fascia. Scegli un altro orario."
          );
        } else if (
          message.includes(
            "COURT_BLOCKED"
          )
        ) {
          setError(
            "Questa fascia non è disponibile."
          );
        } else {
          setError(
            "Non riesco a completare la prenotazione."
          );
        }

        setSaving(false);

        return;
      }

      setConfirmed(true);
      setSaving(false);

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    };

  if (confirmed) {
    return (
      <main className="booking-success-page">
        <div className="booking-success-grid" />

        <div className="container booking-success-container">
          <div className="booking-success-icon">
            <Check
              size={53}
              strokeWidth={3}
            />
          </div>

          <span className="booking-success-kicker">
            PRENOTAZIONE
            CONFERMATA
          </span>

          <h1>
            CI VEDIAMO
            <br />

            <span>
              IN CAMPO.
            </span>
          </h1>

          <div className="booking-success-ticket">
            <div className="success-ticket-top">
              <span>
                CG / SPORT
              </span>

              <span>
                ✓ OK
              </span>
            </div>

            <div className="success-ticket-main">
              <div>
                <small>
                  CAMPO
                </small>

                <strong>
                  {
                    selectedCourt?.name
                  }
                </strong>
              </div>

              <div>
                <small>
                  GIORNO
                </small>

                <strong>
                  {
                    selectedDate?.fullDate
                  }
                </strong>
              </div>

              <div>
                <small>
                  ORARIO
                </small>

                <strong>
                  {startTime} —{" "}
                  {endTime}
                </strong>
              </div>

              <div>
                <small>
                  DURATA
                </small>

                <strong>
                  {
                    durationLabel
                  }
                </strong>
              </div>

              <div>
                <small>
                  PRENOTATO DA
                </small>

                <strong>
                  {name}{" "}
                  {surname}
                </strong>
              </div>
            </div>

            <div className="success-ticket-bottom">
              <span>
                Consulta Giovani
                Gualtieri
              </span>

              <span>★</span>
            </div>
          </div>

          <div className="booking-success-actions">
            <button
              className="button button-blue"
              onClick={() =>
                window.location.reload()
              }
            >
              Nuova prenotazione
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
    <main className="booking-page">
      <section className="booking-page-hero">
        <div className="booking-page-giant-word">
          GIOCA
        </div>

        <div className="container">
          <Link
            to="/"
            className="booking-back"
          >
            <ArrowLeft
              size={17}
            />
            Home
          </Link>

          <div className="booking-page-heading">
            <div>
              <span className="booking-page-label">
                CAMPI SPORTIVI ·
                GUALTIERI
              </span>

              <h1>
                PRENOTA
                <br />

                <span>
                  IL CAMPO.
                </span>
              </h1>
            </div>

            <div className="booking-hero-note">
              <Volleyball
                size={31}
              />

              <p>
                Scegli il campo,
                il giorno e tutto
                il tempo che ti
                serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="booking-step booking-sport-step">
        <div className="container">
          <div className="booking-step-heading">
            <span className="booking-step-number">
              01
            </span>

            <div>
              <small>
                PRIMA COSA
              </small>

              <h2>
                COSA GIOCHIAMO?
              </h2>
            </div>
          </div>

          <div className="booking-sport-selector">
            <button
              className={`booking-sport-option booking-sport-beach ${
                selectedSport ===
                "beach-volley"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changeSport(
                  "beach-volley"
                )
              }
            >
              <div className="booking-sport-top">
                <span>01</span>

                <Volleyball
                  size={33}
                />
              </div>

              <div>
                <small>
                  CAMPO
                </small>

                <strong>
                  BEACH
                  <br />
                  VOLLEY
                </strong>
              </div>

              <div className="sport-selection-check">
                {selectedSport ===
                  "beach-volley" && (
                  <Check
                    size={22}
                  />
                )}
              </div>
            </button>

            <button
              className={`booking-sport-option booking-sport-tennis ${
                selectedSport ===
                "tennis"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                changeSport(
                  "tennis"
                )
              }
            >
              <div className="booking-sport-top">
                <span>02</span>

                <div className="booking-tennis-ball">
                  ●
                </div>
              </div>

              <div>
                <small>
                  CAMPO
                </small>

                <strong>
                  TENNIS
                </strong>
              </div>

              <div className="sport-selection-check">
                {selectedSport ===
                  "tennis" && (
                  <Check
                    size={22}
                  />
                )}
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="booking-step booking-date-step">
        <div className="container">
          <div className="booking-step-heading">
            <span className="booking-step-number">
              02
            </span>

            <div>
              <small>
                QUANDO?
              </small>

              <h2>
                SCEGLI IL
                GIORNO.
              </h2>
            </div>
          </div>

          <div className="booking-calendar-header">
            <button
              type="button"
              onClick={() =>
                changeWeek(-1)
              }
              disabled={
                weekStart <=
                today
              }
            >
              <ChevronLeft
                size={20}
              />
            </button>

            <strong>
              {new Date(
                `${days[0].databaseDate}T12:00:00`
              )
                .toLocaleDateString(
                  "it-IT",
                  {
                    month:
                      "long",
                    year:
                      "numeric",
                  }
                )
                .toUpperCase()}
            </strong>

            <button
              type="button"
              onClick={() =>
                changeWeek(1)
              }
            >
              <ChevronRight
                size={20}
              />
            </button>
          </div>

          <div className="booking-days">
            {days.map(
              (
                day,
                index
              ) => {
                const isBlocked =
                  blockedDates.includes(
                    day.databaseDate
                  );

                return (
                  <button
                    key={
                      day.databaseDate
                    }
                    type="button"
                    disabled={
                      isBlocked
                    }
                    className={`booking-day ${
                      selectedDay ===
                        index &&
                      !isBlocked
                        ? "selected"
                        : ""
                    } ${
                      isBlocked
                        ? "blocked"
                        : ""
                    }`}
                    onClick={() => {
                      if (
                        isBlocked
                      ) {
                        return;
                      }

                      setSelectedDay(
                        index
                      );

                      setStartTime(
                        null
                      );

                      setEndTime(
                        null
                      );
                    }}
                  >
                    <span>
                      {day.label}
                    </span>

                    <strong>
                      {day.number}
                    </strong>

                    <small>
                      {isBlocked
                        ? "DATA BLOCCATA"
                        : day.month}
                    </small>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>

      <section className="booking-step booking-time-step">
        <div className="container">
          <div className="booking-step-heading booking-step-heading-light">
            <span className="booking-step-number">
              03
            </span>

            <div>
              <small>
                ORARIO
              </small>

              <h2>
                DA CHE ORA
                <br />
                A CHE ORA?
              </h2>
            </div>
          </div>

          {selectedDateIsBlocked && (
            <div className="booking-date-blocked-notice">
              <Ban size={24} />

              <div>
                <strong>
                  DATA BLOCCATA
                </strong>

                <span>
                  Il campo non è disponibile
                  in questo giorno.
                  Scegli un'altra data.
                </span>
              </div>
            </div>
          )}

          <div className="booking-selected-info">
            <div>
              <CalendarDays
                size={19}
              />

              {
                selectedDate.fullDate
              }
            </div>

            <div>
              <Trophy
                size={19}
              />

              {selectedCourt?.name ??
                "Campo"}
            </div>
          </div>

          {selectedDateIsBlocked ? (
            <div className="booking-availability-blocked">
              <Ban size={38} />

              <strong>
                CAMPO NON DISPONIBILE
              </strong>

              <span>
                Questa data è stata bloccata
                dalla Consulta.
              </span>
            </div>
          ) : loadingAvailability ? (
            <div className="booking-availability-loading">
              CONTROLLO
              DISPONIBILITÀ...
            </div>
          ) : (
            <div className="booking-time-columns">
              <div className="booking-time-column">
                <div className="booking-time-title">
                  <span>
                    01
                  </span>

                  <strong>
                    ORA DI INIZIO
                  </strong>
                </div>

                <div className="booking-slots booking-slots-start">
                  {startOptions.map(
                    (time) => (
                      <button
                        key={
                          time
                        }
                        className={`booking-slot ${
                          startTime ===
                          time
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          setStartTime(
                            time
                          );

                          setEndTime(
                            null
                          );
                        }}
                      >
                        <Clock
                          size={17}
                        />

                        <strong>
                          {time}
                        </strong>

                        <span>
                          {startTime ===
                          time
                            ? "INIZIO"
                            : "LIBERO"}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="booking-time-column">
                <div className="booking-time-title">
                  <span>
                    02
                  </span>

                  <strong>
                    ORA DI FINE
                  </strong>
                </div>

                {!startTime ? (
                  <div className="booking-end-empty">
                    <ArrowLeft
                      size={33}
                    />

                    <strong>
                      PRIMA SCEGLI
                      <br />
                      L'ORA DI
                      INIZIO
                    </strong>
                  </div>
                ) : (
                  <div className="booking-end-options">
                    {endOptions.map(
                      (time) => (
                        <button
                          key={
                            time
                          }
                          className={`booking-end-option ${
                            endTime ===
                            time
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            setEndTime(
                              time
                            )
                          }
                        >
                          <span>
                            FINO ALLE
                          </span>

                          <strong>
                            {time}
                          </strong>

                          <small>
                            {formatDuration(
                              timeToMinutes(
                                time
                              ) -
                                timeToMinutes(
                                  startTime
                                )
                            )}
                          </small>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="booking-live-error">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="booking-step booking-data-step">
        <div className="container booking-data-layout">
          <div>
            <div className="booking-step-heading">
              <span className="booking-step-number">
                04
              </span>

              <div>
                <small>
                  QUASI FATTO
                </small>

                <h2>
                  CHI PRENOTA?
                </h2>
              </div>
            </div>

            <div className="booking-form">
              <div className="booking-form-row">
                <label>
                  <span>
                    Nome *
                  </span>

                  <input
                    value={name}
                    onChange={(
                      e
                    ) =>
                      setName(
                        e.target
                          .value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Cognome *
                  </span>

                  <input
                    value={
                      surname
                    }
                    onChange={(
                      e
                    ) =>
                      setSurname(
                        e.target
                          .value
                      )
                    }
                  />
                </label>
              </div>

              <label>
                <span>
                  Telefono *
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={(
                    e
                  ) =>
                    setPhone(
                      e.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Email
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(
                    e
                  ) =>
                    setEmail(
                      e.target
                        .value
                    )
                  }
                />
              </label>
            </div>
          </div>

          <aside className="booking-summary">
            <div className="booking-summary-heading">
              <UserRound
                size={24}
              />

              <span>
                LA TUA
                PRENOTAZIONE
              </span>
            </div>

            <div className="booking-summary-main">
              <div className="summary-item">
                <small>
                  CAMPO
                </small>

                <strong>
                  {selectedCourt?.name ??
                    "—"}
                </strong>
              </div>

              <div className="summary-item">
                <small>
                  GIORNO
                </small>

                <strong>
                  {
                    selectedDate.fullDate
                  }
                </strong>
              </div>

              <div className="summary-item">
                <small>
                  ORARIO
                </small>

                <strong>
                  {startTime &&
                  endTime
                    ? `${startTime} — ${endTime}`
                    : "—"}
                </strong>
              </div>

              <div className="summary-item">
                <small>
                  DURATA
                </small>

                <strong>
                  {
                    durationLabel
                  }
                </strong>
              </div>

              <div className="summary-item">
                <small>
                  LUOGO
                </small>

                <strong>
                  Gualtieri
                </strong>
              </div>
            </div>

            <div className="booking-summary-map">
              <MapPin
                size={29}
              />

              <span>
                GUALTIERI
              </span>

              <div className="summary-map-lines" />
            </div>

            <button
              className="booking-confirm-button"
              disabled={
                !canConfirm ||
                saving
              }
              onClick={
                handleConfirm
              }
            >
              <span>
                {saving
                  ? "PRENOTAZIONE..."
                  : "CONFERMA PRENOTAZIONE"}
              </span>

              <ArrowRight
                size={28}
              />
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default BookingPage;