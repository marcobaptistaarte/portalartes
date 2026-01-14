import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ArrowLeft, Camera, Loader2, Plus, Lock, 
  Eye, EyeOff, ShieldCheck, Edit2, X, RefreshCw, Bold, Italic, Underline, List, AlignCenter, 
  AlignRight, AlignJustify, Strikethrough, Heading1, Heading2, ChevronDown, ChevronUp, Trash2, AlertTriangle, 
  Link as LinkIcon, Youtube, Music, Image as ImageIcon
} from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType } from '../types';
import { supabase } from '../supabaseClient';

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural' | 'news';
const ADMIN_PASSWORD = 'Schlussel01';
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});

  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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

  const [post, setPost] = useState<Partial<ManualPost>>({
    level: 'Educação Infantil',
    grade: '',
    bimester: '1º bimestre',
    resource: 'Conteúdo',
    title: '',
    content: '',
    video_url: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

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

      // Trata placeholders de Youtube/Spotify de volta para tags
      if (el.classList.contains('youtube-placeholder')) return `[youtube]${el.dataset.url}[/youtube]\n`;
      if (el.classList.contains('spotify-placeholder')) return `[spotify]${el.dataset.url}[/spotify]\n`;

      let children = Array.from(el.childNodes).map(processNode).join("");
      
      if (tag === 'strong' || tag === 'b') return `**${children}**`;
      if (tag === 'em' || tag === 'i') return `*${children}*`;
      if (tag === 'u') return `<u>${children}</u>`;
      if (tag === 'strike' || tag === 'del') return `~~${children}~~`;
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

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const addLink = () => {
    const url = prompt("Digite a URL (ex: https://google.com):");
    if (url) execCommand('createLink', url);
  };

  const addYoutube = () => {
    const url = prompt("Cole o link do vídeo do YouTube:");
    if (url) {
      const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : url;
      const placeholder = `<div class="youtube-placeholder" data-url="${videoId}" contenteditable="false" style="background: #eee; padding: 20px; text-align: center; border-radius: 10px; margin: 10px 0; border: 2px dashed #ccc;">📹 Vídeo YouTube: ${videoId} (Não apague este bloco)</div><p><br></p>`;
      document.execCommand('insertHTML', false, placeholder);
    }
  };

  const addSpotify = () => {
    const url = prompt("Cole o link da Playlist ou Álbum do Spotify:");
    if (url) {
      const spotifyMatch = url.match(/spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
      const spotifyId = spotifyMatch ? `${spotifyMatch[1]}/${spotifyMatch[2]}` : url;
      const placeholder = `<div class="spotify-placeholder" data-url="${spotifyId}" contenteditable="false" style="background: #1DB954; color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 10px 0;">🎵 Playlist Spotify: ${spotifyId} (Não apague este bloco)</div><p><br></p>`;
      document.execCommand('insertHTML', false, placeholder);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      const fragmentMatch = html.match(/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/);
      let cleanHtml = fragmentMatch ? fragmentMatch[1] : html;
      
      cleanHtml = cleanHtml
        .replace(/<o:p>[\s\S]*?<\/o:p>/g, '') 
        .replace(/class="Mso.*?"/g, '')       
        .replace(/style="[\s\S]*?"/g, (match) => {
           return match.includes('text-align') ? match.match(/text-align:\s*(center|right|justify)/) ? `style="${match.match(/text-align:\s*(center|right|justify)/)![0]}"` : '' : '';
        })
        .replace(/<span[\s\S]*?>/g, '')       
        .replace(/<\/span>/g, '')
        .replace(/\n/g, ' ')                  
        .replace(/<p[\s\S]*?>/g, '<div>')     
        .replace(/<\/p>/g, '</div>')
        .replace(/(<div>\s*<\/div>)+/g, '<br>') 
        .replace(/\s\s+/g, ' ')               
        .trim();

      document.execCommand('insertHTML', false, cleanHtml);
    } else {
      document.execCommand('insertText', false, text);
    }
  };

  const loadRecentMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const { data, error } = await supabase
        .from('materiais_pedagogicos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecentMaterials(data || []);
    } catch (err) { console.error(err); } finally { setIsLoadingMaterials(false); }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'content') loadRecentMaterials();
  }, [isAuthenticated, activeTab]);

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

  const startEditing = (material: any) => {
    setEditingId(material.id);
    setPost({
      level: material.nivel,
      grade: material.serie,
      bimester: material.bimestre,
      resource: material.tipo_recurso,
      title: material.titulo,
      content: material.conteudo,
      video_url: material.video_url || ''
    });
    setExistingFileUrl(material.arquivo_url);
    setExistingGalleryUrls(material.imagens_galeria || []);
    if (editorRef.current) {
      editorRef.current.innerHTML = portalTagsToHtml(material.conteudo);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setPost({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '', video_url: '' });
    if (editorRef.current) editorRef.current.innerHTML = "";
    setExistingFileUrl(null);
    setSelectedGalleryFiles([]);
    setExistingGalleryUrls([]);
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materiais_pedagogicos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setRecentMaterials(prev => prev.filter(m => m.id !== id));
      setDeletingId(null);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
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
        const { error: upErr } = await supabase.storage.from('materiais').upload(`uploads/${fileName}`, selectedFile);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`uploads/${fileName}`);
        fileUrl = publicUrl;
      }

      const galleryUrls = [...existingGalleryUrls];
      for (const file of selectedGalleryFiles) {
        const fileName = `${Date.now()}-gal-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { error: upErr } = await supabase.storage.from('materiais').upload(`galeria/${fileName}`, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`galeria/${fileName}`);
        galleryUrls.push(publicUrl);
      }

      const payload = {
        titulo: post.title?.trim(),
        nivel: post.level,
        serie: post.grade,
        bimestre: post.bimester,
        tipo_recurso: post.resource,
        conteudo: contentTags,
        arquivo_url: fileUrl,
        video_url: post.video_url?.trim() || null,
        imagens_galeria: galleryUrls.slice(0, 10)
      };

      const { error: dbErr } = editingId 
        ? await supabase.from('materiais_pedagogicos').update(payload).eq('id', editingId)
        : await supabase.from('materiais_pedagogicos').insert([payload]);
      if (dbErr) throw dbErr;
      
      setStatus('success');
      cancelEditing();
      loadRecentMaterials();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalCurrent = selectedGalleryFiles.length + existingGalleryUrls.length;
    if (totalCurrent + files.length > 10) {
      alert("Você pode adicionar no máximo 10 imagens.");
      return;
    }
    setSelectedGalleryFiles(prev => [...prev, ...files]);
  };

  const removeGalleryFile = (index: number) => {
    setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryUrl = (index: number) => {
    setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index));
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
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha mestra" className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-4 px-6 text-white text-center font-bold outline-none focus:border-adventist-yellow" autoFocus />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              <button type="submit" className="w-full bg-adventist-yellow text-adventist-blue font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase">Acessar Painel</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-700 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Excluir Material?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Esta ação é permanente e não poderá ser desfeita.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancelar</button>
              <button onClick={() => handleDeleteMaterial(deletingId)} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all">Excluir</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold hover:underline"><ArrowLeft size={20} /> Voltar para o Portal</button>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { sessionStorage.removeItem(ADMIN_AUTH_KEY); setIsAuthenticated(false); }}
            className="text-[10px] font-bold text-red-500 uppercase hover:underline"
          >
            Sair da Sessão
          </button>
          <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border border-green-500/20 flex items-center gap-2"><ShieldCheck size={14} /> Modo Admin Ativo</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white flex gap-4 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('content')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><FileText size={16} /> Material</button>
          <button onClick={() => setActiveTab('mural')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Camera size={16} /> Mural</button>
        </div>

        <div className="p-8">
          {activeTab === 'content' && (
             <div className="space-y-8">
               {editingId && (
                 <div className="bg-adventist-yellow/10 border-2 border-adventist-yellow p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3"><Edit2 size={24}/><p className="font-black text-xs uppercase">Editando ID: {editingId}</p></div>
                    <button onClick={cancelEditing} className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors"><X size={20}/></button>
                 </div>
               )}

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

                  <input type="text" placeholder="Título do Material" className="w-full p-3 rounded-xl border dark:bg-slate-700 dark:text-white font-bold" value={post.title} onChange={e => setPost({...post, title: e.target.value})} required />
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-xl border-b-0">
                      <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Negrito"><Bold size={18}/></button>
                      <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Itálico"><Italic size={18}/></button>
                      <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Sublinhado"><Underline size={18}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={() => execCommand('formatBlock', 'h1')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Título 1"><Heading1 size={18}/></button>
                      <button type="button" onClick={() => execCommand('formatBlock', 'h2')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Título 2"><Heading2 size={18}/></button>
                      <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Lista"><List size={18}/></button>
                      <button type="button" onClick={addLink} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Adicionar Link"><LinkIcon size={18}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={addYoutube} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-600" title="Embed YouTube"><Youtube size={18}/></button>
                      <button type="button" onClick={addSpotify} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-green-600" title="Embed Spotify"><Music size={18}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Centralizar"><AlignCenter size={18}/></button>
                      <button type="button" onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Direita"><AlignRight size={18}/></button>
                    </div>
                    <div 
                      ref={editorRef}
                      contentEditable
                      onPaste={handlePaste}
                      className="w-full min-h-[300px] p-6 rounded-b-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-adventist-blue outline-none dark:bg-slate-800 dark:text-white prose dark:prose-invert max-w-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={18} /> Galeria de Imagens (Até 10)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {existingGalleryUrls.map((url, i) => (
                        <div key={url} className="relative aspect-square rounded-xl overflow-hidden border">
                          <img src={url} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingGalleryUrl(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><X size={12}/></button>
                        </div>
                      ))}
                      {selectedGalleryFiles.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="text-slate-300" />
                          <button type="button" onClick={() => removeGalleryFile(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><X size={12}/></button>
                        </div>
                      ))}
                      {(existingGalleryUrls.length + selectedGalleryFiles.length < 10) && (
                        <label className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <Plus className="text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Add Foto</span>
                          <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                    <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} id="file-mat" className="hidden" />
                    <label htmlFor="file-mat" className="cursor-pointer text-sm font-bold text-slate-500 block p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                      {selectedFile ? `Selecionado: ${selectedFile.name}` : editingId ? 'Substituir PDF (opcional)' : 'Anexar PDF/Arquivo Principal'}
                    </label>
                  </div>
                  
                  <button type="submit" disabled={status === 'saving'} className={`w-full py-4 rounded-xl font-bold shadow-lg uppercase tracking-widest transition-all ${editingId ? 'bg-adventist-yellow text-adventist-blue' : 'bg-adventist-blue text-adventist-yellow'}`}>
                    {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : editingId ? 'Salvar Alterações' : 'Publicar Material'}
                  </button>
               </form>

               <div className="pt-10 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-sm font-black text-adventist-blue dark:text-adventist-yellow uppercase">Materiais Publicados</h4>
                    <button onClick={loadRecentMaterials} className="p-2 text-slate-400 hover:text-adventist-blue transition-colors"><RefreshCw size={18} className={isLoadingMaterials ? 'animate-spin' : ''}/></button>
                  </div>
                  
                  <div className="space-y-6">
                    {Object.keys(groupedMaterials).sort().map((level) => (
                      <div key={level} className="space-y-2">
                        <button 
                          onClick={() => toggleLevelExpansion(level)}
                          className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <Layers className="text-adventist-blue dark:text-adventist-yellow" size={20} />
                            <h5 className="text-xs font-black uppercase tracking-widest">{level}</h5>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full font-bold">
                              {Object.values(groupedMaterials[level]).flat().length}
                            </span>
                          </div>
                          {expandedLevels[level] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                        </button>

                        {expandedLevels[level] && (
                          <div className="ml-4 space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                            {Object.keys(groupedMaterials[level]).sort().map((grade) => {
                              const gradeKey = `${level}-${grade}`;
                              return (
                                <div key={grade} className="space-y-2">
                                  <button 
                                    onClick={() => toggleGradeExpansion(level, grade)}
                                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText size={16} className="text-adventist-blue"/>
                                      <span className="text-[11px] font-bold uppercase tracking-tight">{grade}</span>
                                      <span className="text-[10px] text-slate-400">({groupedMaterials[level][grade].length})</span>
                                    </div>
                                    {expandedGrades[gradeKey] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                  </button>

                                  {expandedGrades[gradeKey] && (
                                    <div className="ml-4 space-y-2 animate-in fade-in slide-in-from-top-1">
                                      {groupedMaterials[level][grade].map((mat: any) => (
                                        <div key={mat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:border-adventist-blue border rounded-xl transition-all group shadow-sm">
                                          <p className="text-xs font-bold truncate pr-4 text-slate-700 dark:text-slate-300">{mat.titulo}</p>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => startEditing(mat)} className="p-2 bg-white dark:bg-slate-700 text-adventist-blue rounded-lg hover:bg-adventist-blue hover:text-white transition-colors" title="Editar"><Edit2 size={12}/></button>
                                            <button onClick={() => setDeletingId(mat.id)} className="p-2 bg-white dark:bg-slate-700 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Excluir"><Trash2 size={12}/></button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          )}
          <div className="mt-6">
             {status === 'success' && <div className="text-green-600 font-bold text-center animate-bounce">✓ Processado com sucesso!</div>}
             {status === 'error' && <div className="text-red-600 font-bold text-center text-xs">✗ {errorMessage}</div>}
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
