
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ArrowLeft, Camera, Loader2, Plus, Lock, 
  Eye, EyeOff, ShieldCheck, Edit2, X, RefreshCw, Bold, Italic, Underline, List, AlignCenter, 
  AlignRight, AlignJustify, Strikethrough, Heading1, Heading2, ChevronDown, ChevronUp, Trash2, AlertTriangle, 
  Link as LinkIcon, Youtube, Music, Image as ImageIcon, Sparkles, School, User
} from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType, MuralPost } from '../types';
import { supabase } from '../supabaseClient';
import { getVideoMetadata } from '../geminiService';

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural';
const ADMIN_PASSWORD = 'Schssel01';
const ADMIN_AUTH_KEY = 'portal_artes_admin_auth';

const AdminSection: React.FC<AdminSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const muralEditorRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [recentMuralPosts, setRecentMuralPosts] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});

  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);

  // States for Content and Mural
  const [post, setPost] = useState<Partial<ManualPost>>({
    level: 'Educação Infantil',
    grade: '',
    bimester: '1º bimestre',
    resource: 'Conteúdo',
    title: '',
    content: '',
    video_url: ''
  });

  const [muralPost, setMuralPost] = useState<Partial<MuralPost>>({
    teacherName: '',
    schoolName: '',
    level: 'Educação Infantil',
    grade: '',
    workTitle: '',
    description: '',
    photos: []
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const loadData = async () => {
    setIsLoadingMaterials(true);
    try {
      const { data: materials } = await supabase.from('materiais_pedagogicos').select('*').order('created_at', { ascending: false });
      setRecentMaterials(materials || []);
      
      const { data: murals } = await supabase.from('mural_posts').select('*').order('created_at', { ascending: false });
      setRecentMuralPosts(murals || []);
    } catch (err) { console.error(err); } finally { setIsLoadingMaterials(false); }
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, activeTab]);

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

  const toggleGradeExpansion = (level: string, grade: string) => {
    const key = `${level}-${grade}`;
    setExpandedGrades(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Content Handlers
  const handleAnalyzeVideo = async () => {
    if (!videoLinkInput) return alert("Insira o link do YouTube primeiro.");
    setIsAnalyzingVideo(true);
    try {
      const metadata = await getVideoMetadata(videoLinkInput);
      setPost(prev => ({ ...prev, title: metadata.title, video_url: videoLinkInput }));
      
      const contentHtml = `
        <h1>${metadata.title}</h1>
        <p>${metadata.summary}</p>
        <p><strong>Principais tópicos:</strong></p>
        <p>${metadata.snippet}</p>
        <div class="youtube-placeholder" data-url="${metadata.videoId}" contenteditable="false" style="background: #eee; padding: 20px; text-align: center; border-radius: 10px; margin: 10px 0; border: 2px dashed #ccc;">📹 Vídeo YouTube: ${metadata.videoId}</div>
        <p><br></p>
      `;
      if (editorRef.current) editorRef.current.innerHTML = contentHtml;
    } catch (err) {
      alert("Erro ao analisar vídeo. Verifique o link.");
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  const portalTagsToHtml = (text: string) => {
    if (!text) return "";
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<strike>$1</strike>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/# (.*?)\n/g, '<h1>$1</h1>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align: center;">$1</div>')
      .replace(/\[right\](.*?)\[\/right\]/g, '<div style="text-align: right;">$1</div>')
      .replace(/\[justify\](.*?)\[\/justify\]/g, '<div style="text-align: justify;">$1</div>')
      .replace(/\[youtube\](.*?)\[\/youtube\]/g, '<div class="youtube-placeholder" data-url="$1" style="background: #eee; padding: 20px; text-align: center; border-radius: 10px; margin: 10px 0;">📹 Vídeo YouTube: $1</div>')
      .replace(/\[spotify\](.*?)\[\/spotify\]/g, '<div class="spotify-placeholder" data-url="$1" style="background: #1DB954; color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 10px 0;">🎵 Playlist Spotify: $1</div>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #003366; text-decoration: underline;">$1</a>');

    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
      if (line.trim().startsWith('- ')) {
        const item = `<li>${line.trim().substring(2)}</li>`;
        if (!inList) { inList = true; return `<ul>${item}`; }
        return item;
      } else {
        if (inList) { inList = false; return `</ul>${line}<br>`; }
        return `${line}<br>`;
      }
    });
    if (inList) processedLines.push('</ul>');
    return processedLines.join('');
  };

  const htmlToPortalTags = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (el.classList.contains('youtube-placeholder')) return `[youtube]${el.dataset.url}[/youtube]\n`;
      if (el.classList.contains('spotify-placeholder')) return `[spotify]${el.dataset.url}[/spotify]\n`;

      let children = Array.from(el.childNodes).map(processNode).join("");
      if (tag === 'strong' || tag === 'b') return `**${children}**`;
      if (tag === 'em' || tag === 'i') return `*${children}*`;
      if (tag === 'u') return `<u>${children}</u>`;
      if (tag === 'h1') return `# ${children}\n`;
      if (tag === 'h2') return `## ${children}\n`;
      if (tag === 'li') return `- ${children}\n`;
      if (tag === 'ul' || tag === 'ol') return `${children}\n`;
      if (tag === 'br') return "\n";
      if (tag === 'a') return `[${children}](${el.getAttribute('href')})`;
      
      const textAlign = el.style.textAlign;
      if (textAlign === 'center') return `[center]${children}[/center]`;
      if (textAlign === 'right') return `[right]${children}[/right]`;
      if (textAlign === 'justify') return `[justify]${children}[/justify]`;
      if (tag === 'div' || tag === 'p') return `${children}\n`;
      return children;
    };
    return Array.from(div.childNodes).map(processNode).join("").replace(/\n\n+/g, '\n').trim();
  };

  const execCommand = (command: string, value: string = "", ref: React.RefObject<HTMLDivElement>) => {
    document.execCommand(command, false, value);
    if (ref.current) ref.current.focus();
  };

  const addLink = (ref: React.RefObject<HTMLDivElement>) => {
    const url = prompt("Digite a URL:");
    if (url) execCommand('createLink', url, ref);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.grade) return alert("Selecione a Série.");
    setStatus('saving');
    try {
      const contentHtml = editorRef.current?.innerHTML || "";
      const contentTags = htmlToPortalTags(contentHtml);
      
      let fileUrl = existingFileUrl || '';
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        await supabase.storage.from('materiais').upload(`uploads/${fileName}`, selectedFile);
        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`uploads/${fileName}`);
        fileUrl = publicUrl;
      }

      const galleryUrls = [...existingGalleryUrls];
      for (const file of selectedGalleryFiles) {
        const fileName = `${Date.now()}-gal-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        await supabase.storage.from('materiais').upload(`galeria/${fileName}`, file);
        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`galeria/${fileName}`);
        galleryUrls.push(publicUrl);
      }

      const payload = {
        titulo: post.title,
        nivel: post.level,
        serie: post.grade,
        bimestre: post.bimester,
        tipo_recurso: post.resource,
        conteudo: contentTags,
        arquivo_url: fileUrl,
        video_url: post.video_url,
        imagens_galeria: galleryUrls
      };

      if (editingId) await supabase.from('materiais_pedagogicos').update(payload).eq('id', editingId);
      else await supabase.from('materiais_pedagogicos').insert([payload]);
      
      setStatus('success');
      cancelEditing();
      loadData();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { setStatus('error'); setErrorMessage(err.message); }
  };

  const handleSaveMural = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const descHtml = muralEditorRef.current?.innerHTML || "";
      const descTags = htmlToPortalTags(descHtml);
      
      const photoUrls = [...existingGalleryUrls];
      for (const file of selectedGalleryFiles) {
        const fileName = `${Date.now()}-mural-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        await supabase.storage.from('materiais').upload(`mural/${fileName}`, file);
        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`mural/${fileName}`);
        photoUrls.push(publicUrl);
      }

      const payload = {
        professor_nome: muralPost.teacherName,
        escola_nome: muralPost.schoolName,
        nivel: muralPost.level,
        serie: muralPost.grade,
        titulo_trabalho: muralPost.workTitle,
        descricao: descTags,
        fotos: photoUrls
      };

      if (editingId) await supabase.from('mural_posts').update(payload).eq('id', editingId);
      else await supabase.from('mural_posts').insert([payload]);

      setStatus('success');
      cancelEditing();
      loadData();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { setStatus('error'); setErrorMessage(err.message); }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setPost({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '' });
    setMuralPost({ teacherName: '', schoolName: '', level: 'Educação Infantil', grade: '', workTitle: '', description: '', photos: [] });
    if (editorRef.current) editorRef.current.innerHTML = "";
    if (muralEditorRef.current) muralEditorRef.current.innerHTML = "";
    setExistingFileUrl(null);
    setSelectedGalleryFiles([]);
    setExistingGalleryUrls([]);
    setVideoLinkInput('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold mb-8 hover:underline"><ArrowLeft size={20} /> Voltar</button>
        <div className={`w-full max-w-md bg-adventist-blue rounded-[3rem] p-10 shadow-2xl transition-all duration-300 ${loginError ? 'translate-x-2 bg-red-900' : ''}`}>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-adventist-yellow rounded-[2rem] flex items-center justify-center text-adventist-blue shadow-lg"><Lock size={40} /></div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Acesso Restrito</h2>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input type={showPassword ? "text" : "password"} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha mestra" className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-4 px-6 text-white text-center font-bold outline-none focus:border-adventist-yellow" autoFocus />
              <button type="submit" className="w-full bg-adventist-yellow text-adventist-blue font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase">Acessar Painel</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold hover:underline"><ArrowLeft size={20} /> Voltar</button>
        <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border border-green-500/20 flex items-center gap-2"><ShieldCheck size={14} /> Modo Admin</div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white flex gap-4 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('content')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><FileText size={16} /> Material</button>
          <button onClick={() => setActiveTab('mural')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Camera size={16} /> Mural</button>
        </div>

        <div className="p-8">
          {activeTab === 'content' ? (
            <div className="space-y-8">
              <form onSubmit={handleSaveContent} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <select value={post.level} onChange={e => setPost({...post, level: e.target.value as EducationLevel, grade: ''})} className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white text-sm">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={post.grade} onChange={e => setPost({...post, grade: e.target.value})} className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white text-sm" required>
                    <option value="">Série...</option>
                    {post.level && (GRADES_BY_LEVEL[post.level as EducationLevel] || []).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select value={post.bimester} onChange={e => setPost({...post, bimester: e.target.value as Bimester})} className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white text-sm">
                    {BIMESTERS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select value={post.resource} onChange={e => setPost({...post, resource: e.target.value as ResourceType})} className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white text-sm">
                    {RESOURCE_TYPES.map(r => <option key={r.type} value={r.type}>{r.type}</option>)}
                  </select>
                </div>

                {post.resource === 'Vídeo' && (
                  <div className="space-y-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 animate-in slide-in-from-top-4">
                    <label className="text-xs font-bold text-red-600 uppercase">Link do Vídeo (YouTube)</label>
                    <div className="flex gap-2">
                      <input type="text" value={videoLinkInput} onChange={e => setVideoLinkInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="flex-1 p-3 rounded-xl border dark:bg-slate-800 dark:text-white text-sm" />
                      <button type="button" onClick={handleAnalyzeVideo} disabled={isAnalyzingVideo} className="bg-red-600 text-white px-4 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 disabled:opacity-50">
                        {isAnalyzingVideo ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isAnalyzingVideo ? 'Analisando...' : 'IA'}
                      </button>
                    </div>
                  </div>
                )}

                <input type="text" placeholder="Título" className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white font-bold" value={post.title} onChange={e => setPost({...post, title: e.target.value})} required />
                
                {/* Editor Shared Structure */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-xl border-b-0">
                    <button type="button" onClick={() => execCommand('bold', '', editorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><Bold size={18}/></button>
                    <button type="button" onClick={() => execCommand('italic', '', editorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><Italic size={18}/></button>
                    <button type="button" onClick={() => execCommand('insertUnorderedList', '', editorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><List size={18}/></button>
                    <button type="button" onClick={() => addLink(editorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><LinkIcon size={18}/></button>
                  </div>
                  <div ref={editorRef} contentEditable className="w-full min-h-[300px] p-6 rounded-b-xl border border-slate-200 dark:border-slate-700 outline-none dark:bg-slate-800 dark:text-white prose dark:prose-invert max-w-none" />
                </div>
                
                <button type="submit" disabled={status === 'saving'} className="w-full py-4 rounded-xl font-bold bg-adventist-blue text-adventist-yellow uppercase tracking-widest transition-all">
                  {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : 'Publicar Material'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <form onSubmit={handleSaveMural} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Professor</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={muralPost.teacherName} onChange={e => setMuralPost({...muralPost, teacherName: e.target.value})} className="w-full p-3 pl-10 rounded-xl border dark:bg-slate-700 dark:text-white text-sm" placeholder="Nome do Professor" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Escola</label>
                    <div className="relative">
                      <School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={muralPost.schoolName} onChange={e => setMuralPost({...muralPost, schoolName: e.target.value})} className="w-full p-3 pl-10 rounded-xl border dark:bg-slate-700 dark:text-white text-sm" placeholder="Nome da Escola" required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select value={muralPost.level} onChange={e => setMuralPost({...muralPost, level: e.target.value as EducationLevel, grade: ''})} className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white text-sm">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={muralPost.grade} onChange={e => setMuralPost({...muralPost, grade: e.target.value})} className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white text-sm" required>
                    <option value="">Série...</option>
                    {muralPost.level && (GRADES_BY_LEVEL[muralPost.level as EducationLevel] || []).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <input type="text" placeholder="Título do Trabalho" className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white font-bold" value={muralPost.workTitle} onChange={e => setMuralPost({...muralPost, workTitle: e.target.value})} required />

                {/* Mural Editor */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-xl border-b-0">
                    <button type="button" onClick={() => execCommand('bold', '', muralEditorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><Bold size={18}/></button>
                    <button type="button" onClick={() => execCommand('italic', '', muralEditorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><Italic size={18}/></button>
                    <button type="button" onClick={() => execCommand('insertUnorderedList', '', muralEditorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><List size={18}/></button>
                    <button type="button" onClick={() => addLink(muralEditorRef)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><LinkIcon size={18}/></button>
                  </div>
                  <div ref={muralEditorRef} contentEditable className="w-full min-h-[300px] p-6 rounded-b-xl border border-slate-200 dark:border-slate-700 outline-none dark:bg-slate-800 dark:text-white prose dark:prose-invert max-w-none" />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={18} /> Fotos do Trabalho (Até 10)</label>
                  <input type="file" multiple accept="image/*" onChange={e => setSelectedGalleryFiles(Array.from(e.target.files || []))} className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white text-sm" />
                </div>

                <button type="submit" disabled={status === 'saving'} className="w-full py-4 rounded-xl font-bold bg-adventist-yellow text-adventist-blue uppercase tracking-widest transition-all">
                  {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : 'Publicar no Mural'}
                </button>
              </form>
            </div>
          )}

          <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-700">
            {status === 'success' && <div className="text-green-600 font-bold text-center animate-bounce mb-4">✓ Processado com sucesso!</div>}
            <h4 className="text-sm font-black text-adventist-blue dark:text-adventist-yellow uppercase mb-6 flex items-center justify-between">
              Posts Recentes
              <button onClick={loadData} className="p-2 text-slate-400 hover:text-adventist-blue transition-colors"><RefreshCw size={18}/></button>
            </h4>
            
            <div className="space-y-4">
              {(activeTab === 'content' ? recentMaterials : recentMuralPosts).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl group transition-all">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.nivel} • {item.serie}</span>
                    <p className="text-sm font-bold truncate">{item.titulo || item.titulo_trabalho}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setDeletingId(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Layers = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

export default AdminSection;
