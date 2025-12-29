
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { addToStore, getAllFromStore, removeFromStore } from '../services/dbService';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  onInteraction?: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose, onInteraction }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'links'>('links'); // الافتراضي هو الروابط
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const checkWatchlist = async () => {
      const watchlist = await getAllFromStore('watchlist');
      setIsInWatchlist(watchlist.some(m => m.id === movie.id));
    };
    checkWatchlist();
  }, [movie.id]);

  const handleOpenLink = async (url: string) => {
    window.open(url, '_blank');
    await addToStore('history', movie);
    if (onInteraction) onInteraction();
  };

  const getDisplayLinkInfo = (url: string) => {
    if (url.includes('google.com/search')) return { name: 'بحث جوجل المتقدم', site: 'Google', color: 'bg-slate-700' };
    
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      if (hostname.includes('cimawbas')) return { name: 'سيرفر سيما وبس المباشر', site: 'Cimawbas', color: 'bg-red-600' };
      if (hostname.includes('mycima') || hostname.includes('wecima')) return { name: 'سيرفر ماي سيما / وي سيما', site: 'MyCima', color: 'bg-emerald-600' };
      if (hostname.includes('akwam')) return { name: 'سيرفر أكوام الأصلي', site: 'Akwam', color: 'bg-sky-600' };
      if (hostname.includes('egybest')) return { name: 'سيرفر إيجي بست المباشر', site: 'EgyBest', color: 'bg-amber-600' };
      if (hostname.includes('faselhd')) return { name: 'سيرفر فاصل إتش دي', site: 'FaselHD', color: 'bg-indigo-600' };
      return { name: `سيرفر خارجي: ${hostname.split('.')[0]}`, site: hostname, color: 'bg-slate-800' };
    } catch {
      return { name: 'رابط مشاهدة مباشر', site: 'External', color: 'bg-slate-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-0 md:p-4 animate-fadeIn backdrop-blur-sm overflow-y-auto">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 text-white/40 hover:text-white p-2 z-[80] bg-white/5 rounded-full hover:bg-red-600 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full max-w-5xl bg-[#0f172a] md:rounded-3xl overflow-hidden flex flex-col md:flex-row h-full md:h-[85vh] shadow-2xl border border-white/5">
        
        {/* Poster Side */}
        <div className="w-full md:w-1/3 relative bg-slate-900 overflow-hidden border-b md:border-b-0 md:border-l border-white/5">
          <img src={movie.poster} className="w-full h-full object-cover opacity-40 blur-sm scale-105 absolute inset-0" alt="backdrop" />
          <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full text-center">
            <img 
              src={movie.poster} 
              className="w-48 shadow-2xl rounded-xl border border-white/10 mb-6 transform hover:scale-105 transition-transform" 
              alt={movie.title} 
            />
            <h2 className="text-2xl font-black text-white mb-2 leading-tight">{movie.title}</h2>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">{movie.originalTitle}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/30 text-[10px] font-black rounded">{movie.quality}</span>
              <span className="px-3 py-1 bg-white/5 text-white/50 text-[10px] font-black rounded border border-white/10">{movie.year}</span>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-2/3 flex flex-col bg-slate-900/50">
          <div className="flex border-b border-white/5 bg-slate-900">
            <button 
              onClick={() => setActiveTab('links')}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-white/30 hover:text-white'}`}
            >
              روابط المشاهدة المباشرة
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-white/30 hover:text-white'}`}
            >
              قصة الفيلم
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar">
            {activeTab === 'links' ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-white font-black text-lg mb-2">اختر رابط للمشاهدة:</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">يتم جلب هذه الروابط مباشرة من سيرفرات المشاهدة العالمية</p>
                </div>

                {movie.sources && movie.sources.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {movie.sources.map((url, i) => {
                      const info = getDisplayLinkInfo(url);
                      return (
                        <button 
                          key={i}
                          onClick={() => handleOpenLink(url)}
                          className="w-full group bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-red-500/50 p-4 rounded-2xl flex items-center justify-between transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${info.color} rounded-xl flex items-center justify-center font-black text-white shadow-lg`}>
                              {i + 1}
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold text-sm group-hover:text-red-500 transition-colors">
                                {info.name}
                              </div>
                              <div className="text-[10px] text-white/20 truncate max-w-[200px] md:max-w-sm font-mono mt-0.5">
                                {url}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded">LIVE</span>
                             <svg className="w-5 h-5 text-white/20 group-hover:text-red-500 group-hover:translate-x-[-4px] transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white/40 font-bold">جاري استخراج أحدث روابط المشاهدة...</p>
                  </div>
                )}
                
                <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <p className="text-[10px] text-amber-500/70 font-bold leading-relaxed">
                    ملاحظة: الروابط المباشرة قد تحتوي على إعلانات من الموقع الأصلي. ننصح باستخدام متصفح يدعم حجب الإعلانات لتجربة أفضل.
                  </p>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <h3 className="text-white font-black text-lg mb-4">نبذة عن العمل:</h3>
                <p className="text-white/60 leading-relaxed text-base font-medium mb-8">
                  {movie.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="block text-[10px] font-black text-white/30 uppercase mb-1">التصنيف</span>
                    <span className="text-white text-sm font-bold">{movie.genre.join(', ')}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="block text-[10px] font-black text-white/30 uppercase mb-1">الحالة</span>
                    <span className="text-red-500 text-sm font-black">{movie.languageStatus === 'subtitled' ? 'مترجم عربي' : 'مدبلج عربي'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-slate-900/80 flex items-center justify-between">
            <button 
              onClick={async () => {
                if (isInWatchlist) await removeFromStore('watchlist', movie.id);
                else await addToStore('watchlist', movie);
                setIsInWatchlist(!isInWatchlist);
                if (onInteraction) onInteraction();
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${isInWatchlist ? 'bg-amber-500 text-black' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
            >
              <svg className="w-4 h-4" fill={isInWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              {isInWatchlist ? 'في المفضلة' : 'حفظ للمشاهدة لاحقاً'}
            </button>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Cinema Flash Scraper v3.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
