import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ArrowLeft, Camera, Loader2, Plus, Lock, 
  ShieldCheck, Edit2, RefreshCw, Bold, Italic, Underline, List, ListOrdered, AlignCenter, 
  AlignLeft, AlignRight, AlignJustify, Strikethrough, ChevronDown, ChevronUp, Trash2, 
  Youtube, Music, Image as ImageIcon, Sparkles, Newspaper, PlayCircle, Link as LinkIcon,
  Upload, Heading1, Heading2, Link
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
  const vidsEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetEditor, setTargetEditor] = useState<React.RefObject<HTMLDivElement> | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [recentMuralPosts, setRecentMuralPosts] = useState<any[]>([]);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  const [post, setPost] = useState<Partial<ManualPost & { galleryImages: string[] }>>({
    level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '', video_url: '', galleryImages: ['', '', '', '', '', '']
  });
  const [muralPost, setMuralPost] = useState<Partial<MuralPost>>({
    teacherName: '', schoolName: '', level: 'Educação Infantil', grade: '', bimester: 'Anual', workTitle: '', description: '', photos: ['', '', '', '', '', '']
  });
  const [newsPost, setNewsPost] = useState<Partial<NewsItem>>({
    title: '', summary: '', content: '', imageUrl: '', externalUrl: '', category: 'Matéria', type: 'external', level: 'Educação Infantil', grade: '', bimester: 'Anual'
  });
  const [vidPost, setVidPost] = useState<any>({
    titulo: '', resumo: '', url_video: '', video_id: '', level: 'Educação Infantil', grade: '', bimester: 'Anual'
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

  const groupItemsByLevelAndGrade = (items: any[]) => {
    return items.reduce((acc: Record<string, Record<string, any[]>>, item) => {
      const level = item.nivel || item.level || 'Outros';
      const grade = item.serie || item.grade || 'Outros';
      if (!acc[level]) acc[level] = {};
      if (!acc[level][grade]) acc[level][grade] = [];
      acc[level][grade].push(item);
      return acc;
    }, {});
  };

  const toggleLevelExpansion = (level: string) => {
    setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const execCommand = (command: string, value: string = "", ref: React.RefObject<HTMLDivElement> | null) => {
    if (!ref || !ref.current) return;
    document.execCommand(command, false, value);
    ref.current.focus();
  };

  const handleAiExtraction = async () => {
    if (!aiLink) return alert("Insira o link.");
    setIsAiLoading(true);
    try {
      if (activeTab === 'news') {
        const metadata = await getNewsMetadata(aiLink);
        setNewsPost(prev => ({ ...prev, title: metadata.title, summary: metadata.summary, category: metadata.category as any, externalUrl: aiLink, type: 'external' }));
        if (newsEditorRef.current) newsEditorRef.current.innerHTML = `<h1>${metadata.title}</h1><p>${metadata.summary}</p>`;
      } else {
        const metadata = await getVideoMetadata(aiLink);
        if (activeTab === 'content') {
          setPost(prev => ({ ...prev, title: metadata.title, video_url: aiLink }));
          if (editorRef.current) editorRef.current.innerHTML = `<p>${metadata.summary}</p><p>[youtube]${metadata.videoId}[/youtube]</p>`;
        } else if (activeTab === 'vids') {
          setVidPost(prev => ({ ...prev, titulo: metadata.title, url_video: aiLink, video_id: metadata.videoId }));
          if (vidsEditorRef.current) vidsEditorRef.current.innerHTML = metadata.summary;
        }
      }
      setAiLink('');
    } catch (e: any) { alert("Erro ao processar: " + (e.message || "Tente novamente.")); } finally { setIsAiLoading(false); }
  };

  const insertEmbedCode = (code: string, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    ref.current.focus();
    document.execCommand('insertHTML', false, code);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      let table = '', payload = {};
      if (activeTab === 'content') {
        table = 'materiais_pedagogicos';
        payload = { titulo: post.title, nivel: post.level, serie: post.grade, bimestre: post.bimester, tipo_recurso: post.resource, conteudo: editorRef.current?.innerHTML, video_url: post.video_url, imagens_galeria: post.galleryImages?.filter(url => !!url) || [] };
      } else if (activeTab === 'mural') {
        table = 'mural_posts';
        payload = { professor_nome: muralPost.teacherName, escola_nome: muralPost.schoolName, nivel: muralPost.level, serie: muralPost.grade, bimestre: muralPost.bimester, titulo_trabalho: muralPost.workTitle, descricao: muralEditorRef.current?.innerHTML, fotos: muralPost.photos?.filter(url => !!url) || [] };
      } else if (activeTab === 'news') {
        table = 'curated_news';
        payload = { titulo: newsPost.title, resumo: newsPost.summary, conteudo: newsEditorRef.current?.innerHTML, imagem_url: newsPost.imageUrl, url_externa: newsPost.externalUrl, tipo: newsPost.type, categoria: newsPost.category, nivel: newsPost.level, serie: newsPost.grade, bimestre: newsPost.bimester };
      } else {
        table = 'videos_curadoria';
        const vId = vidPost.url_video.split('v=')[1]?.split('&')[0] || vidPost.url_video.split('be/')[1] || '';
        payload = { titulo: vidPost.titulo, url_video: vidPost.url_video, video_id: vId, resumo: vidsEditorRef.current?.innerHTML, nivel: vidPost.level, serie: vidPost.grade, bimestre: vidPost.bimester };
      }

      const { error } = editingId ? await supabase.from(table).update(payload).eq('id', editingId) : await supabase.from(table).insert([payload]);
      if (error) throw error;
      setStatus('success');
      loadData();
      setEditingId(null);
      // Limpar formulários
      setAiLink('');
      if (activeTab === 'vids') { setVidPost({ titulo: '', url_video: '', level: 'Educação Infantil', grade: '', bimester: 'Anual' }); if (vidsEditorRef.current) vidsEditorRef.current.innerHTML = ''; }
      if (activeTab === 'news') { setNewsPost({ title: '', summary: '', category: 'Matéria', type: 'external', level: 'Educação Infantil', grade: '', bimester: 'Anual' }); if (newsEditorRef.current) newsEditorRef.current.innerHTML = ''; }
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

  const getCurrentEditorRef = () => {
    if (activeTab === 'news') return newsEditorRef;
    if (activeTab === 'mural') return muralEditorRef;
    if (activeTab === 'vids') return vidsEditorRef;
    return editorRef;
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
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && targetEditor) {
          const reader = new FileReader();
          reader.onload = (event) => execCommand('insertImage', event.target?.result as string, targetEditor);
          reader.readAsDataURL(file);
        }
        e.target.value = '';
      }} className="hidden" accept="image/*" />
      
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold hover:underline"><ArrowLeft size={20} /> Voltar</button>
        <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border border-green-500/20 flex items-center gap-2"><ShieldCheck size={14} /> Modo Admin</div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white flex gap-4 overflow-x-auto no-scrollbar">
          <button onClick={() => {setActiveTab('content'); setEditingId(null);}} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><FileText size={16} /> Materiais</button>
          <button onClick={() => {setActiveTab('mural'); setEditingId(null);}} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Camera size={16} /> Mural</button>
          <button onClick={() => {setActiveTab('news'); setEditingId(null);}} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'news' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Newspaper size={16} /> Curadoria</button>
          <button onClick={() => {setActiveTab('vids'); setEditingId(null);}} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'vids' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><PlayCircle size={16} /> Vídeos</button>
          <button onClick={() => { sessionStorage.removeItem(ADMIN_AUTH_KEY); setIsAuthenticated(false); }} className="ml-auto shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">Sair</button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-6 bg-adventist-blue/5 rounded-2xl border-2 border-dashed border-adventist-blue/20">
              <label className="text-[10px] font-bold uppercase block mb-2 text-adventist-blue">Extração de Dados (YouTube/Link)</label>
              <div className="flex gap-2">
                <input type="text" value={aiLink} onChange={e => setAiLink(e.target.value)} placeholder="Cole o URL aqui..." className="flex-1 p-3 rounded-xl border bg-white text-slate-900 border-slate-200 outline-none focus:ring-2 focus:ring-adventist-blue" />
                <button type="button" onClick={handleAiExtraction} disabled={isAiLoading} className="bg-adventist-blue text-white px-6 rounded-xl font-bold flex items-center gap-2 shrink-0">
                  {isAiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} Extrair
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <select 
                value={activeTab === 'content' ? post.level : activeTab === 'mural' ? muralPost.level : activeTab === 'news' ? newsPost.level : vidPost.level} 
                onChange={e => {
                  const v = e.target.value as EducationLevel;
                  if(activeTab === 'content') setPost({...post, level: v, grade: ''});
                  else if(activeTab === 'mural') setMuralPost({...muralPost, level: v, grade: ''});
                  else if(activeTab === 'news') setNewsPost({...newsPost, level: v, grade: ''});
                  else setVidPost({...vidPost, level: v, grade: ''});
                }} 
                className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue"
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select 
                value={activeTab === 'content' ? post.grade : activeTab === 'mural' ? muralPost.grade : activeTab === 'news' ? newsPost.grade : vidPost.grade} 
                onChange={e => {
                  const v = e.target.value;
                  if(activeTab === 'content') setPost({...post, grade: v});
                  else if(activeTab === 'mural') setMuralPost({...muralPost, grade: v});
                  else if(activeTab === 'news') setNewsPost({...newsPost, grade: v});
                  else setVidPost({...vidPost, grade: v});
                }} 
                className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue"
              >
                <option value="">Série...</option>
                {(GRADES_BY_LEVEL[(activeTab === 'content' ? post.level : activeTab === 'mural' ? muralPost.level : activeTab === 'news' ? newsPost.level : vidPost.level) as EducationLevel] || []).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select 
                value={activeTab === 'content' ? post.bimester : activeTab === 'mural' ? muralPost.bimester : activeTab === 'news' ? newsPost.bimester : vidPost.bimester} 
                onChange={e => {
                  const v = e.target.value as Bimester;
                  if(activeTab === 'content') setPost({...post, bimester: v});
                  else if(activeTab === 'mural') setMuralPost({...muralPost, bimester: v});
                  else if(activeTab === 'news') setNewsPost({...newsPost, bimester: v});
                  else setVidPost({...vidPost, bimester: v});
                }} 
                className="p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue"
              >
                {BIMESTERS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {activeTab === 'content' && (
              <select value={post.resource} onChange={e => setPost({...post, resource: e.target.value as ResourceType})} className="w-full p-3 rounded-xl border bg-white text-slate-900 border-slate-200 text-sm outline-none focus:ring-2 focus:ring-adventist-blue">
                {RESOURCE_TYPES.map(r => <option key={r.type} value={r.type}>{r.type}</option>)}
              </select>
            )}

            {(activeTab === 'vids' || activeTab === 'news') && (
              <input type="text" placeholder="Link (YouTube ou Externo)" value={activeTab === 'news' ? newsPost.externalUrl : vidPost.url_video} onChange={e => activeTab === 'news' ? setNewsPost({...newsPost, externalUrl: e.target.value}) : setVidPost({...vidPost, url_video: e.target.value})} className="w-full p-4 rounded-xl border bg-white text-slate-900 border-slate-200 font-bold outline-none focus:ring-2 focus:ring-adventist-blue" />
            )}

            <input type="text" placeholder="Título" value={activeTab === 'content' ? post.title : activeTab === 'mural' ? muralPost.workTitle : activeTab === 'news' ? newsPost.title : vidPost.titulo} 
              onChange={e => {
                const v = e.target.value;
                if(activeTab === 'content') setPost({...post, title: v});
                else if(activeTab === 'mural') setMuralPost({...muralPost, workTitle: v});
                else if(activeTab === 'news') setNewsPost({...newsPost, title: v});
                else setVidPost({...vidPost, titulo: v});
              }}
              className="w-full p-4 rounded-xl border bg-white text-slate-900 border-slate-200 font-bold outline-none focus:ring-2 focus:ring-adventist-blue" />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-t-xl border-b-0 text-slate-700">
                <button type="button" onClick={() => execCommand('bold', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><Bold size={18}/></button>
                <button type="button" onClick={() => execCommand('italic', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><Italic size={18}/></button>
                <button type="button" onClick={() => execCommand('underline', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><Underline size={18}/></button>
                <button type="button" onClick={() => execCommand('strikeThrough', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><Strikethrough size={18}/></button>
                <div className="h-6 w-px bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => execCommand('formatBlock', 'h1', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><Heading1 size={18}/></button>
                <button type="button" onClick={() => execCommand('formatBlock', 'h2', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><Heading2 size={18}/></button>
                <div className="h-6 w-px bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => execCommand('justifyLeft', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><AlignLeft size={18}/></button>
                <button type="button" onClick={() => execCommand('justifyCenter', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><AlignCenter size={18}/></button>
                <button type="button" onClick={() => execCommand('justifyRight', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><AlignRight size={18}/></button>
                <button type="button" onClick={() => execCommand('justifyFull', '', getCurrentEditorRef())} className="p-2 hover:bg-slate-200 rounded"><AlignJustify size={18}/></button>
                <div className="h-6 w-px bg-slate-300 mx-1"></div>
                <button type="button" onClick={() => { const url = prompt('Cole o Link:'); if(url) execCommand('createLink', url, getCurrentEditorRef()); }} className="p-2 hover:bg-slate-200 rounded"><LinkIcon size={18}/></button>
                <button type="button" onClick={() => { setTargetEditor(getCurrentEditorRef()); fileInputRef.current?.click(); }} className="p-2 hover:bg-slate-200 rounded text-adventist-blue flex items-center gap-1"><Upload size={18}/><span className="text-[10px] font-bold">Imagem</span></button>
                <button type="button" onClick={() => { const id = prompt('ID do YouTube:'); if(id) insertEmbedCode(`[youtube]${id}[/youtube]`, getCurrentEditorRef()!); }} className="p-2 hover:bg-slate-200 rounded text-red-600"><Youtube size={18}/></button>
                <button type="button" onClick={() => { const url = prompt('ID do Spotify:'); if(url) insertEmbedCode(`[spotify]${url}[/spotify]`, getCurrentEditorRef()!); }} className="p-2 hover:bg-slate-200 rounded text-green-600"><Music size={18}/></button>
              </div>
              <div ref={getCurrentEditorRef()} contentEditable className="w-full min-h-[350px] p-6 rounded-b-xl border border-slate-200 outline-none bg-white text-slate-900 prose prose-slate max-w-none shadow-inner" />
            </div>

            {(activeTab === 'content' || activeTab === 'mural') && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ImageIcon size={16}/> Galeria de Imagens (URLs)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3, 4, 5].map(idx => (
                    <input key={idx} type="text" placeholder={`URL da Imagem ${idx + 1}`} value={activeTab === 'content' ? (post.galleryImages?.[idx] || '') : (muralPost.photos?.[idx] || '')}
                      onChange={e => handleImageChange(idx, e.target.value, activeTab === 'content' ? 'content' : 'mural')}
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-900" />
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={status === 'saving'} className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all">
              {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : editingId ? 'Salvar Alterações' : 'Publicar'}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-sm font-black text-adventist-blue dark:text-adventist-yellow uppercase mb-6 flex items-center justify-between">
              Itens Publicados Recentemente
              <button onClick={loadData} className="p-2 text-slate-400 hover:text-adventist-blue transition-colors"><RefreshCw size={18}/></button>
            </h4>
            
            {Object.entries(groupItemsByLevelAndGrade(activeTab === 'content' ? recentMaterials : activeTab === 'mural' ? recentMuralPosts : activeTab === 'news' ? recentNews : recentVideos)).sort().map(([level, grades]) => (
              <div key={level} className="mb-4">
                <button onClick={() => toggleLevelExpansion(level)} className="w-full flex items-center justify-between p-4 bg-white dark:bg-white rounded-2xl font-bold text-xs uppercase hover:bg-slate-50 transition-colors border border-slate-200">
                  <span className="text-adventist-blue">{level}</span>
                  <span className="text-adventist-blue">{expandedLevels[level] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</span>
                </button>
                {expandedLevels[level] && (
                  <div className="pl-4 space-y-2 mt-2">
                    {Object.entries(grades).map(([grade, items]) => (
                      <div key={grade}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase p-2">{grade}</p>
                        <div className="space-y-1">
                          {items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                              <span className="text-xs font-bold text-adventist-blue">{item.titulo || item.titulo_trabalho || item.title}</span>
                              <div className="flex gap-2">
                                <button onClick={() => {
                                  setEditingId(item.id);
                                  if(activeTab === 'content') {
                                    setPost({title: item.titulo, level: item.nivel, grade: item.serie, bimester: item.bimestre, resource: item.tipo_recurso, video_url: item.video_url, galleryImages: item.imagens_galeria || []});
                                    if(editorRef.current) editorRef.current.innerHTML = item.conteudo;
                                  } else if (activeTab === 'mural') {
                                    setMuralPost({workTitle: item.titulo_trabalho, teacherName: item.professor_nome, schoolName: item.escola_nome, level: item.nivel, grade: item.serie, bimester: item.bimestre, photos: item.fotos || []});
                                    if(muralEditorRef.current) muralEditorRef.current.innerHTML = item.descricao;
                                  } else if (activeTab === 'news') {
                                    setNewsPost({title: item.titulo, summary: item.resumo, category: item.categoria, externalUrl: item.url_externa, type: item.tipo, level: item.nivel, grade: item.serie, bimester: item.bimestre});
                                    if(newsEditorRef.current) newsEditorRef.current.innerHTML = item.conteudo;
                                  } else {
                                    setVidPost({titulo: item.titulo, url_video: item.url_video, level: item.nivel, grade: item.serie, bimester: item.bimestre});
                                    if(vidsEditorRef.current) vidsEditorRef.current.innerHTML = item.resumo;
                                  }
                                  window.scrollTo({top: 0, behavior: 'smooth'});
                                }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={14}/></button>
                                <button onClick={async () => { 
                                  const table = activeTab === 'content' ? 'materiais_pedagogicos' : activeTab === 'mural' ? 'mural_posts' : activeTab === 'news' ? 'curated_news' : 'videos_curadoria';
                                  if(confirm('Excluir?')) { await supabase.from(table).delete().eq('id', item.id); loadData(); } 
                                }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
