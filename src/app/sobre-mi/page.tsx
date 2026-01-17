import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, Instagram, Twitter } from 'lucide-react'

export const metadata = {
  title: 'Sobre Mí - María Cudeiro | Woman & Business',
  description: 'Conoce a María Cudeiro, General Manager de Evolus para España, Portugal y Suiza. Líder en la industria de medicina estética con más de 15 años de experiencia.',
}

export default function SobreMiPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-amber-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                  <Image
                    src="/uploads/maria-cudeiro-profile.jpg"
                    alt="María Cudeiro - General Manager Evolus"
                    width={320}
                    height={320}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-100 rounded-full -z-10" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-100 rounded-full -z-10" />
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-block px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-4">
                Sobre Mí
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                María Cudeiro
              </h1>
              <p className="text-xl text-rose-600 font-medium mb-4">
                General Manager, Evolus
              </p>
              <p className="text-gray-600 mb-6">
                España, Portugal y Suiza | Basel, Switzerland
              </p>

              {/* Social Links */}
              <div className="flex gap-4">
                <Link
                  href="https://www.linkedin.com/in/mariacudeiro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow text-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/mcudeiro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:text-pink-700"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="https://x.com/mcudeiro1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow text-gray-700 hover:text-gray-900"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Mi Historia
          </h2>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-6">
              Soy María Cudeiro Torruella, actualmente <strong>General Manager de Evolus para España, Portugal y Suiza</strong>,
              liderando desde Basel, Suiza, el lanzamiento de Nuceiva® (toxina botulínica tipo A) en el mercado español desde junio de 2024.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Mi pasión es empoderar a las mujeres en el mundo empresarial, combinando mi experiencia en liderazgo,
              estrategia de negocio y la industria de la medicina estética. A través de Woman & Business, comparto
              reflexiones, consejos y experiencias para ayudar a otras mujeres a conquistar sus metas profesionales
              sin renunciar a nada.
            </p>

            <p className="text-lg leading-relaxed">
              Creo firmemente que el éxito profesional y el bienestar personal no tienen por qué estar reñidos.
              Mi objetivo es inspirar a mujeres emprendedoras, directivas y profesionales a alcanzar su máximo
              potencial mientras mantienen el equilibrio en todas las facetas de su vida.
            </p>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Experiencia Profesional
          </h2>

          <div className="space-y-8">
            {/* Current Role */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">General Manager - Evolus</h3>
                  <p className="text-rose-600 font-medium">España, Portugal y Suiza</p>
                  <p className="text-gray-500 text-sm mb-3">Junio 2024 - Presente</p>
                  <p className="text-gray-600">
                    Liderando el lanzamiento y expansión de Nuceiva® en el mercado ibérico y suizo,
                    desarrollando estrategias de crecimiento y construyendo equipos de alto rendimiento.
                  </p>
                </div>
              </div>
            </div>

            {/* Previous Role */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                  <span className="text-xl">💼</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">General Director - CROMA-PHARMA</h3>
                  <p className="text-amber-600 font-medium">España y Portugal</p>
                  <p className="text-gray-500 text-sm mb-3">Anteriormente</p>
                  <p className="text-gray-600">
                    Dirección general de las operaciones en la península ibérica,
                    gestionando el portfolio de productos de medicina estética y dermatología.
                  </p>
                </div>
              </div>
            </div>

            {/* NAOS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">NAOS Group</h3>
                  <p className="text-purple-600 font-medium">Bioderma, Institut Esthederm, Etat Pur</p>
                  <p className="text-gray-500 text-sm mb-3">Anteriormente</p>
                  <p className="text-gray-600">
                    Desarrollo de negocio y marketing en marcas premium de cuidado de la piel,
                    construyendo estrategias de marca y expansión de mercado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Formación Académica
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-xl border border-rose-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">MBA</h3>
              <p className="text-rose-600 font-medium">ESADE Business School</p>
              <p className="text-gray-500 text-sm">2007 - 2009</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">BSc</h3>
              <p className="text-amber-600 font-medium">The London School of Economics and Political Science (LSE)</p>
              <p className="text-gray-500 text-sm">Licenciatura</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Reconocimientos
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="font-semibold text-gray-900">Forbes 100 Mujeres Poderosas</h3>
                <p className="text-gray-600 text-sm">Top 100 Mujeres Líderes en España</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
              <span className="text-2xl">🎓</span>
              <div>
                <h3 className="font-semibold text-gray-900">Board Member</h3>
                <p className="text-gray-600 text-sm">Esade Business School Club WE</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
              <span className="text-2xl">💄</span>
              <div>
                <h3 className="font-semibold text-gray-900">Finalista</h3>
                <p className="text-gray-600 text-sm">Mejor Directora Digital de Belleza</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="font-semibold text-gray-900">Women-50 LSE</h3>
                <p className="text-gray-600 text-sm">London School of Economics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Áreas de Expertise
          </h2>

          <div className="flex flex-wrap gap-3">
            {[
              'Marketing Management',
              'Business Strategy',
              'Product Launch',
              'Business Development',
              'Aesthetic Medicine Industry',
              'Team Leadership',
              'International Markets',
              'Brand Building',
              'P&L Management',
              'Go-to-Market Strategy'
            ].map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-gradient-to-r from-rose-50 to-amber-50 text-gray-700 rounded-full text-sm font-medium border border-rose-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            ¿Quieres conectar?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Me encanta conectar con otras mujeres profesionales y emprendedoras.
            Si tienes alguna pregunta o simplemente quieres charlar, no dudes en contactarme.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contacto"
              className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold transition-colors"
            >
              Enviar mensaje
            </Link>
            <Link
              href="https://www.linkedin.com/in/mariacudeiro/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-colors border border-white/20"
            >
              Conectar en LinkedIn
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
