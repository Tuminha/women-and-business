'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-gray-600">Cargando...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-purple-700 mb-6">Mi Perfil</h1>

          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-purple-600">
                  {(profile?.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              {isAdmin && (
                <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Administrador
                </span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-800">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Nombre</label>
              <p className="text-gray-800">
                {profile?.first_name || 'No especificado'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Apellido</label>
              <p className="text-gray-800">
                {profile?.last_name || 'No especificado'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Miembro desde</label>
              <p className="text-gray-800">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'No disponible'}
              </p>
            </div>

            {profile?.last_login && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Ultimo acceso</label>
                <p className="text-gray-800">
                  {new Date(profile.last_login).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6 mt-6 flex flex-wrap gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
              >
                Panel de Administracion
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cerrar Sesion
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
