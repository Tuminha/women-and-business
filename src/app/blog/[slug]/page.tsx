import Link from 'next/link';
import { getPostBySlug } from '@/lib/blog-service';
import { notFound } from 'next/navigation';
import Comments from '@/components/blog/Comments';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return {
        title: 'Post No Encontrado - Woman & Business',
        description: 'El articulo solicitado no fue encontrado.'
      };
    }

    return {
      title: `${post.title} - Woman & Business`,
      description: post.excerpt || post.content?.substring(0, 160)
    };
  } catch (error) {
    console.error('Error generating metadata for blog post:', error);
    return {
      title: 'Blog - Woman & Business',
      description: 'Articulos para mujeres emprendedoras'
    };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    // Format date
    const publishDate = post.published_at || post.date || post.created_at;
    const formattedDate = publishDate
      ? new Date(publishDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : null;

    return (
      <main className="flex min-h-screen flex-col items-center p-6">
        <article className="max-w-3xl mx-auto w-full">
          <Link
            href="/blog"
            className="text-purple-600 hover:underline mb-6 inline-block"
          >
            ← Volver a articulos
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-purple-800">{post.title}</h1>

            {formattedDate && (
              <p className="text-gray-600">Publicado el {formattedDate}</p>
            )}
          </header>

          {post.featured_image && (
            <div className="mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:text-purple-800 prose-a:text-purple-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="text-purple-600 hover:underline"
            >
              ← Volver a articulos
            </Link>
          </div>

          {/* Comments Section */}
          <Comments postId={post.id} />
        </article>
      </main>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);

    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Error al Cargar</h1>
          <p className="text-gray-600 mb-6">Lo sentimos, hubo un problema al cargar este articulo. Por favor intenta de nuevo.</p>
          <Link
            href="/blog"
            className="text-purple-600 hover:underline"
          >
            ← Volver a articulos
          </Link>
        </div>
      </main>
    );
  }
}
