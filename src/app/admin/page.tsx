'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase-client';

interface DashboardStats {
  postsCount: number;
  categoriesCount: number;
  messagesCount: number;
  usersCount: number;
}

interface RecentPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string;
}

interface RecentMessage {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const supabase = getSupabaseClient();

    try {
      // Fetch counts
      const [postsResult, categoriesResult, messagesResult, usersResult] = await Promise.all([
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        postsCount: postsResult.count || 0,
        categoriesCount: categoriesResult.count || 0,
        messagesCount: messagesResult.count || 0,
        usersCount: usersResult.count || 0,
      });

      // Fetch recent posts
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPosts(posts || []);

      // Fetch recent messages
      const { data: messages } = await supabase
        .from('contact_messages')
        .select('id, name, email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentMessages(messages || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Posts', value: stats?.postsCount || 0, href: '/admin/posts', color: 'bg-blue-500' },
    { label: 'Categorias', value: stats?.categoriesCount || 0, href: '/admin/categories', color: 'bg-green-500' },
    { label: 'Mensajes', value: stats?.messagesCount || 0, href: '/admin/messages', color: 'bg-yellow-500' },
    { label: 'Usuarios', value: stats?.usersCount || 0, href: '#', color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
              {card.label === 'Posts' && '📝'}
              {card.label === 'Categorias' && '📁'}
              {card.label === 'Mensajes' && '✉️'}
              {card.label === 'Usuarios' && '👥'}
            </div>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            <p className="text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Posts Recientes</h2>
            <Link href="/admin/posts" className="text-purple-600 hover:underline text-sm">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPosts.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No hay posts</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 truncate max-w-xs">{post.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {post.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Mensajes Recientes</h2>
            <Link href="/admin/messages" className="text-purple-600 hover:underline text-sm">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMessages.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No hay mensajes</p>
            ) : (
              recentMessages.map((message) => (
                <div key={message.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{message.name}</p>
                    <p className="text-sm text-gray-500">{message.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    message.status === 'read'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {message.status === 'read' ? 'Leido' : 'Nuevo'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
