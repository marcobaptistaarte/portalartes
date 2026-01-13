import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ArrowLeft, Camera, Loader2, Plus, Lock, 
  Eye, EyeOff, ShieldCheck, Edit2, X, RefreshCw, Bold, Italic, Underline, List, AlignCenter, 
  AlignRight, AlignJustify, Strikethrough, Heading1, Heading2, ChevronDown, ChevronUp, Trash2, AlertTriangle, Link as LinkIcon
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
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});

  // Verifica se já está autenticado na sessão
  useEffect(() => {
    const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const groupedMaterials = recentMaterials.reduce((acc: Record<string, any[]>, mat) => {
    const key = mat.serie || 'Outros';
    if (!acc[key]) acc[key] = [];
    acc[key].push(mat);
    return acc;
  }, {});

  const toggleGradeExpansion = (grade: string) => {
    setExpandedGrades(prev => ({ ...prev, [grade]: !prev[grade] }));
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
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #003366; text-decoration: underline;">$1</a>');

    // Processar listas
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
    if (url) {
      execCommand('createLink', url);
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
        .replace(/<o:p>[\s\S]*?<\/o:p>/g, '') // Metadados Office
        .replace(/class="Mso.*?"/g, '')       // Classes Word
        .replace(/style="[\s\S]*?"/g, (match) => {
           // Preserva apenas alinhamento de texto se necessário
           return match.includes('text-align') ? match.match(/text-align:\s*(center|right|justify)/) ? `style="${match.match(/text-align:\s*(center|right|justify)/)![0]}"` : '' : '';
        })
        .replace(/<span[\s\S]*?>/g, '')       // Remove spans poluídos
        .replace(/<\/span>/g, '')
        .replace(/\n/g, ' ')                  // Remove quebras de linha que o Word injeta fora das tags
        .replace(/<p[\s\S]*?>/g, '<div>')     // Converte parágrafos do Word em divisores limpos
        .replace(/<\/p>/g, '</div>')
        .replace(/(<div>\s*<\/div>)+/g, '<br>') // Remove blocos vazios gerados por espaços no Word
        .replace(/\s\s+/g, ' ')               // Normaliza espaços múltiplos
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
      const payload = {
        titulo: post.title?.trim(),
        nivel: post.level,
        serie: post.grade,
        bimestre: post.bimester,
        tipo_recurso: post.resource,
        conteudo: contentTags,
        arquivo_url: fileUrl,
        video_url: post.video_url?.trim() || null
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
      {/* Modal de Confirmação de Exclusão */}
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
                      <button type="button" onClick={() => execCommand('strikeThrough')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Tachado"><Strikethrough size={18}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={() => execCommand('formatBlock', 'h1')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Título 1"><Heading1 size={18}/></button>
                      <button type="button" onClick={() => execCommand('formatBlock', 'h2')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Título 2"><Heading2 size={18}/></button>
                      <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Lista"><List size={18}/></button>
                      <button type="button" onClick={addLink} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Adicionar Link"><LinkIcon size={18}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Centralizar"><AlignCenter size={18}/></button>
                      <button type="button" onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Direita"><AlignRight size={18}/></button>
                      <button type="button" onClick={() => execCommand('justifyFull')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300" title="Justificar"><AlignJustify size={18}/></button>
                    </div>
                    <div 
                      ref={editorRef}
                      contentEditable
                      onPaste={handlePaste}
                      className="w-full min-h-[300px] p-6 rounded-b-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-adventist-blue outline-none dark:bg-slate-800 dark:text-white prose dark:prose-invert max-w-none"
                    />
                  </div>
                  
                  <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center">
                    <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} id="file-mat" className="hidden" />
                    <label htmlFor="file-mat" className="cursor-pointer text-sm font-bold text-slate-500 block p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                      {selectedFile ? `Selecionado: ${selectedFile.name}` : editingId ? 'Substituir PDF (opcional)' : 'Anexar PDF/Arquivo'}
                    </label>
                  </div>
                  
                  <button type="submit" disabled={status === 'saving'} className={`w-full py-4 rounded-xl font-bold shadow-lg uppercase tracking-widest transition-all ${editingId ? 'bg-adventist-yellow text-adventist-blue' : 'bg-adventist-blue text-adventist-yellow'}`}>
                    {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : editingId ? 'Salvar Alterações' : 'Publicar Material'}
                  </button>
               </form>

               <div className="pt-10 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-sm font-black text-adventist-blue dark:text-adventist-yellow uppercase">Posts Recentes</h4>
                    <button onClick={loadRecentMaterials} className="p-2 text-slate-400 hover:text-adventist-blue transition-colors"><RefreshCw size={18} className={isLoadingMaterials ? 'animate-spin' : ''}/></button>
                  </div>
                  <div className="space-y-4">
                    {Object.keys(groupedMaterials).sort().map((grade) => (
                      <div key={grade} className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl overflow-hidden border">
                         <button onClick={() => toggleGradeExpansion(grade)} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors">
                           <div className="flex items-center gap-3">
                             <FileText size={16} className="text-adventist-blue"/>
                             <h5 className="text-[11px] font-black uppercase tracking-widest">{grade}</h5>
                             <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-bold">{groupedMaterials[grade].length}</span>
                           </div>
                           {expandedGrades[grade] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                         </button>
                         {expandedGrades[grade] && (
                           <div className="p-3 pt-0 space-y-2">
                             {groupedMaterials[grade].map((mat: any) => (
                               <div key={mat.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 hover:border-adventist-blue border rounded-xl transition-all group shadow-sm">
                                 <p className="text-xs font-bold truncate pr-4">{mat.titulo}</p>
                                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                   <button onClick={() => startEditing(mat)} className="p-2 bg-slate-50 dark:bg-slate-700 text-adventist-blue rounded-lg hover:bg-adventist-blue hover:text-white transition-colors" title="Editar"><Edit2 size={12}/></button>
                                   <button onClick={() => setDeletingId(mat.id)} className="p-2 bg-slate-50 dark:bg-slate-700 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Excluir"><Trash2 size={12}/></button>
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

export default AdminSection;
