import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ArrowLeft, Camera, Loader2, Plus, Lock, 
  ShieldCheck, Edit2, RefreshCw, Bold, Italic, Underline, List, ListOrdered, AlignCenter, 
  AlignLeft, AlignRight, AlignJustify, Strikethrough, ChevronDown, ChevronUp, Trash2, 
  Youtube, Music, Image as ImageIcon, Sparkles, Newspaper, PlayCircle, Link as LinkIcon
} from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType, MuralPost, NewsItem } from '../types';
import { supabase } from '../supabaseClient';
import { getVideoMetadata, getNewsMetadata } from '../geminiService';

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural' | 'news' | 'vids';
const ADMIN_PASSWORD = 'Schlussel01';
const ADMIN_AUTH_KEY = 'portal_artes_admin_auth';

const AdminSection: React.FC<AdminSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const muralEditorRef = useRef<HTMLDivElement>(null);
  const newsEditorRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [recentMuralPosts, setRecentMuralPosts] = useState<any[]>([]);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  // States para Formulários
  const [post, setPost] = useState<Partial<ManualPost & { galleryImages: string[] }>>({
    level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '', video_url: '', galleryImages: ['', '', '', '', '', '']
  });
  const [muralPost, setMuralPost] = useState<Partial<MuralPost>>({
    teacherName: '', schoolName: '', level: 'Educação Infantil', grade: '', workTitle: '', description: '', photos: ['', '', '', '', '', '']
  });
  const [newsPost, setNewsPost] = useState<Partial<NewsItem>>({
    title: '', summary: '', content: '', imageUrl: '', externalUrl: '', category: 'Notícia', type: 'external'
  });
  const [vidPost, setVidPost] = useState<any>({
    titulo: '', resumo: '', snippet: '', url_video: '', video_id: '', imagem_fallback: ''
  });

  const [aiLink, setAiLink] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true') setIsAuthenticated(true);
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const { data: materials } = await supabase.from('materiais_pedagogicos').select('*').order('created_at', { ascending: false });
      setRecentMaterials(materials || []);
      const { data: murals } = await supabase.from('mural_posts').select('*').order('created_at', { ascending: false });
      setRecentMuralPosts(murals || []);
      const { data: news } = await supabase.from('curated_news').select('*').order('created_at', { ascending: false });
      setRecentNews(news || []);
      const { data: vids } = await supabase.from('videos_curadoria').select('*').order('created_at', { ascending: false });
      setRecentVideos(vids || []);
    } catch (err) { console.error(err); } finally { setIsLoadingData(false); }
  };

  useEffect(() => { if (isAuthenticated) loadData(); }, [isAuthenticated, activeTab]);

  const groupedMaterials = recentMaterials.reduce((acc: Record<string, Record<string, any[]>>, mat) => {
    const level = mat.nivel || 'Outros';
    const grade = mat.serie || 'Outros';
    if (!acc[level]) acc[level] = {};
    if (!acc[level][grade]) acc[level][grade] = [];
    acc[level][grade].push(mat);
    return acc;
  }, {});

  const toggleLevelExpansion = (level: string) => {
    setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  // IA Handlers
  const handleAiVideo = async () => {
    if (!aiLink) return alert("Insira o link do YouTube.");
    setIsAiLoading(true);
    try {
      const metadata = await getVideoMetadata(aiLink);
      if (activeTab === 'content') {
        setPost(prev => ({ ...prev, title: metadata.title, video_url: aiLink }));
        insertEmbedCode(`[youtube]${metadata.videoId}[/youtube]`, editorRef);
      } else {
        setVidPost({ titulo: metadata.title, resumo: metadata.summary, snippet: metadata.snippet, url_video: aiLink, video_id: metadata.videoId });
      }
    } catch (e) { alert("Erro ao processar vídeo."); } finally { setIsAiLoading(false); }
  };

  const handleAiNews = async () => {
    if (!aiLink) return alert("Insira o link da notícia/artigo.");
    setIsAiLoading(true);
    try {
      const metadata = await getNewsMetadata(aiLink);
      setNewsPost(prev => ({ 
        ...prev, title: metadata.title, summary: metadata.summary, 
        category: metadata.category as any, externalUrl: aiLink, type: 'external' 
      }));
      if (newsEditorRef.current) {
        newsEditorRef.current.innerHTML = `<h1>${metadata.title}</h1><p>${metadata.summary}</p><h3>Destaques</h3><p>${metadata.snippet}</p>`;
      }
    } catch (e) { alert("Erro ao processar link."); } finally { setIsAiLoading(false); }
  };

  const execCommand = (command: string, value: string = "", ref: React.RefObject<HTMLDivElement>) => {
    document.execCommand(command, false, value);
    if (ref.current) ref.current.focus();
  };

  const insertEmbedCode = (code: string, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    ref.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(code);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      ref.current.innerHTML += `\n${code}`;
    }
  };

  const insertImage = (ref: React.RefObject<HTMLDivElement>) => {
    const url = prompt("Insira a URL da imagem:");
    if (url) {
      execCommand('insertImage', url, ref);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      let table = '', payload = {};
      if (activeTab === 'content') {
        table = 'materiais_pedagogicos';
        payload = { 
          titulo: post.title, nivel: post.level, serie: post.grade, bimestre: post.bimester, 
          tipo_recurso: post.resource, conteudo: editorRef.current?.innerHTML, video_url: post.video_url,
          imagens_galeria: post.galleryImages?.filter(url => !!url) || []
        };
      } else if (activeTab === 'mural') {
        table = 'mural_posts';
        payload = { 
          professor_nome: muralPost.teacherName, escola_nome: muralPost.schoolName, nivel: muralPost.level, 
          serie: muralPost.grade, titulo_trabalho: muralPost.workTitle, descricao: muralEditorRef.current?.innerHTML, 
          fotos: muralPost.photos?.filter(url => !!url) || []
        };
      } else if (activeTab === 'news') {
        table = 'curated_news';
        payload = { 
          titulo: newsPost.title, resumo: newsPost.summary, conteudo: newsEditorRef.current?.innerHTML, 
          imagem_url: newsPost.imageUrl, url_externa: newsPost.externalUrl, tipo: newsPost.type, 
          categoria: newsPost.category 
        };
      } else {
        table = 'videos_curadoria';
        payload = vidPost;
      }

      const { error } = editingId ? await supabase.from(table).update(payload).eq('id', editingId) : await supabase.from(table).insert([payload]);
      if (error) throw error;
      setStatus('success');
      loadData();
      setEditingId(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { setStatus('error'); }
  };

  const handleImageChange = (index: number, value: string, type: 'content' | 'mural') => {
    if (type === 'content') {
      const newImages = [...(post.galleryImages || ['', '', '', '', '', ''])];
      newImages[index] = value;
      setPost({ ...post, galleryImages: newImages });
    } else {
      const newPhotos = [...(muralPost.photos || ['', '', '', '', '', ''])];
      newPhotos[index] = value;
      setMuralPost({ ...muralPost, photos: newPhotos });
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-adventist-blue rounded-[3rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <Lock size={40} className="text-adventist-yellow" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Acesso Restrito</h2>
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && passwordInput === ADMIN_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem(ADMIN_AUTH_KEY, 'true'); } }} placeholder="Senha" className="w-full p-4 rounded-2xl text-center outline-none focus:ring-2 focus:ring-adventist-yellow bg-white text-slate-900" />
          <button onClick={() => { if (passwordInput === ADMIN_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem(ADMIN_AUTH_KEY, 'true'); } else { alert('Senha incorreta!'); } }} className="w-full bg-adventist-yellow text-adventist-blue font-black py-4 rounded-2xl active:scale-95 transition-transform">Acessar Painel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold hover:underline"><ArrowLeft size={20} /> Voltar</button>
        <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border border-green-500/20 flex items-center gap-2"><ShieldCheck size={14} /> Modo Admin</div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white flex gap-4 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('content')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><FileText size={16} /> Materiais</button>
          <button onClick={() => setActiveTab('mural')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Camera size={16} /> Mural</button>
          <button onClick={() => setActiveTab('news')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'news' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Newspaper size={16} /> Curadoria</button>
          <button onClick={() => setActiveTab('vids')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'vids' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><PlayCircle size={16} /> Vídeos</button>
          <button onClick={() => { sessionStorage.removeItem(ADMIN_AUTH_KEY); setIsAuthenticated(false); }} className="ml-auto shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">Sair</button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {(activeTab === 'news' || activeTab === 'vids' || (activeTab === 'content' && post.resource === 'Vídeo')) && (
              <div className="p-6 bg-adventist-blue/5 rounded-2xl border-2 border-dashed border-adventist-blue/20">
                <label className="text-[10px] font-bold uppercase block mb-2 text-adventist-blue">Ferramenta de IA: Extrair do Link</label>
                <div className="flex gap-2">
                  <input type="text" value={aiLink} onChange={e => setAiLink(e.target.value)} placeholder="Cole o URL do YouTube ou Artigo..." className="flex-1 p-3 rounded-xl border bg-white text-slate-900 border-slate-200 outline-none focus:ring-2 focus:ring-adventist-blue" />
                  <button type="button" onClick={activeTab === 'news' ? handleAiNews : handleAiVideo} disabled={isAiLoading} className="bg-adventist-blue text-white px-6 rounded-xl font-bold flex items-center gap-2">
                    {isAiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} Extrair
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <select value={post.level} onChange={e => setPost({...post, level: e.target.value as EducationLevel, grade: ''})} className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={post.grade} onChange={e => setPost({...post, grade: e.target.value})} className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue">
                  <option value="">Série...</option>
                  {(GRADES_BY_LEVEL[post.level as EducationLevel] || []).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={post.bimester} onChange={e => setPost({...post, bimester: e.target.value as Bimester})} className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue">
                  {BIMESTERS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select value={post.resource} onChange={e => setPost({...post, resource: e.target.value as ResourceType})} className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue">
                  {RESOURCE_TYPES.map(r => <option key={r.type} value={r.type}>{r.type}</option>)}
                </select>
              </div>
            )}

            {activeTab === 'mural' && (
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Nome do Professor" value={muralPost.teacherName} onChange={e => setMuralPost({...muralPost, teacherName: e.target.value})} className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 outline-none focus:ring-2 focus:ring-adventist-blue" />
                <input type="text" placeholder="Nome da Escola" value={muralPost.schoolName} onChange={e => setMuralPost({...muralPost, schoolName: e.target.value})} className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 outline-none focus:ring-2 focus:ring-adventist-blue" />
              </div>
            )}

            <input 
              type="text" 
              placeholder="Título" 
              value={activeTab === 'content' ? post.title : activeTab === 'mural' ? muralPost.workTitle : activeTab === 'news' ? newsPost.title : vidPost.titulo} 
              onChange={e => {
                const val = e.target.value;
                if(activeTab === 'content') setPost({...post, title: val});
                else if(activeTab === 'mural') setMuralPost({...muralPost, workTitle: val});
                else if(activeTab === 'news') setNewsPost({...newsPost, title: val});
                else setVidPost({...vidPost, titulo: val});
              }}
              className="w-full p-4 rounded-xl border bg-white text-slate-900 border-slate-200 font-bold outline-none focus:ring-2 focus:ring-adventist-blue" 
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-t-xl border-b-0 text-slate-700">
                <div className="flex items-center border-r border-slate-300 pr-2 mr-1">
                  <button type="button" onClick={() => execCommand('bold', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Negrito"><Bold size={18}/></button>
                  <button type="button" onClick={() => execCommand('italic', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Itálico"><Italic size={18}/></button>
                  <button type="button" onClick={() => execCommand('underline', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Sublinhado"><Underline size={18}/></button>
                  <button type="button" onClick={() => execCommand('strikeThrough', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Riscado"><Strikethrough size={18}/></button>
                </div>
                
                <div className="flex items-center border-r border-slate-300 pr-2 mr-1">
                  <button type="button" onClick={() => execCommand('justifyLeft', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Esquerda"><AlignLeft size={18}/></button>
                  <button type="button" onClick={() => execCommand('justifyCenter', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Centro"><AlignCenter size={18}/></button>
                  <button type="button" onClick={() => execCommand('justifyRight', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Direita"><AlignRight size={18}/></button>
                  <button type="button" onClick={() => execCommand('justifyFull', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Justificado"><AlignJustify size={18}/></button>
                </div>

                <div className="flex items-center border-r border-slate-300 pr-2 mr-1">
                  <button type="button" onClick={() => execCommand('insertUnorderedList', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Lista"><List size={18}/></button>
                  <button type="button" onClick={() => execCommand('insertOrderedList', '', activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded" title="Lista Numérica"><ListOrdered size={18}/></button>
                </div>

                <div className="flex items-center">
                  <button type="button" onClick={() => insertImage(activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef)} className="p-2 hover:bg-slate-200 rounded text-adventist-blue" title="Adicionar Imagem"><ImageIcon size={18}/></button>
                  <button type="button" onClick={() => { const id = prompt('Cole o ID do vídeo do YouTube:'); if(id) insertEmbedCode(`[youtube]${id}[/youtube]`, activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef); }} className="p-2 hover:bg-slate-200 rounded text-red-600" title="YouTube Embed"><Youtube size={18}/></button>
                  <button type="button" onClick={() => { const url = prompt('Cole o ID ou link da Playlist do Spotify:'); if(url) insertEmbedCode(`[spotify]${url}[/spotify]`, activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef); }} className="p-2 hover:bg-slate-200 rounded text-green-600" title="Spotify Embed"><Music size={18}/></button>
                </div>
              </div>
              <div 
                ref={activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef} 
                contentEditable 
                className="w-full min-h-[350px] p-6 rounded-b-xl border border-slate-200 outline-none bg-white text-slate-900 prose prose-slate max-w-none shadow-inner" 
              />
            </div>

            {(activeTab === 'content' || activeTab === 'mural') && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ImageIcon size={16}/> Galeria de Imagens (Máx 6)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2, 3, 4, 5].map(idx => (
                    <div key={idx} className="relative">
                      <input 
                        type="text" 
                        placeholder={`URL da Imagem ${idx + 1}`} 
                        value={activeTab === 'content' ? (post.galleryImages?.[idx] || '') : (muralPost.photos?.[idx] || '')}
                        onChange={e => handleImageChange(idx, e.target.value, activeTab === 'content' ? 'content' : 'mural')}
                        className="w-full p-3 pl-10 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-1 focus:ring-adventist-blue"
                      />
                      <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={status === 'saving'} className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all">
              {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : editingId ? 'Salvar Alterações' : 'Publicar Conteúdo'}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-sm font-black text-adventist-blue dark:text-adventist-yellow uppercase mb-6 flex items-center justify-between">
              Itens Publicados Recentemente
              <button onClick={loadData} className="p-2 text-slate-400 hover:text-adventist-blue transition-colors"><RefreshCw size={18}/></button>
            </h4>
            
            <div className="space-y-4">
              {activeTab === 'content' ? (
                Object.keys(groupedMaterials).sort().map(level => (
                  <div key={level} className="space-y-2">
                    <button onClick={() => toggleLevelExpansion(level)} className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                      {level} {expandedLevels[level] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {expandedLevels[level] && (
                      <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        {Object.keys(groupedMaterials[level]).map(grade => (
                          <div key={grade} className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase p-2">{grade}</p>
                            <div className="space-y-1">
                              {groupedMaterials[level][grade].map(mat => (
                                <div key={mat.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{mat.titulo}</span>
                                  <div className="flex gap-2">
                                    <button onClick={() => { setEditingId(mat.id); setPost({title: mat.titulo, level: mat.nivel, grade: mat.serie, bimester: mat.bimestre, resource: mat.tipo_recurso, video_url: mat.video_url, galleryImages: mat.imagens_galeria || []}); if(editorRef.current) editorRef.current.innerHTML = mat.conteudo; window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={14}/></button>
                                    <button onClick={async () => { if(confirm('Excluir este material?')) { await supabase.from('materiais_pedagogicos').delete().eq('id', mat.id); loadData(); } }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                (activeTab === 'mural' ? recentMuralPosts : activeTab === 'news' ? recentNews : recentVideos).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl hover:border-adventist-blue/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{item.nivel || item.categoria || 'Destaque'}</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.titulo || item.titulo_trabalho || item.titulo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => { 
                        const table = activeTab === 'mural' ? 'mural_posts' : activeTab === 'news' ? 'curated_news' : 'videos_curadoria';
                        if(confirm('Deseja excluir este item permanentemente?')) {
                          await supabase.from(table).delete().eq('id', item.id);
                          loadData();
                        }
                      }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
