'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';

interface Comment {
  id: number;
  post_id: number;
  user_id: number | null;
  name: string;
  email: string;
  content: string;
  status: string;
  created_at: string;
}

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!content.trim()) {
      setError('Por favor escribe un comentario');
      setSubmitting(false);
      return;
    }

    // If not logged in, require name and email
    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      setError('Por favor ingresa tu nombre y email');
      setSubmitting(false);
      return;
    }

    try {
      const supabase = getSupabaseAdmin();
      const commentData = {
        post_id: postId,
        user_id: profile?.id || null,
        name: user ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email?.split('@')[0] : guestName,
        email: user ? user.email : guestEmail,
        content: content.trim(),
        status: 'pending', // Comments need approval
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('comments')
        .insert(commentData);

      if (insertError) {
        throw insertError;
      }

      setContent('');
      setGuestName('');
      setGuestEmail('');
      setSuccess('Gracias! Tu comentario sera revisado y publicado pronto.');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError('Error al enviar el comentario. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || authLoading) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-500">Cargando comentarios...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Comentarios ({comments.length})
      </h2>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-gray-500 mb-8">Se el primero en comentar!</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                  {comment.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{comment.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                </div>
              </div>
              <p className="text-gray-700 ml-13">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Deja un comentario
        </h3>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={!user}
                />
              </div>
              <div>
                <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={!user}
                />
                <p className="text-xs text-gray-500 mt-1">Tu email no sera publicado</p>
              </div>
            </div>
          )}

          {user && (
            <p className="text-sm text-gray-600">
              Comentando como <span className="font-medium">{profile?.first_name || user.email}</span>
            </p>
          )}

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Comentario *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Escribe tu comentario aqui..."
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Los comentarios son moderados antes de publicarse.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-75"
            >
              {submitting ? 'Enviando...' : 'Enviar Comentario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
