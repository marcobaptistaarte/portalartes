
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, CheckCircle2, AlertCircle, ArrowLeft, Camera, Newspaper, Loader2, Sparkles, Plus, Lock, 
  Eye, EyeOff, ShieldCheck, Info, Edit2, X, RefreshCw, Bold, Italic, Underline, List, AlignCenter, 
  AlignRight, AlignJustify, Strikethrough, Heading1, Heading2, ChevronDown, ChevronUp
} from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType } from '../types';
import { supabase } from '../supabaseClient';
import { GoogleGenAI } from "@google/genai";

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural' | 'news';
const ADMIN_PASSWORD = 'Schlussel01';

const AdminSection: React.FC<AdminSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});

  // Fix: Implement groupedMaterials derived from recentMaterials
  const groupedMaterials = recentMaterials.reduce((acc: Record<string, any[]>, mat) => {
    const key = mat.serie || 'Outros';
    if (!acc[key]) acc[key] = [];
    acc[key].push(mat);
    return acc;
  }, {});

  // Fix: Implement toggleGradeExpansion to manage UI accordion state
  const toggleGradeExpansion = (grade: string) => {
    setExpandedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
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

  // --- CONVERSORES DE FORMATO ---
  
  // Converte Tags do Portal para HTML (para exibir no editor)
  const portalTagsToHtml = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<strike>$1</strike>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/# (.*?)\n/g, '<h1>$1</h1>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .replace(/\[center\](.*?)\[\/center\]/g, '<div style="text-align: center;">$1</div>')
      .replace(/\[right\](.*?)\[\/right\]/g, '<div style="text-align: right;">$1</div>')
      .replace(/\[justify\](.*?)\[\/justify\]/g, '<div style="text-align: justify;">$1</div>')
      .replace(/- (.*?)\n/g, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  // Converte HTML do Editor para Tags do Portal (para salvar no banco)
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
      if (tag === 'br') return "\n";
      
      const textAlign = el.style.textAlign;
      if (textAlign === 'center') return `[center]${children}[/center]`;
      if (textAlign === 'right') return `[right]${children}[/right]`;
      if (textAlign === 'justify') return `[justify]${children}[/justify]`;
      
      if (tag === 'div' || tag === 'p') return `${children}\n`;
      
      return children;
    };

    return Array.from(div.childNodes).map(processNode).join("").replace(/\n\n+/g, '\n').trim();
  };

  // --- HANDLERS DO EDITOR ---

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand("insertText", false, text);
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
        <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border border-green-500/20 flex items-center gap-2"><ShieldCheck size={14} /> Modo Admin Ativo</div>
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

               {/* Lista de Materiais para Edição */}
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
                                 <button onClick={() => startEditing(mat)} className="p-2 bg-slate-50 dark:bg-slate-700 text-adventist-blue rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-adventist-blue hover:text-white"><Edit2 size={12}/></button>
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
