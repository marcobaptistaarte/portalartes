
import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterSection from './components/FilterSection';
import ContentDisplay from './components/ContentDisplay';
import AboutSection from './components/AboutSection';
import PrivacySection from './components/PrivacySection';
import ContactSection from './components/ContactSection';
import AdminSection from './components/AdminSection';
import MuralSection from './components/MuralSection';
import MuralDetail from './components/MuralDetail';
import NewsPage from './components/NewsPage';
import NewsDetail from './components/NewsDetail';
import { HomeSections } from './components/HomeSections';
import { SelectionState, MuralPost, NewsItem } from './types';
import { supabase } from './supabaseClient';

type View = 'home' | 'about' | 'privacy' | 'contact' | 'admin' | 'mural' | 'mural-detail' | 'noticias' | 'news-detail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedMuralPost, setSelectedMuralPost] = useState<MuralPost | null>(null);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  
  const [latestManualPosts, setLatestManualPosts] = useState<any[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [selection, setSelection] = useState<SelectionState>({
    level: null,
    grade: null,
    bimester: null,
    resource: null
  });

  const [content, setContent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      // Buscar Materiais Recentes
      const { data: materials } = await supabase
        .from('materiais_pedagogicos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (materials) setLatestManualPosts(materials);

      // Buscar Notícias Recentes do Supabase
      const { data: news } = await supabase
        .from('curated_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (news) {
        setLatestNews(news.map(n => ({
          id: n.id,
          title: n.titulo,
          summary: n.resumo,
          imageUrl: n.imagem_url,
          externalUrl: n.url_externa,
          date: n.data_postagem,
          type: n.tipo as 'internal' | 'external',
          content: n.conteudo
        })));
      }
    };

    fetchHomeData();
  }, [currentView]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const handleUpdateSelection = useCallback(async (update: Partial<SelectionState>) => {
    const newState = { ...selection, ...update };
    setSelection(newState);

    if (newState.level && newState.grade && newState.bimester && newState.resource) {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: dbError } = await supabase
          .from('materiais_pedagogicos')
          .select('*')
          .eq('nivel', newState.level)
          .eq('serie', newState.grade)
          .eq('bimestre', newState.bimester)
          .eq('tipo_recurso', newState.resource)
          .maybeSingle();

        if (dbError) throw dbError;

        if (data) {
          setContent({
            title: data.titulo,
            content: data.conteudo,
            tags: ['Material Oficial', data.nivel, data.tipo_recurso],
            arquivo_url: data.arquivo_url
          });
        } else {
          setContent({
            title: "Conteúdo em Preparação",
            content: `Ainda não existem materiais cadastrados para:\n\n${newState.level} - ${newState.grade}\n${newState.bimester} (${newState.resource})\n\nEstamos trabalhando para disponibilizar este conteúdo em breve.`,
            tags: ['Aviso', 'Coordenação']
          });
        }
      } catch (err: any) {
        setError('Erro ao conectar com o banco de dados.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setContent(null);
    }
  }, [selection]);

  const navigateTo = (view: View, data: any = null) => {
    if (view === 'mural-detail') setSelectedMuralPost(data);
    if (view === 'news-detail') setSelectedNewsItem(data);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewNews = (item: NewsItem) => {
    if (item.type === 'external' && item.externalUrl) {
      window.open(item.externalUrl, '_blank');
    } else {
      navigateTo('news-detail', item);
    }
  };

  const handleViewActivity = (activity: any) => {
    setSelection({
      level: activity.nivel,
      grade: activity.serie,
      bimester: activity.bimestre,
      resource: activity.tipo_recurso
    });
    setContent({
      title: activity.titulo,
      content: activity.conteudo,
      tags: ['Material Oficial', activity.nivel, activity.tipo_recurso],
      arquivo_url: activity.arquivo_url
    });
    setCurrentView('home');
    setTimeout(() => {
      document.getElementById('content-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'about': return <AboutSection />;
      case 'privacy': return <PrivacySection />;
      case 'contact': return <ContactSection />;
      case 'mural': return <MuralSection onReadMore={(post) => navigateTo('mural-detail', post)} />;
      case 'mural-detail': return selectedMuralPost ? <MuralDetail post={selectedMuralPost} onBack={() => navigateTo('mural')} /> : null;
      case 'noticias': return <NewsPage onViewNews={handleViewNews} />;
      case 'news-detail': return selectedNewsItem ? <NewsDetail news={selectedNewsItem} onBack={() => navigateTo('noticias')} /> : null;
      case 'admin': return <AdminSection onBack={() => navigateTo('home')} />;
      default:
        return (
          <>
            <Hero />
            <FilterSection selection={selection} onUpdate={handleUpdateSelection} />
            <div id="content-area" className="pb-10">
              <ContentDisplay content={content} isLoading={isLoading} error={error} />
            </div>
            
            {!content && (
              <HomeSections 
                latestActivities={latestManualPosts.map(m => ({
                  id: m.id,
                  level: m.nivel,
                  grade: m.serie,
                  bimester: m.bimestre,
                  resource: m.tipo_recurso,
                  title: m.titulo,
                  content: m.conteudo,
                  date: new Date(m.created_at).toLocaleDateString('pt-BR'),
                  attachments: []
                }))}
                latestNews={latestNews}
                onViewActivity={(act) => {
                  const raw = latestManualPosts.find(p => p.id === act.id);
                  handleViewActivity(raw);
                }}
                onViewNews={handleViewNews}
                onSeeMoreNews={() => navigateTo('noticias')}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        onGoHome={() => navigateTo('home')}
        onGoMural={() => navigateTo('mural')}
        onGoNews={() => navigateTo('noticias')}
      />
      <main className="flex-grow">{renderContent()}</main>
      <footer className="bg-slate-900 text-white py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto flex flex-col items-center text-center gap-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <button onClick={() => navigateTo('home')} className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView === 'home' ? 'text-adventist-yellow' : 'text-slate-400 hover:text-adventist-yellow'}`}>Início</button>
            <button onClick={() => navigateTo('mural')} className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView === 'mural' || currentView === 'mural-detail' ? 'text-adventist-yellow' : 'text-slate-400 hover:text-adventist-yellow'}`}>Mural</button>
            <button onClick={() => navigateTo('noticias')} className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView === 'noticias' ? 'text-adventist-yellow' : 'text-slate-400 hover:text-adventist-yellow'}`}>Notícias</button>
            <button onClick={() => navigateTo('about')} className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView === 'about' ? 'text-adventist-yellow' : 'text-slate-400 hover:text-adventist-yellow'}`}>Sobre o portal</button>
            <button onClick={() => navigateTo('privacy')} className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView === 'privacy' ? 'text-adventist-yellow' : 'text-slate-400 hover:text-adventist-yellow'}`}>Privacidade</button>
            <button onClick={() => navigateTo('contact')} className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView === 'contact' ? 'text-adventist-yellow' : 'text-slate-400 hover:text-adventist-yellow'}`}>Contato</button>
          </div>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed flex flex-wrap items-center justify-center gap-x-1">
              <span>© 2025 Portal de Ensino de Artes. Idealizado por</span>
              <a 
                href="https://marcobaptista.com.br/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-300 hover:text-adventist-yellow transition-colors font-bold underline underline-offset-4 decoration-slate-600 hover:decoration-adventist-yellow"
              >
                Marco Baptista
              </a>
              <span>, Desenvolvido por</span>
              <a 
                href="https://www.instagram.com/denny.baptista" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-300 hover:text-adventist-yellow transition-colors underline underline-offset-4 decoration-slate-600 hover:decoration-adventist-yellow"
              >
                Denise Baptista
              </a>
              <Heart size={14} className="text-purple-500 fill-purple-500 inline-block ml-0.5" />
            </p>
            <div className="pt-4 border-t border-white/5">
              <button onClick={() => navigateTo('admin')} className="text-[10px] text-slate-600 hover:text-adventist-yellow uppercase tracking-[0.2em] font-bold transition-colors">— Área do Administrador —</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Fix: Adding default export
export default App;
