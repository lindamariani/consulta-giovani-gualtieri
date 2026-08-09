import {
    ArrowDownRight,
    ArrowRight,
    CalendarDays,
    Lightbulb,
    Sparkles,
    Trophy,
    Volleyball,
} from "lucide-react";

import { Link } from "react-router-dom";

import HomeEvents from "../components/HomeEvents";

function HomePage() {
    return (
        <main>
            {/* =========================================================
          HERO
      ========================================================= */}

            <section className="hero">
                <div className="hero-grid-decoration" />

                <div className="container hero-container">
                    <div className="hero-main">
                        <div className="hero-kicker">
                            <span className="hero-kicker-dot" />
                            Gualtieri · RE
                        </div>

                        <h1 className="hero-title">
                            Qui
                            <br />
                            <span className="hero-title-green">succede</span>
                            <br />
                            qualcosa.
                        </h1>

                        <div className="hero-copy-row">
                            <p>
                                Eventi, sport, aperitivi, iniziative e idee per vivere Gualtieri
                                insieme.
                            </p>

                            <ArrowDownRight size={42} strokeWidth={1.6} />
                        </div>

                        <div className="hero-actions">
                            <a href="#eventi" className="button button-blue">
                                Scopri gli eventi
                                <ArrowRight size={18} />
                            </a>

                            <a href="#prenota" className="button button-outline">
                                Prenota un campo
                            </a>
                        </div>
                    </div>

                    <div className="hero-collage">
                        <div className="hero-photo-block hero-photo-large">
                            <div className="image-placeholder image-placeholder-photo">
                                <span>Foto Consulta</span>
                            </div>

                            <div className="hero-photo-label">
                                
                                <strong>NOI</strong>
                            </div>
                        </div>

                        <div className="hero-mini-card hero-mini-pink">
                            <span>EVENTI</span>
                            <strong>15—30</strong>
                            <small>anni, più o meno :)</small>
                        </div>

                        <div className="hero-mini-card hero-mini-yellow">
                            <Sparkles size={25} />
                            <strong>GUALTIERI</strong>
                            <span>per i giovani.</span>
                        </div>

                        <div className="hero-star">
                            
                        </div>
                    </div>
                </div>

                <div className="hero-marquee">
                    <div className="hero-marquee-track">

                        <div className="hero-marquee-group">
                            <span>APERITIVI</span>
                            <i>✦</i>
                            <span>TORNEI</span>
                            <i>✦</i>
                            <span>MUSICA</span>
                            <i>✦</i>
                            <span>SPORT</span>
                            <i>✦</i>
                            <span>GUALTIERI</span>
                            <i>✦</i>
                            <span>APERITIVI</span>
                            <i>✦</i>
                            <span>TORNEI</span>
                            <i>✦</i>
                        </div>

                        <div
                            className="hero-marquee-group"
                            aria-hidden="true"
                        >
                            <span>APERITIVI</span>
                            <i>✦</i>
                            <span>TORNEI</span>
                            <i>✦</i>
                            <span>MUSICA</span>
                            <i>✦</i>
                            <span>SPORT</span>
                            <i>✦</i>
                            <span>GUALTIERI</span>
                            <i>✦</i>
                            <span>APERITIVI</span>
                            <i>✦</i>
                            <span>TORNEI</span>
                            <i>✦</i>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================
          EVENTS
      ========================================================= */}

            <HomeEvents />

            {/* =========================================================
          CONSULTA
      ========================================================= */}

            <section className="section consulta-section" id="consulta">
                <div className="container consulta-layout">
                    <div className="consulta-intro">
                        <span className="section-index">02</span>
                        <span className="eyebrow">Ma quindi...</span>

                        <h2>
                            Cos'è questa
                            <br />
                            <span>Consulta Giovani?</span>
                        </h2>

                        <p className="consulta-main-text">
                            Un gruppo di giovani di Gualtieri che organizza eventi, attività,
                            tornei e occasioni per stare insieme.
                        </p>

                        <p className="consulta-secondary-text">
                            Collaboriamo anche alla realizzazione di alcune iniziative
                            storiche del paese e proviamo a creare qualcosa che possa
                            interessare davvero ai ragazzi del territorio.
                        </p>

                        <Link to="/consulta" className="section-link consulta-link">
                            Scopri chi siamo
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                    <div className="consulta-board">
                        <div className="board-cell board-photo">
                            <div className="image-placeholder">
                                <span>Foto di gruppo</span>
                            </div>
                        </div>

                        <div className="board-cell board-blue">
                            <CalendarDays size={31} />

                            <strong>EVENTI</strong>

                            <span>Aperitivi, serate e attività.</span>
                        </div>

                        <div className="board-cell board-pink">
                            <Trophy size={31} />

                            <strong>TORNEI</strong>

                            <span>Sport, sfide e premi.</span>
                        </div>

                        <div className="board-cell board-yellow">
                            <Lightbulb size={31} />

                            <strong>IDEE</strong>

                            <span>Nuove proposte per il paese.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          BOOKING
      ========================================================= */}

            <section className="booking-section" id="prenota">
                <div className="booking-ticker">
                    <div className="booking-ticker-track">

                        <div className="booking-ticker-group">
                            <span>GIOCA</span>
                            <i>✦</i>

                            <span>PRENOTA</span>
                            <i>✦</i>

                            <span>GIOCA</span>
                            <i>✦</i>

                            <span>PRENOTA</span>
                            <i>✦</i>

                            <span>GIOCA</span>
                            <i>✦</i>

                            <span>PRENOTA</span>
                            <i>✦</i>
                        </div>

                        <div
                            className="booking-ticker-group"
                            aria-hidden="true"
                        >
                            <span>GIOCA</span>
                            <i>✦</i>

                            <span>PRENOTA</span>
                            <i>✦</i>

                            <span>GIOCA</span>
                            <i>✦</i>

                            <span>PRENOTA</span>
                            <i>✦</i>

                            <span>GIOCA</span>
                            <i>✦</i>

                            <span>PRENOTA</span>
                            <i>✦</i>
                        </div>

                    </div>
                </div>

                <div className="container booking-container">
                    <div className="booking-title">
                        <span className="section-index">03</span>
                        <span className="eyebrow">Campi sportivi</span>

                        <h2>
                            Hai voglia
                            <br />
                            di giocare?
                        </h2>

                        <p>
                            Controlla gli orari disponibili e prenota direttamente online.
                            Niente form inguardabili.
                        </p>
                    </div>

                    <div className="sport-grid">
                        <article className="sport-poster sport-beach">
                            <div className="sport-poster-top">
                                <span>01</span>

                                <Volleyball size={31} />
                            </div>

                            <div>
                                <span className="sport-kicker">CAMPO</span>

                                <h3>
                                    BEACH
                                    <br />
                                    VOLLEY
                                </h3>
                            </div>

                            <Link
                                to="/prenota?campo=beach-volley"
                                className="sport-button"
                            >
                                Vedi disponibilità
                                <ArrowRight size={20} />
                            </Link>
                        </article>

                        <article className="sport-poster sport-tennis">
                            <div className="sport-poster-top">
                                <span>02</span>

                                <div className="tennis-ball-icon">●</div>
                            </div>

                            <div>
                                <span className="sport-kicker">CAMPO</span>

                                <h3>TENNIS</h3>
                            </div>

                            <Link
                                to="/prenota?campo=tennis"
                                className="sport-button"
                            >
                                Vedi disponibilità
                                <ArrowRight size={20} />
                            </Link>
                        </article>
                    </div>
                </div>
            </section>

            {/* =========================================================
          GALLERY
      ========================================================= */}

            <section className="section gallery-section" id="gallery">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <span className="section-index">04</span>
                            <span className="eyebrow">Camera roll</span>

                            <h2>
                                C'eravamo
                                <br />
                                <span>anche noi.</span>
                            </h2>
                        </div>

                        <Link to="/eventi#passati" className="section-link">
                            Tutti gli eventi passati
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                    <div className="gallery-collage">
                        <article className="gallery-card gallery-card-one">
                            <div className="image-placeholder">
                                <span>Foto Aperitivo</span>
                            </div>

                            <div className="gallery-caption">
                                <span>2026</span>

                                <strong>Aperitivo in Piazza</strong>
                            </div>
                        </article>

                        <article className="gallery-card gallery-card-two">
                            <div className="image-placeholder">
                                <span>Foto torneo</span>
                            </div>

                            <div className="gallery-caption">
                                <span>2026</span>

                                <strong>Kiss My Ace</strong>
                            </div>
                        </article>

                        <article className="gallery-card gallery-card-three">
                            <div className="image-placeholder">
                                <span>Foto Consulta</span>
                            </div>

                            <div className="gallery-caption">
                                <span>2026</span>

                                <strong>Dietro le quinte</strong>
                            </div>
                        </article>

                        <div className="gallery-message">
                            <span>NON SOLO</span>
                            <strong>LOCANDINE.</strong>

                            <p>
                                Qui raccogliamo foto, ricordi e momenti degli eventi che abbiamo
                                organizzato.
                            </p>

                            <ArrowDownRight size={40} />
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================
          IDEAS
      ========================================================= */}

            <section className="ideas-section" id="idee">
                <div className="ideas-background-word">IDEA?</div>

                <div className="container ideas-container">
                    <div className="ideas-top">
                        <span>05</span>
                        <span>Dicci la tua</span>
                    </div>

                    <h2>
                        Cosa ti piacerebbe
                        <br />
                        vedere a
                        <br />
                        <span>Gualtieri?</span>
                    </h2>

                    <div className="ideas-bottom">
                        <div className="ideas-description">
                            <p>
                                Un evento? Un torneo? Una serata? Qualcosa che secondo te manca?
                            </p>

                            <p>
                                Mandaci la tua proposta. Puoi farlo anche completamente in forma
                                anonima.
                            </p>
                        </div>

                        <Link to="/idee" className="ideas-button">
                            <span>PROPONI</span>
                            <span>UN'IDEA</span>
                            <ArrowDownRight size={31} />
                        </Link>
                    </div>

                    <div className="ideas-anonymous">
                        Nessun nome richiesto · Nessun account · Puoi restare anonimo
                    </div>
                </div>
            </section>

            {/* =========================================================
          SOCIAL
      ========================================================= */}

            <section className="social-section">
                <div className="container social-container">
                    <div>
                        <span className="eyebrow">Dove ci trovi</span>

                        <h2>
                            Seguici su
                            <br />
                            Instagram.
                        </h2>

                        <p>
                            Eventi, locandine, foto, video e tutte le cose che probabilmente
                            scoprirai prima lì che altrove.
                        </p>
                    </div>

                    <a href="https://www.instagram.com/consultagiovanigualtieri?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="social-handle">
                        <span>@consultagiovanigualtieri</span>

                        <strong>
                            resta
                            <br />
                            sempre
                            <br />
                            aggiornato
                        </strong>

                        <ArrowDownRight size={42} />
                    </a>
                </div>
            </section>

            {/* =========================================================
          FOOTER
      ========================================================= */}

            <footer className="footer">
                <div className="container footer-container">
                    <div className="footer-title">
                        CONSULTA
                        <br />
                        GIOVANI
                        <br />
                        GUALTIERI
                    </div>

                    <nav className="footer-nav">
                        <a href="#eventi">Eventi</a>
                        <a href="#consulta">La Consulta</a>
                        <a href="#prenota">Prenota</a>
                        <a href="#gallery">Gallery</a>
                        <a href="#idee">Dicci la tua</a>
                    </nav>

                    <div className="footer-bottom">
                        <span>Gualtieri · Reggio Emilia</span>
                        <span>© 2026 Consulta Giovani Gualtieri</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}

export default HomePage;