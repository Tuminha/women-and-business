import Link from 'next/link'

const footerLinks = {
  navigation: [
    { href: '/', label: 'Inicio' },
    { href: '/blog', label: 'Blog' },
    { href: '/sobre-mi', label: 'Sobre Mí' },
    { href: '/contacto', label: 'Contacto' },
  ],
  categories: [
    { href: '/categoria/liderazgo', label: 'Liderazgo' },
    { href: '/categoria/maternidad', label: 'Maternidad' },
    { href: '/categoria/belleza', label: 'Belleza' },
    { href: '/categoria/management', label: 'Management' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              Woman <span style={{ color: 'var(--rose-400)' }}>&</span> Business
            </div>
            <p className="footer-description">
              Un espacio dedicado a todas las mujeres que buscan equilibrar su vida profesional 
              con su vida personal. Consejos de management, liderazgo, belleza y maternidad.
            </p>
            {/* Social Links */}
            <div className="social-links">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a 
                href="mailto:contacto@womanandbusiness.com"
                className="social-link"
                aria-label="Email"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div>
            <h4 className="footer-heading">Navegación</h4>
            <ul className="footer-links">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">Categorías</h4>
            <ul className="footer-links">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Woman & Business. Todos los derechos reservados.
          </p>
          <p className="footer-made-with">
            Hecho con <span style={{ color: 'var(--rose-500)' }}>♥</span> para mujeres emprendedoras
          </p>
        </div>
      </div>
    </footer>
  )
}
