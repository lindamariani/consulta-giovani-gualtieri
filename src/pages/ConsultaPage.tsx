import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Handshake,
  Landmark,
  Lightbulb,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

function ConsultaPage() {
  return (
    <main className="consulta-page">
      {/* HERO */}
      <section className="consulta-page-hero">
        <div className="consulta-hero-word">NOI</div>

        <div className="container">
          <Link to="/" className="consulta-back">
            <ArrowLeft size={17} />
            Home
          </Link>

          <div className="consulta-page-heading">
            <div>
              <span className="consulta-page-kicker">
                <Users size={16} />
                CONSULTA GIOVANI GUALTIERI
              </span>

              <h1>
                CHI
                <br />
                <span>SIAMO?</span>
              </h1>
            </div>

            <div className="consulta-hero-card">
              <Sparkles size={30} />

              <p>
                Un gruppo di giovani che "a s'dà da fèr" per gli altri
                ragazzi e ragazze di Gualtieri.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="consulta-intro-section">
        <div className="container consulta-intro-layout">
          <div className="consulta-intro-number">01</div>

          <div className="consulta-intro-copy">
            <span className="eyebrow">In due parole</span>

            <h2>
              IDEE GIOVANI.
              <br />
              <span>NEL NOSTRO PAESE.</span>
            </h2>

            <p className="consulta-intro-lead">
              La Consulta Giovani di Gualtieri nasce per organizzare iniziative
              rivolte soprattutto ai ragazzi e alle ragazze del territorio.
            </p>

            <p>
              Aperitivi, tornei sportivi, eventi culturali, serate e tanti
              nuovi progetti pensati per coinvolgere e divertire.
            </p>
          </div>

          <div className="consulta-intro-photo">
            <img
              src="public/foto_gruppo.jpg"
              alt="Foto di gruppo della Consulta Giovani Gualtieri"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />

            <div className="consulta-photo-sticker">
              <span>GUALTIERI</span>
              <strong>RE</strong>
            </div>
          </div>
        </div>
      </section>

      {/* COSA FACCIAMO */}
      <section className="consulta-activities-section">
        <div className="container">
          <div className="consulta-section-title">
            <span>02</span>

            <div>
              <small>COSA FACCIAMO</small>
              <h2>UN PO' DI TUTTO.</h2>
            </div>
          </div>

          <div className="consulta-activity-grid">
            <article className="consulta-activity consulta-activity-blue">
              <CalendarDays size={34} />

              <span>01</span>

              <h3>EVENTI</h3>

              <p>
                Aperitivi, serate, feste e occasioni per stare insieme.
              </p>
            </article>

            <article className="consulta-activity consulta-activity-green">
              <Trophy size={34} />

              <span>02</span>

              <h3>EVENTI SPORTIVI</h3>

              <p>
                Sport, competizione e giornate organizzate sui campi.
              </p>
            </article>

            <article className="consulta-activity consulta-activity-yellow">
              <Landmark size={34} />

              <span>03</span>

              <h3>CULTURA</h3>

              <p>
                Eventi culturali, mostre, spettacoli e attività per scoprire e condividere la cultura del territorio.
              </p>
            </article>

            <article className="consulta-activity consulta-activity-pink">
              <Lightbulb size={34} />

              <span>04</span>

              <h3>IDEE</h3>

              <p>
                Nuove proposte, suggerimenti e iniziative per Gualtieri.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* TERRITORIO */}
      <section className="consulta-territory-section">
        <div className="container consulta-territory-layout">
          <div className="consulta-territory-title">
            <span>03</span>

            <small>IL PAESE</small>

            <h2>
              NON FACCIAMO
              <br />
              TUTTO DA SOLI.
            </h2>
          </div>

          <div className="consulta-territory-content">
            <div className="territory-big-card">
              <Handshake size={40} />

              <h3>
                SIAMO PARTE
                <br />
                DI GUALTIERI.
              </h3>

              <p>
                La Consulta partecipa anche alla realizzazione di iniziative
                storiche del paese e dà una mano durante alcuni eventi del
                territorio.
              </p>
            </div>


            <div className="territory-mini-card">
              <span>LE NOSTRE COLLABORAZIONI</span>

              <strong>
                INSIEME
                <br />
                FACCIAMO DI PIÙ.
              </strong>

              <div className="territory-collaborators">
                <div>Amici Bar Parigi</div>
                <div>Alterales</div>
                <div>Polisportiva Aironi</div>
                <div>Polisportiva Gualtierese</div>
                <div>Teatro Sociale di Gualtieri</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="consulta-process-section">
        <div className="container">
          <div className="consulta-section-title">
            <span>04</span>

            <div>
              <small>COME NASCE UN'IDEA</small>
              <h2>DA "E SE..." A REALTÀ.</h2>
            </div>
          </div>

          <div className="consulta-process">
            <div className="process-step">
              <span>01</span>

              <strong>UN'IDEA</strong>

              <p>
                Qualcuno propone qualcosa che potrebbe funzionare.
              </p>
            </div>

            <div className="process-arrow">
              <ArrowRight size={30} />
            </div>

            <div className="process-step">
              <span>02</span>

              <strong>SI DISCUTE</strong>

              <p>
                Si capisce cosa serve, come farlo e chi può dare una mano.
              </p>
            </div>

            <div className="process-arrow">
              <ArrowRight size={30} />
            </div>

            <div className="process-step">
              <span>03</span>

              <strong>SI FA.</strong>

              <p>
                L'idea diventa un evento, un torneo o un'attività vera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA IDEE */}
      <section className="consulta-cta-section">
        <div className="container consulta-cta-container">
          <div>
            <span className="eyebrow">E tu?</span>

            <h2>
              HAI QUALCOSA
              <br />
              DA PROPORRE?
            </h2>

            <p>
              Puoi mandarci un'idea anche in forma completamente anonima.
            </p>
          </div>

          <Link to="/idee" className="consulta-cta-button">
            <span>
              DICCI
              <br />
              LA TUA
            </span>

            <ArrowRight size={33} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ConsultaPage;