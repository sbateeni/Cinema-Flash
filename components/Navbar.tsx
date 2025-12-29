
import React, { useState } from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  onNavigate: (view: 'home' | 'watchlist' | 'history') => void;
  onStatusClick: () => void;
  activeView: string;
  isApiOnline: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, onNavigate, onStatusClick, activeView, isApiOnline }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/20">
              F
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              سينما <span className="text-red-600">فلاش</span>
            </h1>
          </div>
          
          {/* API Status Indicator - Clickable for details */}
          <button 
            onClick={onStatusClick}
            className="flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-800 px-2 py-1 rounded-full border border-slate-700 transition-colors group"
            title="اضغط لمعرفة حالة الاتصال"
          >
            <span className={`w-2 h-2 rounded-full ${isApiOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter group-hover:text-white">
              Gemini: {isApiOnline ? 'متصل' : 'عطل'}
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث عن فيلم، مسلسل، أنمي..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-full py-2 px-12 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all text-sm md:text-base"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <div className="flex items-center gap-4 md:gap-6 text-slate-300 font-semibold text-sm">
          <button 
            onClick={() => onNavigate('home')} 
            className={`${activeView === 'home' ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
          >
            الرئيسية
          </button>
          <button 
            onClick={() => onNavigate('watchlist')} 
            className={`${activeView === 'watchlist' ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
          >
            المشاهدة لاحقاً
          </button>
          <button 
            onClick={() => onNavigate('history')} 
            className={`${activeView === 'history' ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
          >
            السجل
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
