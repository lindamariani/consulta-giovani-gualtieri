function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-title">
          CONSULTA
          <br />
          GIOVANI
          <br />
          GUALTIERI
        </div>

        <nav className="footer-nav" aria-label="Navigazione footer">
          <a href="/#eventi">Eventi</a>
          <a href="/#consulta">La Consulta</a>
          <a href="/#prenota">Prenota</a>
          <a href="/#gallery">Gallery</a>
          <a href="/#idee">Dicci la tua</a>
          <a href="mailto:consultagiovani.gualtieri@gmail.com">
            Scrivici via email
          </a>
        </nav>

        <div className="footer-bottom">
          <span>Gualtieri · Reggio Emilia</span>
          <span>
            <a href="mailto:consultagiovani.gualtieri@gmail.com">
              consultagiovani.gualtieri@gmail.com
            </a>
          </span>
          <span>© 2026 Consulta Giovani Gualtieri</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
