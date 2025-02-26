import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Sun,
  Moon,
  FileDiff,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import * as Sentry from '@sentry/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import type { Game, Category } from '../../types';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';

const PAGE_SIZE = 10;

// Extend the NewGame interface with extra fields for SEO and versioning.
interface NewGame {
  title: string;
  description: string;
  thumbnail: string;
  iframe_url: string;
  category: string;
  status: 'draft' | 'published';
  seoTitle: string;
  metaDescription: string;
  keywords: string; // comma separated
  ampEnabled: boolean;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Theme toggle: 'light' or 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  // Used for editing a game
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  // Toggle to show the content diff modal (for versioning)
  const [showDiff, setShowDiff] = useState(false);
  // New game state (includes extra fields for SEO)
  const [newGame, setNewGame] = useState<NewGame>({
    title: '',
    description: '',
    thumbnail: '',
    iframe_url: '',
    category: '',
    status: 'draft',
    seoTitle: '',
    metaDescription: '',
    keywords: '',
    ampEnabled: false,
  });
  // Search term persisted via localStorage
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('searchTerm') || '';
  });
  // Pagination: current page
  const [page, setPage] = useState(1);

  // Persist search term in localStorage
  useEffect(() => {
    localStorage.setItem('searchTerm', searchTerm);
  }, [searchTerm]);

  // Apply the theme by updating the document class
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Helper: ensure admin is authenticated before actions
  const ensureAdminAuthenticated = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
        if (signInError) throw signInError;
      }
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  };

  // Fetch games with pagination using React Query
  const { data: gamesData, isLoading: gamesLoading } = useQuery(
    ['games', page],
    async () => {
      const start = (page - 1) * PAGE_SIZE;
      const end = page * PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);
      if (error) throw error;
      return data as Game[];
    },
    { keepPreviousData: true }
  );

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Category[];
    }
  );

  // Check admin login on mount
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  // Mutation to add a game
  const addGameMutation = useMutation(
    async (game: NewGame) => {
      // Generate slug from title
      const slug = game.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      await ensureAdminAuthenticated();
      const { error } = await supabase.from('games').insert([{ ...game, slug }]);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        toast.success('Game added successfully');
        setNewGame({
          title: '',
          description: '',
          thumbnail: '',
          iframe_url: '',
          category: '',
          status: 'draft',
          seoTitle: '',
          metaDescription: '',
          keywords: '',
          ampEnabled: false,
        });
        queryClient.invalidateQueries('games');
      },
      onError: (error) => {
        Sentry.captureException(error);
        toast.error('Failed to add game');
      },
    }
  );

  // Mutation to update a game
  const updateGameMutation = useMutation(
    async (game: Game) => {
      await ensureAdminAuthenticated();
      const { error } = await supabase
        .from('games')
        .update({
          title: game.title,
          description: game.description,
          thumbnail: game.thumbnail,
          iframe_url: game.iframe_url,
          category: game.category,
          // Extra SEO and versioning fields (assumes your table has these columns)
          status: (game as any).status,
          seoTitle: (game as any).seoTitle,
          metaDescription: (game as any).metaDescription,
          keywords: (game as any).keywords,
          ampEnabled: (game as any).ampEnabled,
        })
        .eq('id', game.id);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        toast.success('Game updated successfully');
        setEditingGame(null);
        queryClient.invalidateQueries('games');
      },
      onError: (error) => {
        Sentry.captureException(error);
        toast.error('Failed to update game');
      },
    }
  );

  // Mutation to delete a game
  const deleteGameMutation = useMutation(
    async (id: string) => {
      await ensureAdminAuthenticated();
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        toast.success('Game deleted successfully');
        queryClient.invalidateQueries('games');
      },
      onError: (error) => {
        Sentry.captureException(error);
        toast.error('Failed to delete game');
      },
    }
  );

  // Form submit handler for adding a game
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addGameMutation.mutate(newGame);
  };

  // Save edited game
  const handleSaveEdit = async () => {
    if (!editingGame) return;
    updateGameMutation.mutate(editingGame);
  };

  // Delete game
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    deleteGameMutation.mutate(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  // Filter games based on search term
  const filteredGames = useMemo(() => {
    if (!gamesData) return [];
    return gamesData.filter(
      (game) =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gamesData, searchTerm]);

  if (gamesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`max-w-6xl mx-auto p-4 ${theme}`}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-gray-700 rounded"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add New Game Form */}
      <div className="bg-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Add New Game</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newGame.title}
                onChange={(e) =>
                  setNewGame({ ...newGame, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={newGame.category}
                onChange={(e) =>
                  setNewGame({ ...newGame, category: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {categoriesData!.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={newGame.description}
              onChange={(e) =>
                setNewGame({ ...newGame, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              required
            />
          </div>
          {/* Media URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                value={newGame.thumbnail}
                onChange={(e) =>
                  setNewGame({ ...newGame, thumbnail: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Game URL (iframe)
              </label>
              <input
                type="url"
                value={newGame.iframe_url}
                onChange={(e) =>
                  setNewGame({ ...newGame, iframe_url: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          {/* SEO and Versioning Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={newGame.seoTitle}
                onChange={(e) =>
                  setNewGame({ ...newGame, seoTitle: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description
              </label>
              <input
                type="text"
                value={newGame.metaDescription}
                onChange={(e) =>
                  setNewGame({ ...newGame, metaDescription: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                value={newGame.keywords}
                onChange={(e) =>
                  setNewGame({ ...newGame, keywords: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-300">
                AMP Enabled
              </label>
              <input
                type="checkbox"
                checked={newGame.ampEnabled}
                onChange={(e) =>
                  setNewGame({ ...newGame, ampEnabled: e.target.checked })
                }
                className="w-4 h-4"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={addGameMutation.isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span>Add Game</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search games by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white">Page {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg"
        >
          Next
        </button>
      </div>

      {/* Games Table */}
      <div className="bg-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Manage Games</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-sm text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((game) => (
                <tr key={game.id} className="border-t border-gray-700">
                  <td className="px-4 py-3">{game.title}</td>
                  <td className="px-4 py-3">{game.category}</td>
                  <td className="px-4 py-3">{(game as any).status || 'published'}</td>
                  <td className="px-4 py-3">
                    {new Date(game.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          // Clone the game object to avoid direct mutation
                          setEditingGame({ ...game })
                        }
                        className="p-2 text-blue-400 hover:text-blue-300 transition"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        disabled={deleteGameMutation.isLoading}
                        className="p-2 text-red-400 hover:text-red-300 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredGames.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center">
                    No games found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Edit Game</h2>
                <div className="flex space-x-2">
                  {editingGame &&
                    (editingGame as any).publishedData && (
                      <button
                        onClick={() => setShowDiff(true)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 transition"
                      >
                        <FileDiff className="w-5 h-5" />
                      </button>
                    )}
                  <button
                    onClick={() => setEditingGame(null)}
                    className="p-2 text-gray-400 hover:text-gray-300 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingGame.title}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        title: e.target.value,
                      } as Game)
                    }
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingGame.category}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        category: e.target.value,
                      } as Game)
                    }
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categoriesData!.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingGame.description}
                    onChange={(e) =>
                      setEditingGame({
                        ...editingGame,
                        description: e.target.value,
                      } as Game)
                    }
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>
                {/* SEO and Versioning Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={(editingGame as any).seoTitle || ''}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          seoTitle: e.target.value,
                        } as Game)
                      }
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Meta Description
                    </label>
                    <input
                      type="text"
                      value={(editingGame as any).metaDescription || ''}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          metaDescription: e.target.value,
                        } as Game)
                      }
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={(editingGame as any).keywords || ''}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          keywords: e.target.value,
                        } as Game)
                      }
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="block text-sm font-medium text-gray-300">
                      AMP Enabled
                    </label>
                    <input
                      type="checkbox"
                      checked={(editingGame as any).ampEnabled || false}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          ampEnabled: e.target.checked,
                        } as Game)
                      }
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateGameMutation.isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setEditingGame(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diff Modal for Content Versioning */}
      <AnimatePresence>
        {showDiff && editingGame && (editingGame as any).publishedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-3xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Content Version Diff
                </h2>
                <button
                  onClick={() => setShowDiff(false)}
                  className="p-2 text-gray-400 hover:text-gray-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Published Version
                  </h3>
                  <p>
                    <strong>Title:</strong>{' '}
                    {(editingGame as any).publishedData.title}
                  </p>
                  <p>
                    <strong>Description:</strong>{' '}
                    {(editingGame as any).publishedData.description}
                  </p>
                  <p>
                    <strong>SEO Title:</strong>{' '}
                    {(editingGame as any).publishedData.seoTitle}
                  </p>
                  <p>
                    <strong>Meta Description:</strong>{' '}
                    {(editingGame as any).publishedData.metaDescription}
                  </p>
                  <p>
                    <strong>Keywords:</strong>{' '}
                    {(editingGame as any).publishedData.keywords}
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Draft Version
                  </h3>
                  <p>
                    <strong>Title:</strong> {editingGame.title}
                  </p>
                  <p>
                    <strong>Description:</strong> {editingGame.description}
                  </p>
                  <p>
                    <strong>SEO Title:</strong>{' '}
                    {(editingGame as any).seoTitle}
                  </p>
                  <p>
                    <strong>Meta Description:</strong>{' '}
                    {(editingGame as any).metaDescription}
                  </p>
                  <p>
                    <strong>Keywords:</strong>{' '}
                    {(editingGame as any).keywords}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
