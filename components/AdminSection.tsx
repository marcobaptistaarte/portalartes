
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ArrowLeft, Camera, Loader2, Plus, Lock, 
  Eye, EyeOff, ShieldCheck, Edit2, X, RefreshCw, Bold, Italic, Underline, List, AlignCenter, 
  AlignRight, AlignJustify, Strikethrough, Heading1, Heading2, ChevronDown, ChevronUp, Trash2, AlertTriangle, 
  Link as LinkIcon, Youtube, Music, Image as ImageIcon, Sparkles, School, User, PlayCircle, Newspaper
} from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType, MuralPost } from '../types';
import { supabase } from '../supabaseClient';
import { getVideoMetadata, getNewsMetadata } from '../geminiService';

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural' | 'news' | 'vids';
const ADMIN_PASSWORD = 'Schssel01';
const ADMIN_AUTH_KEY = 'portal_artes_admin_auth';

const AdminSection: React.FC<AdminSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const muralEditorRef = useRef<HTMLDivElement>(null);
  const newsEditorRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  // States para Formulários
  const [post, setPost] = useState<any>({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '', video_url: '', imagens_galeria: [] });
  const [muralPost, setMuralPost] = useState<any>({ teacherName: '', schoolName: '', level: 'Educação Infantil', grade: '', workTitle: '', description: '', photos: [] });
  const [newsPost, setNewsPost] = useState<any>({ title: '', summary: '', content: '', imageUrl: '', externalUrl: '', category: 'Notícia', type: 'internal' });
  const [vidPost, setVidPost] = useState<any>({ title: '', summary: '', snippet: '', videoUrl: '', videoId: '', imageFallback: '' });

  const [aiLink, setAiLink] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true') setIsAuthenticated(true);
  }, []);

  const loadListData = async () => {
    setIsLoadingList(true);
    let table = activeTab === 'content' ? 'materiais_pedagogicos' : activeTab === 'mural' ? 'mural_posts' : activeTab === 'news' ? 'curated_news' : 'videos_curadoria';
    const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    setListData(data || []);
    setIsLoadingList(false);
  };

  useEffect(() => { if (isAuthenticated) loadListData(); }, [isAuthenticated, activeTab]);

  // IA Handlers
  const handleAiVideo = async () => {
    if (!aiLink) return alert("Cole o link!");
    setIsAiLoading(true);
    try {
      const data = await getVideoMetadata(aiLink);
      const target = activeTab === 'content' ? setPost : setVidPost;
      target((prev: any) => ({ ...prev, title: data.title, summary: data.summary, snippet: data.snippet, videoId: data.videoId, videoUrl: aiLink }));
      if (activeTab === 'content' && editorRef.current) {
        editorRef.current.innerHTML = `<h1>${data.title}</h1><p>${data.summary}</p><h3>Pontos Principais</h3><p>${data.snippet}</p><div class="youtube-placeholder" data-url="${data.videoId}">📹 Vídeo: ${data.videoId}</div>`;
      }
    } catch (e) { alert("Erro ao processar."); } finally { setIsAiLoading(false); }
  };

  const handleAiNews = async () => {
    if (!aiLink) return alert("Cole o link!");
    setIsAiLoading(true);
    try {
      const data = await getNewsMetadata(aiLink);
      setNewsPost((prev: any) => ({ ...prev, title: data.title, summary: data.summary, snippet: data.snippet, category: data.category, externalUrl: aiLink, type: 'external' }));
      if (newsEditorRef.current) newsEditorRef.current.innerHTML = `<h1>${data.title}</h1><p>${data.summary}</p><h3>Snippet</h3><p>${data.snippet}</p>`;
    } catch (e) { alert("Erro ao processar."); } finally { setIsAiLoading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      let table = '', payload = {};
      if (activeTab === 'content') {
        table = 'materiais_pedagogicos';
        payload = { ...post, titulo: post.title, nivel: post.level, serie: post.grade, bimestre: post.bimester, tipo_recurso: post.resource, conteudo: editorRef.current?.innerHTML };
      } else if (activeTab === 'mural') {
        table = 'mural_posts';
        payload = { professor_nome: muralPost.teacherName, escola_nome: muralPost.schoolName, nivel: muralPost.level, serie: muralPost.grade, titulo_trabalho: muralPost.workTitle, descricao: muralEditorRef.current?.innerHTML, fotos: muralPost.photos };
      } else if (activeTab === 'news') {
        table = 'curated_news';
        payload = { titulo: newsPost.title, resumo: newsPost.summary, conteudo: newsEditorRef.current?.innerHTML || newsPost.content, imagem_url: newsPost.imageUrl, url_externa: newsPost.externalUrl, tipo: newsPost.type, categoria: newsPost.category };
      } else {
        table = 'videos_curadoria';
        payload = { titulo: vidPost.title, resumo: vidPost.summary, snippet: vidPost.snippet, url_video: vidPost.videoUrl, video_id: vidPost.videoId, imagem_fallback: vidPost.imageFallback };
      }

      const { error } = editingId ? await supabase.from(table).update(payload).eq('id', editingId) : await supabase.from(table).insert([payload]);
      if (error) throw error;
      setStatus('success');
      loadListData();
      setEditingId(null);
    } catch (err: any) { setStatus('error'); setErrorMessage(err.message); }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-adventist-blue p-4">
      <div className="bg-white p-10 rounded-3xl w-full max-w-sm text-center">
        <Lock className="mx-auto mb-6 text-adventist-blue" size={48} />
        <h2 className="text-xl font-bold mb-4">Acesso Administrativo</h2>
        <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha" className="w-full p-4 border rounded-xl mb-4 text-center" />
        <button onClick={() => { if (passwordInput === ADMIN_PASSWORD) { setIsAuthenticated(true); sessionStorage.setItem(ADMIN_AUTH_KEY, 'true'); } }} className="w-full bg-adventist-blue text-white py-4 rounded-xl font-bold">Entrar</button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setActiveTab('content')} className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-slate-100'}`}><FileText size={16}/> Atividades</button>
        <button onClick={() => setActiveTab('mural')} className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-slate-100'}`}><Camera size={16}/> Mural</button>
        <button onClick={() => setActiveTab('news')} className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 ${activeTab === 'news' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-slate-100'}`}><Newspaper size={16}/> Notícias/Artigos</button>
        <button onClick={() => setActiveTab('vids')} className={`shrink-0 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 ${activeTab === 'vids' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-slate-100'}`}><PlayCircle size={16}/> Vídeos</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {(activeTab === 'news' || activeTab === 'vids' || (activeTab === 'content' && post.resource === 'Vídeo')) && (
            <div className="p-6 bg-adventist-blue/5 rounded-2xl border-2 border-dashed border-adventist-blue/20">
              <label className="text-[10px] font-bold uppercase block mb-2 text-adventist-blue">Ferramenta de IA: Extrair do Link</label>
              <div className="flex gap-2">
                <input type="text" value={aiLink} onChange={e => setAiLink(e.target.value)} placeholder="Cole o URL aqui..." className="flex-1 p-3 rounded-xl border" />
                <button type="button" onClick={activeTab === 'news' ? handleAiNews : handleAiVideo} disabled={isAiLoading} className="bg-adventist-blue text-white px-6 rounded-xl font-bold flex items-center gap-2">
                  {isAiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} IA
                </button>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="grid grid-cols-2 gap-4">
              <select value={newsPost.category} onChange={e => setNewsPost({...newsPost, category: e.target.value})} className="p-3 rounded-xl border">
                <option value="Notícia">Notícia</option>
                <option value="Artigo">Artigo</option>
              </select>
              <input type="text" placeholder="URL da Imagem de Capa" value={newsPost.imageUrl} onChange={e => setNewsPost({...newsPost, imageUrl: e.target.value})} className="p-3 rounded-xl border" />
            </div>
          )}

          <input type="text" placeholder="Título" value={activeTab === 'news' ? newsPost.title : activeTab === 'vids' ? vidPost.title : post.title} className="w-full p-4 rounded-xl border font-bold" />
          
          {/* Campo fallbacks de imagem */}
          {activeTab === 'vids' && <input type="text" placeholder="Link da Imagem (Fallback)" value={vidPost.imageFallback} onChange={e => setVidPost({...vidPost, imageFallback: e.target.value})} className="w-full p-3 rounded-xl border" />}

          <div className="min-h-[200px] p-6 border rounded-xl" ref={activeTab === 'news' ? newsEditorRef : activeTab === 'mural' ? muralEditorRef : editorRef} contentEditable />

          <button type="submit" disabled={status === 'saving'} className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold uppercase tracking-widest shadow-lg">
            {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : 'Salvar Conteúdo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSection;
