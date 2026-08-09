import {
    ArrowLeft,
    Ban,
    CalendarDays,
    Clock,
    Filter,
    LockOpen,
    Phone,
    Trash2,
    UserRound,
} from "lucide-react";

import {
    useEffect,
    useMemo,
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
};

type Booking = {
    id: string;
    court_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    customer_name: string;
    customer_surname: string;
    phone: string;
    email: string | null;
    status: string;
    created_at: string;
};

type CourtBlock = {
    id: string;
    court_id: string;
    block_date: string;
    start_time: string;
    end_time: string;
    reason: string | null;
    created_at: string;
};

function formatDate(
    date: string
) {
    return new Date(
        `${date}T12:00:00`
    ).toLocaleDateString(
        "it-IT",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
        }
    );
}

function OwnerBookingsPage() {
    const navigate =
        useNavigate();

    const [courts, setCourts] =
        useState<Court[]>([]);

    const [
        bookings,
        setBookings,
    ] =
        useState<Booking[]>([]);

    const [
        blocks,
        setBlocks,
    ] =
        useState<CourtBlock[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [dateFilter, setDateFilter] =
        useState("");

    const [
        courtFilter,
        setCourtFilter,
    ] =
        useState("all");

    useEffect(() => {
        const loadData =
            async () => {
                setLoading(true);
                setError("");

                const {
                    data: { user },
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
                    courtData,
                    error:
                    courtError,
                } =
                    await supabase
                        .from("courts")
                        .select(
                            "id, name, slug"
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
                        "Errore nel caricamento dei campi."
                    );

                    setLoading(false);

                    return;
                }

                setCourts(
                    (courtData ??
                        []) as Court[]
                );

                const {
                    data:
                    bookingData,
                    error:
                    bookingError,
                } =
                    await supabase
                        .from(
                            "bookings"
                        )
                        .select("*")
                        .order(
                            "booking_date",
                            {
                                ascending:
                                    true,
                            }
                        )
                        .order(
                            "start_time",
                            {
                                ascending:
                                    true,
                            }
                        );

                if (
                    bookingError
                ) {
                    console.error(
                        bookingError
                    );

                    setError(
                        "Errore nel caricamento delle prenotazioni."
                    );

                    setLoading(false);

                    return;
                }

                setBookings(
                    (bookingData ??
                        []) as Booking[]
                );

                const {
                    data:
                    blockData,
                    error:
                    blockError,
                } =
                    await supabase
                        .from(
                            "court_blocks"
                        )
                        .select("*")
                        .order(
                            "block_date",
                            {
                                ascending:
                                    true,
                            }
                        )
                        .order(
                            "start_time",
                            {
                                ascending:
                                    true,
                            }
                        );

                if (
                    blockError
                ) {
                    console.error(
                        blockError
                    );

                    setError(
                        "Errore nel caricamento delle fasce bloccate."
                    );

                    setLoading(false);

                    return;
                }

                setBlocks(
                    (blockData ??
                        []) as CourtBlock[]
                );

                setLoading(false);
            };

        loadData();
    }, [navigate]);

    const filteredBookings =
        useMemo(() => {
            return bookings.filter(
                (booking) => {
                    const matchesDate =
                        !dateFilter ||
                        booking.booking_date ===
                        dateFilter;

                    const matchesCourt =
                        courtFilter ===
                        "all" ||
                        booking.court_id ===
                        courtFilter;

                    return (
                        matchesDate &&
                        matchesCourt
                    );
                }
            );
        }, [
            bookings,
            dateFilter,
            courtFilter,
        ]);

    const filteredBlocks =
        useMemo(() => {
            return blocks.filter(
                (block) => {
                    const matchesDate =
                        !dateFilter ||
                        block.block_date ===
                        dateFilter;

                    const matchesCourt =
                        courtFilter ===
                        "all" ||
                        block.court_id ===
                        courtFilter;

                    return (
                        matchesDate &&
                        matchesCourt
                    );
                }
            );
        }, [
            blocks,
            dateFilter,
            courtFilter,
        ]);

    const getCourtName = (
        courtId: string
    ) => {
        return (
            courts.find(
                (court) =>
                    court.id ===
                    courtId
            )?.name ?? "Campo"
        );
    };

    const deleteBooking =
        async (
            bookingId: string
        ) => {
            const confirmed =
                window.confirm(
                    "Vuoi eliminare questa prenotazione?"
                );

            if (!confirmed) {
                return;
            }

            const {
                error:
                deleteError,
            } =
                await supabase
                    .from(
                        "bookings"
                    )
                    .delete()
                    .eq(
                        "id",
                        bookingId
                    );

            if (
                deleteError
            ) {
                console.error(
                    deleteError
                );

                setError(
                    "Errore durante l'eliminazione della prenotazione."
                );

                return;
            }

            setBookings(
                (
                    current
                ) =>
                    current.filter(
                        (booking) =>
                            booking.id !==
                            bookingId
                    )
            );
        };

    const deleteBlock =
        async (
            blockId: string
        ) => {
            const confirmed =
                window.confirm(
                    "Vuoi riaprire questa fascia oraria?"
                );

            if (!confirmed) {
                return;
            }

            const {
                error:
                deleteError,
            } =
                await supabase
                    .from(
                        "court_blocks"
                    )
                    .delete()
                    .eq(
                        "id",
                        blockId
                    );

            if (
                deleteError
            ) {
                console.error(
                    deleteError
                );

                setError(
                    "Errore durante la riapertura del campo."
                );

                return;
            }

            setBlocks(
                (
                    current
                ) =>
                    current.filter(
                        (block) =>
                            block.id !==
                            blockId
                    )
            );
        };

    if (loading) {
        return (
            <main className="owner-loading">
                CARICAMENTO PRENOTAZIONI...
            </main>
        );
    }

    return (
        <main className="owner-bookings-page">
            <div className="container owner-bookings-container">

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
                        CONSULTA /
                        PRENOTAZIONI
                    </span>
                </div>

                <div className="owner-bookings-heading">
                    <div>
                        <span>
                            CAMPI SPORTIVI
                        </span>

                        <h1>
                            PRENOTA
                            <br />
                            ZIONI.
                        </h1>

                        <p>
                            Gestisci prenotazioni
                            e fasce non disponibili
                            dei campi sportivi.
                        </p>
                    </div>

                    <Link
                        to="/owner/prenotazioni/blocca"
                        className="owner-block-court"
                    >
                        <Ban
                            size={28}
                        />

                        <strong>
                            BLOCCA
                            <br />
                            CAMPO
                        </strong>
                    </Link>
                </div>

                <div className="owner-bookings-toolbar">
                    <div className="owner-booking-filter">
                        <CalendarDays
                            size={18}
                        />

                        <input
                            type="date"
                            value={
                                dateFilter
                            }
                            onChange={(e) =>
                                setDateFilter(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="owner-booking-filter">
                        <Filter
                            size={18}
                        />

                        <select
                            value={
                                courtFilter
                            }
                            onChange={(e) =>
                                setCourtFilter(
                                    e.target.value
                                )
                            }
                        >
                            <option value="all">
                                Tutti i campi
                            </option>

                            {courts.map(
                                (court) => (
                                    <option
                                        key={
                                            court.id
                                        }
                                        value={
                                            court.id
                                        }
                                    >
                                        {
                                            court.name
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="owner-event-form-error">
                        {error}
                    </div>
                )}

                <section className="owner-booking-list-section">

                    <div className="owner-photo-section-title">
                        <span>
                            01
                        </span>

                        <div>
                            <small>
                                RISULTATI
                            </small>

                            <h2>
                                PRENOTAZIONI.
                            </h2>
                        </div>
                    </div>

                    {filteredBookings.length ===
                        0 ? (
                        <div className="owner-bookings-empty">
                            <CalendarDays
                                size={42}
                            />

                            <strong>
                                NESSUNA
                                PRENOTAZIONE.
                            </strong>

                            <span>
                                Nessuna prenotazione
                                per i filtri selezionati.
                            </span>
                        </div>
                    ) : (
                        <div className="owner-bookings-list">
                            {filteredBookings.map(
                                (
                                    booking
                                ) => (
                                    <article
                                        key={
                                            booking.id
                                        }
                                        className="owner-booking-row"
                                    >
                                        <div className="owner-booking-date">
                                            <small>
                                                {
                                                    formatDate(
                                                        booking.booking_date
                                                    )
                                                }
                                            </small>

                                            <strong>
                                                {booking.start_time.slice(
                                                    0,
                                                    5
                                                )}
                                            </strong>

                                            <span>
                                                →
                                            </span>

                                            <strong>
                                                {booking.end_time.slice(
                                                    0,
                                                    5
                                                )}
                                            </strong>
                                        </div>

                                        <div className="owner-booking-main">
                                            <div className="owner-booking-badges">
                                                <span>
                                                    {
                                                        getCourtName(
                                                            booking.court_id
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        booking.status
                                                    }
                                                </span>
                                            </div>

                                            <h3>
                                                {
                                                    booking.customer_name
                                                }{" "}
                                                {
                                                    booking.customer_surname
                                                }
                                            </h3>

                                            <div className="owner-booking-details">
                                                <span>
                                                    <Phone
                                                        size={
                                                            15
                                                        }
                                                    />

                                                    {
                                                        booking.phone
                                                    }
                                                </span>

                                                {booking.email && (
                                                    <span>
                                                        <UserRound
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        {
                                                            booking.email
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="owner-booking-time">
                                            <Clock
                                                size={22}
                                            />

                                            <span>
                                                ORARIO
                                            </span>

                                            <strong>
                                                {booking.start_time.slice(
                                                    0,
                                                    5
                                                )}
                                                {" — "}
                                                {booking.end_time.slice(
                                                    0,
                                                    5
                                                )}
                                            </strong>
                                        </div>

                                        <button
                                            type="button"
                                            className="owner-booking-delete"
                                            title="Elimina prenotazione"
                                            onClick={() =>
                                                deleteBooking(
                                                    booking.id
                                                )
                                            }
                                        >
                                            <Trash2
                                                size={21}
                                            />
                                        </button>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </section>

                <section className="owner-booking-list-section owner-blocks-section">

                    <div className="owner-photo-section-title">
                        <span>
                            02
                        </span>

                        <div>
                            <small>
                                CAMPO NON DISPONIBILE
                            </small>

                            <h2>
                                FASCE BLOCCATE.
                            </h2>
                        </div>
                    </div>

                    {filteredBlocks.length ===
                        0 ? (
                        <div className="owner-bookings-empty owner-blocks-empty">
                            <LockOpen
                                size={42}
                            />

                            <strong>
                                NESSUN BLOCCO.
                            </strong>

                            <span>
                                Il campo è disponibile
                                secondo gli orari normali.
                            </span>
                        </div>
                    ) : (
                        <div className="owner-blocks-list">
                            {filteredBlocks.map(
                                (
                                    block
                                ) => (
                                    <article
                                        key={
                                            block.id
                                        }
                                        className="owner-block-row"
                                    >
                                        <div className="owner-block-row-date">
                                            <small>
                                                {
                                                    formatDate(
                                                        block.block_date
                                                    )
                                                }
                                            </small>

                                            <strong>
                                                {block.start_time.slice(
                                                    0,
                                                    5
                                                )}
                                            </strong>

                                            <span>
                                                →
                                            </span>

                                            <strong>
                                                {block.end_time.slice(
                                                    0,
                                                    5
                                                )}
                                            </strong>
                                        </div>

                                        <div className="owner-block-row-main">
                                            <div className="owner-block-row-badges">
                                                <span>
                                                    {
                                                        getCourtName(
                                                            block.court_id
                                                        )
                                                    }
                                                </span>

                                                <span>
                                                    BLOCCATO
                                                </span>
                                            </div>

                                            <h3>
                                                {block.reason ||
                                                    "CAMPO NON DISPONIBILE"}
                                            </h3>

                                            <p>
                                                Questa fascia
                                                non può essere
                                                prenotata dal sito.
                                            </p>
                                        </div>

                                        <div className="owner-block-row-time">
                                            <Ban
                                                size={22}
                                            />

                                            <span>
                                                BLOCCO
                                            </span>

                                            <strong>
                                                {block.start_time.slice(
                                                    0,
                                                    5
                                                )}
                                                {" — "}
                                                {block.end_time.slice(
                                                    0,
                                                    5
                                                )}
                                            </strong>
                                        </div>

                                        <button
                                            type="button"
                                            className="owner-block-delete"
                                            title="Riapri fascia"
                                            onClick={() =>
                                                deleteBlock(
                                                    block.id
                                                )
                                            }
                                        >
                                            <LockOpen
                                                size={21}
                                            />
                                        </button>
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}

export default OwnerBookingsPage;