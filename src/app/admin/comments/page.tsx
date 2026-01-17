'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';

interface Comment {
  id: number;
  post_id: number;
  name: string;
  email: string;
  content: string;
  status: string;
  created_at: string;
  post_title?: string;
}

export default function CommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'spam'>('pending');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('comments')
      .select('*, blog_posts(title)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      // Try without join
      const { data: commentsOnly } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });
      setComments(commentsOnly || []);
    } else {
      // Map the joined data
      const mapped = (data || []).map(c => ({
        ...c,
        post_title: c.blog_posts?.title
      }));
      setComments(mapped);
    }
    setLoading(false);
  };

  const handleApprove = async (id: number) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('comments')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      alert('Error aprobando comentario: ' + error.message);
    } else {
      fetchComments();
    }
  };

  const handleSpam = async (id: number) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('comments')
      .update({ status: 'spam' })
      .eq('id', id);

    if (error) {
      alert('Error marcando como spam: ' + error.message);
    } else {
      fetchComments();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Estas seguro de eliminar este comentario?')) return;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error eliminando comentario: ' + error.message);
    } else {
      fetchComments();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'spam':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'spam':
        return 'Spam';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="text-gray-600">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Moderacion de Comentarios</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'spam', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f === 'pending' && 'Pendientes'}
            {f === 'approved' && 'Aprobados'}
            {f === 'spam' && 'Spam'}
            {f === 'all' && 'Todos'}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-lg shadow">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay comentarios {filter !== 'all' && `con estado "${getStatusLabel(filter)}"`}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-800">{comment.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(comment.status)}`}>
                        {getStatusLabel(comment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{comment.email}</p>
                    {comment.post_title && (
                      <p className="text-sm text-purple-600 mt-1">
                        En: {comment.post_title}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded">
                  {comment.content}
                </p>

                <div className="flex gap-4">
                  {comment.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Aprobar
                    </button>
                  )}
                  {comment.status !== 'spam' && (
                    <button
                      onClick={() => handleSpam(comment.id)}
                      className="text-orange-600 hover:underline text-sm"
                    >
                      Marcar como Spam
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
