import Link from 'next/link'
import { getAllPosts } from '@/lib/blog-service'
import { getAllCategories } from '@/lib/blog-service'

// Function to fetch data at build time or on-demand
export async function generateMetadata() {
  return {
    title: "Woman and Business - Maria Cudeiro",
    description: "Empowering female entrepreneurs in the modern business landscape"
  }
}

// Main page is now a server component
export default async function Home() {
  // Fetch recent posts and categories
  const { posts } = await getAllPosts({ limit: 3 });
  const categories = await getAllCategories();
  
  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="max-w-4xl mx-auto space-y-12 w-full">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-purple-700">Woman and Business</h1>
          <p className="text-xl text-gray-600 mb-8">Empowering female entrepreneurs in the modern business landscape</p>
        </section>
        
        {/* Featured Blog Posts */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Latest Articles</h2>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {post.featuredImage && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {post.excerpt || post.content.substring(0, 120) + '...'}
                    </p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-purple-600 font-medium text-sm hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500">New articles coming soon!</p>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link
              href="/blog"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
            >
              View All Articles
            </Link>
          </div>
        </section>
        
        {/* Categories */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.slice(0, 3).map(category => (
            <div key={category.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3">{category.name}</h2>
              <p className="text-gray-600 mb-4">
                {category.description || `Articles about ${category.name.toLowerCase()}`}
              </p>
              <Link 
                href={`/blog/category/${category.slug}`}
                className="text-purple-600 font-medium text-sm hover:underline"
              >
                Browse Articles
              </Link>
            </div>
          ))}
        </section>
        
        <section className="bg-purple-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Exclusive Content</h2>
          <p className="text-gray-600 mb-6">Sign up to access premium resources, guides, and exclusive insights from Maria.</p>
          <Link
            href="/register"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Join Now
          </Link>
        </section>
        
        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Connect with Maria</h2>
          <p className="text-gray-600 mb-6">Follow Maria on LinkedIn for daily insights and updates.</p>
          <a 
            href="https://linkedin.com/in/mariacudeiro" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            LinkedIn Profile
          </a>
        </section>
      </div>
    </main>
  );
}
