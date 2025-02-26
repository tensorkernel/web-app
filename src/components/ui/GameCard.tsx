import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Game } from '../../types';

interface GameCardProps {
  game: Game;
}

function GameCardComponent({ game }: GameCardProps) {
  return (
    <Link to={`/g/${game.slug}`} aria-label={`Play ${game.title}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{ transformOrigin: 'center' }}
        className="relative group rounded-2xl overflow-hidden bg-gray-900 shadow-xl transform-gpu"
      >
        {/* Thumbnail + Overlay + Play Icon */}
        <div className="aspect-[16/9] relative">
          <img
            src={game.thumbnail}
            alt={game.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-4 rounded-full"
            aria-hidden="true"
          >
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title, Description, Category, Play Now */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
          <p className="text-gray-400 line-clamp-2">{game.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">{game.category}</span>
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
              Play Now
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export const GameCard = memo(GameCardComponent);
