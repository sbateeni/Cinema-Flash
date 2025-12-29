
import React from 'react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const getLanguageLabel = (status: string) => {
    switch (status) {
      case 'subtitled': return 'مترجم';
      case 'dubbed': return 'مدبلج';
      default: return 'أصلي';
    }
  };

  return (
    <div 
      onClick={() => onClick(movie)}
      className="group relative bg-slate-800 rounded-xl overflow-hidden cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 border border-slate-700/50 hover:border-red-600/50"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${movie.id}/400/600`;
          }}
        />
        
        {/* Overlays */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase">
            {movie.quality}
          </span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-lg ${
            movie.languageStatus === 'dubbed' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {getLanguageLabel(movie.languageStatus)}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full backdrop-blur">
             <span className="text-yellow-400">★</span>
             <span>{movie.rating.toFixed(1)}</span>
           </div>
           <span className="bg-black/60 px-2 py-1 rounded-full backdrop-blur">{movie.year}</span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
          {movie.originalTitle}
        </p>
      </div>

      {/* Play Icon on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
