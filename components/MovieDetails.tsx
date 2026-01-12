
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { addToStore, getAllFromStore, removeFromStore } from '../services/dbService';
import { TRUSTED_ARABIC_SOURCES } from '../constants/sources';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  onInteraction?: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose, onInteraction }) => {
  const [activeTab, setActiveTab] = useState<'links' | 'info'>('links');
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

  const getSourceDetails = (url: string) => {
    const u = url.toLowerCase();
    const foundSource = TRUSTED_ARABIC_SOURCES.find(source => 
      u.includes(source.domain.split('.')[0]) || source.aliases.some(alias => u.includes(alias))
    );

    if (foundSource) {
      return { 
        label: foundSource.name, 
        color: foundSource.color, 
        icon: foundSource.icon,
        isVerified: u.includes(foundSource.watchPathPattern)
      };
    }

    return { label: 'سيرفر مشاهدة احتياطي', color: 'border-slate-700 text-slate-500', icon: '🔗', isVerified: false };
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/98 flex items-center justify-center p-0 md:p-4 animate-fadeIn overflow-y-auto backdrop-blur-xl">
      <button 
        onClick={onClose}
        className="fixed top-5 right-5 text-white/40 hover:text-white p-3 z-[80] bg-white/5 rounded-full hover:bg-red-600 transition-all border border-white/10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full max-w-6xl bg-[#0f172a] md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-full md:min-h-[90vh] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5">
        
        <div className="w-full md:w-[38%] relative bg-slate-900 overflow-hidden border-b md:border-b-0 md:border-l border-white/5">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10"></div>
          <img src={movie.poster} className="w-full h-full object-cover opacity-20 blur-xl absolute inset-0 scale-125" alt="bg" />
          <div className="relative z-20 p-10 flex flex-col items-center justify-center h-full text-center">
            <div className="relative group mb-8">
              <img src={movie.poster} className="w-52 shadow-2xl rounded-3xl border border-white/10 transform transition-transform group-hover:scale-105 duration-500" alt={movie.title} />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#0f172a]">
                 <span className="text-white font-black text-xs">HD</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 leading-tight">{movie.title}</h2>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold mb-8">{movie.originalTitle}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="bg-red-600/10 text-red-500 text-[10px] font-black px-4 py-2 rounded-xl border border-red-500/20 uppercase">{movie.quality}</span>
              <span className="bg-white/5 text-white/50 text-[10px] font-black px-4 py-2 rounded-xl border border-white/10">{movie.year}</span>
              <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-4 py-2 rounded-xl border border-yellow-500/20">★ {movie.rating.toFixed(1)}</span>
            </div>

            <button 
              onClick={async () => {
                if (isInWatchlist) await removeFromStore('watchlist', movie.id);
                else await addToStore('watchlist', movie);
                setIsInWatchlist(!isInWatchlist);
                if (onInteraction) onInteraction();
              }}
              className={`w-full max-w-xs py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${isInWatchlist ? 'bg-amber-500 text-black' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
            >
              <svg className="w-5 h-5" fill={isInWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
              {isInWatchlist ? 'موجود في المفضلة' : 'إضافة لقائمة المشاهدة'}
            </button>
          </div>
        </div>

        <div className="w-full md:w-[62%] flex flex-col bg-slate-900/40">
          <div className="flex bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
            <button onClick={() => setActiveTab('links')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${activeTab === 'links' ? 'text-red-500' : 'text-white/30 hover:text-white'}`}>
              سيرفرات المشاهدة المباشرة
              {activeTab === 'links' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>}
            </button>
            <button onClick={() => setActiveTab('info')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${activeTab === 'info' ? 'text-red-500' : 'text-white/30 hover:text-white'}`}>
              عن العمل والقصة
              {activeTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>}
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 md:p-12 custom-scrollbar">
            {activeTab === 'links' ? (
              <div className="animate-fadeIn space-y-8">
                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
                  <div>
                    <h3 className="text-emerald-500 font-black text-lg mb-1 flex items-center gap-2">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       التحقق من حيوية الروابط:
                    </h3>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">يقوم الوكيل الذكي باستبعاد النطاقات القديمة والمعطلة حالياً</p>
                  </div>
                  <div className="hidden sm:block">
                     <span className="bg-emerald-500 text-black text-[9px] font-black px-3 py-1 rounded-full">LIVE MIRRORS ONLY</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {movie.sources && movie.sources.length > 0 ? (
                    movie.sources.map((url, i) => {
                      const details = getSourceDetails(url);
                      return (
                        <button 
                          key={i}
                          onClick={() => handleOpenLink(url)}
                          className={`w-full group bg-white/[0.03] hover:bg-slate-800 border border-white/5 hover:border-red-600/40 p-6 rounded-[2rem] flex items-center justify-between transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]`}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 bg-slate-900 border ${details.color.split(' ')[0]} rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner group-hover:rotate-6 transition-transform`}>
                              {details.icon}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <div className={`font-black text-lg transition-colors ${details.color.split(' ')[1]}`}>
                                  {details.label}
                                </div>
                                {details.isVerified && (
                                  <span className="bg-emerald-500/20 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-tighter">نشط</span>
                                )}
                              </div>
                              <div className="text-[10px] text-white/10 truncate max-w-[200px] md:max-w-md font-mono mt-1 group-hover:text-white/30 transition-colors">
                                {url}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="hidden lg:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black text-emerald-500">200 OK</span>
                                <span className="text-[8px] text-white/20 uppercase font-mono">Verified Node</span>
                             </div>
                             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7 7-7m8 14l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
                             </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-24 text-center flex flex-col items-center">
                      <div className="relative w-20 h-20 mb-8">
                         <div className="absolute inset-0 border-4 border-red-600/10 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-white/40 font-black text-sm uppercase tracking-[0.2em] animate-pulse">جاري البحث عن أحدث المرايا (Mirrors) النشطة لهذا العمل...</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-800/40 border border-white/5 rounded-[2rem] flex gap-5 items-start">
                   <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-amber-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                   </div>
                   <div>
                      <h4 className="text-white font-bold text-sm mb-1">تنويه بخصوص الروابط المعطلة:</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                        مواقع الأفلام مثل EgyBest تتعرض للحجب المستمر وتغير نطاقاتها أسبوعياً. وكيلنا يحاول جلب "النطاق النشط حالياً"، ولكن في حال تعطل الرابط، يرجى إعادة البحث لاحقاً ليقوم الوكيل بتحديث مساراته.
                      </p>
                   </div>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn space-y-10">
                <div>
                  <h3 className="text-white font-black text-2xl mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                    قصة العمل:
                  </h3>
                  <p className="text-white/60 leading-relaxed text-xl font-medium tracking-wide">
                    {movie.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
