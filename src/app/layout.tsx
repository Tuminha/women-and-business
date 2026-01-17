import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { AuthProvider } from "@/lib/auth-context"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Woman & Business – Blog sobre management y belleza para mujeres",
    template: "%s | Woman & Business",
  },
  description: "Blog sobre management y belleza para mujeres, madres y no madres. Descubre consejos de liderazgo, bienestar y desarrollo profesional.",
}

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/blog', label: 'Blog' },
  { href: '/sobre-mi', label: 'Sobre Mí' },
  { href: '/contacto', label: 'Contacto' },
]

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const currentYear = new Date().getFullYear()

  return (
    <html lang="es" className={`${playfair.variable} ${sourceSans.variable}`} style={{ colorScheme: 'light only' }}>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#ffffff',
        color: '#292524',
        fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.7,
        minHeight: '100vh'
      }}>
        <AuthProvider>
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e7e5e4'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '80px'
            }}>
              {/* Logo */}
              <Link 
                href="/" 
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1c1917',
                  textDecoration: 'none'
                }}
              >
                Woman <span style={{ color: '#e11d48' }}>&</span> Business
              </Link>
              
              {/* Navigation */}
              <nav style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem'
              }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: '#57534e',
                      textDecoration: 'none'
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer style={{
          background: '#1c1917',
          color: '#a8a29e',
          padding: '4rem 0 2rem'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem'
          }}>
            {/* Footer Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '3rem',
              marginBottom: '3rem'
            }}>
              {/* Brand */}
              <div style={{ maxWidth: '300px' }}>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: '1rem'
                }}>
                  Woman <span style={{ color: '#fb7185' }}>&</span> Business
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem'
                }}>
                  Un espacio dedicado a todas las mujeres que buscan equilibrar su vida profesional 
                  con su vida personal. Consejos de management, liderazgo, belleza y maternidad.
                </p>
                {/* Social Links */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: '#292524',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a8a29e',
                      textDecoration: 'none'
                    }}
                  >
                    📷
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: '#292524',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a8a29e',
                      textDecoration: 'none'
                    }}
                  >
                    💼
                  </a>
                  <a 
                    href="mailto:contacto@womanandbusiness.com"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: '#292524',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a8a29e',
                      textDecoration: 'none'
                    }}
                  >
                    ✉️
                  </a>
                </div>
              </div>
              
              {/* Navigation */}
              <div>
                <h4 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Navegación
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {footerLinks.navigation.map((link) => (
                    <li key={link.href} style={{ marginBottom: '0.75rem' }}>
                      <Link 
                        href={link.href}
                        style={{
                          color: '#a8a29e',
                          fontSize: '0.9rem',
                          textDecoration: 'none'
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h4 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Categorías
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {footerLinks.categories.map((link) => (
                    <li key={link.href} style={{ marginBottom: '0.75rem' }}>
                      <Link 
                        href={link.href}
                        style={{
                          color: '#a8a29e',
                          fontSize: '0.9rem',
                          textDecoration: 'none'
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid #292524',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '1rem',
              fontSize: '0.875rem'
            }}>
              <p>© {currentYear} Woman & Business. Todos los derechos reservados.</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Hecho con <span style={{ color: '#f43f5e' }}>♥</span> para mujeres emprendedoras
              </p>
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
