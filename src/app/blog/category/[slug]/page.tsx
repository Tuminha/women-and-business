import Link from 'next/link';
import { getPostsByCategory, getCategoryBySlug } from '@/lib/blog-service';
import { notFound } from 'next/navigation';

// Helper to clean HTML from titles
function cleanTitle(title: string): string {
  return title.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return {
        title: 'Category Not Found - Woman and Business',
        description: 'The requested category could not be found.'
      };
    }

    return {
      title: `${category.name} - Woman and Business Blog`,
      description: category.description || `Articles about ${category.name.toLowerCase()}`
    };
  } catch (error) {
    console.error('Error generating metadata for category page:', error);
    return {
      title: 'Blog Category - Woman and Business',
      description: 'Insights and resources for female entrepreneurs'
    };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      notFound();
    }

    // getPostsByCategory takes the slug, not the id
    const posts = await getPostsByCategory(slug);
    
    return (
      <main className="flex min-h-screen flex-col items-center p-6">
        <div className="max-w-4xl mx-auto w-full">
          <Link 
            href="/blog"
            className="text-purple-600 hover:underline mb-6 inline-block"
          >
            ← Back to all articles
          </Link>
          
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-purple-800">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-gray-600">{category.description}</p>
            )}
          </header>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{cleanTitle(post.title)}</h2>
                    {(post.published_at || post.date || post.created_at) && (
                      <p className="text-sm text-gray-500 mb-3">
                        {new Date(post.published_at || post.date || post.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    <p className="text-gray-600 mb-4">
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-purple-600 font-medium hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No articles found in this category. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching category data:', error);
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Category</h1>
          <p className="text-gray-600 mb-6">Sorry, there was a problem loading this category. Please try again later.</p>
          <Link 
            href="/blog"
            className="text-purple-600 hover:underline"
          >
            ← Back to all articles
          </Link>
        </div>
      </main>
    );
  }
} 