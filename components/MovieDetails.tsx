
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { addToStore, getAllFromStore, removeFromStore } from '../services/dbService';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  onInteraction?: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose, onInteraction }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const checkWatchlist = async () => {
      const watchlist = await getAllFromStore('watchlist');
      setIsInWatchlist(watchlist.some(m => m.id === movie.id));
    };
    checkWatchlist();
  }, [movie.id]);

  const handlePlay = async () => {
    setIsPlaying(true);
    await addToStore('history', movie);
    if (onInteraction) onInteraction();
  };

  const toggleWatchlist = async () => {
    if (isInWatchlist) {
      await removeFromStore('watchlist', movie.id);
      setIsInWatchlist(false);
    } else {
      await addToStore('watchlist', movie);
      setIsInWatchlist(true);
    }
    if (onInteraction) onInteraction();
  };

  const sampleVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 md:p-8 animate-fadeIn overflow-y-auto">
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 md:top-8 md:right-8 text-white hover:text-red-500 p-2 z-[70] bg-black/50 rounded-full backdrop-blur-sm transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full max-w-6xl bg-slate-900 rounded-2xl overflow-hidden flex flex-col lg:flex-row h-full max-h-[90vh] shadow-2xl border border-slate-800 my-auto">
        
        <div className="w-full lg:w-2/3 bg-black flex flex-col relative">
          {!isPlaying ? (
            <div className="relative flex-grow flex items-center justify-center group bg-slate-950 overflow-hidden">
              <img 
                src={movie.poster} 
                alt="backdrop" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
              />
              <div className="relative z-10 text-center p-6 flex flex-col items-center">
                <div 
                  onClick={handlePlay}
                  className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-600/40 cursor-pointer hover:scale-110 transition-transform group-active:scale-95"
                >
                  <svg className="w-12 h-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-black text-white mb-2 tracking-wide">جاهز للمشاهدة الآن</h4>
                <div className="flex gap-3 items-center">
                   <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">{movie.quality}</span>
                   <p className="text-slate-400 text-sm">{movie.languageStatus === 'dubbed' ? 'نسخة مدبلجة بالعربية' : 'نسخة مترجمة للعربية'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex-grow bg-black animate-fadeIn">
              <video 
                src={sampleVideoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
                poster={movie.poster}
              >
                Your browser does not support the video tag.
              </video>
              <button 
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 left-4 bg-slate-900/80 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800 transition-colors border border-slate-700 backdrop-blur-md"
              >
                رجوع للبوستر
              </button>
            </div>
          )}
          
          <div className="bg-slate-900 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-slate-500 text-xs self-center ml-2">السيرفر:</span>
              <button className="px-4 py-2 bg-red-600 text-white font-bold rounded text-xs transition-colors shadow-lg shadow-red-600/10">سيرفر أساسي</button>
              <button className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700">سيرفر احتياطي</button>
              <button className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700">VIP</button>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                  isInWatchlist ? 'bg-yellow-600/20 text-yellow-500 border-yellow-600/50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
               >
                 <svg className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                 </svg>
                 {isInWatchlist ? 'في المفضلة' : 'أضف للمفضلة'}
               </button>
               <button className="p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"/></svg>
               </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 p-6 md:p-8 overflow-y-auto bg-slate-900 border-r border-slate-800 custom-scrollbar">
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genre.map(g => (
              <span key={g} className="text-[10px] px-2 py-1 bg-red-600/10 text-red-500 rounded border border-red-600/20 font-bold">
                {g}
              </span>
            ))}
          </div>
          
          <h2 className="text-3xl font-black mb-2 text-white leading-tight">{movie.title}</h2>
          <h3 className="text-sm text-slate-500 mb-6 font-mono tracking-wider opacity-80 uppercase">{movie.originalTitle}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
               <div className="text-[10px] text-slate-500 uppercase mb-1">التقييم</div>
               <div className="flex items-center gap-1 text-yellow-500 font-black text-lg">
                 <span>{movie.rating.toFixed(1)}</span>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
               </div>
             </div>
             <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
               <div className="text-[10px] text-slate-500 uppercase mb-1">السنة</div>
               <div className="text-white font-black text-lg">{movie.year}</div>
             </div>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="text-white font-bold border-r-4 border-red-600 pr-3">قصة العمل</h4>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base font-medium opacity-90">
              {movie.description}
            </p>
          </div>

          <div className="pt-8 border-t border-slate-800">
            <h4 className="text-slate-400 text-xs font-bold mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              روابط خارجية ومصادر (Grounding)
            </h4>
            <div className="space-y-2">
              {movie.sources?.map((src, i) => (
                <a 
                  key={i} 
                  href={src} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-blue-400 text-[10px] md:text-xs truncate transition-all border border-transparent hover:border-slate-700 flex items-center justify-between"
                >
                  <span className="truncate">{src}</span>
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
