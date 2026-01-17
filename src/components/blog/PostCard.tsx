import Link from 'next/link'
import { formatDate, getExcerpt, type Post } from '@/lib/blog-service'

interface PostCardProps {
  post: Post
  featured?: boolean
}

// Extract a potential image URL from post content
function extractImageUrl(content: string): string | null {
  // Try to find an image URL in the content
  const imgMatch = content.match(/src=["']([^"']+\.(?:jpg|jpeg|png|gif|webp))[^"']*["']/i)
  if (imgMatch) {
    let url = imgMatch[1]
    // Convert WordPress URLs to local paths
    if (url.includes('wp-content/uploads')) {
      const uploadsMatch = url.match(/wp-content\/uploads\/(.+)/)
      if (uploadsMatch) {
        return `/uploads/${uploadsMatch[1]}`
      }
    }
    return url
  }
  return null
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const excerpt = post.excerpt || getExcerpt(post.content, 150)
  const formattedDate = formatDate(post.date)
  const imageUrl = extractImageUrl(post.content)

  // Clean the title from any HTML tags like <br>
  const cleanTitle = post.title.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  if (featured) {
    return (
      <article className="featured-card">
        {/* Featured Image */}
        <div 
          className="featured-image"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        />
        
        {/* Content */}
        <div className="featured-content">
          <span className="featured-badge">Artículo Destacado</span>
          
          <h2 className="featured-title">
            <Link href={`/blog/${post.slug}`}>
              {cleanTitle}
            </Link>
          </h2>
          
          <div className="featured-meta">
            <span>{formattedDate}</span>
            {post.comment_count > 0 && (
              <>
                <span>•</span>
                <span>{post.comment_count} comentario{post.comment_count !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
          
          {excerpt && (
            <p className="featured-excerpt">{excerpt}</p>
          )}
          
          <Link href={`/blog/${post.slug}`} className="btn btn-primary">
            Leer artículo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article className="post-card">
      {/* Post Image */}
      <div 
        className="post-card-image"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />
      
      {/* Content */}
      <div className="post-card-content">
        <div className="post-card-meta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{formattedDate}</span>
        </div>
        
        <h3 className="post-card-title">
          <Link href={`/blog/${post.slug}`}>
            {cleanTitle}
          </Link>
        </h3>
        
        {excerpt && (
          <p className="post-card-excerpt">{excerpt}</p>
        )}
        
        <Link href={`/blog/${post.slug}`} className="read-more">
          Leer más
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </article>
  )
}
