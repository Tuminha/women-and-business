/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Adding environment variables to be used in the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Use standalone output for better Vercel compatibility
  output: 'standalone',
  // Disable image optimization during build
  images: {
    unoptimized: true,
  },
  // Increase build verbosity for debugging
  distDir: '.next',
  poweredByHeader: false,
  // Log environment info during build
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

// Log config for debugging
console.log('Next.js config initialized:', {
  env: nextConfig.env ? {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(nextConfig.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(nextConfig.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  } : 'Not set',
  typescript: nextConfig.typescript,
  eslint: nextConfig.eslint
});

module.exports = nextConfig 