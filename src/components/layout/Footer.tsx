import Link from 'next/link'
import { Instagram, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  navigation: [
    { href: '/', label: 'Inicio' },
    { href: '/blog', label: 'Blog' },
    { href: '/sobre-mi', label: 'Sobre Mí' },
    { href: '/contacto', label: 'Contacto' },
  ],
  categories: [
    { href: '/blog/category/liderazgo', label: 'Liderazgo' },
    { href: '/blog/category/maternidad', label: 'Maternidad' },
    { href: '/blog/category/belleza', label: 'Belleza' },
    { href: '/blog/category/management', label: 'Management' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div>
            <div className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Woman <span className="text-rose-400">&</span> Business
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Un espacio dedicado a todas las mujeres que buscan equilibrar su vida profesional
              con su vida personal. Consejos de management, liderazgo, belleza y maternidad.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/mcudeiro/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/mariacudeiro/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:cudeiromaria@gmail.com"
                className="w-10 h-10 bg-gray-800 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Navegación</h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Categorías</h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Woman & Business. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-sm">
            Hecho con <span className="text-rose-500">♥</span> para mujeres emprendedoras
          </p>
        </div>
      </div>
    </footer>
  )
}
