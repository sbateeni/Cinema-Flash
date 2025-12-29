
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieDetails from './components/MovieDetails';
import { Movie, FilterLanguage, FilterType } from './types';
import { searchMovies, getFeaturedMovies, checkApiStatus } from './services/geminiService';
import { getAllFromStore } from './services/dbService';

type ViewType = 'home' | 'watchlist' | 'history';

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [historyMovies, setHistoryMovies] = useState<Movie[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState<FilterLanguage>(FilterLanguage.ALL);
  const [typeFilter, setTypeFilter] = useState<FilterType>(FilterType.ALL);
  const [isApiOnline, setIsApiOnline] = useState(false);

  const fetchUserData = useCallback(async () => {
    const history = await getAllFromStore('history');
    const watchlist = await getAllFromStore('watchlist');
    setHistoryMovies(history);
    setWatchlistMovies(watchlist);
  }, []);

  const fetchMovies = useCallback(async (q: string, lang: FilterLanguage, type: FilterType) => {
    setLoading(true);
    setError(null);
    setCurrentView('home');
    try {
      const results = await searchMovies(q, lang, type);
      setMovies(results);
      if (results.length === 0) setError("لم نجد نتائج مطابقة لبحثك.");
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") {
        setError("خطأ: مفتاح API غير موجود في إعدادات Vercel.");
      } else if (err.message === "RATE_LIMIT_EXCEEDED") {
        setError("انتهت حصة الاستخدام المجانية لليوم، جرب لاحقاً.");
      } else {
        setError("حدث خطأ أثناء الاتصال بـ Gemini AI. تأكد من إعدادات المفتاح.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const online = checkApiStatus();
      setIsApiOnline(online);
      
      await fetchUserData();
      const featured = await getFeaturedMovies();
      setFeaturedMovies(featured);
      setMovies(featured);
      setLoading(false);
    };
    init();
  }, [fetchUserData]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    fetchMovies(newQuery, langFilter, typeFilter);
  };

  const handleFilterChange = (lang: FilterLanguage, type: FilterType) => {
    setLangFilter(lang);
    setTypeFilter(type);
    if (currentView === 'home' && query) {
      fetchMovies(query, lang, type);
    }
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    setQuery('');
    setError(null);
    fetchUserData();
  };

  const renderContent = () => {
    let displayList: Movie[] = [];
    if (currentView === 'home') displayList = movies;
    else if (currentView === 'watchlist') displayList = watchlistMovies;
    else if (currentView === 'history') displayList = historyMovies;

    if (loading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-slate-800 aspect-[2/3] rounded-xl animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <p className="text-white font-bold mb-2">{error}</p>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">تأكد من إضافة API_KEY بشكل صحيح في لوحة تحكم Vercel وإعادة عمل Deploy.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors">تحديث الصفحة</button>
        </div>
      );
    }

    if (displayList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-xl">القائمة فارغة حالياً</p>
          {currentView !== 'home' && (
            <button onClick={() => setCurrentView('home')} className="mt-4 text-red-500 hover:underline font-bold">استكشف الأفلام</button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {displayList.map((movie) => (
          <MovieCard 
            key={movie.id + currentView} 
            movie={movie} 
            onClick={setSelectedMovie} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar onSearch={handleSearch} onNavigate={handleNavigate} activeView={currentView} isApiOnline={isApiOnline} />
      
      {/* Filters Bar */}
      <div className="bg-slate-800/50 border-b border-slate-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-widest">التصنيف:</label>
            <select 
              value={typeFilter}
              onChange={(e) => handleFilterChange(langFilter, e.target.value as FilterType)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
            >
              {Object.values(FilterType).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-widest">اللغة:</label>
            <select 
              value={langFilter}
              onChange={(e) => handleFilterChange(e.target.value as FilterLanguage, typeFilter)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
            >
              {Object.values(FilterLanguage).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="flex-grow"></div>
          
          <div className="text-xs text-slate-400 font-medium">
            {!isApiOnline && <span className="text-red-500 ml-2">⚠️ لم يتم ضبط الـ API</span>}
            {currentView === 'home' ? 'تصفح المكتبة' : `قائمة ${currentView === 'watchlist' ? 'المفضلة' : 'السجل'}`}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {currentView === 'home' && !query && historyMovies.length > 0 && (
          <div className="mb-12 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                شاهدته مؤخراً
              </h2>
              <button onClick={() => setCurrentView('history')} className="text-xs text-slate-400 hover:text-white transition-colors">عرض الكل</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {historyMovies.slice(0, 8).map((movie) => (
                <div key={movie.id + 'recent'} className="flex-shrink-0 w-32 md:w-40">
                  <MovieCard movie={movie} onClick={setSelectedMovie} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <span className={`w-2 h-8 rounded-full ${currentView === 'watchlist' ? 'bg-yellow-500' : currentView === 'history' ? 'bg-blue-600' : 'bg-red-600'}`}></span>
              {currentView === 'home' ? (query ? `نتائج البحث عن: ${query}` : "أحدث الإضافات") : (currentView === 'watchlist' ? 'قائمة المشاهدة لاحقاً' : 'سجل المشاهدة')}
            </h2>
          </div>

          {renderContent()}
        </div>

        {currentView === 'home' && !query && featuredMovies.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                مختارات سينما فلاش
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {featuredMovies.slice(0, 3).map((movie) => (
                 <div 
                   key={movie.id + 'featured'}
                   onClick={() => setSelectedMovie(movie)}
                   className="group relative h-64 bg-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-[1.02]"
                 >
                   <img 
                    src={movie.poster} 
                    className="w-full h-full object-cover brightness-50 group-hover:brightness-75 transition-all"
                    alt={movie.title}
                   />
                   <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                     <span className="text-xs text-yellow-400 font-bold mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        مميز
                     </span>
                     <h3 className="text-2xl font-black text-white">{movie.title}</h3>
                     <p className="text-slate-300 text-sm line-clamp-1 mt-1">{movie.description}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>

      {selectedMovie && (
        <MovieDetails 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)}
          onInteraction={fetchUserData}
        />
      )}

      <footer className="mt-40 border-t border-slate-800 pt-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 pb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white">F</div>
              <h2 className="text-xl font-bold">سينما فلاش</h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
              منصة عربية رائدة تقدم لك أحدث الأفلام والمسلسلات بجودة عالية وبشكل مجاني تماماً باستخدام تقنيات الذكاء الاصطناعي.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">المكتبة</h4>
            <ul className="text-slate-500 space-y-2 text-sm">
              <li><button onClick={() => handleNavigate('watchlist')} className="hover:text-red-500">المشاهدة لاحقاً</button></li>
              <li><button onClick={() => handleNavigate('history')} className="hover:text-red-500">سجل المشاهدة</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">الدعم</h4>
            <div className="flex gap-4 text-[10px] font-bold text-slate-600">
              {isApiOnline ? <span className="text-green-600">API ACTIVE</span> : <span className="text-red-600">API ERROR</span>}
            </div>
          </div>
        </div>
        <div className="bg-slate-950 py-6 text-center text-slate-600 text-[10px] md:text-xs">
          جميع الحقوق محفوظة © {new Date().getFullYear()} لسينما فلاش
        </div>
      </footer>
    </div>
  );
};

export default App;
