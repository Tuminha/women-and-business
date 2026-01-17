'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  _count?: number;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      // Get post counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (cat) => {
          const { count } = await supabase
            .from('blog_posts')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id);
          return { ...cat, _count: count || 0 };
        })
      );
      setCategories(categoriesWithCounts);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Estas seguro de eliminar esta categoria? Los posts asociados quedaran sin categoria.')) return;

    const supabase = getSupabaseAdmin();

    // First, remove category from posts
    await supabase
      .from('blog_posts')
      .update({ category_id: null })
      .eq('category_id', id);

    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error eliminando categoria: ' + error.message);
    } else {
      fetchCategories();
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = getSupabaseAdmin();
    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);

      if (error) {
        alert('Error actualizando categoria: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          created_at: new Date().toISOString()
        });

      if (error) {
        alert('Error creando categoria: ' + error.message);
      }
    }

    setSaving(false);
    setShowModal(false);
    fetchCategories();
  };

  if (loading) {
    return <div className="text-gray-600">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
        <button
          onClick={handleCreate}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          + Nueva Categoria
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No hay categorias. Crea tu primera categoria!
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-500">/{category.slug}</p>
                </div>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  {category._count} posts
                </span>
              </div>

              {category.description && (
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-purple-600 hover:underline text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripcion
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Descripcion opcional de la categoria..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-75"
                >
                  {saving ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
