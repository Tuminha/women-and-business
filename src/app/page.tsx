import { getPostsByPage } from '@/lib/blog-service'
import Link from 'next/link'

export default async function HomePage() {
  const { posts, totalPages, total } = await getPostsByPage(1, 10)
  const [featuredPost, ...restPosts] = posts

  // Default placeholder for posts without images
  const placeholderImage = '/images/placeholder-article.svg'

  // Extract image from post content or featured_image
  function extractImageUrl(post: any): string {
    // First check if post has a featured_image
    if (post.featured_image) {
      const img = post.featured_image
      if (img.includes('wp-content/uploads')) {
        const uploadsMatch = img.match(/wp-content\/uploads\/(.+)/)
        if (uploadsMatch) {
          return `/uploads/${uploadsMatch[1]}`
        }
      }
      if (img.startsWith('/') || img.startsWith('http')) {
        return img
      }
      return `/uploads/${img}`
    }

    // Try to extract from content
    const content = post.content || ''
    const imgMatch = content.match(/src=["']([^"']+\.(?:jpg|jpeg|png|gif|webp))[^"']*["']/i)
    if (imgMatch) {
      let url = imgMatch[1]
      if (url.includes('wp-content/uploads')) {
        const uploadsMatch = url.match(/wp-content\/uploads\/(.+)/)
        if (uploadsMatch) {
          return `/uploads/${uploadsMatch[1]}`
        }
      }
      return url
    }

    // Return placeholder
    return placeholderImage
  }

  function getExcerpt(content: string, maxLength: number = 150): string {
    const text = content
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    } catch {
      return ''
    }
  }

  function getPostDate(post: any): string | undefined {
    return post.published_at || post.date || post.created_at
  }

  const cleanTitle = (title: string) => title.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#292524' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffffff 50%, #fffbeb 100%)',
        padding: '4rem 0 5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #fecdd3',
              borderRadius: '50px',
              fontSize: '0.875rem',
              color: '#44403c',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              ✨ Blog para mujeres emprendedoras
            </div>
            
            {/* Title */}
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 700,
              color: '#1c1917',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              Woman <span style={{ color: '#e11d48' }}>&</span> Business
            </h1>
            
            {/* Subtitle */}
            <p style={{
              fontSize: '1.25rem',
              color: '#57534e',
              maxWidth: '600px',
              margin: '0 auto 2rem',
              lineHeight: 1.8
            }}>
              Management, liderazgo y belleza para mujeres que quieren 
              <strong style={{ color: '#e11d48' }}> conquistar el mundo</strong> sin renunciar a nada.
            </p>
            
            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginTop: '3rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  color: '#e11d48',
                  fontSize: '1.25rem'
                }}>📚</div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1c1917'
                }}>{total}+</div>
                <div style={{ fontSize: '0.875rem', color: '#78716c' }}>Artículos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  color: '#e11d48',
                  fontSize: '1.25rem'
                }}>❤️</div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1c1917'
                }}>100%</div>
                <div style={{ fontSize: '0.875rem', color: '#78716c' }}>Pasión</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  color: '#e11d48',
                  fontSize: '1.25rem'
                }}>🏆</div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#1c1917'
                }}>5+</div>
                <div style={{ fontSize: '0.875rem', color: '#78716c' }}>Años de experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section style={{ padding: '4rem 0', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #fff1f2 0%, #fef3c7 100%)',
              borderRadius: '24px',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              {/* Image */}
              <div style={{
                aspectRatio: '4/3',
                background: `url(${extractImageUrl(featuredPost)}) center/cover`,
                minHeight: '280px'
              }} />
              
              {/* Content */}
              <div style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-flex',
                  padding: '0.375rem 0.875rem',
                  background: '#e11d48',
                  color: 'white',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                  width: 'fit-content'
                }}>
                  Artículo Destacado
                </span>
                
                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  color: '#1c1917',
                  marginBottom: '1rem',
                  lineHeight: 1.3
                }}>
                  <Link href={`/blog/${featuredPost.slug}`} style={{ color: '#1c1917', textDecoration: 'none' }}>
                    {cleanTitle(featuredPost.title)}
                  </Link>
                </h2>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  color: '#78716c',
                  marginBottom: '1rem'
                }}>
                  <span>{formatDate(getPostDate(featuredPost))}</span>
                </div>
                
                <p style={{
                  color: '#57534e',
                  lineHeight: 1.8,
                  marginBottom: '1.5rem'
                }}>
                  {getExcerpt(featuredPost.content, 200)}
                </p>
                
                <Link 
                  href={`/blog/${featuredPost.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: '50px',
                    background: '#1c1917',
                    color: 'white',
                    textDecoration: 'none',
                    width: 'fit-content'
                  }}
                >
                  Leer artículo →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section style={{ padding: '4rem 0', background: '#fafaf9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 700,
                color: '#1c1917',
                marginBottom: '0.5rem'
              }}>
                Últimos Artículos
              </h2>
              <p style={{ color: '#78716c' }}>Descubre nuestras publicaciones más recientes</p>
            </div>
            {totalPages > 1 && (
              <Link 
                href="/blog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  color: '#e11d48',
                  textDecoration: 'none'
                }}
              >
                Ver todos los artículos →
              </Link>
            )}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {restPosts.slice(0, 6).map((post) => (
              <article 
                key={post.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Image */}
                <div style={{
                  aspectRatio: '16/10',
                  background: `url(${extractImageUrl(post)}) center/cover`
                }} />
                
                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#a8a29e',
                    marginBottom: '0.75rem'
                  }}>
                    📅 {formatDate(getPostDate(post))}
                  </div>
                  
                  <h3 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: '#1c1917',
                    marginBottom: '0.75rem',
                    lineHeight: 1.4
                  }}>
                    <Link href={`/blog/${post.slug}`} style={{ color: '#1c1917', textDecoration: 'none' }}>
                      {cleanTitle(post.title)}
                    </Link>
                  </h3>
                  
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#78716c',
                    lineHeight: 1.7,
                    marginBottom: '1rem'
                  }}>
                    {getExcerpt(post.content)}
                  </p>
                  
                  <Link 
                    href={`/blog/${post.slug}`}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#e11d48',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    Leer más →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* View All Button */}
          {totalPages > 1 && (
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <Link 
                href="/blog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '50px',
                  background: '#1c1917',
                  color: 'white',
                  textDecoration: 'none'
                }}
              >
                Explorar todos los artículos →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{
        padding: '5rem 0',
        background: '#1c1917',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.5rem'
            }}>
              💌
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1rem'
            }}>
              Únete a nuestra comunidad
            </h2>
            <p style={{
              color: '#a8a29e',
              marginBottom: '2rem',
              fontSize: '1.1rem'
            }}>
              Recibe consejos exclusivos de management, liderazgo y bienestar directamente en tu email.
            </p>
            <form style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <input
                type="email"
                placeholder="Tu email"
                style={{
                  padding: '1rem 1.5rem',
                  border: '1px solid #44403c',
                  borderRadius: '50px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '1rem'
                }}
                required
              />
              <button 
                type="submit"
                style={{
                  padding: '1rem 2rem',
                  background: '#f43f5e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Suscribirme
              </button>
            </form>
            <p style={{
              fontSize: '0.8rem',
              color: '#78716c',
              marginTop: '1rem'
            }}>
              Sin spam. Puedes darte de baja cuando quieras.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
