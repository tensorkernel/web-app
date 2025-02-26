import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameCard } from '../components/ui/GameCard';
import { supabase } from '../lib/supabase';
import type { Game } from '../types';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', slug)
          .single();

        if (categoryData) {
          setCategoryName(categoryData.name);

          const { data: gamesData, error } = await supabase
            .from('games')
            .select('*')
            .eq('category', categoryData.name)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setGames(gamesData || []);
        }
      } catch (error) {
        console.error('Error fetching category games:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchGames();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">{categoryName} Games</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        {games.length === 0 && (
          <p className="text-gray-400 text-center mt-8">No games found in this category.</p>
        )}
      </motion.section>
    </div>
  );
}
