
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
import AppInstallPage from './components/AppInstallPage';
import { HomeSections } from './components/HomeSections';
import { SelectionState, MuralPost, NewsItem } from './types';
import { supabase } from './supabaseClient';

type View = 'home' | 'about' | 'privacy' | 'contact' | 'admin' | 'mural' | 'mural-detail' | 'noticias' | 'news-detail' | 'app-install' | 'material';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedMuralPost, setSelectedMuralPost] = useState<MuralPost | null>(null);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [latestManualPosts, setLatestManualPosts] = useState<any[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [latestVideos, setLatestVideos] = useState<any[]>([]);

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

  const fetchMaterialById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('materiais_pedagogicos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (dbError) throw dbError;
      if (data) {
        setContent({
          title: data.titulo,
          content: data.conteudo,
          tags: ['Material Oficial', data.nivel, data.tipo_recurso],
          arquivo_url: data.arquivo_url,
          imagens_galeria: data.imagens_galeria
        });
      } else {
        setError("Material não encontrado.");
      }
    } catch (err) {
      setError("Erro ao carregar o material.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '') || 'home';
      if (hash.startsWith('material/')) {
        const id = hash.split('/')[1];
        setCurrentView('material');
        fetchMaterialById(id);
      } else {
        const validViews: View[] = ['home', 'about', 'privacy', 'contact', 'admin', 'mural', 'mural-detail', 'noticias', 'news-detail', 'app-install'];
        setCurrentView(validViews.includes(hash as View) ? (hash as View) : 'home');
        if (hash === 'home' || hash === '') {
          setContent(null);
          setSelection({ level: null, grade: null, bimester: null, resource: null });
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Busca 12 Atividades
        const { data: materials } = await supabase.from('materiais_pedagogicos').select('*').order('created_at', { ascending: false }).limit(12);
        if (materials) setLatestManualPosts(materials);

        // Busca 6 Notícias/Artigos
        const { data: news } = await supabase.from('curated_news').select('*').order('created_at', { ascending: false }).limit(6);
        if (news) {
          setLatestNews(news.map(n => ({
            id: n.id,
            title: n.titulo,
            summary: n.resumo,
            imageUrl: n.imagem_url,
            externalUrl: n.url_externa,
            date: new Date(n.created_at).toLocaleDateString('pt-BR'),
            type: n.tipo as 'internal' | 'external',
            content: n.conteudo,
            category: n.categoria || 'Notícia'
          })));
        }

        // Busca 6 Vídeos Interessantes
        const { data: vids } = await supabase.from('videos_curadoria').select('*').order('created_at', { ascending: false }).limit(6);
        if (vids) setLatestVideos(vids);

      } catch (err) { console.error(err); }
    };
    fetchHomeData();
  }, []);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const handleUpdateSelection = useCallback(async (update: Partial<SelectionState>) => {
    const newState = { ...selection, ...update };
    setSelection(newState);
    if (newState.level && newState.grade && newState.bimester && newState.resource) {
      setIsLoading(true);
      try {
        const { data } = await supabase.from('materiais_pedagogicos').select('id').eq('nivel', newState.level).eq('serie', newState.grade).eq('bimestre', newState.bimester).eq('tipo_recurso', newState.resource).maybeSingle();
        if (data) window.location.hash = `#/material/${data.id}`;
        else setContent({ title: "Em Preparação", content: "Conteúdo não disponível ainda.", tags: ['Aviso'] });
      } catch (err) { setError('Erro no banco.'); } finally { setIsLoading(false); }
    }
  }, [selection]);

  const navigateTo = (view: View, data: any = null) => {
    if (view === 'mural-detail') setSelectedMuralPost(data);
    if (view === 'news-detail') setSelectedNewsItem(data);
    window.location.hash = (view === 'material' && data) ? `#/material/${data.id || data}` : `#/${view}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onGoHome={() => navigateTo('home')} onGoMural={() => navigateTo('mural')} onGoNews={() => navigateTo('noticias')} onGoApp={() => navigateTo('app-install')} />
      <main className="flex-grow">
        {currentView === 'home' ? (
          <>
            <Hero />
            <HomeSections 
              latestActivities={latestManualPosts.map(m => ({ id: m.id, level: m.nivel, grade: m.serie, bimester: m.bimestre, resource: m.tipo_recurso, title: m.titulo, content: m.conteudo, date: new Date(m.created_at).toLocaleDateString('pt-BR'), attachments: [] }))}
              latestNews={latestNews}
              latestVideos={latestVideos}
              onViewActivity={(act) => navigateTo('material', act.id)}
              onViewNews={(n) => n.type === 'external' ? window.open(n.externalUrl, '_blank') : navigateTo('news-detail', n)}
              onSeeMoreNews={() => navigateTo('noticias')}
            />
            <FilterSection selection={selection} onUpdate={handleUpdateSelection} />
            <div id="content-area" className="pb-10"><ContentDisplay content={content} isLoading={isLoading} error={error} /></div>
          </>
        ) : (
          currentView === 'about' ? <AboutSection /> :
          currentView === 'privacy' ? <PrivacySection /> :
          currentView === 'contact' ? <ContactSection /> :
          currentView === 'admin' ? <AdminSection onBack={() => navigateTo('home')} /> :
          currentView === 'mural' ? <MuralSection onReadMore={(p) => navigateTo('mural-detail', p)} /> :
          currentView === 'mural-detail' ? <MuralDetail post={selectedMuralPost!} onBack={() => navigateTo('mural')} /> :
          currentView === 'noticias' ? <NewsPage onViewNews={(n) => n.type === 'external' ? window.open(n.externalUrl, '_blank') : navigateTo('news-detail', n)} /> :
          currentView === 'news-detail' ? <NewsDetail news={selectedNewsItem!} onBack={() => navigateTo('noticias')} /> :
          currentView === 'app-install' ? <AppInstallPage /> :
          currentView === 'material' ? <ContentDisplay content={content} isLoading={isLoading} error={error} /> : null
        )}
      </main>
      <footer className="bg-slate-900 text-white py-12 px-4 border-t border-slate-800 text-center space-y-8">
        <div className="flex flex-wrap justify-center gap-12 text-adventist-yellow uppercase tracking-widest font-bold text-sm">
          <button onClick={() => navigateTo('home')}>Início</button>
          <button onClick={() => navigateTo('about')}>Sobre</button>
          <button onClick={() => navigateTo('contact')}>Contato</button>
          <button onClick={() => navigateTo('privacy')}>Privacidade</button>
        </div>
        <p className="text-slate-400 text-xs">© 2026 Portal de Artes. Idealizado por Marco Baptista. <button onClick={() => navigateTo('admin')} className="ml-4 opacity-50 hover:opacity-100">— Admin —</button></p>
      </footer>
    </div>
  );
};

export default App;
