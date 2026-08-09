import {
    CalendarDays,
    CalendarPlus,
    Image,
    Lightbulb,
    LogOut,
    Settings,
    Users,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

function OwnerPage() {
    const navigate = useNavigate();

    const [name, setName] =
        useState("Consulta");

    const [loading, setLoading] =
        useState(true);

    const [futureEvents, setFutureEvents] =
        useState(0);

    const [bookings, setBookings] =
        useState(0);

    const [newIdeas, setNewIdeas] =
        useState(0);

    useEffect(() => {
        const loadDashboard =
            async () => {
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
                } = await supabase
                    .from("profiles")
                    .select(
                        "full_name, role"
                    )
                    .eq("id", user.id)
                    .single();

                if (
                    !profile ||
                    profile.role !== "owner"
                ) {
                    await supabase.auth.signOut();

                    navigate(
                        "/owner/login"
                    );

                    return;
                }

                if (
                    profile.full_name
                ) {
                    setName(
                        profile.full_name
                    );
                }

                const today = new Date()
                    .toISOString()
                    .split("T")[0];

                const {
                    count:
                    futureEventCount,
                } = await supabase
                    .from("events")
                    .select("*", {
                        count: "exact",
                        head: true,
                    })
                    .gte(
                        "event_date",
                        today
                    );

                const {
                    count:
                    bookingCount,
                } = await supabase
                    .from("bookings")
                    .select("*", {
                        count: "exact",
                        head: true,
                    })
                    .eq(
                        "status",
                        "confirmed"
                    )
                    .gte(
                        "booking_date",
                        today
                    );

                const {
                    count: ideaCount,
                } = await supabase
                    .from("ideas")
                    .select("*", {
                        count: "exact",
                        head: true,
                    })
                    .eq(
                        "status",
                        "new"
                    );

                setFutureEvents(
                    futureEventCount ?? 0
                );

                setBookings(
                    bookingCount ?? 0
                );

                setNewIdeas(
                    ideaCount ?? 0
                );

                setLoading(false);
            };

        loadDashboard();
    }, [navigate]);

    const handleLogout =
        async () => {
            await supabase.auth.signOut();

            navigate("/");
        };

    if (loading) {
        return (
            <main className="owner-loading">
                CARICAMENTO...
            </main>
        );
    }

    return (
        <main className="owner-page">
            <aside className="owner-sidebar">
                <div>
                    <span className="owner-sidebar-small">
                        CONSULTA GIOVANI
                    </span>

                    <strong>
                        OWNER
                    </strong>
                </div>

                <nav>
                    <button className="active">
                        <Users size={19} />

                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/owner/eventi"
                            )
                        }
                    >
                        <CalendarDays
                            size={19}
                        />

                        Eventi
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/owner/foto"
                            )
                        }
                    >
                        <Image size={19} />
                        Foto
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/owner/prenotazioni"
                            )
                        }
                    >
                        <CalendarPlus
                            size={19}
                        />

                        Prenotazioni
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/owner/idee"
                            )
                        }
                    >
                        <Lightbulb
                            size={19}
                        />

                        Idee
                    </button>

                    <button>
                        <Settings
                            size={19}
                        />

                        Impostazioni
                    </button>
                </nav>

                <button
                    className="owner-logout"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />

                    Esci
                </button>
            </aside>

            <section className="owner-dashboard">
                <div className="owner-dashboard-header">
                    <div>
                        <span>
                            AREA RISERVATA
                        </span>

                        <h1>
                            CIAO,
                            <br />
                            {name.toUpperCase()}.
                        </h1>
                    </div>

                    <div className="owner-status">
                        <i />
                        ONLINE
                    </div>
                </div>

                <div className="owner-stats-grid">
                    <article className="owner-stat owner-stat-green">
                        <span>
                            EVENTI FUTURI
                        </span>

                        <strong>
                            {futureEvents}
                        </strong>

                        <small>
                            in programma
                        </small>
                    </article>

                    <article className="owner-stat owner-stat-yellow">
                        <span>
                            PRENOTAZIONI
                        </span>

                        <strong>
                            {bookings}
                        </strong>

                        <small>
                            attive
                        </small>
                    </article>

                    <article className="owner-stat owner-stat-pink">
                        <span>
                            IDEE NUOVE
                        </span>

                        <strong>
                            {newIdeas}
                        </strong>

                        <small>
                            da leggere
                        </small>
                    </article>
                </div>

                <div className="owner-quick-section">
                    <div>
                        <span>
                            AZIONI RAPIDE
                        </span>

                        <h2>
                            CHE FACCIAMO?
                        </h2>
                    </div>

                    <div className="owner-quick-grid">
                        <button
                            onClick={() =>
                                navigate(
                                    "/owner/eventi/nuovo"
                                )
                            }
                        >
                            <CalendarPlus
                                size={29}
                            />

                            <strong>
                                NUOVO
                                <br />
                                EVENTO
                            </strong>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/owner/foto"
                                )
                            }
                        >
                            <Image size={29} />

                            <strong>
                                CARICA
                                <br />
                                FOTO
                            </strong>
                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/owner/idee"
                                )
                            }
                        >
                            <Lightbulb
                                size={29}
                            />

                            <strong>
                                LEGGI
                                <br />
                                IDEE
                            </strong>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default OwnerPage;