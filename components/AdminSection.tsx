import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Camera, 
  Newspaper, 
  Loader2, 
  Sparkles, 
  Plus, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Info,
  Edit2,
  X,
  RefreshCw,
  Bold,
  Italic,
  Underline,
  Type,
  List,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Heading1,
  Heading2
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
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Estado para Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

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

  const [muralData, setMuralData] = useState({
    professor_nome: '',
    escola_nome: '',
    nivel: 'Ensino Fundamental I' as EducationLevel,
    serie: '',
    titulo_trabalho: '',
    descricao: ''
  });
  const [muralFiles, setMuralFiles] = useState<File[]>([]);

  const [newsData, setNewsData] = useState({
    url: '',
    titulo: '',
    resumo: '',
    imagem_url: '',
    tipo: 'external' as const
  });

  // Função para aplicar formatação no textarea
  const applyFormat = (tagStart: string, tagEnd: string = '') => {
    if (!textAreaRef.current) return;
    
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const text = post.content || '';
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + tagStart + selection + tagEnd + after;
    setPost({ ...post, content: newText });

    // Re-focus e reposicionar cursor
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newPos = selection ? end + tagStart.length + tagEnd.length : start + tagStart.length;
        textAreaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const loadRecentMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const { data, error } = await supabase
        .from('materiais_pedagogicos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setRecentMaterials(data || []);
    } catch (err) {
      console.error("Erro ao carregar materiais:", err);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'content') {
      loadRecentMaterials();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
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
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setPost({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '', video_url: '' });
    setSelectedFile(null);
    setExistingFileUrl(null);
  };

  const fetchVideoMetadata = async () => {
    if (!post.video_url) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise este link de vídeo: ${post.video_url}. Crie um título pedagógico atraente e um resumo curto (max 200 caracteres) explicando como este vídeo pode ser usado em uma aula de Artes. Responda em JSON com "titulo" e "resumo".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setPost(prev => ({
          ...prev,
          title: data.titulo || prev.title,
          content: data.resumo || prev.content
        }));
      }
    } catch (err) {
      console.error("Erro IA Vídeo:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchNewsMetadata = async () => {
    if (!newsData.url) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia o título, um resumo curto (max 150 caracteres) e sugira uma URL de imagem de destaque para este link: ${newsData.url}. Responda apenas em JSON com as chaves: "titulo", "resumo", "imagem_url".`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setNewsData(prev => ({
          ...prev,
          titulo: data.titulo || '',
          resumo: data.resumo || '',
          imagem_url: data.imagem_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'
        }));
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.grade) {
      alert("Por favor, selecione a Série antes de salvar.");
      return;
    }

    setStatus('saving');
    setErrorMessage(null);
    
    try {
      let fileUrl = existingFileUrl || '';
      
      if (selectedFile) {
        const sanitizedName = selectedFile.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9._-]/g, '');

        const fileName = `${Date.now()}-${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('materiais')
          .upload(`uploads/${fileName}`, selectedFile);

        if (uploadError) {
          throw new Error(`Erro no Storage: ${uploadError.message}.`);
        }

        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`uploads/${fileName}`);
        fileUrl = publicUrl;
      }

      const payload = {
        titulo: post.title?.trim(),
        nivel: post.level,
        serie: post.grade,
        bimestre: post.bimester,
        tipo_recurso: post.resource,
        conteudo: post.content?.trim(),
        arquivo_url: fileUrl,
        video_url: post.video_url?.trim() || null
      };

      let dbError;
      if (editingId) {
        const { error } = await supabase
          .from('materiais_pedagogicos')
          .update(payload)
          .eq('id', editingId);
        dbError = error;
      } else {
        const { error } = await supabase.from('materiais_pedagogicos').insert([payload]);
        dbError = error;
      }

      if (dbError) throw dbError;

      setStatus('success');
      setPost({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '', video_url: '' });
      setSelectedFile(null);
      setEditingId(null);
      setExistingFileUrl(null);
      loadRecentMaterials();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { 
      console.error("Erro detalhado:", err);
      setErrorMessage(err.message || 'Erro ao salvar.');
      setStatus('error'); 
    }
  };

  const handleSaveMural = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage(null);
    try {
      const photoUrls: string[] = [];
      for (const file of muralFiles) {
        const sanitizedName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage.from('mural').upload(`fotos/${fileName}`, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('mural').getPublicUrl(`fotos/${fileName}`);
        photoUrls.push(publicUrl);
      }

      const { error: dbError } = await supabase.from('mural_posts').insert([{
        professor_nome: muralData.professor_nome,
        escola_nome: muralData.escola_nome,
        nivel: muralData.nivel,
        serie: muralData.serie,
        titulo_trabalho: muralData.titulo_trabalho,
        descricao: muralData.descricao,
        fotos: photoUrls
      }]);

      if (dbError) throw dbError;

      setStatus('success');
      setMuralFiles([]);
      setMuralData({ professor_nome: '', escola_nome: '', nivel: 'Ensino Fundamental I', serie: '', titulo_trabalho: '', descricao: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { 
      setErrorMessage(err.message || 'Erro ao salvar mural.');
      setStatus('error'); 
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage(null);
    try {
      const { error: dbError } = await supabase.from('curated_news').insert([{
        titulo: newsData.titulo,
        resumo: newsData.resumo,
        imagem_url: newsData.imagem_url,
        url_externa: newsData.url,
        tipo: newsData.tipo,
        data_postagem: new Date().toLocaleDateString('pt-BR')
      }]);

      if (dbError) throw dbError;

      setStatus('success');
      setNewsData({ url: '', titulo: '', resumo: '', imagem_url: '', tipo: 'external' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { 
      setErrorMessage(err.message || 'Erro ao salvar notícia.');
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
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Acesso Restrito</h2>
              <p className="text-blue-100/70 text-sm">Digite a senha para gerenciar o portal</p>
            </div>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha mestra" className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-4 px-6 text-white text-center font-bold tracking-[0.3em] outline-none focus:border-adventist-yellow" autoFocus />
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
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold hover:underline"><ArrowLeft size={20} /> Voltar para o Portal</button>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20"><ShieldCheck size={14} /> Modo Admin Ativo</div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white flex gap-4 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('content')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><FileText size={16} /> Material</button>
          <button onClick={() => setActiveTab('mural')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Camera size={16} /> Mural</button>
          <button onClick={() => setActiveTab('news')} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'news' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Newspaper size={16} /> Notícia</button>
        </div>

        <div className="p-8">
          {activeTab === 'content' && (
             <div className="space-y-12">
               {editingId && (
                 <div className="bg-adventist-yellow/10 border-2 border-adventist-yellow p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                      <Edit2 className="text-adventist-blue" size={24}/>
                      <div>
                        <p className="font-black text-adventist-blue uppercase text-xs">Editando Material</p>
                        <p className="text-[10px] text-slate-500">ID: {editingId}</p>
                      </div>
                    </div>
                    <button onClick={cancelEditing} className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors"><X size={20}/></button>
                 </div>
               )}

               <form onSubmit={handleSaveContent} className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nível</label>
                      <select value={post.level} onChange={e => setPost({...post, level: e.target.value as EducationLevel, grade: ''})} className="w-full p-3 rounded-xl border border-slate-200 text-sm">
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Série</label>
                      <select value={post.grade} onChange={e => setPost({...post, grade: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 text-sm" required>
                        <option value="">Selecione...</option>
                        {post.level && (GRADES_BY_LEVEL[post.level as EducationLevel] || []).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  {post.resource === 'Vídeo' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Link do Vídeo</label>
                      <div className="flex gap-2">
                        <input type="url" placeholder="YouTube/Vimeo" className="flex-1 p-3 rounded-xl border border-slate-200" value={post.video_url} onChange={e => setPost({...post, video_url: e.target.value})} />
                        <button type="button" onClick={fetchVideoMetadata} className="px-4 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2"><Sparkles size={16}/> IA</button>
                      </div>
                    </div>
                  )}

                  <input type="text" placeholder="Título" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={post.title} onChange={e => setPost({...post, title: e.target.value})} required />
                  
                  {/* Painel de Formatação */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-xl border-b-0">
                      <button type="button" onClick={() => applyFormat('**', '**')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Negrito"><Bold size={18}/></button>
                      <button type="button" onClick={() => applyFormat('*', '*')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Itálico"><Italic size={18}/></button>
                      <button type="button" onClick={() => applyFormat('<u>', '</u>')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Sublinhado"><Underline size={18}/></button>
                      <button type="button" onClick={() => applyFormat('~~', '~~')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Tachado"><Strikethrough size={18}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={() => applyFormat('# ', '')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Título 1"><Heading1 size={18}/></button>
                      <button type="button" onClick={() => applyFormat('## ', '')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Título 2"><Heading2 size={18}/></button>
                      <button type="button" onClick={() => applyFormat('- ', '')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Lista"><List size={18}/></button>
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button type="button" onClick={() => applyFormat('[center]', '[/center]')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Centralizar"><AlignCenter size={18}/></button>
                      <button type="button" onClick={() => applyFormat('[right]', '[/right]')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Direita"><AlignRight size={18}/></button>
                    </div>
                    <textarea 
                      ref={textAreaRef}
                      rows={8} 
                      placeholder="Conteúdo Pedagógico..." 
                      className="w-full p-4 rounded-b-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-adventist-blue outline-none" 
                      value={post.content} 
                      onChange={e => setPost({...post, content: e.target.value})} 
                      required 
                    />
                  </div>
                  
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                    {existingFileUrl && !selectedFile && (
                      <div className="text-[10px] text-green-600 font-bold uppercase mb-2">Arquivo Atual: {existingFileUrl.split('/').pop()}</div>
                    )}
                    <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} id="file-mat" className="hidden" />
                    <label htmlFor="file-mat" className="cursor-pointer text-sm font-bold text-slate-500 block p-2 hover:bg-slate-50 rounded-lg">
                      {selectedFile ? `Selecionado: ${selectedFile.name}` : editingId ? 'Substituir arquivo (opcional)' : 'Anexar PDF/Arquivo'}
                    </label>
                  </div>
                  
                  <button type="submit" disabled={status === 'saving'} className={`w-full py-4 rounded-xl font-bold shadow-lg uppercase tracking-widest transition-all ${editingId ? 'bg-adventist-yellow text-adventist-blue' : 'bg-adventist-blue text-adventist-yellow'}`}>
                    {status === 'saving' ? <Loader2 className="animate-spin mx-auto"/> : editingId ? 'Salvar Alterações' : 'Publicar Material'}
                  </button>
               </form>

               {/* Materiais Recentes */}
               <div className="pt-10 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-adventist-blue uppercase tracking-wider">Posts Recentes (Edição)</h4>
                    <button onClick={loadRecentMaterials} className="p-2 text-slate-400 hover:text-adventist-blue transition-colors"><RefreshCw size={18} className={isLoadingMaterials ? 'animate-spin' : ''}/></button>
                  </div>

                  <div className="space-y-3">
                    {recentMaterials.map((mat) => (
                      <div key={mat.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all group">
                         <div className="overflow-hidden">
                           <p className="text-xs font-bold text-slate-800 truncate">{mat.titulo}</p>
                           <p className="text-[8px] text-slate-400 uppercase font-bold">{mat.nivel} • {mat.serie}</p>
                         </div>
                         <button onClick={() => startEditing(mat)} className="p-2 bg-white text-adventist-blue rounded-xl shadow-sm border border-slate-200 hover:bg-adventist-blue hover:text-white transition-all">
                           <Edit2 size={14}/>
                         </button>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'mural' && (
            <form onSubmit={handleSaveMural} className="space-y-6">
              <input type="text" placeholder="Trabalho" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={muralData.titulo_trabalho} onChange={e => setMuralData({...muralData, titulo_trabalho: e.target.value})} required />
              <textarea rows={4} placeholder="Descrição..." className="w-full p-3 rounded-xl border border-slate-200" value={muralData.descricao} onChange={e => setMuralData({...muralData, descricao: e.target.value})} required />
              <div className="grid grid-cols-5 gap-2">
                {muralFiles.map((file, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-slate-100 overflow-hidden"><img src={URL.createObjectURL(file)} className="w-full h-full object-cover" /></div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50"><Plus size={20} /><input type="file" multiple className="hidden" onChange={e => setMuralFiles([...muralFiles, ...Array.from(e.target.files || [])])} /></label>
              </div>
              <button type="submit" className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold">Publicar Mural</button>
            </form>
          )}

          {activeTab === 'news' && (
            <form onSubmit={handleSaveNews} className="space-y-6">
              <input type="text" placeholder="Título da Notícia" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={newsData.titulo} onChange={e => setNewsData({...newsData, titulo: e.target.value})} required />
              <textarea placeholder="Resumo..." className="w-full p-3 rounded-xl border border-slate-200" value={newsData.resumo} onChange={e => setNewsData({...newsData, resumo: e.target.value})} required />
              <button type="submit" className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold">Publicar Notícia</button>
            </form>
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
