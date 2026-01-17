import Link from 'next/link'
import { getAllPosts, getAllCategories } from '@/lib/blog-service'

export async function generateMetadata() {
  return {
    title: "Blog - Woman and Business",
    description: "Explore articles on management, beauty, and female leadership"
  }
}

export default async function BlogPage() {
  // Fetch posts and categories with error handling
  let posts = [];
  let categories = [];
  
  try {
    const postsResult = await getAllPosts({ limit: 10 });
    posts = postsResult.posts || [];
    
    const categoriesResult = await getAllCategories();
    categories = categoriesResult || [];
    
    console.log("Successfully fetched data for blog page:", { 
      postsCount: posts.length, 
      categoriesCount: categories.length 
    });
  } catch (error) {
    console.error("Error fetching data for blog page:", error);
    // Continue rendering with empty data
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-purple-700">Blog</h1>
          <p className="text-xl text-gray-600 mb-8">Explore articles on management, beauty, and female leadership</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar with categories */}
          <div className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="font-semibold text-lg mb-4">Categories</h2>
              <ul className="space-y-2">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <li key={category.id}>
                      <Link 
                        href={`/blog/category/${category.slug}`}
                        className="text-purple-600 hover:underline"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No categories found</li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Main content with posts */}
          <div className="md:col-span-3">
            <h2 className="text-2xl font-semibold mb-6">Latest Articles</h2>
            
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-medium mb-2">{post.title}</h3>
                      {post.publishedAt && (
                        <p className="text-sm text-gray-500 mb-3">
                          {new Date(post.publishedAt).toLocaleDateString()}
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
                <p className="text-gray-500">No articles found. New content coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 