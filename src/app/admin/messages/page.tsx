'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleView = async (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if unread
    if (message.status === 'new' || message.status === 'unread') {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', message.id);

      setMessages(messages.map(m =>
        m.id === message.id ? { ...m, status: 'read' } : m
      ));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Estas seguro de eliminar este mensaje?')) return;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error eliminando mensaje: ' + error.message);
    } else {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleMarkAsReplied = async (id: number) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'replied' })
      .eq('id', id);

    if (error) {
      alert('Error actualizando mensaje: ' + error.message);
    } else {
      setMessages(messages.map(m =>
        m.id === id ? { ...m, status: 'replied' } : m
      ));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: 'replied' });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
      case 'unread':
        return 'bg-blue-100 text-blue-700';
      case 'read':
        return 'bg-gray-100 text-gray-700';
      case 'replied':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
      case 'unread':
        return 'Nuevo';
      case 'read':
        return 'Leido';
      case 'replied':
        return 'Respondido';
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
        <h1 className="text-2xl font-bold text-gray-800">Mensajes de Contacto</h1>
        <span className="text-gray-500">
          {messages.filter(m => m.status === 'new' || m.status === 'unread').length} sin leer
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay mensajes
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleView(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedMessage?.id === message.id ? 'bg-purple-50' : ''
                  } ${message.status === 'new' || message.status === 'unread' ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-medium ${
                      message.status === 'new' || message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {message.name}
                    </p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(message.status)}`}>
                      {getStatusLabel(message.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{message.email}</p>
                  <p className="text-sm text-gray-600 truncate mt-1">{message.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(message.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedMessage.name}</h2>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-purple-600 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(selectedMessage.status)}`}>
                  {getStatusLabel(selectedMessage.status)}
                </span>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.message}</p>
              </div>

              <div className="text-sm text-gray-500 mb-6">
                Recibido: {new Date(selectedMessage.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: Contacto desde Woman & Business`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  Responder por Email
                </a>
                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={() => handleMarkAsReplied(selectedMessage.id)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Marcar como Respondido
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Selecciona un mensaje para ver los detalles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
