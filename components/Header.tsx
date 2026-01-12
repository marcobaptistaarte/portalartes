import React, { useState } from 'react';
import { Sun, Moon, Palette, Home, Camera, Newspaper, Smartphone, Menu, X } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onGoHome: () => void;
  onGoMural: () => void;
  onGoNews: () => void;
  onGoApp: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isDarkMode, 
  toggleDarkMode, 
  onGoHome, 
  onGoMural, 
  onGoNews, 
  onGoApp,
  canInstall,
  onInstall
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (fn: () => void) => {
    fn();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-adventist-blue text-white shadow-lg transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onGoHome}
        >
          <div className="bg-adventist-yellow p-1.5 rounded-lg text-adventist-blue group-hover:scale-110 transition-transform shadow-sm">
            <Palette size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Portal <span className="text-adventist-yellow">Artes</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-1">
            <button onClick={onGoHome} className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider hover:text-adventist-yellow transition-colors py-2 px-3 rounded-lg hover:bg-white/5"><Home size={18} /> Início</button>
            <button onClick={onGoMural} className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider hover:text-adventist-yellow transition-colors py-2 px-3 rounded-lg hover:bg-white/5"><Camera size={18} /> Mural</button>
            <button onClick={onGoNews} className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider hover:text-adventist-yellow transition-colors py-2 px-3 rounded-lg hover:bg-white/5"><Newspaper size={18} /> Notícias</button>
          </nav>
          <div className="flex items-center border-l border-white/20 pl-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl bg-white/10 text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-adventist-blue z-40 animate-in fade-in slide-in-from-right duration-300">
          <nav className="flex flex-col p-6 gap-4">
            <button onClick={() => handleNavClick(onGoHome)} className="flex items-center gap-4 text-xl font-bold p-4 bg-white/5 rounded-2xl"><Home size={24} /> Início</button>
            <button onClick={() => handleNavClick(onGoMural)} className="flex items-center gap-4 text-xl font-bold p-4 bg-white/5 rounded-2xl"><Camera size={24} /> Mural</button>
            <button onClick={() => handleNavClick(onGoNews)} className="flex items-center gap-4 text-xl font-bold p-4 bg-white/5 rounded-2xl"><Newspaper size={24} /> Notícias</button>
            
            {canInstall && (
              <button 
                onClick={() => { onInstall?.(); setIsMenuOpen(false); }}
                className="mt-8 flex items-center justify-center gap-3 bg-adventist-yellow text-adventist-blue p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl animate-bounce"
              >
                <Smartphone size={24} /> Instalar Aplicativo
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
