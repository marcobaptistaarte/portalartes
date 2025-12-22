
import React from 'react';
import { Sun, Moon, Palette, Home, Camera, Newspaper, Smartphone } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onGoHome: () => void;
  onGoMural: () => void;
  onGoNews: () => void;
  onGoApp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, onGoHome, onGoMural, onGoNews, onGoApp }) => {
  return (
    <header className="sticky top-0 z-50 bg-adventist-blue text-white shadow-lg transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo e Título */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={onGoHome}
        >
          <div className="bg-adventist-yellow p-1.5 rounded-lg text-adventist-blue group-hover:scale-110 transition-transform shadow-sm">
            <Palette size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Portal de Ensino de <span className="text-adventist-yellow">Artes</span>
          </h1>
        </div>

        {/* Navegação e Controles */}
        <div className="flex items-center gap-2 md:gap-6">
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider hover:text-adventist-yellow transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <Home size={18} />
              Início
            </button>
            <button
              onClick={onGoMural}
              className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider hover:text-adventist-yellow transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <Camera size={18} />
              Mural
            </button>
            <button
              onClick={onGoNews}
              className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider hover:text-adventist-yellow transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <Newspaper size={18} />
              Notícias
            </button>
            <button
              onClick={onGoApp}
              className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider hover:text-adventist-yellow transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <Smartphone size={18} />
              App
            </button>
          </nav>

          {/* Botão de Tema - Garantido como último item */}
          <div className="flex items-center border-l border-white/20 pl-2 md:pl-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
