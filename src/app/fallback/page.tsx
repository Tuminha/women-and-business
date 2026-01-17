import Link from 'next/link';

// This is a fallback page that doesn't rely on database connections
export default function FallbackPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl mx-auto space-y-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-purple-700">Woman and Business</h1>
          <p className="text-xl text-gray-600 mb-8">Empowering female entrepreneurs in the modern business landscape</p>
          
          <div className="bg-yellow-100 p-4 rounded-lg text-left mb-8">
            <h2 className="font-bold text-lg mb-2">⚠️ Site Under Construction</h2>
            <p>
              Our website is currently being set up. Please check back soon for the full experience!
            </p>
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Management</h2>
            <p className="text-gray-600 mb-4">Insights and resources on effective management in modern business environments.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Beauty</h2>
            <p className="text-gray-600 mb-4">Exploring the intersection of beauty, self-care, and professional success.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Female Leadership</h2>
            <p className="text-gray-600 mb-4">Celebrating and supporting women who lead businesses and inspire others.</p>
          </div>
        </section>
        
        <section className="bg-purple-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Exclusive Content</h2>
          <p className="text-gray-600 mb-6">Sign up to access premium resources, guides, and exclusive insights from Maria.</p>
          <div className="bg-white p-3 rounded text-gray-500">Coming Soon</div>
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